# Running in a Container

The [`Dockerfile`](../Dockerfile) builds the app with Node and serves the result with unprivileged nginx
on port **4000**.

> This assumes Docker Desktop (or another local Docker engine) is installed and running.

## Build and run

From the repo root:

```powershell
docker build -t personal-dashboard-web .
docker run --rm -p 8080:4000 personal-dashboard-web
```

Then open http://localhost:8080. The API and the identity provider have to be reachable from your browser,
not just from the container, since it's the browser that talks to them.

The build stage pins the Node version with `NODE_VERSION`. Angular 22 needs 24.15 or newer; to try another
one without editing the file:

```powershell
docker build --build-arg NODE_VERSION=24.15.0-alpine -t personal-dashboard-web .
```

## Runtime settings

The same image runs in any environment. On every container start, [`env.sh`](../env.sh) writes
`assets/env.js` (`window.__env`, read by
[`environment.ts`](../src/environments/environment.ts)) from these variables, and sets `<base href>`:

| Variable | Default | Meaning |
|---|---|---|
| `API_URL` | `http://localhost:5010` | Base URL of Ponce.PersonalDashboard.Core.API, as the **browser** reaches it |
| `IDP_ISSUER` | `http://localhost:5008` | Identity provider base URL (OIDC issuer); must match the API's `Authentication:Authority` |
| `IDP_CLIENT_ID` | `personal-dashboard-web` | Public client registered on the identity provider |
| `IDP_SCOPE` | `openid profile offline_access` | Requested scopes |
| `BASE_HREF` | `/` | Path the app is served from, e.g. `/dashboard/` behind a reverse proxy |

```powershell
docker run --rm -p 8080:4000 -e API_URL=https://api.example.com -e IDP_ISSUER=https://idp.example.com personal-dashboard-web
```

Everything here is public: it ends up in a file any visitor can download. Don't pass anything secret.

## What nginx does

[`nginx.conf`](../nginx.conf) is small:

- **Client-side routes:** any path that isn't a file falls back to `index.html`, so reloading `/finances`
  works.
- **Caching:** the bundled `.js`/`.css`, fonts and images have content hashes in their names, so they're
  cached for a year. `index.html` and the translation files are always revalidated, and `assets/env.js` is
  never cached, so a new deploy or new runtime settings show up right away.
- **Compression:** gzip for CSS, JS, JSON and SVG.

## Every origin the app runs on must be allowed

Each origin the app is served from (`http://localhost:4200` for `ng serve`, `http://localhost:8080` for the
container, and your real domain) has to be:

- **On the identity provider's client:** a redirect URI (`<origin>/auth/callback`) and a post-logout
  redirect URI (`<origin>/login`). [`scripts/register-idp-client.ps1`](../scripts/register-idp-client.ps1)
  registers `http://localhost:4200` and `http://localhost:8080`; see
  [Signing In](02-signing-in.md#registering-the-app-on-the-identity-provider).
- **In the identity provider's CORS origins** (`Cors:Origins` / `CORS_ORIGINS`), for the token exchange.
- **In the API's CORS origins** (`Cors:Origins` in its appsettings, or `CORS_ORIGINS`).

If one is missing, signing in fails, or every API call shows a connection error, even though both servers
are running fine.
