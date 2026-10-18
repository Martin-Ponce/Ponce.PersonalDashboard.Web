import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-exit-button',
  imports: [TranslocoPipe],
  template: `
    <button
      type="button"
      class="exit-button"
      [attr.title]="tooltip() || null"
      [attr.aria-label]="tooltip() || ('common.close' | transloco)"
      (click)="clicked.emit()"
    >
      ✕
    </button>
  `,
  styles: `
    .exit-button {
      width: 28px;
      height: 24px;
      padding: 0;
      border-radius: 6px;
      border: 1px solid var(--color-white-soft);
      background: var(--gradient-gloss), var(--color-danger);
      color: var(--color-text-on-accent);
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
    }

    .exit-button:focus-visible {
      outline: 2px solid var(--color-white);
      outline-offset: 2px;
    }
  `,
})
export class ExitButton {
  tooltip = input<string>('');

  clicked = output<void>();
}
