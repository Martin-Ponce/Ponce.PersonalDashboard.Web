import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { SettingsService } from './settings-service';

/** Must match the `data-theme` blocks in colors.css. */
export type AppTheme = 'sky' | 'night';

export const APP_THEMES: { key: AppTheme; labelKey: string }[] = [
  { key: 'sky', labelKey: 'theme.sky' },
  { key: 'night', labelKey: 'theme.night' },
];

/** Applies the theme saved in the user's settings, or one previewed while picking. */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly settings = inject(SettingsService);

  /** null = show the saved theme. */
  private readonly previewTheme = signal<AppTheme | null>(null);

  readonly theme = computed(() => this.settings.settings().theme);

  constructor() {
    effect(() => {
      const shown = this.previewTheme() ?? this.theme();
      this.document.documentElement.setAttribute('data-theme', shown);
    });
  }

  setTheme(theme: AppTheme): void {
    this.previewTheme.set(null);
    this.settings.update({ theme });
  }

  preview(theme: AppTheme | null): void {
    this.previewTheme.set(theme);
  }
}
