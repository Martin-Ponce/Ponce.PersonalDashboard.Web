import { Component, input } from '@angular/core';

/** Card look: frosted glass, floating popover, or nested inset. */
export type CardVariant = 'glass' | 'popover' | 'inset';

let nextCardId = 0;

@Component({
  selector: 'app-card',
  styleUrl: './card.css',
  template: `
    <section
      class="card"
      [class]="'card--' + variant()"
      [attr.aria-labelledby]="titleText() ? titleId : null"
    >
      @if (titleText()) {
        <header class="card__title-bar">
          <h2 class="card__title" [id]="titleId">{{ titleText() }}</h2>
          <div class="card__actions">
            <ng-content select="[card-actions]" />
          </div>
        </header>
      }
      <div class="card__body" [class.card__body--padded]="padded()">
        <ng-content />
      </div>
    </section>
  `,
})
export class Card {
  titleText = input<string>();
  variant = input<CardVariant>('glass');
  padded = input(true);

  protected readonly titleId = `app-card-title-${nextCardId++}`;
}
