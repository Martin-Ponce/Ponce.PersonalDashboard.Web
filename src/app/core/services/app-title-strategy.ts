import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { APP_NAME } from '../constants/app.constants';
import { TranslationService } from './translation-service';

/** Sets the tab title from the route's translation key, live on language change. */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(TranslationService);

  private readonly titleKey = signal<string | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const key = this.titleKey();
      this.title.setTitle(key ? this.i18n.translate(key) : APP_NAME);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.titleKey.set(this.buildTitle(snapshot));
  }
}
