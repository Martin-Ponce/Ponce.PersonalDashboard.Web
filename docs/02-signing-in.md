# Signing In

The app never sees anyone's password. Signing in happens on the identity provider's own page
(Ponce.IdentityProvider), and the app gets tokens back through the OAuth 2.0 authorization code flow with
PKCE. All of it is in [`core/services/auth-service.ts`](../src/app/core/services/auth-service.ts); no
OIDC library is involved.

## The flow

```
/login                         "Log in with identity provider"
  -> AuthService.login()       makes a PKCE pair, state and nonce, saves them for this tab,
                               then sends the browser to the identity provider's authorize endpoint
  -> identity provider         the user signs in there
  -> /auth/callback?code=...   AuthService.completeLogin() checks the state, exchanges the code for
                               tokens, checks the id token's nonce, then loads the user's settings
  -> the page they wanted      (or /overview), with the ?code= dropped from the browser history
```

The identity provider's endpoints aren't hard-coded: they come from its discovery document,
`{issuer}/.well-known/openid-configuration`.

If someone opens a page while signed out, the [route guard](../src/app/core/guards/auth-guards.ts) sends
them to `/login?returnUrl=...`, and they land back on that page after signing in. Only paths inside the app
are accepted as a return URL, so the login page can't be used to redirect somewhere else.

## Where the tokens live

- **Access token and id token:** only in memory. They're gone on a reload.
- **Refresh token:** in `sessionStorage` ([`token-storage.ts`](../src/app/core/services/token-storage.ts)),
  so it survives a reload but not closing the tab. On startup, `restoreSession()` uses it to get a fresh
  access token before the first page shows.

The identity provider rotates refresh tokens, so the app only ever runs one refresh at a time. Two at once
would race, and the loser would get signed out.

## How API calls get the token

[`auth-interceptor.ts`](../src/app/core/interceptors/auth-interceptor.ts) adds `Authorization: Bearer ...`
to requests going to the API, and only to the API: the URL has to start with `apiUrl` from
[`environment.ts`](../src/environments/environment.ts). Requests to anywhere else, the identity provider
included, never get the token.

If the token is about to expire, it's refreshed before the request goes out. If the API still answers `401`,
the interceptor refreshes once and retries the request. If the refresh itself fails, the user is sent to
`/login?reason=expired`, which shows a "your session ended" message.

## Signing out

**Sign out** in the sidebar clears the session here and sends the browser to the identity provider's
end-session endpoint, so its own sign-in cookie goes too. Then it comes back to `/login`. If the identity
provider can't be reached, only this app is signed out, and the next sign-in may not ask for the password.

## Registering the app on the identity provider

The app is a **public client**: it runs in the browser, so it can't keep a client secret, and PKCE takes its
place. The identity provider needs to know about it before anyone can sign in. With the identity provider
running locally:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\register-idp-client.ps1
```

[`scripts/register-idp-client.ps1`](../scripts/register-idp-client.ps1) opens the browser for you to sign in
as the identity provider's admin, then creates the client, or updates it if it already exists, with:

| | Value |
|---|---|
| Client id | `personal-dashboard-web` |
| Redirect URIs | `<origin>/auth/callback` for each origin |
| Post-logout redirect URIs | `<origin>/login` for each origin |
| Scopes | `openid`, `profile`, `offline_access` |
| Origins | `http://localhost:4200` (`ng serve`) and `http://localhost:8080` (the Docker image) |

For other addresses, pass them in:

```powershell
.\scripts\register-idp-client.ps1 -Idp https://idp.example.com -AppOrigins https://dashboard.example.com
```

The redirect URIs have to match **exactly**, down to the path and trailing slash, or the identity provider
refuses the sign-in. Every origin the app runs on also has to be allowed elsewhere; see
[Running in a Container](04-docker-container.md#every-origin-the-app-runs-on-must-be-allowed).
