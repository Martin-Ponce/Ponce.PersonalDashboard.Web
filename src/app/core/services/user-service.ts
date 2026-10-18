import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, UpdateUserRequest } from '../models/user/user-settings';
import { UserProfile } from '../models/user/user-profile';
import { AuthService } from './auth-service';
import { HttpManagerService } from './http-manager-service';
import { SettingsService } from './settings-service';

const FALLBACK_NAME = 'Your name';

/** The signed-in user and the profile shown in the sidebar. */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpService = inject(HttpManagerService);
  private readonly auth = inject(AuthService);
  private readonly settings = inject(SettingsService);
  private readonly urlMe = `${environment.apiUrl}/api/users/me`;

  private readonly online = signal(true);
  private readonly user = signal<CurrentUser | null>(null);

  readonly currentUser = this.user.asReadonly();

  readonly profile = computed<UserProfile>(() => ({
    name: this.user()?.name ?? this.auth.user()?.name ?? FALLBACK_NAME,
    picture: this.settings.settings().profilePicture,
    online: this.online(),
  }));

  /** Loads the signed-in user, keeping the fallback name on failure. Never rejects. */
  async load(): Promise<void> {
    try {
      this.user.set(await firstValueFrom(this.httpService.get<CurrentUser>(this.urlMe)));
    } catch {
      // API unreachable or not signed in yet.
    }
  }

  updateDisplayName(displayName: string): Observable<CurrentUser> {
    const request: UpdateUserRequest = { displayName: displayName.trim() || null };
    return this.httpService
      .put<CurrentUser>(this.urlMe, request)
      .pipe(tap((user) => this.user.set(user)));
  }
}
