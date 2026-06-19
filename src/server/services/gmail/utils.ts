export function base64UrlEncode(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64url");
}

export function base64UrlDecode(data: string): string {
  return Buffer.from(data, "base64url").toString("utf-8");
}

interface GmailPayloadBody {
  attachmentId?: string;
  size?: number;
  data?: string;
}

export interface GmailPayload {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: GmailPayloadBody;
  parts?: GmailPayload[];
}

function extractTextFromParts(
  parts: GmailPayload[],
): { html: string | null; plain: string | null } {
  let html: string | null = null;
  let plain: string | null = null;

  for (const part of parts) {
    if (part.mimeType === "text/html" && part.body?.data && !html) {
      html = base64UrlDecode(part.body.data);
    }
    if (part.mimeType === "text/plain" && part.body?.data && !plain) {
      plain = base64UrlDecode(part.body.data);
    }
    if (part.parts) {
      const nested = extractTextFromParts(part.parts);
      if (nested.html && !html) html = nested.html;
      if (nested.plain && !plain) plain = nested.plain;
    }
  }

  return { html, plain };
}

export function extractBodyFromPayload(
  payload: GmailPayload | undefined,
): string {
  if (!payload) return "";

  if (payload.body?.data) {
    if (payload.mimeType === "text/html") {
      return base64UrlDecode(payload.body.data);
    }
    if (payload.mimeType === "text/plain") {
      return base64UrlDecode(payload.body.data);
    }
  }

  if (payload.parts) {
    const result = extractTextFromParts(payload.parts);
    return result.html ?? result.plain ?? "";
  }

  return "";
}

export function buildRfc2822Message(
  to: string | string[],
  subject: string,
  body: string,
  isHtml = false,
): string {
  const toValue = Array.isArray(to) ? to.join(', ') : to;

  if (isHtml) {
    const plainText = body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const lines = [
      `To: ${toValue}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      plainText,
      "",
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      body,
      "",
      `--${boundary}--`,
    ];
    return lines.join("\r\n");
  }

  const lines = [
    `To: ${toValue}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    body,
  ];
  return lines.join("\r\n");
}
