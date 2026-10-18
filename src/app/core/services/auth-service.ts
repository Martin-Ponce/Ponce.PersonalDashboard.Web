import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_CALLBACK_ROUTE,
  AUTH_CONFIG,
  DEFAULT_SIGNED_IN_ROUTE,
  LOGIN_ROUTE,
} from '../constants/auth.constants';
import { SKIP_AUTH } from '../interceptors/http-context';
import {
  AuthSession,
  AuthUser,
  IdpClaims,
  OidcDiscovery,
  TokenResponse,
} from '../models/auth/auth-models';
import { decodeJwtPayload } from '../utils/jwt';
import { createCodeChallenge, randomUrlSafeString } from '../utils/pkce';
import { TokenStorage } from './token-storage';

const EXPIRY_SKEW_MS = 30_000;

/** What the identity provider sends back to the callback page. */
export interface CallbackParams {
  code?: string | null;
  state?: string | null;
  error?: string | null;
  errorDescription?: string | null;
}

/** OAuth code + PKCE client for the identity provider: sign in, refresh, sign out. */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorage);
  private readonly document = inject(DOCUMENT);

  private readonly current = signal<AuthSession | null>(null);
  readonly user = computed<AuthUser | null>(() => this.current()?.user ?? null);
  readonly isAuthenticated = computed(() => this.current() !== null);

  private discovery?: Promise<OidcDiscovery>;
  private refreshInFlight: Promise<AuthSession | null> | null = null;

  get redirectUri(): string {
    return this.appUrl(AUTH_CALLBACK_ROUTE);
  }

  async restoreSession(): Promise<void> {
    if (this.storage.getRefreshToken()) {
      await this.refresh();
    }
  }

  /** Sets up PKCE, state and nonce, then sends the browser to the identity provider. */
  async login(returnUrl?: string | null): Promise<void> {
    const discovery = await this.getDiscovery();
    const codeVerifier = randomUrlSafeString(48);
    const state = randomUrlSafeString();
    const nonce = randomUrlSafeString();

    this.storage.savePending({ state, nonce, codeVerifier, returnUrl: safeReturnUrl(returnUrl) });

    const url = new URL(discovery.authorization_endpoint);
    url.search = new URLSearchParams({
      client_id: AUTH_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: AUTH_CONFIG.scope,
      state,
      nonce,
      code_challenge: await createCodeChallenge(codeVerifier),
      code_challenge_method: 'S256',
    }).toString();

    this.document.location.assign(url.toString());
  }

  /** Checks state, swaps the code for tokens, returns where to go next. */
  async completeLogin(params: CallbackParams): Promise<string> {
    const pending = this.storage.takePending();

    if (params.error) {
      throw new Error(
        `${params.error}${params.errorDescription ? `: ${params.errorDescription}` : ''}`,
      );
    }
    if (!pending || !params.state || params.state !== pending.state) {
      throw new Error('The response doesn’t match a sign-in started from this tab.');
    }
    if (!params.code) {
      throw new Error('The identity provider didn’t send an authorization code.');
    }

    const discovery = await this.getDiscovery();
    const tokens = await this.requestTokens(discovery, {
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: this.redirectUri,
      client_id: AUTH_CONFIG.clientId,
      code_verifier: pending.codeVerifier,
    });

    this.validateIdToken(tokens.id_token, discovery, pending.nonce);
    this.setSession(this.createSession(tokens));
    return pending.returnUrl;
  }

  /** Current access token, refreshed first if it's about to expire. */
  async getValidAccessToken(): Promise<string | null> {
    const session = this.current();
    if (!session) return null;
    if (session.expiresAt - Date.now() > EXPIRY_SKEW_MS) return session.accessToken;
    return (await this.refresh())?.accessToken ?? null;
  }

  /** One refresh at a time: refresh tokens rotate, so parallel ones would race. */
  refresh(): Promise<AuthSession | null> {
    this.refreshInFlight ??= this.doRefresh().finally(() => (this.refreshInFlight = null));
    return this.refreshInFlight;
  }

  /** Signs out here and at the identity provider, or just here if it's unreachable. */
  async logout(): Promise<void> {
    const idToken = this.current()?.idToken;
    this.clearSession();
    const loginUrl = this.appUrl(LOGIN_ROUTE);

    const endSessionEndpoint = await this.getDiscovery().then(
      (discovery) => discovery.end_session_endpoint,
      () => undefined,
    );
    if (!endSessionEndpoint) {
      this.document.location.assign(loginUrl);
      return;
    }

    const url = new URL(endSessionEndpoint);
    url.search = new URLSearchParams({
      client_id: AUTH_CONFIG.clientId,
      post_logout_redirect_uri: loginUrl,
      ...(idToken ? { id_token_hint: idToken } : {}),
    }).toString();
    this.document.location.assign(url.toString());
  }

  sessionExpired(returnUrl: string): void {
    this.clearSession();
    const query = new URLSearchParams({ reason: 'expired', returnUrl: safeReturnUrl(returnUrl) });
    this.document.location.assign(`${this.appUrl(LOGIN_ROUTE)}?${query}`);
  }

  private appUrl(route: string): string {
    return new URL(route, this.document.baseURI).toString();
  }

  private async doRefresh(): Promise<AuthSession | null> {
    const current = this.current();
    const refreshToken = current?.refreshToken ?? this.storage.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return null;
    }

    try {
      const discovery = await this.getDiscovery();
      const tokens = await this.requestTokens(discovery, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: AUTH_CONFIG.clientId,
      });
      const session = this.createSession(tokens, refreshToken, current?.idToken);
      this.setSession(session);
      return session;
    } catch (error) {
      // Offline (status 0): keep the refresh token so a later try can work.
      if (!(error instanceof HttpErrorResponse && error.status === 0)) {
        console.warn('Refreshing the session failed; signing out.', error);
        this.clearSession();
      }
      return null;
    }
  }

  private getDiscovery(): Promise<OidcDiscovery> {
    this.discovery ??= firstValueFrom(
      this.http.get<OidcDiscovery>(`${AUTH_CONFIG.issuer}/.well-known/openid-configuration`, {
        context: new HttpContext().set(SKIP_AUTH, true),
      }),
    ).catch((error: unknown) => {
      this.discovery = undefined; // Don't cache a failure, so the next call retries.
      throw error;
    });
    return this.discovery;
  }

  private requestTokens(
    discovery: OidcDiscovery,
    body: Record<string, string>,
  ): Promise<TokenResponse> {
    // HttpParams body = form-urlencoded, which the token endpoint requires.
    return firstValueFrom(
      this.http.post<TokenResponse>(
        discovery.token_endpoint,
        new HttpParams({ fromObject: body }),
        {
          context: new HttpContext().set(SKIP_AUTH, true),
        },
      ),
    );
  }

  /** Checks the id_token's iss, aud, nonce and exp (not the signature). */
  private validateIdToken(
    idToken: string | undefined,
    discovery: OidcDiscovery,
    expectedNonce: string,
  ): void {
    if (!idToken) return;
    const claims = decodeJwtPayload<IdpClaims>(idToken);
    const audiences = [claims?.aud ?? []].flat();

    const problems = [
      !claims && 'unreadable token',
      claims && trimSlash(claims.iss) !== trimSlash(discovery.issuer) && 'issuer mismatch',
      claims && !audiences.includes(AUTH_CONFIG.clientId) && 'audience mismatch',
      claims && claims.nonce !== expectedNonce && 'nonce mismatch',
      claims && claims.exp * 1000 < Date.now() && 'token expired',
    ].filter(Boolean);

    if (problems.length > 0) {
      throw new Error(`The id_token was rejected: ${problems.join(', ')}.`);
    }
  }

  private createSession(
    tokens: TokenResponse,
    previousRefreshToken?: string,
    previousIdToken?: string,
  ): AuthSession {
    const claims = decodeJwtPayload<IdpClaims>(tokens.access_token);
    if (!claims?.sub) {
      throw new Error('The access token couldn’t be read.');
    }

    return {
      accessToken: tokens.access_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      refreshToken: tokens.refresh_token ?? previousRefreshToken,
      idToken: tokens.id_token ?? previousIdToken,
      user: {
        id: claims.sub,
        name: claims.name ?? claims.sub,
        roles: [claims.role ?? []].flat(),
      },
    };
  }

  private setSession(session: AuthSession): void {
    this.current.set(session);
    this.storage.setRefreshToken(session.refreshToken);
  }

  private clearSession(): void {
    this.current.set(null);
    this.storage.clear();
  }
}

function trimSlash(url: string | undefined): string {
  return (url ?? '').replace(/\/+$/, '');
}

/** In-app paths only, so no open redirects to other hosts or `//host`. */
function safeReturnUrl(url: string | null | undefined): string {
  return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')
    ? url
    : DEFAULT_SIGNED_IN_ROUTE;
}
