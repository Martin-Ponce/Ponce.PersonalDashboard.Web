import { Component, input, output } from '@angular/core';
import { IconName } from '../../assets/icons/icons';
import { Button } from '../button/button';
import { Card } from '../card/card';

@Component({
  selector: 'app-page-header',
  imports: [Card, Button],
  template: `
    <app-card [padded]="false">
      <div class="page-header">
        <div class="page-header__text">
          <h1 class="page-header__title">{{ header() }}</h1>
          @if (subtitle(); as subtitle) {
            <p class="page-header__subtitle">{{ subtitle }}</p>
          }
        </div>
        <div class="page-header__actions">
          <ng-content />
          <app-button
            [isVisible]="!!buttonText()"
            [text]="buttonText()"
            [iconName]="buttonIcon()"
            (clicked)="buttonClick.emit()"
          />
        </div>
      </div>
    </app-card>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 20px;
    }

    .page-header__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .page-header__title {
      margin: 0;
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 800;
      color: var(--color-text);
    }

    .page-header__subtitle {
      margin: 0;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    .page-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Narrow screens: actions drop below the title */
    @media (max-width: 760px) {
      .page-header {
        flex-wrap: wrap;
        padding: 14px 16px;
      }

      .page-header__title {
        font-size: 22px;
      }
    }
  `,
})
export class PageHeader {
  header = input.required<string>();
  subtitle = input<string>();
  buttonText = input<string>();
  buttonIcon = input<IconName>();

  buttonClick = output<void>();
}
