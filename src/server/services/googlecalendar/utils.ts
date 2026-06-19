import type { CalendarEvent, CalendarAttendee, EventReminders } from './types';

export function toCalendarEvent(
  entity: { data: Record<string, unknown>; entity_id: string },
): CalendarEvent {
  const data = entity.data;
  const startRaw = data.start as { date?: string; dateTime?: string } | undefined;
  const endRaw = data.end as { date?: string; dateTime?: string } | undefined;
  const allDay = !!startRaw?.date;

  const rawAttendees = data.attendees as
    | { email?: string; displayName?: string; responseStatus?: string; self?: boolean }[]
    | undefined;
  const attendees: CalendarAttendee[] | undefined = rawAttendees?.map((a) => ({
    email: a.email ?? '',
    displayName: a.displayName,
    responseStatus: (a.responseStatus as CalendarAttendee['responseStatus']) ?? 'needsAction',
    self: a.self,
  }));

  const rawReminders = data.reminders as
    | { useDefault?: boolean; overrides?: { method?: string; minutes?: number }[] }
    | undefined;
  const reminders: EventReminders | undefined = rawReminders
    ? {
        useDefault: rawReminders.useDefault ?? true,
        overrides: rawReminders.overrides?.map((r) => ({
          method: (r.method as 'email' | 'popup') ?? 'popup',
          minutes: r.minutes ?? 10,
        })),
      }
    : undefined;

  return {
    id: (data.id as string) ?? entity.entity_id,
    summary: (data.summary as string) ?? 'Untitled event',
    description: (data.description as string) ?? undefined,
    location: (data.location as string) ?? undefined,
    status: (data.status as CalendarEvent['status']) ?? 'confirmed',
    start: startRaw?.dateTime ?? startRaw?.date ?? '',
    end: endRaw?.dateTime ?? endRaw?.date ?? '',
    allDay,
    colorId: (data.colorId as string) ?? undefined,
    calendarId: (data.calendarId as string) ?? undefined,
    htmlLink: (data.htmlLink as string) ?? undefined,
    hangoutLink: (data.hangoutLink as string) ?? undefined,
    attendees,
    organizer: data.organizer as CalendarEvent['organizer'],
    visibility: (data.visibility as CalendarEvent['visibility']) ?? undefined,
    transparency: (data.transparency as CalendarEvent['transparency']) ?? undefined,
    recurrence: (data.recurrence as string[]) ?? undefined,
    reminders,
    createdAt: (data.created as string) ?? undefined,
  };
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.allDay) return 'All day';

  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const startStr = fmt(startDate);
  const endStr = fmt(endDate);

  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (sameDay) return `${startStr} – ${endStr}`;
  return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startStr} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${endStr}`;
}

const EVENT_COLORS: Record<string, string> = {
  '1': 'bg-blue-500',
  '2': 'bg-green-500',
  '3': 'bg-purple-500',
  '4': 'bg-red-500',
  '5': 'bg-yellow-500',
  '6': 'bg-orange-500',
  '7': 'bg-teal-500',
  '8': 'bg-gray-500',
  '9': 'bg-indigo-500',
  '10': 'bg-pink-500',
  '11': 'bg-cyan-500',
};

export function getEventColor(event: CalendarEvent): string {
  if (event.colorId && EVENT_COLORS[event.colorId]) return EVENT_COLORS[event.colorId];
  return 'bg-blue-500';
}

export function getDaysWithEvents(events: CalendarEvent[], year: number, month: number): number[] {
  const days = new Set<number>();
  for (const event of events) {
    const start = new Date(event.start);
    if (start.getFullYear() === year && start.getMonth() === month) {
      days.add(start.getDate());
    }
    if (!event.allDay) continue;
    const end = new Date(event.end);
    if (end.getFullYear() === year && end.getMonth() === month) {
      for (let d = start.getDate(); d <= end.getDate(); d++) {
        days.add(d);
      }
    }
  }
  return Array.from(days);
}
