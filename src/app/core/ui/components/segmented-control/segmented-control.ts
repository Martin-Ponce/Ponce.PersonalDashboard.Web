import { Component, input, output } from '@angular/core';
import { SelectOption } from '../../models/select-option';

/** Row of buttons where exactly one is picked. */
@Component({
  selector: 'app-segmented-control',
  template: `
    <div
      class="segmented"
      role="radiogroup"
      [attr.aria-labelledby]="labelledBy() || null"
      [attr.aria-label]="ariaLabel() || null"
    >
      @for (option of options(); track option.value) {
        <button
          type="button"
          role="radio"
          class="segmented__option"
          [class.segmented__option--selected]="option.value === value()"
          [attr.aria-checked]="option.value === value()"
          (click)="valueChange.emit(option.value)"
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .segmented {
      display: flex;
      gap: 8px;
    }

    .segmented__option {
      flex: 1;
      min-height: 40px;
      padding: 0 8px;
      border-radius: 10px;
      border: 1px solid var(--color-border-strong);
      background: var(--gradient-surface);
      font-family: inherit;
      font-size: 13px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--color-text);
      cursor: pointer;
    }

    .segmented__option:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .segmented__option--selected {
      border-color: var(--color-accent-deep);
      background: var(--gradient-gloss), var(--color-accent);
      color: var(--color-text-on-accent);
      text-shadow: 0 1px 1px var(--color-shadow-dark);
    }
  `,
})
export class SegmentedControl<T extends string | number = string> {
  options = input.required<SelectOption<T>[]>();
  value = input<T>();
  labelledBy = input<string>();
  ariaLabel = input<string>();

  valueChange = output<T>();
}
