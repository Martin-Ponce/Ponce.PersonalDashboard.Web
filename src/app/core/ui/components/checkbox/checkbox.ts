import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  template: `
    <label class="checkbox">
      <input
        type="checkbox"
        class="checkbox__input"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="toggled.emit(!checked())"
      />
      <span>{{ label() }}</span>
    </label>
  `,
  styles: `
    :host {
      display: block;
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 40px;
      padding: 0 12px;
      border-radius: 10px;
      background: var(--color-row-stripe);
      font-size: 13px;
      color: var(--color-text);
      cursor: pointer;
    }

    .checkbox__input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--color-accent);
      cursor: inherit;
    }
  `,
})
export class Checkbox {
  label = input.required<string>();
  checked = input(false);
  disabled = input(false);

  toggled = output<boolean>();
}
