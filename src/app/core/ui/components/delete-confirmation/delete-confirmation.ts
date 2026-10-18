import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Button } from '../button/button';

let nextConfirmationId = 0;

/** Inline red panel to confirm a delete. */
@Component({
  selector: 'app-delete-confirmation',
  imports: [TranslocoPipe, Button],
  template: `
    <div
      class="delete-confirmation"
      [class.delete-confirmation--compact]="compact()"
      role="alertdialog"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="compact() ? null : textId"
    >
      <div class="delete-confirmation__text">
        <div class="delete-confirmation__title" [id]="titleId">
          {{ title() || ('common.deleteConfirmation.title' | transloco) }}
        </div>
        @if (!compact()) {
          <div class="delete-confirmation__subtitle" [id]="textId">
            {{ subtitle() || ('common.deleteConfirmation.subtitle' | transloco) }}
          </div>
        }
      </div>
      <div class="delete-confirmation__actions">
        <app-button
          variant="secondary"
          [size]="compact() ? 'sm' : 'md'"
          [text]="cancelText() || ('common.cancel' | transloco)"
          [autoFocus]="true"
          (clicked)="cancelled.emit()"
        />
        <app-button
          variant="danger"
          [size]="compact() ? 'sm' : 'md'"
          [text]="confirmText() || ('common.deleteConfirmation.confirm' | transloco)"
          (clicked)="confirmed.emit()"
        />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .delete-confirmation {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      background: var(--gradient-danger-surface);
      border: 1px solid var(--color-danger-border);
    }

    .delete-confirmation__text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .delete-confirmation__title {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 800;
      color: var(--color-danger-deep);
    }

    .delete-confirmation__subtitle {
      font-size: 13px;
      color: var(--color-danger-body);
    }

    .delete-confirmation__actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .delete-confirmation--compact {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      padding: 10px 12px;
      border-radius: 12px;
    }

    .delete-confirmation--compact .delete-confirmation__title {
      font-family: inherit;
      font-size: 14px;
      font-weight: 700;
    }

    .delete-confirmation--compact .delete-confirmation__actions {
      gap: 8px;
      margin-left: auto;
    }
  `,
})
export class DeleteConfirmation {
  title = input<string>();
  subtitle = input<string>();
  confirmText = input<string>();
  cancelText = input<string>();
  compact = input(false);

  confirmed = output<void>();
  cancelled = output<void>();

  private readonly id = nextConfirmationId++;
  protected readonly titleId = `app-delete-confirmation-title-${this.id}`;
  protected readonly textId = `app-delete-confirmation-text-${this.id}`;
}
