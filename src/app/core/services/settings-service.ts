import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_SIGN_IN } from '../constants/auth.constants';
import { DEFAULT_LANGUAGE } from '../constants/language.constants';
import { DEFAULT_PROFILE_PICTURE } from '../constants/profile.constants';
import { DATE_FORMATS, TIME_ZONES } from '../constants/settings.constants';
import { UserSettings } from '../models/user/user-settings';
import { AuthService } from './auth-service';
import { HttpManagerService } from './http-manager-service';
import { TranslationService } from './translation-service';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'sky',
  language: DEFAULT_LANGUAGE,
  dateFormat: 'DD/MM/YYYY',
  currency: 'EUR',
  showDecimals: true,
  autoTimeZone: true,
  timeZone: TIME_ZONES[0].id,
  profilePicture: DEFAULT_PROFILE_PICTURE,
  overviewWidgets: { summary: true, spending: true, dates: true, applications: true },
};

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

/** The user's settings, synced with the API and loaded before first render. */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly httpService = inject(HttpManagerService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(TranslationService);
  private readonly urlSettings = `${environment.apiUrl}/api/users/me/settings`;

  private readonly current = signal<UserSettings>(DEFAULT_SETTINGS);

  readonly settings = this.current.asReadonly();
  readonly currency = computed(() => this.current().currency);
  readonly showDecimals = computed(() => this.current().showDecimals);
  readonly datePattern = computed(
    () => DATE_FORMATS.find((f) => f.value === this.current().dateFormat)!.pattern,
  );
  readonly timeZone = computed(() =>
    this.current().autoTimeZone ? deviceTimeZone() : this.current().timeZone,
  );

  constructor() {
    effect(() => this.i18n.setLanguage(this.current().language));
  }

  /** Loads saved settings, falling back to defaults. Never rejects. */
  async load(): Promise<void> {
    try {
      this.current.set(await firstValueFrom(this.httpService.get<UserSettings>(this.urlSettings)));
    } catch {
      // API unreachable or not signed in yet: keep the defaults.
    }
  }

  save(settings: UserSettings): Observable<UserSettings> {
    return this.httpService
      .put<UserSettings>(this.urlSettings, settings)
      .pipe(tap((saved) => this.current.set(saved)));
  }

  /** Applies a change right away, saving it in the background when signed in. */
  update(patch: Partial<UserSettings>): void {
    this.current.update((settings) => ({ ...settings, ...patch }));
    if (!SKIP_SIGN_IN && !this.auth.isAuthenticated()) return;
    this.httpService.put<UserSettings>(this.urlSettings, this.current()).subscribe({
      error: () => {
        // Still applies for this session.
      },
    });
  }
}
