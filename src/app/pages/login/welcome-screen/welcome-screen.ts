import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { APP_NAME } from '../../../core/constants/app.constants';
import { Card } from '../../../core/ui/components/card/card';
import { Logo } from '../../../core/ui/components/logo/logo';
import { ThemeSettings } from '../../../core/ui/components/theme-settings/theme-settings';
import { VersionBadge } from '../../../core/ui/components/version-badge/version-badge';

/** Full-screen sign-in frame; the card's actions get projected in. */
@Component({
  selector: 'app-welcome-screen',
  imports: [TranslocoPipe, Card, Logo, ThemeSettings, VersionBadge],
  template: `
    <main class="welcome wallpaper">
      <app-card class="welcome__version" [padded]="false">
        <div class="welcome__pill"><app-version-badge /></div>
      </app-card>

      <app-card class="welcome__card" [titleText]="'login.title' | transloco" [padded]="false">
        <span card-actions>{{ appName }}</span>

        <div class="welcome__body">
          <app-logo size="lg" />
          <h1 class="welcome__heading">{{ appName }}</h1>
          <ng-content />
        </div>
      </app-card>

      <app-card class="welcome__themes" [padded]="false">
        <div class="welcome__pill">
          <span class="welcome__themes-label">{{ 'theme.label' | transloco }}</span>
          <app-theme-settings [compact]="true" />
        </div>
      </app-card>
    </main>
  `,
  styleUrls: ['../../../core/ui/styles/wallpaper.css', './welcome-screen.css'],
})
export class WelcomeScreen {
  protected readonly appName = APP_NAME;
}
