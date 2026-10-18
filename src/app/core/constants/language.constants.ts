/** Must match the files in public/i18n. */
export type AppLanguage = 'en' | 'es' | 'sv';

export interface LanguageOption {
  code: AppLanguage;
  locale: string;
}

export const APP_LANGUAGES: LanguageOption[] = [
  { code: 'en', locale: 'en-US' },
  { code: 'es', locale: 'es-ES' },
  { code: 'sv', locale: 'sv-SE' },
];

export const DEFAULT_LANGUAGE: AppLanguage = 'en';
