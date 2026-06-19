import { streamText, stepCountIs, type Tool } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getAIModel } from '@/server/services/aicredits';
import { buildSystemPrompt } from '@/server/ai/system-prompt';
import { buildTools } from '@/server/ai/tools';
import { checkConnections } from '@/server/actions/connections';
import { getAIConfig } from '@/server/ai/config';
import { isHostedAvailable, getHostedTools } from '@/server/services/corsair-hosted';
import {
  getMessages,
  addMessage,
  createSession,
  generateSessionTitle,
} from '@/server/ai/memory';

const MAX_RETRIES = 2;

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  let sessionId: string | undefined;

  try {
    const { userId } = await auth();
    if (!userId) return jsonError('Unauthorized', 401);

    const body = await req.json();
    const { messages, sessionId: inputSessionId } = body as {
      messages: Array<{ role: string; content: string }>;
      sessionId?: string;
    };

    if (!messages || messages.length === 0) {
      return jsonError('No messages provided', 400);
    }

    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role !== 'user') {
      return jsonError('Last message must be from user', 400);
    }

    const config = getAIConfig();

    let tools: Record<string, Tool> = {};
    let corsairMode = 'self-hosted';

    if (isHostedAvailable()) {
      try {
        const hostedTools = await getHostedTools(userId);
        if (Object.keys(hostedTools).length > 0) {
          tools = hostedTools;
          corsairMode = 'hosted';
        }
      } catch {}
    }

    if (Object.keys(tools).length === 0) {
      const connections = await checkConnections();
      tools = buildTools(connections);
      corsairMode = 'self-hosted';
    }

    sessionId = inputSessionId;
    if (!sessionId) {
      const session = await createSession(userId);
      sessionId = session.id;
    }

    await addMessage(sessionId, 'user', lastUserMessage.content);
    const existingMessages = await getMessages(sessionId);
    if (existingMessages.length <= 1) {
      await generateSessionTitle(userId, sessionId, lastUserMessage.content);
    }

    const systemPrompt = buildSystemPrompt();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = streamText({
          model: getAIModel(config.model),
          system: systemPrompt,
          tools,
          stopWhen: stepCountIs(config.maxSteps),
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens,
          messages: messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          onFinish: async ({ text, toolCalls, toolResults }) => {
            await addMessage(
              sessionId!,
              'assistant',
              text || null,
              toolCalls.length > 0 ? toolCalls : undefined,
              toolResults.length > 0 ? toolResults : undefined,
            );
          },
          onError: (error) => {
            lastError = error.error instanceof Error ? error.error : new Error(String(error.error));
          },
        });

        const response = result.toTextStreamResponse();
        const headers = new Headers(response.headers);
        headers.set('x-session-id', sessionId!);
        headers.set('x-model', config.model);
        headers.set('x-attempt', String(attempt));
        headers.set('x-corsair-mode', corsairMode);

        return new Response(response.body, {
          status: response.status,
          headers,
        });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (attempt < MAX_RETRIES) {
          const delay = Math.min(1000 * 2 ** attempt, 8000);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }
    }

    return jsonError(
      `AI request failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message || 'Unknown error'}`,
      502,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return jsonError(message, 500);
  }
}

export const maxDuration = 60;
