import { Component, input } from '@angular/core';

/** accent fills the tile with the theme accent. */
export type StatVariant = 'default' | 'accent';
export type StatSubtitleTone = 'muted' | 'success' | 'danger';
export type StatValueTone = 'default' | 'success' | 'danger';

@Component({
  selector: 'app-stat',
  template: `
    <div class="stat" [class.stat--accent]="variant() === 'accent'">
      <p class="stat__category">{{ category() }}</p>
      <p class="stat__value" [class]="'stat__value--' + valueTone()">{{ value() }}</p>
      @if (subtitle()) {
        <p class="stat__subtitle" [class]="'stat__subtitle--' + subtitleTone()">
          {{ subtitle() }}
        </p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .stat {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px 18px;
      border-radius: 16px;
      color: var(--color-text);
      background: var(--color-surface-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--color-white-soft);
      box-shadow:
        0 10px 28px var(--color-shadow),
        inset 0 1px 0 var(--color-white);
    }

    .stat p {
      margin: 0;
    }

    .stat__category {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text-muted);
    }

    .stat__value {
      font-family: var(--font-display);
      font-size: 30px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    .stat__value--success {
      color: var(--color-success-text);
    }

    .stat__value--danger {
      color: var(--color-danger-text);
    }

    .stat__subtitle {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .stat__subtitle--success {
      font-weight: 600;
      color: var(--color-success-text);
    }

    .stat__subtitle--danger {
      font-weight: 600;
      color: var(--color-danger-text);
    }

    .stat--accent {
      color: var(--color-text-on-accent);
      background: var(--gradient-gloss), var(--color-accent);
      border-color: var(--color-accent-deep);
      box-shadow: 0 10px 28px var(--color-shadow-strong);
    }

    .stat--accent .stat__category,
    .stat--accent .stat__subtitle {
      color: inherit;
    }
  `,
})
export class Stat {
  category = input.required<string>();
  value = input.required<string | number>();
  subtitle = input<string>();
  variant = input<StatVariant>('default');
  subtitleTone = input<StatSubtitleTone>('muted');
  valueTone = input<StatValueTone>('default');
}
