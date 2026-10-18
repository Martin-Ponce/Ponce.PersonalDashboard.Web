import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CalendarEvent, CalendarEventRequest } from '../models/calendar/calendar-models';
import { addDays, dayKey } from '../utils/date-utils';
import { HttpManagerService } from './http-manager-service';

/** Calendar events (the API's "upcoming dates"). */
@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly httpService = inject(HttpManagerService);
  private readonly urlUpcomingDates = `${environment.apiUrl}/api/upcomingdates`;

  /**
   * Events from `start` (inclusive) to `end` (exclusive), soonest first; within a day, timed
   * events by time, then all-day ones.
   */
  getEventsBetween(start: Date, end: Date): Observable<CalendarEvent[]> {
    // No page number: the API returns every match. Its range is inclusive on both ends.
    const params = new HttpParams()
      .set('from', dayKey(start))
      .set('to', dayKey(addDays(end, -1)))
      .set('sort', 'date');
    return this.httpService.getWithParams<CalendarEvent[]>(this.urlUpcomingDates, { params });
  }

  /** Next `limit` events still to do, from today on, soonest first. */
  getUpcoming(limit: number): Observable<CalendarEvent[]> {
    const params = new HttpParams()
      .set('status', 'Scheduled')
      .set('from', dayKey(new Date()))
      .set('sort', 'date')
      .set('pageNumber', 1)
      .set('pageSize', limit);
    return this.httpService.getWithParams<CalendarEvent[]>(this.urlUpcomingDates, { params });
  }

  createEvent(request: CalendarEventRequest): Observable<CalendarEvent> {
    return this.httpService.post<CalendarEvent>(this.urlUpcomingDates, request);
  }

  /** Marks an event as completed, or back to scheduled. */
  setDone(event: CalendarEvent, done: boolean): Observable<CalendarEvent> {
    const { date, time, title, description } = event;
    const request: CalendarEventRequest = {
      date,
      time,
      title,
      description,
      status: done ? 'Completed' : 'Scheduled',
    };
    return this.httpService.put<CalendarEvent>(`${this.urlUpcomingDates}/${event.id}`, request);
  }

  deleteEvent(id: string): Observable<void> {
    return this.httpService.delete<void>(`${this.urlUpcomingDates}/${id}`);
  }
}
