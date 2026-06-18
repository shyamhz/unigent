import { Pool } from "pg";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";

export const db = new Pool({ connectionString: process.env.DATABASE_URL! });

const googleOAuth = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/corsair/oauth/callback`,
};

export const corsair = createCorsair({
  plugins: [
    gmail({ oauth: googleOAuth }),
    googlecalendar({ oauth: googleOAuth }),
  ],
  database: db,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});
