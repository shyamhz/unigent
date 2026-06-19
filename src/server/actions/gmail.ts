'use server';

import { auth } from '@clerk/nextjs/server';
import { callCorsairOperation, runCorsairScript } from '@/server/services/corsair-hosted';
import type { EmailPreview, DraftEmailParams } from '@/server/services/gmail/types';

async function gmailOp(path: string, params: Record<string, unknown>): Promise<unknown> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return callCorsairOperation(userId, path, params);
}

async function listAndFetchMessages(
  listParams: Record<string, unknown>,
  limit: number,
): Promise<EmailPreview[]> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // Single MCP call: list messages, then fetch each one with metadata
  const listParamsJson = JSON.stringify({ ...listParams, maxResults: limit });
  const code = `
    const list = await corsair.gmail.api.messages.list(${listParamsJson});
    const ids = (list.messages || []).map(m => m.id).slice(0, ${limit});
    const results = [];
    for (const id of ids) {
      try {
        const msg = await corsair.gmail.api.messages.get({ id, format: 'metadata', metadataHeaders: ['Subject', 'From', 'To', 'Date'] });
        results.push(msg);
      } catch { /* skip failed messages */ }
    }
    return results;
  `;

  const raw = await runCorsairScript(userId, code);
  const messages = (raw as Record<string, unknown>[]) || [];
  return messages.map(toEmailPreview);
}

function toEmailPreview(raw: Record<string, unknown>): EmailPreview {
  // Extract headers from Gmail metadata format
  const payload = raw.payload as Record<string, unknown> | undefined;
  const headers = (payload?.headers as Array<Record<string, string>>) || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

  return {
    id: (raw.id as string) || '',
    threadId: (raw.threadId as string) || '',
    snippet: (raw.snippet as string) || '',
    subject: getHeader('Subject'),
    from: getHeader('From'),
    to: getHeader('To'),
    date: (raw.internalDate as string) || getHeader('Date') || '',
    labelIds: (raw.labelIds as string[]) || [],
    body: undefined,
  };
}

export async function getEmails(limit = 20): Promise<EmailPreview[]> {
  return listAndFetchMessages({}, limit);
}

export async function searchEmails(query: string, limit = 20): Promise<EmailPreview[]> {
  return listAndFetchMessages({ query }, limit);
}

export async function getEmailBody(emailId: string): Promise<string> {
  const result = (await gmailOp('gmail.api.messages.get', { id: emailId, format: 'full' })) as Record<string, unknown>;
  return (result?.body as string) || '';
}

export async function getDrafts(limit = 20) {
  const result = (await gmailOp('gmail.api.drafts.list', { maxResults: limit })) as Record<string, unknown>;
  const drafts = (result?.drafts || []) as Record<string, unknown>[];
  return drafts.map((d) => ({
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
  return listAndFetchMessages({ labelIds: ['IMPORTANT'] }, limit);
}

export async function getPromotionsEmails(limit = 25): Promise<EmailPreview[]> {
  return listAndFetchMessages({ labelIds: ['CATEGORY_PROMOTIONS'] }, limit);
}

export async function getUpdatesEmails(limit = 25): Promise<EmailPreview[]> {
  return listAndFetchMessages({ labelIds: ['CATEGORY_UPDATES'] }, limit);
}

export async function getSocialEmails(limit = 25): Promise<EmailPreview[]> {
  return listAndFetchMessages({ labelIds: ['CATEGORY_SOCIAL'] }, limit);
}

export async function getSentEmails(limit = 25): Promise<EmailPreview[]> {
  return listAndFetchMessages({ labelIds: ['SENT'] }, limit);
}
