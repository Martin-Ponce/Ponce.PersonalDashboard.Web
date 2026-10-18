import { formatDate } from '@angular/common';
import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { eventStart, isDone } from '../../../core/constants/calendar.constants';
import { CalendarEvent, CalendarEventRequest } from '../../../core/models/calendar/calendar-models';
import { TranslationService } from '../../../core/services/translation-service';
import { Banner } from '../../../core/ui/components/banner/banner';
import { Button } from '../../../core/ui/components/button/button';
import { Card } from '../../../core/ui/components/card/card';
import { CheckButton } from '../../../core/ui/components/check-button/check-button';
import { DeleteConfirmation } from '../../../core/ui/components/delete-confirmation/delete-confirmation';
import { Entry } from '../../../core/ui/components/entry/entry';
import { Icon } from '../../../core/ui/components/icon/icon';
import { Modal } from '../../../core/ui/components/modal/modal';
import { Tag } from '../../../core/ui/components/tag/tag';
import { dayKey } from '../../../core/utils/date-utils';

export interface EventDoneChange {
  event: CalendarEvent;
  done: boolean;
}

const notBlank = (control: AbstractControl): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };

/** One day's events, plus a form to add more. */
@Component({
  selector: 'app-day-modal',
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    Banner,
    Button,
    Card,
    CheckButton,
    DeleteConfirmation,
    Entry,
    Icon,
    Modal,
    Tag,
  ],
  templateUrl: './day-modal.html',
  styleUrl: './day-modal.css',
})
export class DayModal {
  private readonly i18n = inject(TranslationService);

  day = input<Date | null>(null);
  events = input<CalendarEvent[]>([]);
  past = input(false);

  added = output<CalendarEventRequest>();
  doneChanged = output<EventDoneChange>();
  deleted = output<CalendarEvent>();

  private readonly modal = viewChild.required(Modal);
  private readonly titleEntry = viewChild.required<Entry>('titleEntry');

  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: notBlank }),
    time: new FormControl('', { nonNullable: true }),
    note: new FormControl('', { nonNullable: true }),
  });

  protected readonly isDone = isDone;

  protected readonly tried = signal(false);
  protected readonly confirmingId = signal<string | null>(null);

  protected readonly title = computed(() => {
    const day = this.day();
    return day
      ? formatDate(day, this.i18n.translate('common.dateFormats.long'), this.i18n.locale())
      : '';
  });

  protected readonly pastNote = computed(() =>
    this.i18n.translate(
      this.events().some((e) => !isDone(e))
        ? 'calendar.day.pastNoteUnfinished'
        : 'calendar.day.pastNote',
    ),
  );

  protected readonly countLabel = computed(() => {
    const done = this.events().filter(isDone).length;
    return [
      this.i18n.plural('calendar.eventCount', this.events().length),
      `${done} ${this.i18n.plural('calendar.completedWord', done)}`,
    ].join(' · ');
  });

  protected meta(event: CalendarEvent): string {
    return [
      event.time
        ? formatDate(eventStart(event), 'HH:mm', this.i18n.locale())
        : this.i18n.translate('calendar.day.allDay'),
      event.description,
      this.past() && !isDone(event) ? this.i18n.translate('calendar.day.notCompleted') : null,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  open(): void {
    this.tried.set(false);
    this.confirmingId.set(null);
    this.form.reset();
    this.modal().open();
    this.titleEntry().focus();
  }

  close(): void {
    this.modal().close();
  }

  protected toggleDone(event: CalendarEvent): void {
    this.doneChanged.emit({ event, done: !isDone(event) });
  }

  protected confirmDelete(event: CalendarEvent): void {
    this.confirmingId.set(null);
    this.deleted.emit(event);
  }

  protected add(): void {
    const day = this.day();
    this.tried.set(true);
    if (!day || this.form.invalid) return;

    const { title, time, note } = this.form.getRawValue();
    this.added.emit({
      title: title.trim(),
      date: dayKey(day),
      time: time ? `${time}:00` : null,
      description: note.trim() || null,
      status: 'Scheduled',
    });

    this.tried.set(false);
    this.form.reset();
    this.titleEntry().focus();
  }
}
