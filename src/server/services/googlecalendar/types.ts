export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  status?: string;
  attendees?: string[];
  colorId?: string;
  visibility?: string;
  transparency?: string;
  allDay?: boolean;
  reminders?: Array<{ method: string; minutes: number }>;
  hangoutLink?: string;
}

export interface CreateEventParams {
  summary: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  attendees?: string[];
  allDay?: boolean;
  colorId?: string;
  visibility?: string;
  transparency?: string;
  reminders?: Array<{ method: string; minutes: number }>;
}

export interface UpdateEventParams {
  summary?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  colorId?: string;
  visibility?: string;
  transparency?: string;
  reminders?: Array<{ method: string; minutes: number }>;
  allDay?: boolean;
}

export interface ListEventsOptions {
  timeMin?: string;
  timeMax?: string;
  singleEvents?: boolean;
  maxResults?: number;
  calendarId?: string;
}

export interface SearchEventsOptions {
  query?: string;
  status?: string;
  limit?: number;
  offset?: number;
}
