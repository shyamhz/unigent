'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const intentBadges = [
  { label: 'schedule_event', className: 'bg-primary/10 text-primary border-primary/20' },
  { label: 'send_email', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  { label: 'Alex', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Thu · 3:00 PM', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
];

const reasoningSteps = [
  { icon: '◆', color: 'text-primary', done: true, label: 'Intent parsed' },
  { icon: '◆', color: 'text-primary', done: true, label: 'Actions planned' },
  { icon: '◆', color: 'text-destructive', done: true, label: 'Email sent' },
  { icon: '◆', color: 'text-blue-400', done: true, label: 'Event created' },
  { icon: '✓', color: 'text-emerald-400', done: true, label: 'Complete' },
];

const chatMessages = [
  {
    type: 'user' as const,
    text: 'Schedule a call with Alex for Thursday 3pm and send a confirmation',
  },
  {
    type: 'agent' as const,
    text: 'Done. Calendar event created for Thu 3:00–3:30 PM and confirmation email sent to alex@team.io.',
    status: 'success',
  },
  {
    type: 'user' as const,
    text: 'Remind me to follow up with Finance on invoice 2047 tomorrow at 10am',
  },
  {
    type: 'agent' as const,
    text: 'Scheduled. I\'ll ping you tomorrow at 10:00 AM and draft a follow-up if needed.',
    status: 'success',
  },
];

export default function AICommandPanel() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-foreground">Unigent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-live" />
          <span className="text-[0.7rem] text-emerald-400">Active</span>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-5">
        <div className="flex flex-col gap-4 py-4">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`animate-fade-in-up flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
            >
              {msg.type === 'agent' && (
                <div className="mr-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              )}
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block rounded-2xl px-4 py-2.5 text-[0.82rem] leading-relaxed ${
                    msg.type === 'user'
                      ? 'rounded-br-sm bg-secondary text-foreground'
                      : 'rounded-bl-sm bg-primary/8 text-foreground'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.type === 'agent' && msg.status === 'success' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[0.65rem] text-emerald-400">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border/50 bg-background/50 px-5 py-4">
        {/* Intent Badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {intentBadges.map((badge) => (
            <Badge
              key={badge.label}
              variant="outline"
              className={`text-[0.65rem] font-medium px-2 py-0.5 ${badge.className}`}
            >
              {badge.label}
            </Badge>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Give Unigent a command..."
              className="h-11 bg-secondary/50 border-border/50 font-mono text-[0.82rem] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <kbd className="rounded border border-border/50 bg-background/50 px-1.5 py-0.5 text-[0.6rem] text-muted-foreground font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
          <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
