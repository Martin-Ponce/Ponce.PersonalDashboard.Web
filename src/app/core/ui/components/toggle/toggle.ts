import { Component, input, output } from '@angular/core';

/** On/off switch with a label and optional description. */
@Component({
  selector: 'app-toggle',
  template: `
    <label class="toggle" [class.toggle--disabled]="disabled()">
      <span class="toggle__text">
        <span class="toggle__label">{{ label() }}</span>
        @if (description()) {
          <span class="toggle__description">{{ description() }}</span>
        }
      </span>
      <input
        type="checkbox"
        role="switch"
        class="toggle__input"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="toggled.emit(!checked())"
      />
      <span class="toggle__track" [class.toggle__track--on]="checked()" aria-hidden="true">
        <span class="toggle__knob"></span>
      </span>
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .toggle {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 40px;
      cursor: pointer;
    }

    .toggle--disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .toggle__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toggle__label {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text);
    }

    .toggle__description {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    /* Hidden but still focusable, the track draws the switch */
    .toggle__input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
      margin: 0;
    }

    .toggle__track {
      position: relative;
      flex-shrink: 0;
      width: 52px;
      height: 30px;
      box-sizing: border-box;
      border-radius: 999px;
      border: 1px solid var(--color-control-off-border);
      background: var(--gradient-gloss), var(--color-control-off);
      box-shadow: inset 0 1px 3px var(--color-shadow-strong);
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease;
    }

    .toggle__track--on {
      border-color: var(--color-accent-deep);
      background: var(--gradient-gloss), var(--color-accent);
    }

    .toggle__input:focus-visible + .toggle__track {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .toggle__knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 24px;
      height: 24px;
      box-sizing: border-box;
      border-radius: 50%;
      background: var(--gradient-surface);
      border: 1px solid var(--color-knob-border);
      box-shadow: 0 1px 3px var(--color-shadow-dark);
      transition: left 0.2s ease;
    }

    .toggle__track--on .toggle__knob {
      left: 24px;
    }
  `,
})
export class Toggle {
  label = input.required<string>();
  description = input<string>();
  checked = input(false);
  disabled = input(false);

  toggled = output<boolean>();
}
