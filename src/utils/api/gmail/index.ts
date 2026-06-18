import { corsair } from "@/utils/corsair";

import type {
  SearchEmailsOptions,
  ListEmailsOptions,
  EmailPreview,
  DraftEmailParams,
} from "./types";

import {
  buildRfc2822Message,
  base64UrlEncode,
  extractBodyFromPayload,
} from "./utils";

import type { GmailPayload } from "./utils";

function toEmailPreview(
  msg: {
    data: Record<string, unknown>;
    entity_id: string;
  },
  options?: { includeBody?: boolean },
): EmailPreview {
  const preview: EmailPreview = {
    id: (msg.data.id as string) ?? msg.entity_id,
    threadId: (msg.data.threadId as string) ?? "",
    snippet: (msg.data.snippet as string) ?? "",
    subject: (msg.data.subject as string) ?? "",
    from: (msg.data.from as string) ?? "",
    to: (msg.data.to as string) ?? "",
    date: String(msg.data.internalDate ?? ""),
    labelIds: (msg.data.labelIds as string[]) ?? [],
  };

  if (options?.includeBody) {
    preview.body = extractBodyFromPayload(
      msg.data.payload as GmailPayload | undefined,
    );
  }

  return preview;
}

async function fetchEmailsFromAPI(
  tenantId: string,
  options: ListEmailsOptions = {},
): Promise<void> {
  const client = corsair.withTenant(tenantId);

  const result = await client.gmail.api.messages.list({
    maxResults: options.maxResults ?? 25,
    q: options.q,
    labelIds: options.labelIds,
    pageToken: options.pageToken,
  });

  if (!result.messages?.length) return;

  for (const msg of result.messages) {
    if (!msg.id) continue;
    await client.gmail.api.messages.get({
      id: msg.id,
      format: "full",
    });
  }
}

export async function fetchEmailsFromDB(
  tenantId: string,
  options: { limit?: number; offset?: number; includeBody?: boolean; entityId?: string } = {},
): Promise<EmailPreview[]> {
  const client = corsair.withTenant(tenantId);

  const search = async () => {
    const searchOptions: Record<string, unknown> = {
      limit: options.limit ?? 20,
      offset: options.offset ?? 0,
    };
    if (options.entityId) {
      searchOptions.entity_id = options.entityId;
    }
    const entities = await client.gmail.db.messages.search(searchOptions);
    return entities.map((msg) =>
      toEmailPreview(msg, { includeBody: options.includeBody }),
    );
  };

  let results = await search();
  if (results.length === 0) {
    await fetchEmailsFromAPI(tenantId, { maxResults: options.limit ?? 20 });
    results = await search();
  }

  results.sort((a, b) => {
    const da = parseInt(a.date) || 0;
    const db = parseInt(b.date) || 0;
    return db - da;
  });

  return results;
}

export async function searchEmailsInDB(
  tenantId: string,
  options: SearchEmailsOptions = {},
): Promise<EmailPreview[]> {
  const client = corsair.withTenant(tenantId);

  const searchOptions: Parameters<typeof client.gmail.db.messages.search>[0] =
    {};
  if (options.from)
    searchOptions.data = {
      ...searchOptions.data,
      from: { contains: options.from },
    };
  if (options.to)
    searchOptions.data = {
      ...searchOptions.data,
      to: { contains: options.to },
    };
  if (options.subject)
    searchOptions.data = {
      ...searchOptions.data,
      subject: { contains: options.subject },
    };
  if (options.query)
    searchOptions.data = {
      ...searchOptions.data,
      snippet: { contains: options.query },
    };
  if (options.limit) searchOptions.limit = options.limit;
  if (options.offset) searchOptions.offset = options.offset;

  const entities = await client.gmail.db.messages.search(searchOptions);
  return entities.map((msg) =>
    toEmailPreview(msg, { includeBody: options.includeBody }),
  );
}

export async function deleteEmailFromGmail(
  tenantId: string,
  emailId: string,
): Promise<void> {
  const client = corsair.withTenant(tenantId);
  await client.gmail.api.messages.delete({ id: emailId });
}

export async function fetchEmailsByLabelFromDB(
  tenantId: string,
  labelIds: string[],
  options: { limit?: number } = {},
): Promise<EmailPreview[]> {
  const client = corsair.withTenant(tenantId);

  await fetchEmailsFromAPI(tenantId, { maxResults: options.limit ?? 25, labelIds });

  const searchOptions: Record<string, unknown> = {
    limit: options.limit ?? 25,
  };
  const entities = await client.gmail.db.messages.search(searchOptions);
  const results = entities
    .map((msg) => toEmailPreview(msg))
    .filter((email) => labelIds.some((label) => email.labelIds.includes(label)));

  results.sort((a, b) => {
    const da = parseInt(a.date) || 0;
    const db = parseInt(b.date) || 0;
    return db - da;
  });

  return results;
}

function getHeaderValue(headers: { name: string; value: string }[] | undefined, name: string): string {
  if (!headers) return '';
  const h = headers.find((h) => h.name?.toLowerCase() === name.toLowerCase());
  return h?.value ?? '';
}

function extractTo(to: unknown): string {
  if (!to) return '';
  if (typeof to === 'string') return to;
  if (Array.isArray(to)) {
    return to
      .map((r) => {
        if (typeof r === 'string') return r;
        if (r && typeof r === 'object' && 'email' in r) return (r as { email: string }).email;
        return '';
      })
      .filter(Boolean)
      .join(', ');
  }
  return '';
}

export async function fetchDraftsFromDB(
  tenantId: string,
  options: { limit?: number } = {},
): Promise<Array<{ id: string; subject: string; snippet: string; to: string; date: string }>> {
  const client = corsair.withTenant(tenantId);

  const listResult = await client.gmail.api.drafts.list({
    maxResults: options.limit ?? 20,
  });

  if (!listResult.drafts?.length) return [];

  const drafts: Array<{ id: string; subject: string; snippet: string; to: string; date: string }> = [];

  for (const d of listResult.drafts) {
    if (!d.id) continue;
    const full = await client.gmail.api.drafts.get({
      id: d.id,
      format: 'full',
    });

    const message = (full.message ?? {}) as Record<string, unknown>;
    const payload = (message.payload ?? {}) as GmailPayload;
    const headers = payload?.headers;

    const subject = (message.subject as string)
      ?? getHeaderValue(headers, 'Subject')
      ?? '';

    const toRaw = message.to;
    const to = extractTo(toRaw)
      || getHeaderValue(headers, 'To');

    const body = extractBodyFromPayload(payload);
    const snippet = (message.snippet as string) || body || '';

    const date = String(message.internalDate ?? '');

    drafts.push({ id: d.id, subject, snippet, to, date });
  }

  return drafts;
}

export async function deleteDraftFromGmail(
  tenantId: string,
  draftId: string,
): Promise<void> {
  const client = corsair.withTenant(tenantId);
  await client.gmail.api.drafts.delete({ id: draftId });
}

export async function createDraftViaGmail(
  tenantId: string,
  { to, subject, body }: DraftEmailParams,
) {
  const client = corsair.withTenant(tenantId);

  const rfc2822 = buildRfc2822Message(to, subject, body);
  const raw = base64UrlEncode(rfc2822);

  return client.gmail.api.drafts.create({
    draft: { message: { raw } },
  });
}

export async function sendDraftViaGmail(
  tenantId: string,
  draftId: string,
) {
  const client = corsair.withTenant(tenantId);
  return client.gmail.api.drafts.send({ id: draftId });
}

export async function sendEmailViaGmail(
  tenantId: string,
  { to, subject, body }: DraftEmailParams,
) {
  const client = corsair.withTenant(tenantId);

  const rfc2822 = buildRfc2822Message(to, subject, body);
  const raw = base64UrlEncode(rfc2822);

  return client.gmail.api.messages.send({ raw });
}
