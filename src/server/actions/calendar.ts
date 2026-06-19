'use server';

import { auth } from '@clerk/nextjs/server';
import { getHostedTools } from '@/server/services/corsair-hosted';
import type { CalendarEvent, CreateEventParams, UpdateEventParams } from '@/server/services/googlecalendar/types';
import type { Tool } from 'ai';

async function callHostedTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const tools = await getHostedTools(userId);
  const tool = tools[toolName] as Tool & { execute: (input: Record<string, unknown>) => Promise<unknown> };
  if (!tool?.execute) throw new Error(`Tool ${toolName} not available`);
  return tool.execute(params);
}

function toCalendarEvent(raw: Record<string, unknown>): CalendarEvent {
  return {
    id: (raw.id as string) || '',
    summary: (raw.summary as string) || '',
    description: raw.description as string | undefined,
    location: raw.location as string | undefined,
    start: (raw.start as string) || '',
    end: (raw.end as string) || '',
    status: raw.status as string | undefined,
    attendees: raw.attendees as string[] | undefined,
    colorId: raw.colorId as string | undefined,
    visibility: raw.visibility as string | undefined,
    transparency: raw.transparency as string | undefined,
    allDay: raw.allDay as boolean | undefined,
    reminders: raw.reminders as Array<{ method: string; minutes: number }> | undefined,
  };
}

export async function getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
  const result = await callHostedTool('googlecalendar.list_events', {
    timeMin,
    timeMax,
    singleEvents: true,
    maxResults: 250,
  });
  const events = (result as Record<string, unknown>)?.events || [];
  return (events as Record<string, unknown>[]).map(toCalendarEvent);
}

export async function createCalendarEvent(params: CreateEventParams): Promise<CalendarEvent> {
  const result = await callHostedTool('googlecalendar.create_event', {
    summary: params.summary,
    start: params.start,
    end: params.end,
    description: params.description,
    location: params.location,
    attendees: params.attendees,
    allDay: params.allDay,
    colorId: params.colorId,
    visibility: params.visibility,
    transparency: params.transparency,
    reminders: params.reminders,
  });
  return toCalendarEvent(result as Record<string, unknown>);
}

export async function updateCalendarEvent(eventId: string, params: UpdateEventParams): Promise<CalendarEvent> {
  const result = await callHostedTool('googlecalendar.update_event', {
    eventId,
    summary: params.summary,
    start: params.start,
    end: params.end,
    description: params.description,
    location: params.location,
    colorId: params.colorId,
    visibility: params.visibility,
    transparency: params.transparency,
    reminders: params.reminders,
    allDay: params.allDay,
  });
  return toCalendarEvent(result as Record<string, unknown>);
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await callHostedTool('googlecalendar.delete_event', { eventId });
}
