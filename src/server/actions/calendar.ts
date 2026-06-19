'use server';

import { auth } from '@clerk/nextjs/server';
import { callCorsairOperation } from '@/server/services/corsair-hosted';
import type { CalendarEvent, CreateEventParams, UpdateEventParams } from '@/server/services/googlecalendar/types';

async function calendarOp(path: string, params: Record<string, unknown>): Promise<unknown> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return callCorsairOperation(userId, path, params);
}

function toCalendarEvent(raw: Record<string, unknown>): CalendarEvent {
  const start = raw.start as Record<string, unknown> | undefined;
  const end = raw.end as Record<string, unknown> | undefined;
  return {
    id: (raw.id as string) || '',
    summary: (raw.summary as string) || '',
    description: raw.description as string | undefined,
    location: raw.location as string | undefined,
    start: (start?.dateTime as string) || (start?.date as string) || '',
    end: (end?.dateTime as string) || (end?.date as string) || '',
    status: raw.status as string | undefined,
    attendees: raw.attendees
      ? (raw.attendees as Array<Record<string, unknown>>).map((a) => a.email as string).filter(Boolean)
      : undefined,
    colorId: raw.colorId as string | undefined,
    visibility: raw.visibility as string | undefined,
    transparency: raw.transparency as string | undefined,
    allDay: !!(start as Record<string, unknown>)?.date,
    reminders: raw.reminders as Array<{ method: string; minutes: number }> | undefined,
    hangoutLink: raw.hangoutLink as string | undefined,
  };
}

export async function getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
  const result = (await calendarOp('googlecalendar.api.events.getMany', {
    calendarId: 'primary',
    timeMin,
    timeMax,
    singleEvents: true,
    maxResults: 250,
  })) as Record<string, unknown>;
  const items = result?.items || [];
  return (items as Record<string, unknown>[]).map(toCalendarEvent);
}

export async function createCalendarEvent(params: CreateEventParams): Promise<CalendarEvent> {
  const startParam = params.allDay
    ? { date: params.start.slice(0, 10) }
    : { dateTime: params.start };
  const endParam = params.allDay
    ? { date: params.end.slice(0, 10) }
    : { dateTime: params.end };

  const result = (await calendarOp('googlecalendar.api.events.create', {
    calendarId: 'primary',
    event: {
      summary: params.summary,
      start: startParam,
      end: endParam,
      description: params.description,
      location: params.location,
      attendees: params.attendees,
      colorId: params.colorId,
      visibility: params.visibility,
      transparency: params.transparency,
      reminders: params.reminders,
    },
  })) as Record<string, unknown>;
  return toCalendarEvent(result);
}

export async function updateCalendarEvent(eventId: string, params: UpdateEventParams): Promise<CalendarEvent> {
  const eventFields: Record<string, unknown> = {};
  if (params.summary) eventFields.summary = params.summary;
  if (params.description) eventFields.description = params.description;
  if (params.location) eventFields.location = params.location;
  if (params.colorId) eventFields.colorId = params.colorId;
  if (params.visibility) eventFields.visibility = params.visibility;
  if (params.transparency) eventFields.transparency = params.transparency;
  if (params.reminders) eventFields.reminders = params.reminders;
  if (params.allDay !== undefined) {
    eventFields.start = { date: params.start?.slice(0, 10) };
    eventFields.end = { date: params.end?.slice(0, 10) };
  } else if (params.start || params.end) {
    if (params.start) eventFields.start = { dateTime: params.start };
    if (params.end) eventFields.end = { dateTime: params.end };
  }

  const result = (await calendarOp('googlecalendar.api.events.update', {
    calendarId: 'primary',
    id: eventId,
    event: eventFields,
  })) as Record<string, unknown>;
  return toCalendarEvent(result);
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await calendarOp('googlecalendar.api.events.delete', {
    calendarId: 'primary',
    id: eventId,
  });
}
