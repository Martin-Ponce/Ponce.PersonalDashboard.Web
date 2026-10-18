import { formatDate } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { SOON_THRESHOLD_DAYS, eventStart, isDone } from '../../core/constants/calendar.constants';
import { CalendarEvent, CalendarEventRequest } from '../../core/models/calendar/calendar-models';
import { DaysUntilPipe, daysUntil } from '../../core/pipes/days-until-pipe';
import { CalendarService } from '../../core/services/calendar-service';
import { FormattingService } from '../../core/services/formatting-service';
import { TranslationService } from '../../core/services/translation-service';
import { Banner } from '../../core/ui/components/banner/banner';
import { Button } from '../../core/ui/components/button/button';
import { Card } from '../../core/ui/components/card/card';
import { DateChip } from '../../core/ui/components/date-chip/date-chip';
import { PageHeader } from '../../core/ui/components/page-header/page-header';
import { dayKey, parseDay } from '../../core/utils/date-utils';
import { latestValue } from '../../core/utils/resource-utils';
import { DayModal } from './day-modal/day-modal';
import { CalendarCell, MonthGrid } from './month-grid/month-grid';

const GRID_DAYS = 42;
const CHIPS_PER_DAY = 2;
const UPCOMING_LIMIT = 8;

@Component({
  selector: 'app-calendar',
  imports: [
    TranslocoPipe,
    DaysUntilPipe,
    Banner,
    Button,
    Card,
    DateChip,
    PageHeader,
    DayModal,
    MonthGrid,
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  private readonly calendarService = inject(CalendarService);
  private readonly i18n = inject(TranslationService);
  private readonly formatting = inject(FormattingService);

  protected readonly locale = this.i18n.locale;

  private readonly dayModal = viewChild.required(DayModal);

  private readonly today = new Date();
  private readonly todayKey = dayKey(this.today);

  // ---------- Month ----------
  protected readonly year = signal(this.today.getFullYear());
  protected readonly month = signal(this.today.getMonth() + 1);

  /** Grid start (a Monday) and exclusive end, six weeks later. */
  private readonly range = computed(() => {
    const first = new Date(this.year(), this.month() - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    return {
      start: new Date(this.year(), this.month() - 1, 1 - offset),
      end: new Date(this.year(), this.month() - 1, 1 - offset + GRID_DAYS),
    };
  });

  // ---------- Data ----------
  private readonly events = rxResource({
    params: this.range,
    stream: ({ params }) => this.calendarService.getEventsBetween(params.start, params.end),
  });
  private readonly eventsValue = latestValue(this.events);
  private readonly gridEvents = computed(() => this.eventsValue() ?? []);

  private readonly upcoming = rxResource({
    stream: () => this.calendarService.getUpcoming(UPCOMING_LIMIT),
  });
  private readonly upcomingValue = latestValue(this.upcoming);

  private readonly eventsByDay = computed(() => {
    const byDay = new Map<string, CalendarEvent[]>();
    for (const event of this.gridEvents()) {
      byDay.set(event.date, [...(byDay.get(event.date) ?? []), event]);
    }
    return byDay;
  });

  // ---------- Errors ----------
  private readonly saveFailed = signal(false);
  protected readonly errorMessage = computed(() =>
    this.events.status() === 'error' || this.upcoming.status() === 'error'
      ? this.i18n.translate('calendar.loadError')
      : this.saveFailed()
        ? this.i18n.translate('calendar.saveError')
        : '',
  );

  // ---------- Labels ----------
  protected readonly monthTitle = computed(() =>
    this.formatting.monthYear(this.year(), this.month()),
  );

  protected readonly weekdays = computed(() =>
    // 1 Jan 2024 was a Monday, so this starts the week on Monday.
    Array.from({ length: 7 }, (_, i) => formatDate(new Date(2024, 0, 1 + i), 'EEE', this.locale())),
  );

  // ---------- Grid ----------
  protected readonly cells = computed<CalendarCell[]>(() => {
    const { start } = this.range();
    const longDate = this.i18n.translate('common.dateFormats.long');
    return Array.from({ length: GRID_DAYS }, (_, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = dayKey(date);
      const events = this.eventsByDay().get(key) ?? [];
      const past = key < this.todayKey;
      const label = [
        formatDate(date, longDate, this.locale()),
        events.length
          ? this.i18n.plural('calendar.eventCount', events.length)
          : this.i18n.translate('calendar.cell.noEvents'),
        past ? this.i18n.translate('calendar.cell.passed') : null,
      ];
      return {
        key,
        date,
        inMonth: date.getMonth() === this.month() - 1,
        past,
        today: key === this.todayKey,
        eventCount: events.length,
        chips: events.slice(0, CHIPS_PER_DAY).map((e) => ({
          id: e.id,
          label: e.time
            ? `${formatDate(eventStart(e), 'HH:mm', this.locale())} ${e.title}`
            : e.title,
          done: isDone(e),
        })),
        more: Math.max(events.length - CHIPS_PER_DAY, 0),
        missed: past && events.some((e) => !isDone(e)),
        ariaLabel: label.filter(Boolean).join(', '),
      };
    });
  });

  // ---------- Coming up ----------
  protected readonly upcomingItems = computed(() =>
    (this.upcomingValue() ?? []).map((event) => {
      const start = eventStart(event);
      return {
        event,
        month: formatDate(start, 'MMM', this.locale()),
        day: formatDate(start, 'd', this.locale()),
        soon: daysUntil(start) <= SOON_THRESHOLD_DAYS,
        time: event.time ? formatDate(start, 'HH:mm', this.locale()) : null,
      };
    }),
  );

  // ---------- Month summary ----------
  private readonly monthEvents = computed(() =>
    this.gridEvents().filter((e) => {
      const date = parseDay(e.date);
      return date.getFullYear() === this.year() && date.getMonth() + 1 === this.month();
    }),
  );
  protected readonly monthEventCount = computed(() => this.monthEvents().length);
  protected readonly monthDoneCount = computed(() => this.monthEvents().filter(isDone).length);
  protected readonly monthEventsLabel = computed(() =>
    this.i18n.plural('calendar.legend.eventsIn', this.monthEventCount(), {
      month: formatDate(new Date(this.year(), this.month() - 1, 1), 'MMMM', this.locale()),
    }),
  );
  protected readonly monthDoneLabel = computed(() =>
    this.i18n.plural('calendar.completedWord', this.monthDoneCount()),
  );

  // ---------- Day window ----------
  protected readonly openDay = signal<Date | null>(null);
  protected readonly openDayEvents = computed(() => {
    const day = this.openDay();
    return day ? (this.eventsByDay().get(dayKey(day)) ?? []) : [];
  });
  protected readonly openDayPast = computed(() => {
    const day = this.openDay();
    return !!day && dayKey(day) < this.todayKey;
  });

  // ---------- Navigation ----------
  goToToday(): void {
    this.showMonth(this.today);
  }

  shiftMonth(offset: number): void {
    this.showMonth(new Date(this.year(), this.month() - 1 + offset, 1));
  }

  private showMonth(date: Date): void {
    this.year.set(date.getFullYear());
    this.month.set(date.getMonth() + 1);
  }

  // ---------- Days and events ----------
  openDayOf(date: Date): void {
    this.showMonth(date);
    this.openDay.set(date);
    this.dayModal().open();
  }

  openEvent(event: CalendarEvent): void {
    this.openDayOf(parseDay(event.date));
  }

  onEventAdded(request: CalendarEventRequest): void {
    this.save(this.calendarService.createEvent(request));
  }

  onDoneChanged({ event, done }: { event: CalendarEvent; done: boolean }): void {
    this.save(this.calendarService.setDone(event, done));
  }

  onEventDeleted(event: CalendarEvent): void {
    this.save(this.calendarService.deleteEvent(event.id));
  }

  /** Runs a change, then reloads both lists or flags the error. */
  private save(change$: Observable<unknown>): void {
    change$.subscribe({
      next: () => {
        this.saveFailed.set(false);
        this.events.reload();
        this.upcoming.reload();
      },
      error: () => this.saveFailed.set(true),
    });
  }
}
