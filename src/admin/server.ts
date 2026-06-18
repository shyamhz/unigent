import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { createClerkClient } from "@clerk/backend";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAIConfig, setAIConfig } from "../lib/ai/config";
import { getClerkPublishableKey, getClerkSecretKey } from "../lib/clerk-env";

// Admin panel is development-only
if (process.env.NODE_ENV === "production") {
  console.error("\n  ✗ Admin panel is disabled in production.\n");
  process.exit(1);
}

const PORT = 3001;
const HOST = "127.0.0.1";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "unigent-admin-2026";

const clerk = createClerkClient({
  secretKey: getClerkSecretKey(),
  publishableKey: getClerkPublishableKey(),
});

type UserMeta = {
  access_allowed?: boolean;
  onboarded?: boolean;
  tier?: "free" | "pro";
  connections?: { gmail?: boolean; calendar?: boolean };
};

async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function json(res: ServerResponse, data: any, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function handleAuth(_req: IncomingMessage, res: ServerResponse) {
  const body = await parseBody(_req);
  if (body.password === ADMIN_PASSWORD) {
    return json(res, { ok: true });
  }
  return json(res, { ok: false }, 401);
}

async function handleUsers(_req: IncomingMessage, res: ServerResponse) {
  const result = await clerk.users.getUserList({ limit: 100 });
  const users = result.data || [];
  const mapped = users.map((u) => {
    const meta = (u.publicMetadata || {}) as UserMeta;
    return {
      id: u.id,
      email: u.emailAddresses?.[0]?.emailAddress || "No email",
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unnamed",
      createdAt: u.createdAt,
      lastSignInAt: u.lastSignInAt,
      access_allowed: meta.access_allowed === true,
      onboarded: meta.onboarded === true,
      tier: meta.tier || "free",
    };
  });
  return json(res, { users: mapped });
}

async function handleGrant(_req: IncomingMessage, res: ServerResponse) {
  const { userId } = await parseBody(_req);
  if (!userId) return json(res, { ok: false, error: "Missing userId" }, 400);

  try {
    const user = await clerk.users.getUser(userId);
    const existing = (user.publicMetadata || {}) as UserMeta;

    await clerk.users.updateUser(userId, {
      publicMetadata: { ...existing, access_allowed: true, tier: existing.tier || "free" },
    });

    // Send email
    let emailSent = false;
    let emailError = "";
    try {
      const { sendEmail } = await import("../../lib/email");
      const { getAccessGrantedEmail } = await import("../../emails/access-granted");
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (email) {
        await sendEmail({
          to: email,
          subject: "Welcome to Unigent — Your account is ready",
          html: getAccessGrantedEmail(user.firstName || ""),
        });
        emailSent = true;
      } else {
        emailError = "No email address found";
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
    }

    return json(res, { ok: true, emailSent, emailError });
  } catch (err) {
    return json(res, { ok: false, error: err instanceof Error ? err.message : "Unknown" });
  }
}

async function handleRevoke(_req: IncomingMessage, res: ServerResponse) {
  const { userId } = await parseBody(_req);
  if (!userId) return json(res, { ok: false, error: "Missing userId" }, 400);

  try {
    const user = await clerk.users.getUser(userId);
    const existing = (user.publicMetadata || {}) as UserMeta;
    await clerk.users.updateUser(userId, {
      publicMetadata: { ...existing, access_allowed: false },
    });
    return json(res, { ok: true });
  } catch (err) {
    return json(res, { ok: false, error: err instanceof Error ? err.message : "Unknown" });
  }
}

async function handleTier(_req: IncomingMessage, res: ServerResponse) {
  const { userId, tier } = await parseBody(_req);
  if (!userId || !tier) return json(res, { ok: false, error: "Missing params" }, 400);

  try {
    const user = await clerk.users.getUser(userId);
    const existing = (user.publicMetadata || {}) as UserMeta;
    await clerk.users.updateUser(userId, {
      publicMetadata: { ...existing, tier },
    });
    return json(res, { ok: true });
  } catch (err) {
    return json(res, { ok: false, error: err instanceof Error ? err.message : "Unknown" });
  }
}

async function handleGetAIConfig(_req: IncomingMessage, res: ServerResponse) {
  const config = getAIConfig();

  let models: Array<{ id: string; name: string; is_free: boolean; context_length: number; provider: string }> = [];
  try {
    const apiRes = await fetch("https://api.aicredits.in/api/models");
    const apiData = await apiRes.json() as { data: Array<{ id: string; name: string; is_free: boolean; context_length: number; is_active: boolean }> };
    models = (apiData.data || [])
      .filter((m) => m.is_active)
      .map((m) => ({
        id: m.id,
        name: m.name,
        is_free: m.is_free,
        context_length: m.context_length,
        provider: m.id.split("/")[0] || "unknown",
      }));
  } catch {
    models = [];
  }

  return json(res, { config, models });
}

async function handleSetAIConfig(_req: IncomingMessage, res: ServerResponse) {
  const body = await parseBody(_req);
  const { model, temperature, maxTokens, maxSteps } = body;

  const updates: Record<string, unknown> = {};
  if (model !== undefined) updates.model = model;
  if (temperature !== undefined) updates.temperature = Number(temperature);
  if (maxTokens !== undefined) updates.maxTokens = Number(maxTokens);
  if (maxSteps !== undefined) updates.maxSteps = Number(maxSteps);

  const config = setAIConfig(updates);
  return json(res, { ok: true, config });
}

function serveHTML(res: ServerResponse) {
  const html = readFileSync(join(import.meta.dirname, "index.html"), "utf-8");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);

  if (url.pathname === "/" && req.method === "GET") {
    return serveHTML(res);
  }
  if (url.pathname === "/api/auth" && req.method === "POST") {
    return handleAuth(req, res);
  }
  if (url.pathname === "/api/users" && req.method === "GET") {
    return handleUsers(req, res);
  }
  if (url.pathname === "/api/grant" && req.method === "POST") {
    return handleGrant(req, res);
  }
  if (url.pathname === "/api/revoke" && req.method === "POST") {
    return handleRevoke(req, res);
  }
  if (url.pathname === "/api/tier" && req.method === "POST") {
    return handleTier(req, res);
  }
  if (url.pathname === "/api/ai-config" && req.method === "GET") {
    return handleGetAIConfig(req, res);
  }
  if (url.pathname === "/api/ai-config" && req.method === "POST") {
    return handleSetAIConfig(req, res);
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`\n  ⚡ Unigent Admin Panel`);
  console.log(`  → http://${HOST}:${PORT}`);
  console.log(`  → Only accessible from localhost\n`);
});
