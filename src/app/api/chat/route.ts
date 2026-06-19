import { streamText, stepCountIs, type Tool } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { getAIModel } from '@/server/services/aicredits';
import { buildSystemPrompt } from '@/server/ai/system-prompt';
import { getHostedTools } from '@/server/services/corsair-hosted';
import {
  getMessages,
  addMessage,
  createSession,
  generateSessionTitle,
} from '@/server/ai/memory';
import { getAIConfig } from '@/server/ai/config';

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

    const config = await getAIConfig();
    const tools = await getHostedTools(userId);

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
          stopWhen: stepCountIs(15),
          temperature: 0.7,
          maxOutputTokens: 4096,
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

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const part of result.fullStream) {
                switch (part.type) {
                  case 'reasoning-delta':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'thinking', text: part.text })}\n`)
                    );
                    break;
                  case 'tool-input-start':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'tool-start', toolName: part.toolName })}\n`)
                    );
                    break;
                  case 'tool-input-delta':
                    break;
                  case 'tool-input-end':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'tool-end', toolName: '' })}\n`)
                    );
                    break;
                  case 'tool-call':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'tool-call', toolName: part.toolName, input: part.input })}\n`)
                    );
                    break;
                  case 'tool-result':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'tool-result', toolName: part.toolName })}\n`)
                    );
                    break;
                  case 'text-delta':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'text', text: part.text })}\n`)
                    );
                    break;
                  case 'error':
                    controller.enqueue(
                      encoder.encode(`e:${JSON.stringify({ type: 'error', error: 'Tool execution failed' })}\n`)
                    );
                    break;
                }
              }
            } catch (err) {
              if ((err as Error).name !== 'AbortError') {
                controller.enqueue(
                  encoder.encode(`e:${JSON.stringify({ type: 'error', error: (err as Error).message })}\n`)
                );
              }
            } finally {
              controller.enqueue(encoder.encode('e:{"type":"done"}\n'));
              controller.close();
            }
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'x-session-id': sessionId!,
            'x-model': config.model,
            'x-attempt': String(attempt),
          },
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
