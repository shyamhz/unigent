'use server';

import { auth } from '@clerk/nextjs/server';
import {
  fetchEmailsFromDB,
  searchEmailsInDB,
  fetchEmailsByLabelFromDB,
  fetchDraftsFromDB,
  deleteEmailFromGmail,
  deleteDraftFromGmail,
  createDraftViaGmail,
  sendDraftViaGmail,
  sendEmailViaGmail,
} from '@/server/services/gmail';
import type { EmailPreview } from '@/server/services/gmail/types';

async function getTenantId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: No user session found');
  }
  return userId;
}

export async function getEmails(limit = 20): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return fetchEmailsFromDB(tenantId, { limit });
}

export async function searchEmails(query: string, limit = 20): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return searchEmailsInDB(tenantId, { query, limit });
}

export async function getEmailBody(emailId: string): Promise<string> {
  const tenantId = await getTenantId();
  const result = await fetchEmailsFromDB(tenantId, {
    limit: 1,
    includeBody: true,
    entityId: emailId,
  });
  return result[0]?.body ?? '';
}

export async function getDrafts(limit = 20) {
  const tenantId = await getTenantId();
  return fetchDraftsFromDB(tenantId, { limit });
}

export async function deleteEmail(emailId: string): Promise<void> {
  const tenantId = await getTenantId();
  await deleteEmailFromGmail(tenantId, emailId);
}

export async function deleteDraft(draftId: string): Promise<void> {
  const tenantId = await getTenantId();
  await deleteDraftFromGmail(tenantId, draftId);
}

export async function createDraft(params: { to: string | string[]; subject: string; body: string }) {
  const tenantId = await getTenantId();
  return createDraftViaGmail(tenantId, params);
}

export async function sendDraft(draftId: string) {
  const tenantId = await getTenantId();
  return sendDraftViaGmail(tenantId, draftId);
}

export async function sendEmail(params: { to: string | string[]; subject: string; body: string }) {
  const tenantId = await getTenantId();
  return sendEmailViaGmail(tenantId, params);
}

export async function getImportantEmails(limit = 25): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return fetchEmailsByLabelFromDB(tenantId, ['IMPORTANT'], { limit });
}

export async function getPromotionsEmails(limit = 25): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return fetchEmailsByLabelFromDB(tenantId, ['CATEGORY_PROMOTIONS'], { limit });
}

export async function getUpdatesEmails(limit = 25): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return fetchEmailsByLabelFromDB(tenantId, ['CATEGORY_UPDATES'], { limit });
}

export async function getSocialEmails(limit = 25): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return fetchEmailsByLabelFromDB(tenantId, ['CATEGORY_SOCIAL'], { limit });
}

export async function getSentEmails(limit = 25): Promise<EmailPreview[]> {
  const tenantId = await getTenantId();
  return fetchEmailsByLabelFromDB(tenantId, ['SENT'], { limit });
}
