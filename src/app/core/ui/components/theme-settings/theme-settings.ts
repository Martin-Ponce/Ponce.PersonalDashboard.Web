import { Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { APP_THEMES, AppTheme, ThemeService } from '../../../services/theme-service';

@Component({
  selector: 'app-theme-settings',
  imports: [TranslocoPipe],
  styleUrl: './theme-settings.css',
  template: `
    <div
      class="theme-settings"
      [class.theme-settings--compact]="compact()"
      role="group"
      [attr.aria-label]="'theme.label' | transloco"
    >
      @for (theme of themes; track theme.key) {
        <button
          type="button"
          class="theme-settings__option"
          [attr.aria-pressed]="current() === theme.key"
          [attr.aria-label]="'theme.option' | transloco: { name: (theme.labelKey | transloco) }"
          [title]="theme.labelKey | transloco"
          (click)="setTheme(theme.key)"
        >
          <span
            class="theme-settings__thumb"
            [class]="'theme-settings__thumb--' + theme.key"
            [class.theme-settings__thumb--active]="current() === theme.key"
          ></span>
          <span class="theme-settings__name">{{ theme.labelKey | transloco }}</span>
        </button>
      }
    </div>
  `,
})
export class ThemeSettings {
  private readonly themeService = inject(ThemeService);

  compact = input(false);

  protected readonly themes = APP_THEMES;
  protected readonly current = this.themeService.theme;

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }
}
