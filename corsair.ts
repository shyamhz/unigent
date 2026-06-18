import { Pool } from "pg";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";

export const db = new Pool({ connectionString: process.env.DATABASE_URL! });

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");
const redirectUri = `${appUrl}/api/corsair/oauth/callback`;

export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: db,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
  connect: { baseUrl: appUrl, redirectUri },
});
