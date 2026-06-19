'use server';

import { auth } from '@clerk/nextjs/server';
import { callCorsairOperation } from '@/server/services/corsair-hosted';
import type { EmailPreview, DraftEmailParams, SearchEmailsOptions } from '@/server/services/gmail/types';

async function gmailOp(path: string, params: Record<string, unknown>): Promise<unknown> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return callCorsairOperation(userId, path, params);
}

function toEmailPreview(raw: Record<string, unknown>): EmailPreview {
  return {
    id: (raw.id as string) || '',
    threadId: (raw.threadId as string) || '',
    snippet: (raw.snippet as string) || '',
    subject: (raw.subject as string) || '',
    from: (raw.from as string) || '',
    to: (raw.to as string) || '',
    date: (raw.date as string) || '',
    labelIds: (raw.labelIds as string[]) || [],
    body: raw.body as string | undefined,
  };
}

export async function getEmails(limit = 20): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { maxResults: limit })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function searchEmails(query: string, limit = 20): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { query, maxResults: limit })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getEmailBody(emailId: string): Promise<string> {
  const result = (await gmailOp('gmail.api.messages.get', { id: emailId, format: 'full' })) as Record<string, unknown>;
  return result?.body as string || '';
}

export async function getDrafts(limit = 20) {
  const result = (await gmailOp('gmail.api.drafts.list', { maxResults: limit })) as Record<string, unknown>;
  const drafts = result?.drafts || [];
  return (drafts as Record<string, unknown>[]).map((d) => ({
    id: (d.id as string) || '',
    subject: (d.subject as string) || '',
    snippet: (d.snippet as string) || '',
    to: (d.to as string) || '',
    date: (d.date as string) || '',
  }));
}

export async function deleteEmail(emailId: string): Promise<void> {
  await gmailOp('gmail.api.messages.delete', { id: emailId });
}

export async function deleteDraft(draftId: string): Promise<void> {
  await gmailOp('gmail.api.drafts.delete', { id: draftId });
}

export async function createDraft(params: DraftEmailParams) {
  return gmailOp('gmail.api.drafts.create', {
    message: {
      raw: Buffer.from(
        `From: me\r\nTo: ${params.to}\r\nSubject: ${params.subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${params.body}`,
      ).toString('base64url'),
    },
  });
}

export async function sendDraft(draftId: string) {
  return gmailOp('gmail.api.drafts.send', { id: draftId });
}

export async function sendEmail(params: DraftEmailParams) {
  return gmailOp('gmail.api.messages.send', {
    raw: Buffer.from(
      `From: me\r\nTo: ${Array.isArray(params.to) ? params.to.join(', ') : params.to}\r\nSubject: ${params.subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${params.body}`,
    ).toString('base64url'),
  });
}

export async function getImportantEmails(limit = 25): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { maxResults: limit, labelIds: ['IMPORTANT'] })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getPromotionsEmails(limit = 25): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { maxResults: limit, labelIds: ['CATEGORY_PROMOTIONS'] })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getUpdatesEmails(limit = 25): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { maxResults: limit, labelIds: ['CATEGORY_UPDATES'] })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getSocialEmails(limit = 25): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { maxResults: limit, labelIds: ['CATEGORY_SOCIAL'] })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getSentEmails(limit = 25): Promise<EmailPreview[]> {
  const result = (await gmailOp('gmail.api.messages.list', { maxResults: limit, labelIds: ['SENT'] })) as Record<string, unknown>;
  const messages = result?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}
