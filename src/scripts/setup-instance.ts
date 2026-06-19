import "dotenv/config";

const DEV_KEY = process.env.CORSAIR_DEV_KEY!;
const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const BASE = `https://api.corsair.dev/instances/${INSTANCE_ID}`;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const APP_URL = "https://unigent.in";
const REDIRECT_URL = `${APP_URL}/api/corsair/oauth/callback`;

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${DEV_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  ✗ ${method} ${path} → ${res.status}: ${text}`);
    return null;
  }
  try { return JSON.parse(text); } catch { return text; }
}

async function main() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("  ✗ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required\n");
    process.exit(1);
  }

  console.log(`\n  Setting up Corsair instance: ${INSTANCE_ID}\n`);

  // 1. Install plugins
  console.log("  Installing plugins...");
  await api("/plugins/gmail", "PUT", { authType: "oauth_2" });
  await api("/plugins/googlecalendar", "PUT", { authType: "oauth_2" });
  console.log("    ✓ gmail, googlecalendar installed");

  // 2. Set root credentials for gmail
  console.log("  Setting gmail root credentials...");
  await api("/plugins/gmail/credentials/root", "PUT", { field: "client_id", value: GOOGLE_CLIENT_ID });
  await api("/plugins/gmail/credentials/root", "PUT", { field: "client_secret", value: GOOGLE_CLIENT_SECRET });
  await api("/plugins/gmail/credentials/root", "PUT", { field: "redirect_url", value: REDIRECT_URL });
  console.log("    ✓ client_id, client_secret, redirect_url set");

  // 3. Set root credentials for googlecalendar
  console.log("  Setting googlecalendar root credentials...");
  await api("/plugins/googlecalendar/credentials/root", "PUT", { field: "client_id", value: GOOGLE_CLIENT_ID });
  await api("/plugins/googlecalendar/credentials/root", "PUT", { field: "client_secret", value: GOOGLE_CLIENT_SECRET });
  await api("/plugins/googlecalendar/credentials/root", "PUT", { field: "redirect_url", value: REDIRECT_URL });
  console.log("    ✓ client_id, client_secret, redirect_url set");

  // 4. Verify
  console.log("\n  Verifying setup...\n");
  const detail = await api("/");
  if (detail) {
    console.log(`    Instance: ${detail.name} (${detail.id})`);
    console.log(`    Status: ${detail.status}`);
    console.log(`    OAuth callback: ${detail.oauthCallbackUrl}`);
    console.log(`    Plugins: ${(detail.plugins || []).map((p: any) => p.pluginId).join(", ")}`);
  }

  const gmailCreds = await api("/plugins/gmail/credentials");
  if (gmailCreds) {
    console.log("\n    Gmail root credentials:");
    for (const f of (gmailCreds as any).fields || []) {
      if (f.scope === "root") {
        console.log(`      ${f.field}: ${f.set ? "✓ set" : "✗ missing"}`);
      }
    }
  }

  const calCreds = await api("/plugins/googlecalendar/credentials");
  if (calCreds) {
    console.log("\n    Google Calendar root credentials:");
    for (const f of (calCreds as any).fields || []) {
      if (f.scope === "root") {
        console.log(`      ${f.field}: ${f.set ? "✓ set" : "✗ missing"}`);
      }
    }
  }

  console.log("\n  Done. Users can now connect via the onboarding flow.\n");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
