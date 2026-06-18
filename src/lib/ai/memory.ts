import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  toolCalls?: unknown;
  toolResult?: unknown;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount?: number;
}

export async function createSession(userId: string, title?: string): Promise<ChatSession> {
  const [session] = await db
    .insert(chatSessions)
    .values({ userId, title: title ?? 'New Chat' })
    .returning();
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export async function listSessions(userId: string): Promise<ChatSession[]> {
  const sessions = await db
    .select({
      id: chatSessions.id,
      title: chatSessions.title,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.updatedAt));
  return sessions;
}

export async function getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
  const [session] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1);
  if (!session || session.userId !== userId) return null;
  return {
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export async function deleteSession(sessionId: string, userId: string): Promise<boolean> {
  const session = await getSession(sessionId, userId);
  if (!session) return false;
  await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
  return true;
}

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  await db
    .update(chatSessions)
    .set({ title, updatedAt: new Date() })
    .where(eq(chatSessions.id, sessionId));
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(chatMessages.createdAt);
  return messages.map((m) => ({
    id: m.id,
    role: m.role as ChatMessage['role'],
    content: m.content,
    toolCalls: m.toolCalls ?? undefined,
    toolResult: m.toolResult ?? undefined,
    createdAt: m.createdAt,
  }));
}

export async function addMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'tool',
  content: string | null,
  toolCalls?: unknown,
  toolResult?: unknown,
): Promise<ChatMessage> {
  const [message] = await db
    .insert(chatMessages)
    .values({
      sessionId,
      role,
      content,
      toolCalls: toolCalls as Record<string, unknown> | undefined,
      toolResult: toolResult as Record<string, unknown> | undefined,
    })
    .returning();

  await db
    .update(chatSessions)
    .set({ updatedAt: new Date() })
    .where(eq(chatSessions.id, sessionId));

  return {
    id: message.id,
    role: message.role as ChatMessage['role'],
    content: message.content,
    toolCalls: message.toolCalls ?? undefined,
    toolResult: message.toolResult ?? undefined,
    createdAt: message.createdAt,
  };
}

export async function generateSessionTitle(userId: string, sessionId: string, firstMessage: string): Promise<string> {
  const title = firstMessage.length > 60
    ? firstMessage.slice(0, 57) + '...'
    : firstMessage;
  await updateSessionTitle(sessionId, title);
  return title;
}
