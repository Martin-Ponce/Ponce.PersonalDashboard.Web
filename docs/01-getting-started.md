# Getting Started

## Prerequisites

- **Node.js 24.15 or newer** (22.22.3+ also works). The Angular 22 CLI refuses to run on anything older.
- **npm 11** (comes with Node 24).
- **The API** (Ponce.PersonalDashboard.Core) running, by default on `http://localhost:5010`.
- **The identity provider** (Ponce.IdentityProvider) running, by default on `http://localhost:5008`, with
  this app registered as a client (see [Signing In](02-signing-in.md#registering-the-app-on-the-identity-provider)).

## Running it locally

```powershell
npm install
npm start
```

`npm start` runs `ng serve`. Open http://localhost:4200; the page reloads on its own whenever you change a
file. Every page except `/login` needs you to be signed in, so without the identity provider running you'll
only get as far as the login screen.

## Where the settings come from

There are only a handful, all in [`src/environments/environment.ts`](../src/environments/environment.ts):

| Setting | Default | What it is |
|---|---|---|
| `apiUrl` | `http://localhost:5010` | Base URL of the API, as the browser reaches it |
| `auth.issuer` | `http://localhost:5008` | The identity provider's base URL; must match the API's `Authentication:Authority` |
| `auth.clientId` | `personal-dashboard-web` | The public client registered on the identity provider |
| `auth.scope` | `openid profile offline_access` | Scopes to ask for (`offline_access` is what gets you a refresh token) |
| `auth.skipSignIn` | `false` | Development only: opens every page without signing in (ignored in production builds) |

The first four can be overridden at runtime without rebuilding: `environment.ts` reads them from
`window.__env`, which [`public/assets/env.js`](../public/assets/env.js) sets. During development that file
is empty, so the defaults above apply. The Docker image rewrites it on every start from environment
variables (see [Running in a Container](04-docker-container.md#runtime-settings)).

None of these are secrets. A browser app can't keep secrets anyway, which is why the app signs in as a
public client with PKCE instead of a client secret.

### Working on pages without the identity provider

Set `skipSignIn: true` in `environment.ts` to open every page without signing in. API calls will still go
out without a token, so whatever needs the API will show its error state unless the API lets the request
through. Set it back to `false` before committing.

### The user's own settings

Theme, language, date format, currency, time zone, profile picture and which Overview widgets are shown are
saved per user through the API (`SettingsService` and `UserService`). They're loaded right after signing in,
before the first page renders. The allowed values on both sides have to match: the API keeps its copy in
`UserSettingsOptions`.

## Building

```powershell
npm run build
```

The output goes to `dist/ponce-personal-dashboard-web/browser`. Each component stylesheet gets a warning
over 4 kB and fails the build over 8 kB. Going over usually means the component should be split up.

## Tests

```powershell
npm test
```

Runs the unit tests (`*.spec.ts`) once with Vitest. To run a single file:

```powershell
npx ng test --watch=false --include="src/app/core/ui/components/paginator/paginator.spec.ts"
```

## Formatting

```powershell
npx prettier --write src
```

Uses the repo's `.prettierrc`. Run it before committing.
