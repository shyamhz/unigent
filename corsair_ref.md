# Corsair Gmail API Reference

Source: https://docs.corsair.dev/plugins/gmail/api

## Base

All calls go through a tenant-scoped client:

```ts
const client = corsair.withTenant(tenantId);
```

## Messages

### messages.list

```ts
client.gmail.api.messages.list({
  userId?: string,
  q?: string,                // Gmail search query
  maxResults?: number,       // max 500
  pageToken?: string,
  labelIds?: string[],
  includeSpamTrash?: boolean,
})
// → { messages?: Message[], nextPageToken?: string, resultSizeEstimate?: number }
```

### messages.get

```ts
client.gmail.api.messages.get({
  userId?: string,
  id: string,
  format?: "minimal" | "full" | "raw" | "metadata",
  metadataHeaders?: string[],
})
// → GmailMessage
```

### messages.send

```ts
client.gmail.api.messages.send({
  userId?: string,
  raw: string,       // base64url-encoded RFC 2822
  threadId?: string,
})
// → GmailMessage
```

### messages.modify

```ts
client.gmail.api.messages.modify({
  userId?: string,
  id: string,
  addLabelIds?: string[],
  removeLabelIds?: string[],
})
// → GmailMessage
```

### messages.batchModify

```ts
client.gmail.api.messages.batchModify({
  userId?: string,
  ids?: string[],
  addLabelIds?: string[],
  removeLabelIds?: string[],
})
// → void
```

### messages.delete

```ts
client.gmail.api.messages.delete({ userId?: string, id: string })
// → void — IRREVERSIBLE
```

### messages.trash / messages.untrash

```ts
client.gmail.api.messages.trash({ userId?: string, id: string })
client.gmail.api.messages.untrash({ userId?: string, id: string })
// → GmailMessage
```

## Drafts

### drafts.create

```ts
client.gmail.api.drafts.create({
  userId?: string,
  draft?: {
    message?: {
      raw?: string,        // base64url-encoded RFC 2822
      threadId?: string,
    }
  }
})
// → { id?: string, message?: GmailMessage }
```

### drafts.get

```ts
client.gmail.api.drafts.get({
  userId?: string,
  id: string,
  format?: "minimal" | "full" | "raw" | "metadata",
})
// → { id?: string, message?: GmailMessage }
```

### drafts.list

```ts
client.gmail.api.drafts.list({
  userId?: string,
  maxResults?: number,
  pageToken?: string,
  q?: string,
})
// → { drafts?: Draft[], nextPageToken?: string, resultSizeEstimate?: number }
```

### drafts.send

```ts
client.gmail.api.drafts.send({
  userId?: string,
  id?: string,             // draft ID — send an existing draft
  message?: { raw?: string; threadId?: string },  // or send inline
})
// → GmailMessage
```

### drafts.update

```ts
client.gmail.api.drafts.update({
  userId?: string,
  id: string,
  draft?: { message?: { raw?: string; threadId?: string } },
})
// → { id?: string, message?: GmailMessage }
```

### drafts.delete

```ts
client.gmail.api.drafts.delete({ userId?: string, id: string })
// → void — IRREVERSIBLE
```

## Labels

### labels.list

```ts
client.gmail.api.labels.list({ userId?: string })
// → { labels?: Label[] }
```

### labels.get

```ts
client.gmail.api.labels.get({ userId?: string, id: string })
// → Label
```

### labels.create

```ts
client.gmail.api.labels.create({
  userId?: string,
  label: {
    name?: string,
    messageListVisibility?: "show" | "hide",
    labelListVisibility?: "labelShow" | "labelShowIfUnread" | "labelHide",
    color?: { textColor?: string; backgroundColor?: string },
  }
})
// → Label
```

### labels.update

```ts
client.gmail.api.labels.update({
  userId?: string,
  id: string,
  label: Label,
})
// → Label
```

### labels.delete

```ts
client.gmail.api.labels.delete({ userId?: string, id: string })
// → void
```

## Threads

### threads.get

```ts
client.gmail.api.threads.get({
  userId?: string,
  id: string,
  format?: "minimal" | "full" | "metadata",
  metadataHeaders?: string[],
})
// → { id?: string, snippet?: string, historyId?: string, messages?: GmailMessage[] }
```

### threads.delete

```ts
client.gmail.api.threads.delete({ userId?: string, id: string })
// → void — IRREVERSIBLE
```

## DB (cached read)

```ts
client.gmail.db.messages.search(options)  // → TypedEntity<GmailMessage>[]
client.gmail.db.drafts.search(options)    // → TypedEntity<GmailDraft>[]
client.gmail.db.labels.search(options)    // → TypedEntity<GmailLabel>[]
client.gmail.db.threads.search(options)   // → TypedEntity<GmailThread>[]
```

Search options accept `data` filters on JSONB fields with operators: `equals`, `contains`, `startsWith`, `endsWith`, `in`, `gt`, `gte`, `lt`, `lte`, `before`, `after`, `between`.

## Types

```ts
type GmailMessage = {
  id?: string
  threadId?: string
  labelIds?: string[]
  snippet?: string
  historyId?: string
  internalDate?: string | number | Date | null
  sizeEstimate?: number
  payload?: {
    partId?: string
    mimeType?: string
    filename?: string
    headers?: { name?: string; value?: string }[]
    body?: { attachmentId?: string; size?: number; data?: string }
    parts?: MessagePart[]   // recursive for multipart
  }
  raw?: string
}

type Draft = {
  id?: string
  message?: GmailMessage
}

type Label = {
  id?: string
  name?: string
  messageListVisibility?: "show" | "hide"
  labelListVisibility?: "labelShow" | "labelShowIfUnread" | "labelHide"
  type?: "system" | "user"
  messagesTotal?: number
  messagesUnread?: number
  threadsTotal?: number
  threadsUnread?: number
  color?: { textColor?: string; backgroundColor?: string }
}
```

## Notes

- `messages.send` and draft operations require RFC 2822 email encoded as **base64url**.
- `messages.delete`, `drafts.delete`, and `threads.delete` are **irreversible**.
- `format` supports `minimal`, `full`, `raw`, `metadata` depending on endpoint.
- DB reads (`*.db.*`) are cached — use for UI feeds. API reads (`*.api.*`) hit Gmail live — use for writes or refresh.
