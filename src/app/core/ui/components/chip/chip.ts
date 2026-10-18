import { Component, input, output } from '@angular/core';

/** Small pill button, acts as a toggle when `selected` is set. */
@Component({
  selector: 'app-chip',
  host: { '[class.chip-host--stretch]': 'stretch()' },
  template: `
    <button
      type="button"
      class="chip"
      [class.chip--sm]="size() === 'sm'"
      [class.chip--selected]="selected()"
      [class.chip--stretch]="stretch()"
      [attr.aria-pressed]="selected() ?? null"
      (click)="clicked.emit()"
    >
      @if (dotColor(); as color) {
        <span class="chip__dot" [style.background-color]="color" aria-hidden="true"></span>
      }
      {{ label() }}
    </button>
  `,
  styles: `
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 36px;
      padding: 0 14px;
      border-radius: 999px;
      border: 1px solid var(--color-border-strong);
      background: var(--gradient-surface);
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
      cursor: pointer;
    }

    .chip--sm {
      min-height: 32px;
      padding: 0 12px;
      font-size: 12px;
    }

    :host(.chip-host--stretch) {
      display: block;
    }

    .chip--stretch {
      width: 100%;
      justify-content: center;
      padding: 0 4px;
    }

    .chip:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .chip--selected {
      border-color: var(--color-accent-deep);
      background: var(--gradient-gloss), var(--color-accent);
      color: var(--color-text-on-accent);
      text-shadow: 0 1px 1px var(--color-shadow-dark);
    }

    .chip__dot {
      width: 10px;
      height: 10px;
      box-sizing: border-box;
      border-radius: 50%;
      border: 1px solid var(--color-white-soft);
    }
  `,
})
export class Chip {
  label = input.required<string>();
  selected = input<boolean>();
  dotColor = input<string>();
  size = input<'md' | 'sm'>('md');
  stretch = input(false);

  clicked = output<void>();
}
