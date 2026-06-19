export interface EmailPreview {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  labelIds: string[];
  body?: string;
}

export interface DraftEmailParams {
  to: string | string[];
  subject: string;
  body: string;
}

export interface SearchEmailsOptions {
  from?: string;
  to?: string;
  subject?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ListEmailsOptions {
  maxResults?: number;
  q?: string;
  labelIds?: string[];
  pageToken?: string;
}
