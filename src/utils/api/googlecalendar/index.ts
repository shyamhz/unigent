import { corsair } from '@/utils/corsair';
import type {
  CalendarEvent,
  ListEventsOptions,
  SearchEventsOptions,
  CreateEventParams,
  UpdateEventParams,
} from './types';
import { toCalendarEvent } from './utils';

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

function ensureSeconds(dt: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dt)) return dt + ':00';
  return dt;
}

async function fetchEventsFromAPI(
  tenantId: string,
  options: ListEventsOptions = {},
): Promise<void> {
  const client = corsair.withTenant(tenantId);
  await client.googlecalendar.api.events.getMany({
    timeMin: options.timeMin,
    timeMax: options.timeMax,
    singleEvents: options.singleEvents ?? true,
    maxResults: options.maxResults ?? 250,
    calendarId: options.calendarId,
  });
}

export async function fetchEventsFromDB(
  tenantId: string,
  options: { limit?: number; offset?: number; timeMin?: string; timeMax?: string } = {},
): Promise<CalendarEvent[]> {
  const client = corsair.withTenant(tenantId);

  const search = async () => {
    const entities = await client.googlecalendar.db.events.search({
      limit: options.limit ?? 250,
      offset: options.offset ?? 0,
    });
    return entities.map(toCalendarEvent);
  };

  let results = await search();
  if (results.length === 0) {
    await fetchEventsFromAPI(tenantId, {
      timeMin: options.timeMin,
      timeMax: options.timeMax,
    });
    results = await search();
  }

  return results;
}

export async function searchEventsInDB(
  tenantId: string,
  options: SearchEventsOptions = {},
): Promise<CalendarEvent[]> {
  const client = corsair.withTenant(tenantId);

  const dataFilters: Record<string, unknown> = {};
  if (options.query) {
    dataFilters.summary = { contains: options.query };
  }
  if (options.status) {
    dataFilters.status = options.status;
  }

  const searchOptions: Record<string, unknown> = {};
  if (Object.keys(dataFilters).length > 0) {
    searchOptions.data = dataFilters;
  }
  if (options.limit) searchOptions.limit = options.limit;
  if (options.offset) searchOptions.offset = options.offset;

  const entities = await client.googlecalendar.db.events.search(searchOptions);
  return entities.map(toCalendarEvent);
}

export async function createEvent(
  tenantId: string,
  params: CreateEventParams,
): Promise<CalendarEvent> {
  const client = corsair.withTenant(tenantId);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const start = params.allDay
    ? { date: params.start.slice(0, 10) }
    : { dateTime: ensureSeconds(params.start), timeZone };
  const end = params.allDay
    ? { date: params.end.slice(0, 10) }
    : { dateTime: ensureSeconds(params.end), timeZone };

  const event: Record<string, unknown> = {
    summary: params.summary,
    description: params.description,
    location: params.location,
    start,
    end,
    attendees: params.attendees?.map((email) => ({ email })),
    visibility: params.visibility,
    transparency: params.transparency,
  };

  if (params.colorId) event.colorId = params.colorId;
  if (params.reminders && params.reminders.length > 0) {
    event.reminders = { useDefault: false, overrides: params.reminders };
  }

  const result = await client.googlecalendar.api.events.create({ event: stripUndefined(event) });

  return toCalendarEvent({ data: result as Record<string, unknown>, entity_id: (result as { id?: string }).id ?? '' });
}

export async function deleteEvent(
  tenantId: string,
  eventId: string,
): Promise<void> {
  const client = corsair.withTenant(tenantId);
  await client.googlecalendar.api.events.delete({ id: eventId });
}

export async function updateEvent(
  tenantId: string,
  eventId: string,
  params: UpdateEventParams,
): Promise<CalendarEvent> {
  const client = corsair.withTenant(tenantId);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const event: Record<string, unknown> = {};
  if (params.summary !== undefined) event.summary = params.summary;
  if (params.description !== undefined) event.description = params.description;
  if (params.location !== undefined) event.location = params.location;
  if (params.start !== undefined) {
    event.start = params.allDay
      ? { date: params.start.slice(0, 10) }
      : { dateTime: ensureSeconds(params.start), timeZone };
  }
  if (params.end !== undefined) {
    event.end = params.allDay
      ? { date: params.end.slice(0, 10) }
      : { dateTime: ensureSeconds(params.end), timeZone };
  }
  if (params.colorId !== undefined) event.colorId = params.colorId;
  if (params.visibility !== undefined) event.visibility = params.visibility;
  if (params.transparency !== undefined) event.transparency = params.transparency;
  if (params.reminders !== undefined) {
    event.reminders = params.reminders.length > 0
      ? { useDefault: false, overrides: params.reminders }
      : { useDefault: true };
  }

  const result = await client.googlecalendar.api.events.update({
    id: eventId,
    event,
  });

  return toCalendarEvent({ data: result as Record<string, unknown>, entity_id: eventId });
}
