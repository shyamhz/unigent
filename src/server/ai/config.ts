import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { aiConfig } from '@/server/db/schema';

export interface AIConfig {
  model: string;
}

const DEFAULT_MODEL = 'openai/gpt-4o-mini';

export async function getAIConfig(): Promise<AIConfig> {
  const [row] = await db
    .select()
    .from(aiConfig)
    .where(eq(aiConfig.id, 'default'))
    .limit(1);

  if (row) {
    return { model: row.model };
  }

  await db.insert(aiConfig).values({ id: 'default', model: DEFAULT_MODEL });
  return { model: DEFAULT_MODEL };
}

export async function setAIConfig(config: Partial<AIConfig>): Promise<AIConfig> {
  const current = await getAIConfig();
  const updated = { ...current, ...config };

  await db
    .update(aiConfig)
    .set({ model: updated.model, updatedAt: new Date() })
    .where(eq(aiConfig.id, 'default'));

  return updated;
}
