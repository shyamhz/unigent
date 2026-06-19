import "dotenv/config";

const DEV_KEY = process.env.CORSAIR_DEV_KEY!;
const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const BASE = `https://api.corsair.dev/instances/${INSTANCE_ID}`;

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${DEV_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function main() {
  console.log("\n  Instance detail:\n");
  const detail = await api("/");
  console.log(`    Name: ${detail.name}`);
  console.log(`    Status: ${detail.status}`);
  console.log(`    oauthCallbackUrl: ${detail.oauthCallbackUrl}`);
  console.log(`    mcpHttpUrl: ${detail.mcpHttpUrl}`);
  console.log(`    Plugins: ${(detail.plugins || []).map((p: any) => `${p.id || p.pluginId}(${p.authType})`).join(", ")}`);

  // Check root credentials
  for (const plugin of ["gmail", "googlecalendar"]) {
    const creds = await api(`/plugins/${plugin}/credentials`);
    console.log(`\n    ${plugin} root credentials:`);
    for (const f of (creds as any).fields || []) {
      if (f.scope === "root") {
        console.log(`      ${f.field}: ${f.set ? `✓ set (${f.preview || "****"})` : "✗ missing"}`);
      }
    }
  }

  // List tenants
  const tenants = await api("/tenants");
  console.log(`\n    Tenants: ${(tenants as any).tenants?.length || 0}`);
  for (const t of (tenants as any).tenants || []) {
    console.log(`      ${t.id}`);
    // Check per-tenant credentials
    for (const plugin of ["gmail", "googlecalendar"]) {
      const creds = await api(`/plugins/${plugin}/credentials/${t.id}`);
      const fields = (creds as any).fields || [];
      const setFields = fields.filter((f: any) => f.scope === "account" && f.set);
      if (setFields.length > 0) {
        console.log(`        ${plugin}: ${setFields.map((f: any) => f.field).join(", ")}`);
      } else {
        console.log(`        ${plugin}: no credentials`);
      }
    }
  }

  console.log("");
}

main().catch(console.error);
