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

export interface ListEmailsOptions {
  maxResults?: number;
  q?: string;
  labelIds?: string[];
  pageToken?: string;
}

export interface SearchEmailsOptions {
  query?: string;
  from?: string;
  to?: string;
  subject?: string;
  limit?: number;
  offset?: number;
  includeBody?: boolean;
}
