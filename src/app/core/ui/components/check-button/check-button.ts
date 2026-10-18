import { Component, input, output } from '@angular/core';
import { Icon } from '../icon/icon';

/** Round tick button for marking things done. */
@Component({
  selector: 'app-check-button',
  imports: [Icon],
  template: `
    <button
      type="button"
      role="checkbox"
      class="check"
      [class.check--md]="size() === 'md'"
      [class.check--checked]="checked()"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
      (click)="toggled.emit(!checked())"
    >
      @if (checked()) {
        <app-icon name="check" [size]="size() === 'md' ? 18 : 14" [strokeWidth]="3.2" />
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
    }

    .check {
      width: 28px;
      height: 28px;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border-radius: 50%;
      border: 2px solid var(--color-control-off-border);
      background: var(--gradient-surface);
      box-shadow: inset 0 1px 2px var(--color-shadow-soft);
      color: var(--color-text-on-accent);
      cursor: pointer;
    }

    .check--md {
      width: 40px;
      height: 40px;
    }

    .check:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .check:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .check--checked {
      border: 1px solid var(--color-success-deep);
      background:
        radial-gradient(circle at 50% 25%, var(--color-white-soft), var(--color-gloss-fade) 55%),
        var(--color-success);
      box-shadow: 0 3px 8px var(--color-success-shadow);
    }
  `,
})
export class CheckButton {
  checked = input(false);
  size = input<'sm' | 'md'>('sm');
  ariaLabel = input.required<string>();
  disabled = input(false);

  toggled = output<boolean>();
}
