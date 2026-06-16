import "dotenv/config";
import { Pool } from "pg";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { log } from "console";

const db = new Pool({ connectionString: process.env.DATABASE_URL! });
log(db);

export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: db,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: true,
});
