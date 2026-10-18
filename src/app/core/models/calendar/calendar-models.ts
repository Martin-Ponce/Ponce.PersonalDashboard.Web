// Mirrors the API's UpcomingDates DTOs.

export type CalendarEventStatus = 'Scheduled' | 'Completed';

/** An event on one day. */
export interface CalendarEvent {
  id: string;
  /** Local "yyyy-MM-dd". */
  date: string;
  /** Local "HH:mm:ss"; null for all day. */
  time: string | null;
  title: string;
  description: string | null;
  status: CalendarEventStatus;
}

/** Body to create or replace an event. */
export interface CalendarEventRequest {
  date: string;
  time: string | null;
  title: string;
  description: string | null;
  status: CalendarEventStatus;
}
