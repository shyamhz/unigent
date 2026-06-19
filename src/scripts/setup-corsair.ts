import "dotenv/config";
import { setupCorsair } from "corsair";
import { corsair } from "../server/services/corsair";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error("\n  ✗ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env\n");
  process.exit(1);
}

const redirectUrl = `${APP_URL}/api/corsair/oauth/callback`;

async function main() {
  console.log("\n  ⚡ Setting up Corsair integrations...\n");

  const result = await setupCorsair(corsair, {
    credentials: {
      gmail: {
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_url: redirectUrl,
      },
      googlecalendar: {
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_url: redirectUrl,
      },
    },
  });

  console.log(result);
  console.log("\n  ✓ Corsair integrations configured.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n  ✗ Setup failed:", err instanceof Error ? err.message : String(err), "\n");
  process.exit(1);
});
