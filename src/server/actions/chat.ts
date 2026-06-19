'use server';

import { auth } from '@clerk/nextjs/server';
import {
  createSession,
  listSessions,
  getSession,
  deleteSession,
  getMessages,
  addMessage,
  type ChatSession,
  type ChatMessage,
} from '@/server/ai/memory';
import { checkConnections } from './connections';

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function createChatSession(title?: string): Promise<ChatSession> {
  const userId = await getUserId();
  return createSession(userId, title);
}

export async function getChatSessions(): Promise<ChatSession[]> {
  const userId = await getUserId();
  return listSessions(userId);
}

export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  const userId = await getUserId();
  return getSession(sessionId, userId);
}

export async function removeChatSession(sessionId: string): Promise<boolean> {
  const userId = await getUserId();
  return deleteSession(sessionId, userId);
}

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const userId = await getUserId();
  const session = await getSession(sessionId, userId);
  if (!session) throw new Error('Session not found');
  return getMessages(sessionId);
}

export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'tool',
  content: string | null,
  toolCalls?: unknown,
  toolResult?: unknown,
): Promise<ChatMessage> {
  const userId = await getUserId();
  const session = await getSession(sessionId, userId);
  if (!session) throw new Error('Session not found');
  return addMessage(sessionId, role, content, toolCalls, toolResult);
}

export async function getAIConnections() {
  await getUserId();
  return checkConnections();
}
