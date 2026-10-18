import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

export interface CalendarCell {
  key: string;
  date: Date;
  inMonth: boolean;
  past: boolean;
  today: boolean;
  eventCount: number;
  chips: { id: string; label: string; done: boolean }[];
  more: number;
  missed: boolean;
  ariaLabel: string;
}

/** Six-week month grid, Monday first; click a day to open it. */
@Component({
  selector: 'app-month-grid',
  imports: [TranslocoPipe],
  templateUrl: './month-grid.html',
  styleUrl: './month-grid.css',
})
export class MonthGrid {
  label = input.required<string>();
  /** Monday first. */
  weekdays = input.required<string[]>();
  cells = input.required<CalendarCell[]>();

  dayClicked = output<Date>();
}
