# Languages and Themes

## Translations

The app uses [Transloco](https://jsverse.gitbook.io/transloco). Every piece of text a user sees lives in
`public/i18n/<code>.json`: `en.json` (English, the default), `es.json` (Spanish) and `sv.json` (Swedish).
All three have exactly the same keys. If a key is missing in one language, the English text shows instead
of the raw key.

- **In templates:** use the pipe, `{{ 'finances.addEntry' | transloco }}`, or with values,
  `{{ 'goals.edit' | transloco: { title: goal.title } }}`.
- **In code:** use `TranslationService.translate(key, params)`. Inside a `computed`, it updates when the
  language changes.
- **Plurals:** keys with `one` / `other` variants, e.g. `finances.count.one` / `finances.count.other`. Pick
  one with `TranslationService.plural('finances.count', count)`.
- **Dates and numbers:** `FormattingService` and Angular's date and number formatting use the locale of the
  current language (`en-US`, `es-ES`, `sv-SE`), plus the user's date format and currency from Settings.

The browser tab title comes from each route's `title`, which is a translation key that
`AppTitleStrategy` translates.

### Adding a language

1. **Translations:** copy `public/i18n/en.json` to `public/i18n/<code>.json` and translate the values.
   Keep the keys and every `{{placeholder}}` as they are.
2. **The language list:** add it to [`language.constants.ts`](../src/app/core/constants/language.constants.ts),
   to the `AppLanguage` type and to `APP_LANGUAGES` with its Angular locale, e.g.
   `{ code: 'de', locale: 'de-DE' }`.
3. **Locale data:** register it in [`translation-service.ts`](../src/app/core/services/translation-service.ts),
   next to the others:
   ```ts
   import localeDe from '@angular/common/locales/de';
   registerLocaleData(localeDe);
   ```
4. **Its name:** add its name to `language` in **every** translation file, written in the language itself
   (e.g. `"de": "Deutsch"`), so the picker shows it the same way whatever language you're in.
5. **The API:** add the code to `UserSettingsOptions.LANGUAGES` in Ponce.PersonalDashboard.Core, or the API
   rejects it when a user saves their settings.

The new language then shows up in Settings and in the Customize overview window on its own.

## Themes

There are two themes, **Sky** (the default) and **Night**. A theme is just a set of color values plus a
wallpaper.

### Colors

Every color in the app is a CSS variable from [`core/ui/colors.css`](../src/app/core/ui/colors.css).
Components only ever use `var(--color-...)`, never a hex value or `rgba(...)` of their own. The file has:

- **One block per theme** (`[data-theme='sky']`, `[data-theme='night']`) with the few values that change
  between themes: the accent colors and the backdrop.
- **The shared tokens** in `:root`: text, surfaces, borders, shadows, the gloss and surface gradients,
  status colors, the pill colors used by tags, and the chart palette.

`ThemeService` sets `data-theme` on `<html>`, so switching themes just swaps those values. While someone is
picking a theme in Settings, it's shown as a preview until they save or leave the page.

If you need a new color, add a token to `colors.css` (in the theme blocks if it should change per theme,
otherwise in the shared `:root`) and use it from there.

### Adding a theme

1. **Colors:** in `colors.css`, copy the Night block, rename it to `[data-theme='<key>']` and change the values.
2. **The theme list:** add the key to `AppTheme` and `APP_THEMES` in
   [`theme-service.ts`](../src/app/core/services/theme-service.ts).
3. **Its name:** add `theme.<key>` to every translation file.
4. **The wallpaper:** put the image in `core/ui/assets/backgrounds/`, then add a rule for the theme
   wherever the wallpapers are listed: `core/ui/styles/wallpaper.css` (the page background),
   `core/ui/components/theme-settings/theme-settings.css` (the thumbnails in Customize overview) and
   `pages/settings/settings.css` (the theme cards).
5. **The API:** add the key to `UserSettingsOptions.THEMES` in Ponce.PersonalDashboard.Core.
