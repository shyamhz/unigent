import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_PATH = join(process.cwd(), 'ai-config.json');

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  maxSteps: number;
  provider: string;
}

const DEFAULT_CONFIG: AIConfig = {
  model: 'openai/gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 4096,
  maxSteps: 15,
  provider: 'aicredits',
};

export function getAIConfig(): AIConfig {
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function setAIConfig(config: Partial<AIConfig>): AIConfig {
  const current = getAIConfig();
  const updated = { ...current, ...config };
  writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
  return updated;
}
