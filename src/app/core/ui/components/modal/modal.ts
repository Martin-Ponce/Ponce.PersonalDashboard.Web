import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ExitButton } from '../exit-button/exit-button';

let nextModalId = 0;

@Component({
  selector: 'app-modal',
  imports: [TranslocoPipe, ExitButton],
  styleUrl: './modal.css',
  template: `
    <dialog
      #dialog
      class="modal"
      [style.width.px]="width()"
      [attr.aria-labelledby]="titleId"
      (close)="closed.emit()"
      (cancel)="onCancel($event)"
      (click)="onDialogClick($event)"
    >
      <header class="modal__title-bar">
        <h2 class="modal__title" [id]="titleId">{{ titleText() }}</h2>
        @if (enabledExitButton()) {
          <app-exit-button
            [tooltip]="exitText() || ('common.close' | transloco)"
            (clicked)="close()"
          />
        }
      </header>
      <div class="modal__body">
        <ng-content />
      </div>
    </dialog>
  `,
})
export class Modal {
  titleText = input.required<string>();
  exitText = input<string>();
  enabledExitButton = input(true);
  closeOnBackdrop = input(true);
  width = input(520);

  closed = output<void>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly titleId = `app-modal-title-${nextModalId++}`;

  open(): void {
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  protected onCancel(event: Event): void {
    if (!this.closeOnBackdrop()) {
      event.preventDefault();
    }
  }

  protected onDialogClick(event: MouseEvent): void {
    // Backdrop clicks come in with the <dialog> itself as the target.
    if (this.closeOnBackdrop() && event.target === this.dialogRef().nativeElement) {
      this.close();
    }
  }
}
