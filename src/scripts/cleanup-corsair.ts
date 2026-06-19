import "dotenv/config";

const DEV_KEY = process.env.CORSAIR_DEV_KEY!;
const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const BASE = `https://api.corsair.dev/instances/${INSTANCE_ID}`;

async function api(path: string, method = "GET") {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${DEV_KEY}` },
  });
  if (!res.ok) {
    console.error(`  ✗ ${method} ${path} → ${res.status}`);
    return null;
  }
  return res.json();
}

async function main() {
  console.log(`\n  Cleaning Corsair instance: ${INSTANCE_ID}\n`);

  const data = await api("/tenants");
  const tenants = (data as any)?.tenants || [];

  if (tenants.length === 0) {
    console.log("  No tenants found.\n");
    return;
  }

  console.log(`  Found ${tenants.length} tenant(s):\n`);

  for (const tenant of tenants) {
    console.log(`  → ${tenant.id}`);
    const del = await api(`/tenants/${tenant.id}`, "DELETE");
    if (del !== null) {
      console.log(`    ✓ Deleted`);
    }
  }

  console.log("\n  Done.\n");
}

main().catch(console.error);
