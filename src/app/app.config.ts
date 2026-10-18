import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { TitleStrategy, provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { SKIP_SIGN_IN } from './core/constants/auth.constants';
import { APP_LANGUAGES, DEFAULT_LANGUAGE } from './core/constants/language.constants';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AppTitleStrategy } from './core/services/app-title-strategy';
import { AuthService } from './core/services/auth-service';
import { SettingsService } from './core/services/settings-service';
import { ThemeService } from './core/services/theme-service';
import { TranslationService } from './core/services/translation-service';
import { UserService } from './core/services/user-service';
import { TranslocoHttpLoader } from './core/services/transloco-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: APP_LANGUAGES.map((l) => l.code),
        defaultLang: DEFAULT_LANGUAGE,
        fallbackLang: DEFAULT_LANGUAGE,
        missingHandler: { useFallbackTranslation: true },
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    // Restore the session, then load user, settings, theme and translations before first render.
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      const settings = inject(SettingsService);
      const user = inject(UserService);
      const i18n = inject(TranslationService);
      inject(ThemeService);
      await auth.restoreSession();
      if (SKIP_SIGN_IN || auth.isAuthenticated()) {
        await Promise.all([settings.load(), user.load()]);
      }
      await i18n.init(settings.settings().language);
    }),
  ],
};
