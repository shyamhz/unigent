export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  start: string;
  end: string;
  allDay: boolean;
  colorId?: string;
  calendarId?: string;
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: CalendarAttendee[];
  organizer?: { email?: string; displayName?: string };
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  transparency?: 'opaque' | 'transparent';
  recurrence?: string[];
  reminders?: EventReminders;
  createdAt?: string;
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  self?: boolean;
}

export interface EventReminders {
  useDefault: boolean;
  overrides?: { method: 'email' | 'popup'; minutes: number }[];
}

export interface ListEventsOptions {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  calendarId?: string;
  singleEvents?: boolean;
}

export interface SearchEventsOptions {
  query?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEventParams {
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay?: boolean;
  attendees?: string[];
  colorId?: string;
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  transparency?: 'opaque' | 'transparent';
  reminders?: { method: 'email' | 'popup'; minutes: number }[];
}

export interface UpdateEventParams {
  summary?: string;
  description?: string;
  location?: string;
  start?: string;
  end?: string;
  allDay?: boolean;
  colorId?: string;
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  transparency?: 'opaque' | 'transparent';
  reminders?: { method: 'email' | 'popup'; minutes: number }[];
}
