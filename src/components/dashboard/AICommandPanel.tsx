'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  removeChatSession,
  getAIConnections,
} from '@/app/actions/chat';
import type { ChatSession, ChatMessage } from '@/lib/ai/memory';

interface ConnectionStatus {
  gmail: boolean;
  googlecalendar: boolean;
}

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: Array<{ toolName: string; args: unknown }>;
  toolResult?: unknown;
}

let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playNotificationSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1100, now + 0.08);
    osc2.frequency.setValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.25);
  } catch {}
}

function playErrorSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.18);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch {}
}

export default function AICommandPanel() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [connections, setConnections] = useState<ConnectionStatus>({ gmail: false, googlecalendar: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    getAIConnections().then(setConnections);
    getChatSessions().then((s) => {
      setSessions(s);
      if (s.length > 0) {
        setActiveSessionId(s[0].id);
        getChatMessages(s[0].id).then((msgs) => {
          setMessages(msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content ?? '',
            toolCalls: m.toolCalls as Array<{ toolName: string; args: unknown }> | undefined,
            toolResult: m.toolResult as unknown,
          })));
        });
      }
    });
  }, []);

  const loadSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    const msgs = await getChatMessages(sessionId);
    setMessages(msgs.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content ?? '',
      toolCalls: m.toolCalls as Array<{ toolName: string; args: unknown }> | undefined,
      toolResult: m.toolResult as unknown,
    })));
  }, []);

  const startNewSession = useCallback(async () => {
    const session = await createChatSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setMessages([]);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    await removeChatSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        loadSession(remaining[0].id);
      } else {
        setActiveSessionId(null);
        setMessages([]);
      }
    }
  }, [activeSessionId, sessions, loadSession]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: DisplayMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    let sessionId = activeSessionId;
    if (!sessionId) {
      const session = await createChatSession(userMsg.content.slice(0, 60));
      sessionId = session.id;
      setActiveSessionId(sessionId);
      setSessions((prev) => [session, ...prev]);
    }

    const assistantMsg: DisplayMessage = {
      id: `stream-${Date.now()}`,
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const allMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      abortRef.current = new AbortController();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, sessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errorData.error || `Chat failed: ${res.status}`);
      }

      const returnedSessionId = res.headers.get('x-session-id');
      if (returnedSessionId && returnedSessionId !== sessionId) {
        setActiveSessionId(returnedSessionId);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: accumulated };
          }
          return updated;
        });
      }

      getChatSessions().then(setSessions);
      playNotificationSound();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        playErrorSound();
        const errMsg = (err as Error).message || '';
        let userMessage = 'Sorry, something went wrong. Please try again.';
        if (errMsg.includes('502') || errMsg.includes('503')) {
          userMessage = 'The AI service is temporarily unavailable. Please try again in a moment.';
        } else if (errMsg.includes('429')) {
          userMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (errMsg.includes('401') || errMsg.includes('403')) {
          userMessage = 'Authentication failed. Please check your API configuration.';
        } else if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
          userMessage = 'Network error. Please check your connection and try again.';
        }
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content || userMessage,
            };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, isStreaming, activeSessionId, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const connectedCount = Object.values(connections).filter(Boolean).length;
  const totalCount = Object.keys(connections).length;

  const quickActions = [
    { label: 'Summarize inbox', prompt: 'Summarize my most important unread emails' },
    { label: 'Check calendar', prompt: 'What meetings do I have today?' },
    { label: 'Draft reply', prompt: 'Help me draft a professional reply to my latest email' },
    { label: 'Find urgent', prompt: 'Find any urgent or critical emails I need to respond to' },
  ];

  const handleQuickAction = useCallback((prompt: string) => {
    if (isStreaming) return;
    setInput(prompt);
    inputRef.current?.focus();
  }, [isStreaming]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </button>
          <span className="text-sm font-medium text-foreground">Unigent</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[0.65rem]">
            <span className={`h-1.5 w-1.5 rounded-full ${connectedCount > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-muted-foreground">{connectedCount}/{totalCount} connected</span>
          </div>
          <button
            onClick={startNewSession}
            className="flex h-7 items-center gap-1 rounded-lg bg-secondary/50 px-2 text-[0.7rem] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Session Sidebar */}
        {showSidebar && (
          <div className="w-48 shrink-0 border-r border-border/50 flex flex-col">
            <div className="flex-1 overflow-y-auto py-2">
              {sessions.length === 0 ? (
                <div className="px-3 py-6 text-center text-[0.7rem] text-muted-foreground/50">
                  No conversations yet
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer transition-colors ${
                      activeSessionId === session.id
                        ? 'bg-secondary/80 text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                    }`}
                    onClick={() => loadSession(session.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-40">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="flex-1 truncate text-[0.72rem]">{session.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-opacity"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-10 shrink-0 border-b border-border/40 bg-card/95 px-4 py-2.5 backdrop-blur-sm sm:px-5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isStreaming}
                  className="shrink-0 rounded-lg border border-border/40 bg-secondary/40 px-2.5 py-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5">
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[12rem] flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <h3 className="mb-1 text-sm font-medium text-foreground">How can I help?</h3>
                <p className="max-w-[240px] text-[0.72rem] text-muted-foreground">
                  I can manage your emails, schedule events, and more.
                  {connectedCount < totalCount && (
                    <span className="mt-1 block text-amber-400/70">
                      Connect {totalCount - connectedCount} more integration{totalCount - connectedCount > 1 ? 's' : ''} for full access.
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="mr-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.role === 'tool' ? (
                        <div className="rounded-lg border border-border/30 bg-secondary/30 px-3 py-2 font-mono text-[0.72rem] text-muted-foreground">
                          <span className="mb-1 block text-[0.65rem] uppercase tracking-wider text-muted-foreground/50">Tool Result</span>
                          {typeof msg.content === 'string' ? msg.content.slice(0, 200) : JSON.stringify(msg.content).slice(0, 200)}
                        </div>
                      ) : (
                        <div
                          className={`inline-block rounded-2xl px-4 py-2.5 text-[0.82rem] leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'rounded-br-sm bg-secondary text-foreground'
                              : 'rounded-bl-sm bg-primary/8 text-foreground'
                          }`}
                        >
                          {msg.content}
                          {isStreaming && msg.id === messages[messages.length - 1]?.id && msg.role === 'assistant' && (
                            <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-primary/60 align-text-bottom" />
                          )}
                        </div>
                      )}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {msg.toolCalls.map((tc, i) => (
                            <span key={i} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[0.6rem] text-primary">
                              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                              </svg>
                              {tc.toolName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border/50 bg-background/50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Unigent anything..."
                  disabled={isStreaming}
                  className="h-11 bg-secondary/50 border-border/50 text-[0.82rem] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <kbd className="rounded border border-border/50 bg-background/50 px-1.5 py-0.5 text-[0.6rem] text-muted-foreground font-mono">
                    ⌘K
                  </kbd>
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isStreaming ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
