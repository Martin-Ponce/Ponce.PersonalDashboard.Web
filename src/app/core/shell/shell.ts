import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { APP_NAME, APP_TAGLINE } from '../constants/app.constants';
import { NAV_ROUTES } from '../constants/navigation.constants';
import { AuthService } from '../services/auth-service';
import { TranslationService } from '../services/translation-service';
import { UserService } from '../services/user-service';
import { Avatar } from '../ui/components/avatar/avatar';
import { Button } from '../ui/components/button/button';
import { Card } from '../ui/components/card/card';
import { Logo } from '../ui/components/logo/logo';
import { Sidebar } from '../ui/components/sidebar/sidebar';
import { Status } from '../ui/components/status/status';
import { VersionBadge } from '../ui/components/version-badge/version-badge';
import { SidebarRoute } from '../ui/models/sidebar-route';

/** App frame: header, sidebar and the routed page. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TranslocoPipe, Avatar, Button, Card, Logo, Sidebar, Status, VersionBadge],
  templateUrl: './shell.html',
  styleUrls: ['../ui/styles/wallpaper.css', './shell.css'],
})
export class Shell {
  private readonly i18n = inject(TranslationService);
  private readonly auth = inject(AuthService);

  protected readonly appName = APP_NAME;
  protected readonly appTagline = APP_TAGLINE;

  protected readonly navRoutes = computed<SidebarRoute[]>(() =>
    NAV_ROUTES.map(({ labelKey, routePage, icon }) => ({
      name: this.i18n.translate(labelKey),
      routePage,
      icon,
    })),
  );

  protected readonly profile = inject(UserService).profile;

  signOut(): void {
    void this.auth.logout();
  }
}
