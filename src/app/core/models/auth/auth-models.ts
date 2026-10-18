/** The bits of the OIDC discovery doc we use. */
export interface OidcDiscovery {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
}

/** Response from `POST /connect/token`. */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  /** Seconds. */
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
}

/** Claims the identity provider puts in its tokens. */
export interface IdpClaims {
  sub: string;
  iss: string;
  aud?: string | string[];
  /** Epoch seconds. */
  exp: number;
  nonce?: string;
  name?: string;
  role?: string | string[];
}

export interface AuthUser {
  id: string;
  name: string;
  roles: string[];
}

/** In-memory session; only the refresh token gets persisted. */
export interface AuthSession {
  accessToken: string;
  /** Epoch ms. */
  expiresAt: number;
  refreshToken?: string;
  idToken?: string;
  user: AuthUser;
}

/** Survives the login redirect, kept in sessionStorage. */
export interface PendingAuthorization {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnUrl: string;
}
