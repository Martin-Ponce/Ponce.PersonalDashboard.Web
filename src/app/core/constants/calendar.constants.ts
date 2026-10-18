import { CalendarEvent } from '../models/calendar/calendar-models';
import { parseDay } from '../utils/date-utils';

export const SOON_THRESHOLD_DAYS = 3;

export function isDone(event: CalendarEvent): boolean {
  return event.status === 'Completed';
}

export function eventStart(event: CalendarEvent): Date {
  const start = parseDay(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    start.setHours(hours, minutes);
  }
  return start;
}
