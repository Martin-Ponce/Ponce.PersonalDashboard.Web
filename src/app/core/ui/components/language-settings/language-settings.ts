import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppLanguage } from '../../../constants/language.constants';
import { SettingsService } from '../../../services/settings-service';
import { TranslationService } from '../../../services/translation-service';

/** Language switcher, each option shows its own name. */
@Component({
  selector: 'app-language-settings',
  imports: [TranslocoPipe],
  template: `
    <div class="language-settings" role="group" [attr.aria-label]="'language.label' | transloco">
      @for (language of languages; track language.code) {
        <button
          type="button"
          class="language-settings__option"
          [class.language-settings__option--active]="current() === language.code"
          [attr.aria-pressed]="current() === language.code"
          [attr.lang]="language.code"
          (click)="setLanguage(language.code)"
        >
          {{ 'language.' + language.code | transloco }}
        </button>
      }
    </div>
  `,
  styles: `
    .language-settings {
      display: inline-flex;
      padding: 3px;
      gap: 3px;
      border-radius: 999px;
      border: 1px solid var(--color-border-strong);
      background: var(--gradient-surface);
      box-shadow: inset 0 1px 2px var(--color-shadow-soft);
    }

    .language-settings__option {
      min-height: 30px;
      padding: 0 14px;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
      cursor: pointer;
    }

    .language-settings__option:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .language-settings__option--active {
      border-color: var(--color-accent-deep);
      background: var(--gradient-gloss), var(--color-accent);
      color: var(--color-text-on-accent);
      font-weight: 700;
      text-shadow: 0 1px 1px var(--color-shadow-dark);
    }
  `,
})
export class LanguageSettings {
  private readonly i18n = inject(TranslationService);
  private readonly settings = inject(SettingsService);

  protected readonly languages = this.i18n.languages;
  protected readonly current = this.i18n.language;

  setLanguage(language: AppLanguage): void {
    this.settings.update({ language });
  }
}
