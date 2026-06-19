import { createClient } from '@corsair-dev/app';
import type { Tool } from 'ai';

const DEV_KEY = process.env.CORSAIR_DEV_KEY;
const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID;

export function isHostedAvailable(): boolean {
  return Boolean(DEV_KEY && INSTANCE_ID);
}

function getInst() {
  if (!DEV_KEY || !INSTANCE_ID) {
    throw new Error('CORSAIR_DEV_KEY and CORSAIR_INSTANCE_ID required for hosted mode');
  }
  return createClient({ apiKey: DEV_KEY }).instance(INSTANCE_ID);
}

export async function getOrCreateTenant(tenantId: string): Promise<string> {
  const inst = getInst();
  const { tenants } = await inst.tenants.list();
  const existing = tenants.find((t) => t.id === tenantId);
  if (existing) return existing.id;
  const created = await inst.tenants.create(tenantId);
  return created.id;
}

export async function deleteTenant(tenantId: string): Promise<boolean> {
  if (!isHostedAvailable()) return false;
  try {
    const inst = getInst();
    await inst.tenant(tenantId).delete();
    return true;
  } catch {
    return false;
  }
}

export async function getHostedTools(tenantId: string): Promise<Record<string, Tool>> {
  const inst = getInst();
  const corsairTenantId = await getOrCreateTenant(tenantId);
  const mcpClient = await inst.tenant(corsairTenantId).mcp.createVercelClient();
  return await mcpClient.tools();
}

export async function callCorsairOperation(
  tenantId: string,
  path: string,
  params: Record<string, unknown>,
): Promise<unknown> {
  const inst = getInst();
  const corsairTenantId = await getOrCreateTenant(tenantId);
  const mcpClient = await inst.tenant(corsairTenantId).mcp.createVercelClient();
  const tools = await mcpClient.tools();

  const paramsJson = JSON.stringify(params);
  const code = `const r = await corsair.${path}(${paramsJson}); return r;`;
  const result = await tools.run_script.execute({ code });

  const text = (result as { content?: Array<{ text?: string }> })?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Corsair');
  return JSON.parse(text);
}
