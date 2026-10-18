import { DOCUMENT, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeSv from '@angular/common/locales/sv';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, firstValueFrom } from 'rxjs';
import { APP_LANGUAGES, AppLanguage, DEFAULT_LANGUAGE } from '../constants/language.constants';

// Only English locale data ships with Angular; the rest must be registered.
registerLocaleData(localeEs);
registerLocaleData(localeSv);

/** Values for {{ placeholders }} in a translation. */
export type TranslationParams = Record<string, unknown>;

/** Wraps Transloco and keeps <html lang> in sync with the language. */
@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly currentLanguage = signal<AppLanguage>(DEFAULT_LANGUAGE);

  readonly languages = APP_LANGUAGES;
  readonly language = this.currentLanguage.asReadonly();
  readonly locale = computed(
    () => APP_LANGUAGES.find((l) => l.code === this.currentLanguage())!.locale,
  );

  constructor() {
    effect(() => {
      const language = this.currentLanguage();
      this.transloco.setActiveLang(language);
      this.document.documentElement.lang = language;
    });
  }

  async init(language: AppLanguage): Promise<void> {
    await firstValueFrom(this.transloco.load(language));
    this.currentLanguage.set(language);
  }

  /** Loads the language's translations first, then switches to it. */
  setLanguage(language: AppLanguage): void {
    if (language === this.currentLanguage()) return;
    this.transloco.load(language).subscribe(() => this.currentLanguage.set(language));
  }

  translate(key: string, params?: TranslationParams): string {
    return this.transloco.translate(key, params, this.currentLanguage());
  }

  plural(key: string, count: number, params?: TranslationParams): string {
    return this.translate(`${key}.${count === 1 ? 'one' : 'other'}`, { ...params, count });
  }

  translate$(key: string, params?: TranslationParams): Observable<string> {
    return this.transloco.selectTranslate(key, params);
  }
}
