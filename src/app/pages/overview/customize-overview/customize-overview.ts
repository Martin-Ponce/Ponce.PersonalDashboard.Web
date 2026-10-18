import { Component, inject, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  OVERVIEW_WIDGETS,
  OverviewPreferencesService,
  OverviewWidget,
} from '../../../core/services/overview-preferences-service';
import { ThemeService } from '../../../core/services/theme-service';
import { Button } from '../../../core/ui/components/button/button';
import { Card } from '../../../core/ui/components/card/card';
import { Checkbox } from '../../../core/ui/components/checkbox/checkbox';
import { ExitButton } from '../../../core/ui/components/exit-button/exit-button';
import { LanguageSettings } from '../../../core/ui/components/language-settings/language-settings';
import { ThemeSettings } from '../../../core/ui/components/theme-settings/theme-settings';

/** Popup to pick theme, language and visible widgets. */
@Component({
  selector: 'app-customize-overview',
  imports: [TranslocoPipe, Button, Card, Checkbox, ExitButton, LanguageSettings, ThemeSettings],
  templateUrl: './customize-overview.html',
  styleUrl: './customize-overview.css',
})
export class CustomizeOverview {
  private readonly preferences = inject(OverviewPreferencesService);
  private readonly themeService = inject(ThemeService);

  protected readonly widgetOptions = OVERVIEW_WIDGETS;
  protected readonly widgets = this.preferences.widgets;

  closed = output<void>();

  toggleWidget(key: OverviewWidget, visible: boolean): void {
    this.preferences.setVisible(key, visible);
  }

  /** Resets widgets and theme; the language stays on purpose. */
  reset(): void {
    this.preferences.reset();
    this.themeService.setTheme('sky');
  }
}
