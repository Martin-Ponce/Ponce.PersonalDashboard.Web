import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/services/auth-service';
import { Banner } from '../../core/ui/components/banner/banner';
import { BusyIndicator } from '../../core/ui/components/busy-indicator/busy-indicator';
import { Button } from '../../core/ui/components/button/button';
import { Icon } from '../../core/ui/components/icon/icon';
import { WelcomeScreen } from './welcome-screen/welcome-screen';

type LoginState = 'idle' | 'redirecting' | 'failed';

/** Sign-in screen with one button to the identity provider. */
@Component({
  selector: 'app-login',
  imports: [TranslocoPipe, Banner, BusyIndicator, Button, Icon, WelcomeScreen],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly query = inject(ActivatedRoute).snapshot.queryParamMap;
  private readonly returnUrl = this.query.get('returnUrl');
  protected readonly expired = this.query.get('reason') === 'expired';

  protected readonly state = signal<LoginState>('idle');

  async login(): Promise<void> {
    this.state.set('redirecting');
    try {
      // Leaves the app; only gets past this if the provider can't be reached.
      await this.auth.login(this.returnUrl);
    } catch {
      this.state.set('failed');
    }
  }
}
