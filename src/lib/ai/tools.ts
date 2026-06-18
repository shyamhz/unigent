import { tool, zodSchema, type Tool } from 'ai';
import { z } from 'zod';
import {
  getEmails,
  searchEmails,
  getEmailBody,
  getDrafts,
  createDraft,
  sendDraft,
  sendEmail,
  deleteEmail,
  deleteDraft,
  getImportantEmails,
  getPromotionsEmails,
  getUpdatesEmails,
  getSocialEmails,
  getSentEmails,
} from '@/app/actions/gmail';
import {
  getEvents,
  searchEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/app/actions/calendar';

export function buildTools(connections: { gmail: boolean; googlecalendar: boolean }) {
  const tools: Record<string, Tool> = {};

  if (connections.gmail) {
    tools.list_emails = tool({
      description: 'List recent emails from Gmail inbox',
      inputSchema: zodSchema(z.object({
        limit: z.number().optional().default(20).describe('Number of emails to return'),
      })),
      execute: async ({ limit }) => {
        const emails = await getEmails(limit);
        return emails.map((e) => ({
          id: e.id,
          from: e.from,
          subject: e.subject,
          snippet: e.snippet,
          date: e.date,
          labelIds: e.labelIds,
        }));
      },
    });

    tools.search_emails = tool({
      description: 'Search emails by query string',
      inputSchema: zodSchema(z.object({
        query: z.string().describe('Search query (e.g. "from:alex subject:meeting")'),
        limit: z.number().optional().default(20),
      })),
      execute: async ({ query, limit }) => {
        const emails = await searchEmails(query, limit);
        return emails.map((e) => ({
          id: e.id,
          from: e.from,
          subject: e.subject,
          snippet: e.snippet,
          date: e.date,
        }));
      },
    });

    tools.read_email = tool({
      description: 'Read the full body of a specific email',
      inputSchema: zodSchema(z.object({
        emailId: z.string().describe('The email ID to read'),
      })),
      execute: async ({ emailId }) => {
        const body = await getEmailBody(emailId);
        return { id: emailId, body };
      },
    });

    tools.send_email = tool({
      description: 'Send an HTML-formatted email via Gmail',
      inputSchema: zodSchema(z.object({
        to: z.union([z.string(), z.array(z.string())]).describe('Recipient email(s)'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body in HTML format with inline CSS styling'),
      })),
      execute: async (params) => {
        await sendEmail(params);
        return { success: true, message: `Email sent to ${Array.isArray(params.to) ? params.to.join(', ') : params.to}` };
      },
    });

    tools.create_draft = tool({
      description: 'Create a draft HTML email',
      inputSchema: zodSchema(z.object({
        to: z.union([z.string(), z.array(z.string())]).describe('Recipient email(s)'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body in HTML format with inline CSS styling'),
      })),
      execute: async (params) => {
        const draft = await createDraft(params);
        return { success: true, draftId: draft.id, message: 'Draft created' };
      },
    });

    tools.send_draft = tool({
      description: 'Send an existing draft email',
      inputSchema: zodSchema(z.object({
        draftId: z.string().describe('The draft ID to send'),
      })),
      execute: async ({ draftId }) => {
        await sendDraft(draftId);
        return { success: true, message: 'Draft sent' };
      },
    });

    tools.delete_email = tool({
      description: 'Delete an email from Gmail',
      inputSchema: zodSchema(z.object({
        emailId: z.string().describe('The email ID to delete'),
      })),
      execute: async ({ emailId }) => {
        await deleteEmail(emailId);
        return { success: true, message: 'Email deleted' };
      },
    });

    tools.delete_draft = tool({
      description: 'Delete a draft email',
      inputSchema: zodSchema(z.object({
        draftId: z.string().describe('The draft ID to delete'),
      })),
      execute: async ({ draftId }) => {
        await deleteDraft(draftId);
        return { success: true, message: 'Draft deleted' };
      },
    });

    tools.get_important_emails = tool({
      description: 'Get emails marked as important',
      inputSchema: zodSchema(z.object({
        limit: z.number().optional().default(25),
      })),
      execute: async ({ limit }) => {
        const emails = await getImportantEmails(limit);
        return emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, snippet: e.snippet, date: e.date }));
      },
    });

    tools.get_promotions = tool({
      description: 'Get promotional emails',
      inputSchema: zodSchema(z.object({ limit: z.number().optional().default(25) })),
      execute: async ({ limit }) => {
        const emails = await getPromotionsEmails(limit);
        return emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, snippet: e.snippet, date: e.date }));
      },
    });

    tools.get_social_emails = tool({
      description: 'Get social notification emails',
      inputSchema: zodSchema(z.object({ limit: z.number().optional().default(25) })),
      execute: async ({ limit }) => {
        const emails = await getSocialEmails(limit);
        return emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, snippet: e.snippet, date: e.date }));
      },
    });

    tools.get_updates = tool({
      description: 'Get update/notification emails',
      inputSchema: zodSchema(z.object({ limit: z.number().optional().default(25) })),
      execute: async ({ limit }) => {
        const emails = await getUpdatesEmails(limit);
        return emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, snippet: e.snippet, date: e.date }));
      },
    });

    tools.get_sent_emails = tool({
      description: 'Get recently sent emails',
      inputSchema: zodSchema(z.object({ limit: z.number().optional().default(25) })),
      execute: async ({ limit }) => {
        const emails = await getSentEmails(limit);
        return emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, snippet: e.snippet, date: e.date }));
      },
    });

    tools.get_drafts = tool({
      description: 'List draft emails',
      inputSchema: zodSchema(z.object({ limit: z.number().optional().default(20) })),
      execute: async ({ limit }) => {
        const drafts = await getDrafts(limit);
        return drafts.map((d) => ({ id: d.id, to: d.to, subject: d.subject, snippet: d.snippet, date: d.date }));
      },
    });
  }

  if (connections.googlecalendar) {
    tools.list_events = tool({
      description: 'List calendar events within a date range',
      inputSchema: zodSchema(z.object({
        timeMin: z.string().optional().describe('Start of date range (ISO 8601)'),
        timeMax: z.string().optional().describe('End of date range (ISO 8601)'),
      })),
      execute: async ({ timeMin, timeMax }) => {
        const events = await getEvents(timeMin, timeMax);
        return events.map((e) => ({
          id: e.id,
          summary: e.summary,
          start: e.start,
          end: e.end,
          location: e.location,
          status: e.status,
          attendees: e.attendees,
        }));
      },
    });

    tools.search_events = tool({
      description: 'Search calendar events by query',
      inputSchema: zodSchema(z.object({
        query: z.string().describe('Search query for event summary'),
      })),
      execute: async ({ query }) => {
        const events = await searchEvents(query);
        return events.map((e) => ({
          id: e.id,
          summary: e.summary,
          start: e.start,
          end: e.end,
          location: e.location,
        }));
      },
    });

    tools.create_event = tool({
      description: 'Create a new calendar event',
      inputSchema: zodSchema(z.object({
        summary: z.string().describe('Event title'),
        start: z.string().describe('Start time (ISO 8601)'),
        end: z.string().describe('End time (ISO 8601)'),
        description: z.string().optional().describe('Event description'),
        location: z.string().optional().describe('Event location'),
        attendees: z.array(z.string()).optional().describe('Attendee email addresses'),
        allDay: z.boolean().optional().describe('Is this an all-day event'),
        colorId: z.string().optional().describe('Color ID (1-11)'),
        visibility: z.enum(['default', 'public', 'private', 'confidential']).optional(),
        transparency: z.enum(['opaque', 'transparent']).optional(),
        reminders: z.array(z.object({
          method: z.enum(['email', 'popup']),
          minutes: z.number(),
        })).optional(),
      })),
      execute: async (params) => {
        const event = await createCalendarEvent(params);
        return { success: true, eventId: event.id, message: `Event "${event.summary}" created` };
      },
    });

    tools.update_event = tool({
      description: 'Update an existing calendar event',
      inputSchema: zodSchema(z.object({
        eventId: z.string().describe('The event ID to update'),
        summary: z.string().optional().describe('New event title'),
        start: z.string().optional().describe('New start time (ISO 8601)'),
        end: z.string().optional().describe('New end time (ISO 8601)'),
        description: z.string().optional().describe('New description'),
        location: z.string().optional().describe('New location'),
      })),
      execute: async ({ eventId, ...params }) => {
        const event = await updateCalendarEvent(eventId, params);
        return { success: true, message: `Event "${event.summary}" updated` };
      },
    });

    tools.delete_event = tool({
      description: 'Delete a calendar event',
      inputSchema: zodSchema(z.object({
        eventId: z.string().describe('The event ID to delete'),
      })),
      execute: async ({ eventId }) => {
        await deleteCalendarEvent(eventId);
        return { success: true, message: 'Event deleted' };
      },
    });
  }

  return tools;
}
