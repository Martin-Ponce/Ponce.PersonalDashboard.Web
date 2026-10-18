import {
  Component,
  ElementRef,
  Injector,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  selector: 'app-entry',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Entry),
      multi: true,
    },
  ],
  styleUrl: './entry.css',
  template: `
    <div
      class="entry"
      [class.entry--lg]="size() === 'lg'"
      [class.entry--error]="hasError"
      [class.entry--disabled]="isDisabled()"
    >
      @if (prefix()) {
        <span class="entry__prefix" aria-hidden="true">{{ prefix() }}</span>
      }
      <input
        #inputRef
        class="entry__input"
        [class.entry__input--numeric]="type() === 'number'"
        [attr.id]="inputId() || null"
        [attr.aria-label]="ariaLabel() || null"
        [type]="type()"
        [value]="value()"
        [disabled]="isDisabled()"
        [placeholder]="placeholder()"
        [attr.name]="name() || null"
        [attr.min]="type() === 'number' ? min() : null"
        [attr.max]="type() === 'number' ? max() : null"
        [attr.step]="type() === 'number' ? step() : null"
        [attr.aria-invalid]="hasError || null"
        (blur)="onBlur()"
        (input)="onInput($event)"
      />
    </div>
    @if (hasError && validator()) {
      <span class="entry__message">{{ validator() }}</span>
    }
  `,
})
export class Entry implements ControlValueAccessor {
  private readonly injector = inject(Injector);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  inputId = input<string>();
  ariaLabel = input<string>();
  size = input<'md' | 'lg'>('md');
  type = input<'text' | 'number' | 'time'>('text');
  placeholder = input('');
  name = input<string>();
  prefix = input<string>();
  min = input<number>();
  max = input<number>();
  step = input<number>();
  validator = input<string>();
  showValidation = input(false);

  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);
  private readonly isTouched = signal(false);

  private onChanged: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private get ngControl(): NgControl | null {
    return this.injector.get(NgControl, null, { self: true, optional: true });
  }

  get hasError(): boolean {
    const control = this.ngControl?.control;
    if (control) {
      return control.invalid && (control.touched || control.dirty || this.showValidation());
    }
    return !!this.validator() && (this.isTouched() || this.showValidation()) && !this.value();
  }

  focus(): void {
    this.inputRef()?.nativeElement.focus();
  }

  writeValue(value: string | number | null): void {
    const text = value == null ? '' : String(value);
    this.value.set(text);
    // Set the element too, or a same-tick write after typing gets skipped by [value].
    const element = this.inputRef()?.nativeElement;
    if (element) element.value = text;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChanged = fn;
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

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChanged(value);
  }
}
