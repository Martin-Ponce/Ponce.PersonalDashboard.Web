import { Component, Injector, forwardRef, inject, input, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SelectOption } from '../../models/select-option';

@Component({
  selector: 'app-select',
  imports: [TranslocoPipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
  template: `
    <select
      class="select"
      [class.select--error]="hasError"
      [attr.id]="selectId() || null"
      [disabled]="isDisabled()"
      [attr.aria-invalid]="hasError || null"
      (blur)="onBlur()"
      (change)="onChange($event)"
    >
      @if (placeholder()) {
        <option value="" disabled [selected]="!selectedValue()">{{ placeholder() }}</option>
      }
      @for (item of items(); track item.value) {
        <option [value]="item.value" [selected]="isSelected(item.value)">{{ item.label }}</option>
      } @empty {
        <option disabled>{{ 'common.noOptions' | transloco }}</option>
      }
    </select>
    @if (hasError && validator()) {
      <span class="select__message">{{ validator() }}</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .select {
      width: 100%;
      min-height: 40px;
      padding: 0 12px;
      border-radius: 12px;
      border: 1px solid var(--color-border-strong);
      background: var(--gradient-surface);
      box-shadow: inset 0 1px 2px var(--color-shadow-soft);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
      cursor: pointer;
      transition: border-color 0.15s ease;
    }

    .select:hover {
      border-color: var(--color-accent);
    }

    .select:focus-visible {
      border-color: var(--color-accent);
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }

    .select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .select--error,
    .select--error:hover {
      border-color: var(--color-danger);
    }

    .select__message {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-danger-text);
    }
  `,
})
export class Select<T extends string | number = string> implements ControlValueAccessor {
  private readonly injector = inject(Injector);

  selectId = input<string>();
  items = input<SelectOption<T>[]>([]);
  placeholder = input<string>();
  validator = input<string>();
  showValidation = input(false);

  valueChanged = output<T>();

  protected readonly selectedValue = signal('');
  protected readonly isDisabled = signal(false);
  private readonly isTouched = signal(false);

  private onControlChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  private get ngControl(): NgControl | null {
    return this.injector.get(NgControl, null, { self: true, optional: true });
  }

  get hasError(): boolean {
    const control = this.ngControl?.control;
    if (control) {
      return control.invalid && (control.touched || control.dirty || this.showValidation());
    }
    return (
      !!this.validator() && (this.isTouched() || this.showValidation()) && !this.selectedValue()
    );
  }

  isSelected(value: T): boolean {
    return String(value) === this.selectedValue();
  }

  writeValue(value: T | null): void {
    this.selectedValue.set(value == null ? '' : String(value));
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onControlChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onBlur(): void {
    this.isTouched.set(true);
    this.onTouched();
  }

  onChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    // Return the original value so numeric options stay numbers.
    const value = this.items().find((item) => String(item.value) === raw)?.value ?? (raw as T);
    this.selectedValue.set(raw);
    this.onControlChange(value);
    this.valueChanged.emit(value);
  }
}
