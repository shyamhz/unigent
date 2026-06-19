'use server';

import { auth } from '@clerk/nextjs/server';
import {
  fetchEventsFromDB,
  searchEventsInDB,
  createEvent as createEventDB,
  updateEvent as updateEventDB,
  deleteEvent as deleteEventDB,
} from '@/server/services/googlecalendar';
import type { CalendarEvent, CreateEventParams, UpdateEventParams } from '@/server/services/googlecalendar/types';

async function getTenantId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: No user session found');
  }
  return userId;
}

export async function getEvents(
  timeMin?: string,
  timeMax?: string,
): Promise<CalendarEvent[]> {
  const tenantId = await getTenantId();
  return fetchEventsFromDB(tenantId, { timeMin, timeMax });
}

export async function searchEvents(
  query: string,
): Promise<CalendarEvent[]> {
  const tenantId = await getTenantId();
  return searchEventsInDB(tenantId, { query });
}

export async function createCalendarEvent(
  params: CreateEventParams,
): Promise<CalendarEvent> {
  try {
    const tenantId = await getTenantId();
    return await createEventDB(tenantId, params);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create event: ${message}`);
  }
}

export async function updateCalendarEvent(
  eventId: string,
  params: UpdateEventParams,
): Promise<CalendarEvent> {
  try {
    const tenantId = await getTenantId();
    return await updateEventDB(tenantId, eventId, params);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update event: ${message}`);
  }
}

export async function deleteCalendarEvent(
  eventId: string,
): Promise<void> {
  try {
    const tenantId = await getTenantId();
    await deleteEventDB(tenantId, eventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete event: ${message}`);
  }
}
