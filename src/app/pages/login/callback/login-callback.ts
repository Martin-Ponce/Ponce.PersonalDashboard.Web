import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../../core/services/auth-service';
import { SettingsService } from '../../../core/services/settings-service';
import { TranslationService } from '../../../core/services/translation-service';
import { UserService } from '../../../core/services/user-service';
import { Banner } from '../../../core/ui/components/banner/banner';
import { BusyIndicator } from '../../../core/ui/components/busy-indicator/busy-indicator';
import { Button } from '../../../core/ui/components/button/button';
import { WelcomeScreen } from '../welcome-screen/welcome-screen';

const MAX_ERROR_LENGTH = 200;

/** Finishes sign-in when the identity provider sends the user back. */
@Component({
  selector: 'app-login-callback',
  imports: [TranslocoPipe, Banner, BusyIndicator, Button, WelcomeScreen],
  template: `
    <app-welcome-screen>
      @if (error() !== null) {
        <app-banner class="callback__action" [text]="errorText()" />
        <app-button
          class="callback__action"
          size="lg"
          iconName="shield-check"
          [fullWidth]="true"
          [text]="'login.tryAgain' | transloco"
          (clicked)="retry()"
        />
      } @else {
        <app-busy-indicator
          class="callback__action"
          [text]="'login.callback.signingIn' | transloco"
        />
      }
    </app-welcome-screen>
  `,
  styles: `
    .callback__action {
      align-self: stretch;
    }
  `,
})
export class LoginCallback {
  private readonly auth = inject(AuthService);
  private readonly settings = inject(SettingsService);
  private readonly user = inject(UserService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;

  /** null while signing in; the reason (maybe '') once it failed. */
  protected readonly error = signal<string | null>(null);

  constructor() {
    void this.complete();
  }

  private async complete(): Promise<void> {
    try {
      const returnUrl = await this.auth.completeLogin({
        code: this.query.get('code'),
        state: this.query.get('state'),
        error: this.query.get('error'),
        errorDescription: this.query.get('error_description'),
      });
      await Promise.all([this.settings.load(), this.user.load()]);
      // replaceUrl: the one-time ?code= must not stay in the browser history.
      await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message.slice(0, MAX_ERROR_LENGTH) : '');
    }
  }

  protected errorText(): string {
    return [this.i18n.translate('login.callback.failed'), this.error()].filter(Boolean).join(' ');
  }

  protected retry(): void {
    void this.auth.login();
  }
}
