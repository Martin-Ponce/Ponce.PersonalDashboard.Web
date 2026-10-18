import { DOCUMENT } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AUTH_CONFIG } from '../constants/auth.constants';
import { authInterceptor, isSecureUrl } from '../interceptors/auth-interceptor';
import { decodeJwtPayload } from '../utils/jwt';
import { base64UrlEncode, createCodeChallenge } from '../utils/pkce';
import { AuthService } from './auth-service';

const DISCOVERY = {
  issuer: `${AUTH_CONFIG.issuer}/`,
  authorization_endpoint: `${AUTH_CONFIG.issuer}/connect/authorize`,
  token_endpoint: `${AUTH_CONFIG.issuer}/connect/token`,
  end_session_endpoint: `${AUTH_CONFIG.issuer}/connect/logout`,
};
const DISCOVERY_URL = `${AUTH_CONFIG.issuer}/.well-known/openid-configuration`;
const API_URL = `${AUTH_CONFIG.secureApiUrls[0]}/api/overview`;

/** An unsigned JWT with the given claims (the browser never checks signatures). */
function jwt(claims: Record<string, unknown>): string {
  const part = (value: object) => base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));
  return `${part({ alg: 'none' })}.${part(claims)}.signature`;
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('PKCE and JWT helpers', () => {
  it('computes the S256 challenge as base64url(SHA-256)', async () => {
    // SHA-256("abc") is the FIPS 180 test vector ba7816bf…15ad, here in base64url without padding.
    expect(await createCodeChallenge('abc')).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
  });

  it('reads JWT claims, including non-ASCII text', () => {
    expect(decodeJwtPayload(jwt({ sub: '1', name: 'Martín' }))).toEqual({
      sub: '1',
      name: 'Martín',
    });
    expect(decodeJwtPayload('not-a-token')).toBeNull();
  });

  it('only treats the API prefix as secure, on a path boundary', () => {
    const prefixes = ['http://localhost:5010'];
    expect(isSecureUrl('http://localhost:5010/api/x', prefixes)).toBe(true);
    expect(isSecureUrl('http://localhost:5010?x=1', prefixes)).toBe(true);
    expect(isSecureUrl('http://localhost:50100/api', prefixes)).toBe(false);
    expect(isSecureUrl('http://localhost:5008/connect/token', prefixes)).toBe(false);
  });
});

describe('AuthService', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let assign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        // The real location can't navigate in tests; capture where the app sends the browser.
        {
          provide: DOCUMENT,
          useValue: { baseURI: 'http://localhost:4200/', location: { assign } },
        },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Runs login() and returns the authorize URL the browser was sent to. */
  async function startLogin(returnUrl?: string): Promise<URL> {
    const login = auth.login(returnUrl);
    http.expectOne(DISCOVERY_URL).flush(DISCOVERY);
    await login;
    return new URL(assign.mock.calls[0][0]);
  }

  /** Completes a login whose token response carries `claims` in the access token. */
  async function signIn(claims: Record<string, unknown> = { sub: 'user-1', name: 'dev' }) {
    const url = await startLogin('/finances');
    const done = auth.completeLogin({ code: 'the-code', state: url.searchParams.get('state') });
    await flush();
    const tokenRequest = http.expectOne(DISCOVERY.token_endpoint);
    tokenRequest.flush({
      access_token: jwt(claims),
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'refresh-1',
      id_token: jwt({
        iss: DISCOVERY.issuer,
        aud: AUTH_CONFIG.clientId,
        nonce: url.searchParams.get('nonce'),
        exp: Date.now() / 1000 + 300,
      }),
    });
    return { returnUrl: await done, tokenRequest };
  }

  it('sends the browser to the authorize endpoint with PKCE', async () => {
    const url = await startLogin('/finances');

    expect(`${url.origin}${url.pathname}`).toBe(DISCOVERY.authorization_endpoint);
    expect(url.searchParams.get('client_id')).toBe(AUTH_CONFIG.clientId);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:4200/auth/callback');
    expect(url.searchParams.get('scope')).toBe(AUTH_CONFIG.scope);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/);
    expect(url.searchParams.get('state')).toBeTruthy();
  });

  it('exchanges the code, keeps only the refresh token in storage, and returns the page to open', async () => {
    const { returnUrl, tokenRequest } = await signIn();

    const body = tokenRequest.request.body.toString();
    expect(body).toContain('grant_type=authorization_code');
    expect(body).toContain('code=the-code');
    expect(body).toContain('code_verifier=');
    expect(tokenRequest.request.headers.has('Authorization')).toBe(false);
    expect(returnUrl).toBe('/finances');
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()).toEqual({ id: 'user-1', name: 'dev', roles: [] });
    expect(sessionStorage.getItem('auth.refresh_token')).toBe('refresh-1');
    expect(JSON.stringify(sessionStorage)).not.toContain('.signature');
  });

  it('rejects a callback whose state does not match', async () => {
    await startLogin();
    await expect(auth.completeLogin({ code: 'x', state: 'forged' })).rejects.toThrow();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('never sends an open-redirect return URL', async () => {
    const url = await startLogin('https://evil.example');
    const done = auth.completeLogin({ code: 'c', state: url.searchParams.get('state') });
    await flush();
    http.expectOne(DISCOVERY.token_endpoint).flush({
      access_token: jwt({ sub: 'u' }),
      token_type: 'Bearer',
      expires_in: 900,
    });
    expect(await done).toBe('/overview');
  });

  it('adds the access token to API requests only', async () => {
    await signIn();
    const client = TestBed.inject(HttpClient);

    const api = firstValueFrom(client.get(API_URL));
    await flush();
    const apiRequest = http.expectOne(API_URL);
    expect(apiRequest.request.headers.get('Authorization')).toMatch(/^Bearer /);
    apiRequest.flush({});
    await api;

    const other = firstValueFrom(client.get('https://example.com/data'));
    await flush();
    const otherRequest = http.expectOne('https://example.com/data');
    expect(otherRequest.request.headers.has('Authorization')).toBe(false);
    otherRequest.flush({});
    await other;
  });

  it('refreshes once, even when asked twice at the same time', async () => {
    await signIn();
    const first = auth.refresh();
    const second = auth.refresh();
    await flush();

    const refresh = http.expectOne(DISCOVERY.token_endpoint);
    expect(refresh.request.body.toString()).toContain('grant_type=refresh_token');
    refresh.flush({
      access_token: jwt({ sub: 'user-1' }),
      token_type: 'Bearer',
      expires_in: 900,
      refresh_token: 'refresh-2',
    });

    expect(await first).toBe(await second);
    expect(sessionStorage.getItem('auth.refresh_token')).toBe('refresh-2');
  });

  it('restores the session from the stored refresh token', async () => {
    sessionStorage.setItem('auth.refresh_token', 'stored');
    const restore = auth.restoreSession();
    http.expectOne(DISCOVERY_URL).flush(DISCOVERY);
    await flush();
    http.expectOne(DISCOVERY.token_endpoint).flush({
      access_token: jwt({ sub: 'u', name: 'dev' }),
      token_type: 'Bearer',
      expires_in: 900,
    });
    await restore;

    expect(auth.user()?.name).toBe('dev');
    // No new refresh token was sent: the stored one is kept.
    expect(sessionStorage.getItem('auth.refresh_token')).toBe('stored');
  });

  it('signs out of the identity provider too, sending the id_token, and comes back to the login page', async () => {
    await signIn();
    await auth.logout();

    expect(auth.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('auth.refresh_token')).toBeNull();
    const url = new URL(assign.mock.lastCall![0]);
    expect(`${url.origin}${url.pathname}`).toBe(DISCOVERY.end_session_endpoint);
    expect(url.searchParams.get('client_id')).toBe(AUTH_CONFIG.clientId);
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe('http://localhost:4200/login');
    expect(decodeJwtPayload(url.searchParams.get('id_token_hint')!)).toMatchObject({
      aud: AUTH_CONFIG.clientId,
    });
  });

  it('keeps the id_token across refreshes that do not send a new one', async () => {
    await signIn();
    const refresh = auth.refresh();
    await flush();
    http.expectOne(DISCOVERY.token_endpoint).flush({
      access_token: jwt({ sub: 'user-1' }),
      token_type: 'Bearer',
      expires_in: 900,
    });
    await refresh;

    await auth.logout();
    expect(new URL(assign.mock.lastCall![0]).searchParams.get('id_token_hint')).toBeTruthy();
  });

  it('only signs out of this app when the identity provider is unreachable', async () => {
    const logout = auth.logout();
    http.expectOne(DISCOVERY_URL).error(new ProgressEvent('error'));
    await logout;

    expect(assign).toHaveBeenLastCalledWith('http://localhost:4200/login');
  });
});
