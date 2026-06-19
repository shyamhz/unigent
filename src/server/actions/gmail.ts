'use server';

import { auth } from '@clerk/nextjs/server';
import { getHostedTools } from '@/server/services/corsair-hosted';
import type { EmailPreview, DraftEmailParams, SearchEmailsOptions } from '@/server/services/gmail/types';
import type { Tool } from 'ai';

async function callHostedTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const tools = await getHostedTools(userId);
  const tool = tools[toolName] as Tool & { execute: (input: Record<string, unknown>) => Promise<unknown> };
  if (!tool?.execute) throw new Error(`Tool ${toolName} not available`);
  return tool.execute(params);
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
  const result = await callHostedTool('gmail.list_messages', { maxResults: limit });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function searchEmails(query: string, limit = 20): Promise<EmailPreview[]> {
  const result = await callHostedTool('gmail.search_messages', { query, maxResults: limit });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getEmailBody(emailId: string): Promise<string> {
  const result = await callHostedTool('gmail.get_message', { id: emailId, format: 'full' });
  return (result as Record<string, unknown>)?.body as string || '';
}

export async function getDrafts(limit = 20) {
  const result = await callHostedTool('gmail.list_drafts', { maxResults: limit });
  const drafts = (result as Record<string, unknown>)?.drafts || [];
  return (drafts as Record<string, unknown>[]).map((d) => ({
    id: (d.id as string) || '',
    subject: (d.subject as string) || '',
    snippet: (d.snippet as string) || '',
    to: (d.to as string) || '',
    date: (d.date as string) || '',
  }));
}

export async function deleteEmail(emailId: string): Promise<void> {
  await callHostedTool('gmail.delete_message', { id: emailId });
}

export async function deleteDraft(draftId: string): Promise<void> {
  await callHostedTool('gmail.delete_draft', { id: draftId });
}

export async function createDraft(params: DraftEmailParams) {
  return callHostedTool('gmail.create_draft', {
    to: params.to,
    subject: params.subject,
    body: params.body,
  });
}

export async function sendDraft(draftId: string) {
  return callHostedTool('gmail.send_draft', { id: draftId });
}

export async function sendEmail(params: DraftEmailParams) {
  return callHostedTool('gmail.send_message', {
    to: params.to,
    subject: params.subject,
    body: params.body,
  });
}

export async function getImportantEmails(limit = 25): Promise<EmailPreview[]> {
  const result = await callHostedTool('gmail.list_messages', { maxResults: limit, labelIds: ['IMPORTANT'] });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getPromotionsEmails(limit = 25): Promise<EmailPreview[]> {
  const result = await callHostedTool('gmail.list_messages', { maxResults: limit, labelIds: ['CATEGORY_PROMOTIONS'] });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getUpdatesEmails(limit = 25): Promise<EmailPreview[]> {
  const result = await callHostedTool('gmail.list_messages', { maxResults: limit, labelIds: ['CATEGORY_UPDATES'] });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getSocialEmails(limit = 25): Promise<EmailPreview[]> {
  const result = await callHostedTool('gmail.list_messages', { maxResults: limit, labelIds: ['CATEGORY_SOCIAL'] });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}

export async function getSentEmails(limit = 25): Promise<EmailPreview[]> {
  const result = await callHostedTool('gmail.list_messages', { maxResults: limit, labelIds: ['SENT'] });
  const messages = (result as Record<string, unknown>)?.messages || [];
  return (messages as Record<string, unknown>[]).map(toEmailPreview);
}
