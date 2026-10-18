import { Component, input } from '@angular/core';
import { IconName } from '../../assets/icons/icons';
import { Icon } from '../icon/icon';

export type KeyFigureTone = 'default' | 'danger';

/** Headline number with an accent icon orb. */
@Component({
  selector: 'app-key-figure',
  imports: [Icon],
  template: `
    <div class="key-figure">
      <span class="key-figure__orb" aria-hidden="true">
        <app-icon [name]="iconName()" [size]="20" [strokeWidth]="2.2" />
      </span>
      <div class="key-figure__text">
        <span class="key-figure__caption">{{ caption() }}</span>
        <span class="key-figure__value" [class.key-figure__value--danger]="tone() === 'danger'">
          {{ value() }}
        </span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .key-figure {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 8px 18px 8px 10px;
      border-radius: 16px;
      border: 1px solid var(--color-border);
      background: var(--gradient-surface);
      box-shadow: inset 0 1px 0 var(--color-white);
    }

    .key-figure__orb {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid var(--color-accent-deep);
      background:
        radial-gradient(circle at 50% 20%, var(--color-white-soft), var(--color-gloss-fade) 55%),
        var(--color-accent);
      box-shadow: 0 3px 8px var(--color-shadow);
      color: var(--color-text-on-accent);
    }

    .key-figure__text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .key-figure__caption {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .key-figure__value {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 800;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
      color: var(--color-text);
    }

    .key-figure__value--danger {
      color: var(--color-danger-text);
    }
  `,
})
export class KeyFigure {
  caption = input.required<string>();
  value = input.required<string>();
  iconName = input.required<IconName>();
  tone = input<KeyFigureTone>('default');
}
