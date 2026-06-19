import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { createClerkClient } from "@clerk/backend";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../server/db/schema";

// Force production URL for emails — admin runs locally but sends to real users
process.env.NEXT_PUBLIC_APP_URL = "https://unigent.in";

const PORT = Number(process.env.ADMIN_PORT || 3001);
const HOST = "127.0.0.1";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
});

type UserMeta = {
  access_allowed?: boolean;
  onboarded?: boolean;
  tier?: "free" | "pro";
  connections?: { gmail?: boolean; calendar?: boolean };
};

const DEFAULT_MODEL = "openai/gpt-4o-mini";

async function getAIConfig(): Promise<{ model: string }> {
  const [row] = await db
    .select()
    .from(schema.aiConfig)
    .where(eq(schema.aiConfig.id, "default"))
    .limit(1);

  if (row) return { model: row.model };

  await db.insert(schema.aiConfig).values({ id: "default", model: DEFAULT_MODEL });
  return { model: DEFAULT_MODEL };
}

async function setAIConfig(model: string): Promise<{ model: string }> {
  const current = await getAIConfig();
  await db
    .update(schema.aiConfig)
    .set({ model, updatedAt: new Date() })
    .where(eq(schema.aiConfig.id, "default"));
  return { model };
}

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

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { ...existing, access_allowed: true, tier: existing.tier || "free" },
    });

    let emailSent = false;
    let emailError = "";
    try {
      const { sendEmail } = await import("../server/services/email");
      const { getAccessGrantedEmail } = await import("../emails/access-granted");
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
    await clerk.users.updateUserMetadata(userId, {
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
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { ...existing, tier },
    });
    return json(res, { ok: true });
  } catch (err) {
    return json(res, { ok: false, error: err instanceof Error ? err.message : "Unknown" });
  }
}

async function handleDeleteUser(_req: IncomingMessage, res: ServerResponse, userId: string) {
  if (!userId) return json(res, { ok: false, error: "Missing userId" }, 400);

  const results: Record<string, string> = {};

  // 1. Delete from Corsair (tenant + all credentials)
  try {
    const CORSAIR_DEV_KEY = process.env.CORSAIR_DEV_KEY;
    const CORSAIR_INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID;
    if (CORSAIR_DEV_KEY && CORSAIR_INSTANCE_ID) {
      const corsairRes = await fetch(
        `https://api.corsair.dev/instances/${CORSAIR_INSTANCE_ID}/tenants/${userId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${CORSAIR_DEV_KEY}` } },
      );
      results.corsair = corsairRes.ok ? "deleted" : `failed (${corsairRes.status})`;
    } else {
      results.corsair = "skipped (no config)";
    }
  } catch (err) {
    results.corsair = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 2. Delete from DB (chat sessions cascade to messages, corsair entities)
  try {
    // Find user's chat sessions
    const sessions = await db
      .select({ id: schema.chatSessions.id })
      .from(schema.chatSessions)
      .where(eq(schema.chatSessions.userId, userId));
    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      // Delete messages for these sessions
      await db
        .delete(schema.chatMessages)
        .where(inArray(schema.chatMessages.sessionId, sessionIds));
    }

    // Delete chat sessions
    await db.delete(schema.chatSessions).where(eq(schema.chatSessions.userId, userId));

    // Delete corsair accounts/entities for this tenant
    const accounts = await db
      .select({ id: schema.corsairAccounts.id })
      .from(schema.corsairAccounts)
      .where(eq(schema.corsairAccounts.tenantId, userId));
    const accountIds = accounts.map((a) => a.id);

    if (accountIds.length > 0) {
      await db.delete(schema.corsairEntities).where(inArray(schema.corsairEntities.accountId, accountIds));
      await db.delete(schema.corsairEvents).where(inArray(schema.corsairEvents.accountId, accountIds));
    }
    await db.delete(schema.corsairAccounts).where(eq(schema.corsairAccounts.tenantId, userId));

    results.db = "deleted";
  } catch (err) {
    results.db = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 3. Delete from Clerk (last, so if it fails the data above is already cleaned)
  try {
    await clerk.users.deleteUser(userId);
    results.clerk = "deleted";
  } catch (err) {
    results.clerk = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  const allOk = Object.values(results).every((v) => v === "deleted" || v.startsWith("skipped"));
  return json(res, { ok: allOk, results });
}

async function handleGetAIConfig(_req: IncomingMessage, res: ServerResponse) {
  const config = await getAIConfig();

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
  const { model } = body;

  if (!model) return json(res, { ok: false, error: "Missing model" }, 400);

  const config = await setAIConfig(model);
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

  // DELETE /api/users/:id — delete user from Clerk + Corsair + DB
  if (url.pathname.startsWith("/api/users/") && req.method === "DELETE") {
    const userId = url.pathname.split("/api/users/")[1];
    return handleDeleteUser(req, res, userId);
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`\n  ⚡ Unigent Admin Panel`);
  console.log(`  → http://${HOST}:${PORT}\n`);
});
