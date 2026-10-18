import { Component, input } from '@angular/core';

/** caption is the small uppercase label used by filters. */
export type FormFieldVariant = 'default' | 'caption';

@Component({
  selector: 'app-form-field',
  template: `
    <div class="form-field">
      <label
        class="form-field__label"
        [class.form-field__label--caption]="variant() === 'caption'"
        [attr.for]="labelFor() || null"
      >
        {{ label() }}
        @if (isRequired()) {
          <span class="form-field__required" aria-hidden="true">*</span>
        }
      </label>
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-field__label {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text);
    }

    .form-field__label--caption {
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .form-field__required {
      margin-left: 2px;
      color: var(--color-danger-text);
    }
  `,
})
export class FormField {
  label = input.required<string>();
  labelFor = input<string>();
  isRequired = input(false);
  variant = input<FormFieldVariant>('default');
}
