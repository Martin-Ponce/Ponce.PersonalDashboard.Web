import { formatDate, getCurrencySymbol } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable, forkJoin } from 'rxjs';
import { APP_NAME } from '../../core/constants/app.constants';
import { APP_LANGUAGES, AppLanguage } from '../../core/constants/language.constants';
import {
  CURRENCIES,
  CurrencyCode,
  DATE_FORMATS,
  DateFormat,
  TIME_ZONES,
} from '../../core/constants/settings.constants';
import { UserSettings } from '../../core/models/user/user-settings';
import { formatMoney } from '../../core/services/formatting-service';
import { SettingsService, deviceTimeZone } from '../../core/services/settings-service';
import { APP_THEMES, ThemeService } from '../../core/services/theme-service';
import { TranslationService } from '../../core/services/translation-service';
import { UserService } from '../../core/services/user-service';
import { Button } from '../../core/ui/components/button/button';
import { Card } from '../../core/ui/components/card/card';
import { Entry } from '../../core/ui/components/entry/entry';
import { FormField } from '../../core/ui/components/form-field/form-field';
import { PageHeader } from '../../core/ui/components/page-header/page-header';
import { SegmentedControl } from '../../core/ui/components/segmented-control/segmented-control';
import { Select } from '../../core/ui/components/select/select';
import { Tag, TagColor } from '../../core/ui/components/tag/tag';
import { Toggle } from '../../core/ui/components/toggle/toggle';
import { SelectOption } from '../../core/ui/models/select-option';
import { ProfilePicturePicker } from './profile-picture-picker/profile-picture-picker';

/** What the page edits: the settings plus the display name. */
interface SettingsDraft extends UserSettings {
  displayName: string;
}

const PREVIEW_AMOUNTS = [1842.5, -140];
const CLOCK_REFRESH_MS = 30_000;

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    TranslocoPipe,
    Button,
    Card,
    Entry,
    FormField,
    PageHeader,
    SegmentedControl,
    Select,
    Tag,
    Toggle,
    ProfilePicturePicker,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(TranslationService);
  private readonly settingsService = inject(SettingsService);
  private readonly userService = inject(UserService);

  protected readonly appName = APP_NAME;
  protected readonly themes = APP_THEMES;
  protected readonly userName = computed(
    () => this.userService.currentUser()?.userName ?? this.userService.profile().name,
  );
  protected readonly profileName = computed(
    () => this.draft().displayName.trim() || this.userName(),
  );

  // ---------- Draft ----------
  private readonly saved = signal<SettingsDraft>(this.currentSettings());
  protected readonly draft = signal<SettingsDraft>(this.saved());
  private readonly justSaved = signal(false);
  protected readonly saving = signal(false);
  private readonly saveFailed = signal(false);

  protected readonly dirty = computed(() => {
    const saved = this.saved();
    const draft = this.draft();
    return (Object.keys(saved) as (keyof SettingsDraft)[]).some((k) => saved[k] !== draft[k]);
  });

  protected readonly status = computed<{ key: string; color: TagColor }>(() => {
    if (this.saveFailed()) return { key: 'settings.status.saveError', color: 'danger' };
    if (this.dirty()) return { key: 'settings.status.unsaved', color: 'warning' };
    return this.justSaved()
      ? { key: 'settings.status.saved', color: 'success' }
      : { key: 'settings.status.allSaved', color: 'success' };
  });

  // ---------- Options ----------
  private readonly draftLocale = computed(
    () => APP_LANGUAGES.find((l) => l.code === this.draft().language)!.locale,
  );

  protected readonly languageOptions = computed<SelectOption<AppLanguage>[]>(() =>
    APP_LANGUAGES.map((l) => ({ label: this.i18n.translate(`language.${l.code}`), value: l.code })),
  );

  protected readonly dateFormatOptions: SelectOption<DateFormat>[] = DATE_FORMATS.map((f) => ({
    label: f.value,
    value: f.value,
  }));

  protected readonly currencyOptions = computed<SelectOption<CurrencyCode>[]>(() => {
    const locale = this.i18n.locale();
    const names = new Intl.DisplayNames([locale], { type: 'currency' });
    return CURRENCIES.map((code) => ({
      label: `${capitalize(names.of(code) ?? code)} (${getCurrencySymbol(code, 'wide', locale)})`,
      value: code,
    }));
  });

  protected readonly shownTimeZone = computed(() =>
    this.draft().autoTimeZone ? deviceTimeZone() : this.draft().timeZone,
  );

  protected readonly timeZoneOptions = computed<SelectOption<string>[]>(() => {
    const options = TIME_ZONES.map((zone) => ({
      label: `${this.i18n.translate(zone.labelKey)} (${utcOffset(zone.id)})`,
      value: zone.id,
    }));
    // The device zone might not be listed; add it so the select isn't blank.
    const device = deviceTimeZone();
    if (!options.some((o) => o.value === device)) {
      options.unshift({
        label: `${device.replace(/_/g, ' ')} (${utcOffset(device)})`,
        value: device,
      });
    }
    return options;
  });

  // ---------- Previews ----------
  private readonly now = signal(new Date());

  protected readonly datePreview = computed(() => {
    const locale = this.draftLocale();
    const pattern = DATE_FORMATS.find((f) => f.value === this.draft().dateFormat)!.pattern;
    const longDate = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.now());
    return `${formatDate(this.now(), pattern, locale)} · ${longDate}`;
  });

  protected readonly moneyPreview = computed(() => {
    const { currency, showDecimals } = this.draft();
    const format = { locale: this.draftLocale(), currency, showDecimals };
    return PREVIEW_AMOUNTS.map((amount) => formatMoney(amount, format)).join(' · ');
  });

  protected readonly timePreview = computed(() =>
    new Intl.DateTimeFormat(this.draftLocale(), {
      timeZone: this.shownTimeZone(),
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(this.now()),
  );

  constructor() {
    effect(() => {
      const theme = this.draft().theme;
      this.themeService.preview(theme === this.saved().theme ? null : theme);
    });

    const clock = setInterval(() => this.now.set(new Date()), CLOCK_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(clock);
      // Leaving without saving goes back to the saved theme.
      this.themeService.preview(null);
    });
  }

  update(patch: Partial<SettingsDraft>): void {
    this.draft.update((draft) => ({ ...draft, ...patch }));
    this.justSaved.set(false);
    this.saveFailed.set(false);
  }

  /** Saves the settings, plus the display name if it changed. */
  save(): void {
    const draft = { ...this.draft(), displayName: this.draft().displayName.trim() };
    const { displayName, ...settings } = draft;
    const changes: Observable<unknown>[] = [this.settingsService.save(settings)];
    if (displayName !== this.saved().displayName) {
      changes.push(this.userService.updateDisplayName(displayName));
    }
    this.saving.set(true);
    forkJoin(changes).subscribe({
      next: () => {
        this.saved.set(draft);
        this.draft.set(draft);
        this.justSaved.set(true);
        this.saveFailed.set(false);
        this.saving.set(false);
      },
      error: () => {
        this.saveFailed.set(true);
        this.saving.set(false);
      },
    });
  }

  discard(): void {
    this.draft.set(this.saved());
    this.saveFailed.set(false);
  }

  private currentSettings(): SettingsDraft {
    return {
      ...this.settingsService.settings(),
      displayName: this.userService.currentUser()?.displayName ?? '',
    };
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** A zone's current offset, like "UTC+2" (DST-aware). */
function utcOffset(timeZone: string): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName')?.value;
  return !name || name === 'GMT' ? 'UTC' : name.replace('GMT', 'UTC').replace('-', '−');
}
