'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const emails = [
  {
    id: 1,
    sender: 'CEO',
    initial: 'C',
    color: 'bg-red-500',
    subject: 'Q3 board deck — needs review',
    priority: 'critical' as const,
    time: '9:14 AM',
    preview: "Hi team, Please review the attached Q3 board deck before our meeting tomorrow. I need everyone's feedback on the financial projections and the new market expansion strategy.",
  },
  {
    id: 2,
    sender: 'Recruiter',
    initial: 'R',
    color: 'bg-emerald-500',
    subject: 'Open role follow-up',
    priority: 'low' as const,
    time: '8:30 AM',
  },
  {
    id: 3,
    sender: 'Dev Team',
    initial: 'D',
    color: 'bg-blue-500',
    subject: 'Deploy window confirmed Fri',
    priority: 'high' as const,
    time: 'Yesterday',
  },
  {
    id: 4,
    sender: 'Newsletter',
    initial: 'N',
    color: 'bg-zinc-600',
    subject: '5 productivity tips inside',
    priority: 'ignore' as const,
    time: 'Yesterday',
  },
  {
    id: 5,
    sender: 'Alex Chen',
    initial: 'A',
    color: 'bg-primary',
    subject: 'Re: Integration spec — LGTM',
    priority: 'high' as const,
    time: 'Mon',
  },
  {
    id: 6,
    sender: 'Finance',
    initial: 'F',
    color: 'bg-red-500',
    subject: 'Invoice #2047 awaiting approval',
    priority: 'critical' as const,
    time: 'Mon',
  },
];

const priorityConfig = {
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive' },
  high: { label: 'High', className: 'bg-amber-500/10 text-amber-400' },
  low: { label: 'Low', className: 'bg-zinc-500/10 text-zinc-400' },
  ignore: { label: 'Ignore', className: 'bg-zinc-800 text-zinc-500' },
};

export default function GmailPanel() {
  const [selectedId, setSelectedId] = useState(1);
  const selectedEmail = emails.find((e) => e.id === selectedId);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
          <span className="text-sm font-medium text-foreground">Inbox</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.65rem]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">Auto-sorted</span>
        </div>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {emails.map((email) => (
            <button
              key={email.id}
              onClick={() => setSelectedId(email.id)}
              className={`group flex w-full items-center gap-3 border-b border-border/30 px-5 py-3 text-left transition-all hover:bg-secondary/50 ${
                selectedId === email.id
                  ? 'border-l-2 border-l-primary bg-primary/5'
                  : 'border-l-2 border-l-transparent'
              }`}
            >
              <Avatar className={`h-8 w-8 ${email.color}`}>
                <AvatarFallback className="text-[0.7rem] font-medium text-white">
                  {email.initial}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[0.82rem] ${selectedId === email.id ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                    {email.sender}
                  </span>
                  <Badge variant="secondary" className={`text-[0.55rem] px-1.5 py-0 ${priorityConfig[email.priority].className}`}>
                    {priorityConfig[email.priority].label}
                  </Badge>
                </div>
                <div className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">
                  {email.subject}
                </div>
              </div>

              <span className="text-[0.65rem] text-muted-foreground/60">
                {email.time}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Preview */}
      {selectedEmail?.preview && (
        <div className="shrink-0 border-t border-border/50 bg-secondary/20 px-5 py-4">
          <p className="text-[0.78rem] leading-relaxed text-muted-foreground line-clamp-2">
            {selectedEmail.preview}
          </p>
        </div>
      )}

      {/* Compose */}
      <div className="shrink-0 border-t border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Reply..."
            className="h-10 bg-secondary/30 border-border/30 text-[0.82rem] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
          <button className="flex h-10 items-center rounded-lg bg-primary px-4 text-[0.78rem] font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
