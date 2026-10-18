import { isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';

/** `<origin>/auth/callback` must be registered exactly as the client's redirect URI. */
export const AUTH_CALLBACK_ROUTE = 'auth/callback';
export const LOGIN_ROUTE = 'login';
export const DEFAULT_SIGNED_IN_ROUTE = '/overview';

export const SKIP_SIGN_IN = isDevMode() && environment.auth.skipSignIn;

export const AUTH_CONFIG = {
  issuer: environment.auth.issuer.replace(/\/+$/, ''),
  clientId: environment.auth.clientId,
  scope: environment.auth.scope,
  /** Only these URL prefixes get the access token. */
  secureApiUrls: [environment.apiUrl.replace(/\/+$/, '')],
};
