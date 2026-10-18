# Ponce.PersonalDashboard.Web docs

[Leer en español](#español)

## English

These guides are for working on the app itself: how it's put together, how to run it, and how the
pieces around it (the API and the identity provider) plug in. If you just want to know what the app does
and how to use it, the [main README](../README.md) is the place.

The backend is Ponce.PersonalDashboard.Core (add repo link) and sign-in goes through my identity provider,
Ponce.IdentityProvider (add repo link).

| # | Guide | What's in it |
|---|-------|--------------|
| 1 | [Getting Started](01-getting-started.md) | What you need installed, running it locally, where the settings come from, building, testing and formatting. |
| 2 | [Signing In](02-signing-in.md) | How the identity provider sign-in works, where tokens live, how API calls get the token, and registering the app on the identity provider. |
| 3 | [Languages and Themes](03-languages-and-themes.md) | Translations (and adding a new language), and the color tokens behind the Sky and Night themes. |
| 4 | [Running in a Container](04-docker-container.md) | Building and running the Docker image, its runtime settings, and the origins every environment has to allow. |

## How it's organized

It's an Angular 22 app: standalone components, signals, zoneless change detection and lazy-loaded pages.

```
src/
  environments/environment.ts   <- API and identity provider addresses (read at runtime from assets/env.js)
  app/
    app.config.ts               <- providers, and the startup steps (restore session, load settings, translations)
    app.routes.ts               <- /login, /auth/callback, and the shell with every page
    core/
      constants/                <- fixed lists and settings (statuses, categories, languages, auth...)
      guards/                   <- signed-in / signed-out route guards
      interceptors/             <- adds the access token to API calls
      models/                   <- the shapes of what the API sends and receives
      pipes/                    <- template helpers (money, "in 3 days")
      services/                 <- one per feature, plus auth, settings, formatting, translations
      shell/                    <- the frame around every page: header, sidebar, profile card
      ui/                       <- shared components, colors.css, typography, icons and images
      utils/                    <- small helpers (dates, PKCE, JWT reading)
    pages/
      overview/  finances/  calendar/  job-applications/  goals/  settings/  login/
public/
  i18n/                         <- translation files (en, es, sv)
  assets/env.js                 <- runtime settings, rewritten by the Docker image at start
```

Each page lives in its own folder under `pages/`, with its own `*.routes.ts` that the main routes load
lazily. Windows (modals) and bigger pieces of a page get their own subfolder next to it.

This is the path an API call takes:

```
Page component (e.g. pages/finances/finances.ts)
  -> core/services/<feature>-service.ts       (the feature's API calls)
  -> core/services/http-manager-service.ts    (the HttpClient wrapper every call goes through)
  -> core/interceptors/auth-interceptor.ts    (adds the access token, refreshes it on a 401)
  -> Ponce.PersonalDashboard.Core.API
```

A few conventions worth knowing before changing things:

- **Colors** only come from the tokens in `core/ui/colors.css`; components never hard-code them.
- **Text** shown to the user always goes through the translation files, never straight in a template.
- **Shared components** live in `core/ui/components`; a page only builds its own when nothing there fits.
- **Formatting** is Prettier with the repo's `.prettierrc`.

---

## Español

Estas guías son para trabajar en la app en sí: cómo está armada, cómo correrla y cómo se conectan las
piezas de alrededor (la API y el proveedor de identidad). Si solo quieres saber qué hace la app y cómo
usarla, eso está en el [README principal](../README.md).

El backend es Ponce.PersonalDashboard.Core (add repo link) y el inicio de sesión pasa por mi proveedor de
identidad, Ponce.IdentityProvider (add repo link).

| # | Guía | Qué tiene |
|---|------|-----------|
| 1 | [Getting Started](01-getting-started.md) | Qué necesitas instalado, cómo correrla en local, de dónde sale la configuración, cómo compilar, probar y formatear. |
| 2 | [Signing In](02-signing-in.md) | Cómo funciona el inicio de sesión con el proveedor de identidad, dónde viven los tokens, cómo reciben el token las llamadas a la API y cómo registrar la app en el proveedor. |
| 3 | [Languages and Themes](03-languages-and-themes.md) | Las traducciones (y cómo agregar un idioma) y los tokens de color detrás de los temas Sky y Night. |
| 4 | [Running in a Container](04-docker-container.md) | Cómo construir y correr la imagen de Docker, su configuración en tiempo de ejecución y los orígenes que cada entorno tiene que permitir. |

Las guías están en inglés.

### Cómo está organizado

Es una app de Angular 22: componentes standalone, signals, detección de cambios sin zone.js y páginas que
se cargan bajo demanda. La estructura de carpetas está arriba, en la sección en inglés.

Cada página vive en su propia carpeta dentro de `pages/`, con su propio `*.routes.ts` que las rutas
principales cargan bajo demanda. Las ventanas (modales) y las partes grandes de una página van en su propia
subcarpeta al lado.

Este es el camino que sigue una llamada a la API:

```
Componente de la página (p. ej. pages/finances/finances.ts)
  -> core/services/<feature>-service.ts       (las llamadas a la API de esa funcionalidad)
  -> core/services/http-manager-service.ts    (el envoltorio de HttpClient por el que pasa cada llamada)
  -> core/interceptors/auth-interceptor.ts    (agrega el token de acceso y lo renueva si llega un 401)
  -> Ponce.PersonalDashboard.Core.API
```

Algunas convenciones que conviene saber antes de cambiar cosas:

- **Los colores** solo salen de los tokens en `core/ui/colors.css`; los componentes nunca los escriben a mano.
- **Los textos** que ve el usuario siempre pasan por los archivos de traducción, nunca directo en una plantilla.
- **Los componentes compartidos** viven en `core/ui/components`; una página solo arma el suyo cuando no hay ninguno que sirva.
- **El formato** es Prettier con el `.prettierrc` del repo.
