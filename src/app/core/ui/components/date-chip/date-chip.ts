import { Component, input } from '@angular/core';

/** Small calendar tile, orange when `highlight` is on. */
@Component({
  selector: 'app-date-chip',
  template: `
    <div class="date-chip" [class.date-chip--highlight]="highlight()">
      <span class="date-chip__month">{{ month() }}</span>
      <span class="date-chip__day">{{ day() }}</span>
    </div>
  `,
  styles: `
    .date-chip {
      width: 48px;
      height: 52px;
      flex-shrink: 0;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      border-radius: 12px;
      color: var(--color-text);
      background: var(--gradient-surface);
      border: 1px solid var(--color-border);
    }

    .date-chip--highlight {
      color: var(--color-highlight-text);
      background: var(--gradient-gloss), var(--color-highlight);
      border-color: var(--color-highlight-deep);
    }

    .date-chip__month {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .date-chip__day {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 800;
      line-height: 1;
    }
  `,
})
export class DateChip {
  month = input.required<string>();
  day = input.required<string | number>();
  highlight = input(false);
}
