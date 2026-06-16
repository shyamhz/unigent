'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const events = [
  { color: 'bg-primary', name: 'Call with Alex', time: '3:00 – 3:30 PM', tag: 'AI-created' },
  { color: 'bg-blue-500', name: 'Dev Team Sync', time: '4:00 – 4:30 PM', tag: 'Meeting' },
  { color: 'bg-amber-500', name: 'Finance Follow-up', time: '10:00 AM', tag: 'Reminder' },
  { color: 'bg-blue-500', name: 'Q3 Review Prep', time: '11:00 AM – 12:00 PM', tag: 'Meeting' },
  { color: 'bg-primary', name: 'Investor Debrief', time: '2:00 – 3:00 PM', tag: 'AI-created' },
];

const activityItems = [
  { icon: '⏰', label: 'Reminder set', detail: 'Finance follow-up · Tomorrow 10 AM', time: '2m ago' },
  { icon: '⚡', label: 'Conflict resolved', detail: 'Reorganized overlapping events', time: '5m ago' },
  { icon: '✓', label: 'Event created', detail: 'Call with Alex · Thu 3:00 PM', time: '8m ago' },
];

const daysInJune2026 = 30;
const today = 17;
const daysWithEvents = [17, 18, 19, 20, 21];

export default function CalendarPanel() {
  const days = Array.from({ length: 35 }, (_, i) => {
    const day = i + 1;
    return day <= daysInJune2026 ? day : 0;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-sm font-medium text-foreground">Calendar</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.65rem]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground">Synced</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Month Header */}
          <div className="flex shrink-0 items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">June 2026</h3>
            <div className="flex gap-1">
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                ‹
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                ›
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
              <div key={d} className="text-center text-[0.6rem] font-medium uppercase text-muted-foreground/60 py-1">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const isToday = day === today;
              const hasEvent = daysWithEvents.includes(day);
              return (
                <div
                  key={i}
                  className={`relative flex h-8 w-full items-center justify-center rounded-lg text-[0.75rem] cursor-pointer transition-colors ${
                    day === 0
                      ? 'invisible'
                      : isToday
                        ? 'bg-primary font-semibold text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {day || ''}
                  {hasEvent && !isToday && (
                    <div className="absolute bottom-1 h-0.5 w-0.5 rounded-full bg-blue-400" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Upcoming Events - limited height, scrollable */}
          <div className="shrink-0">
            <h4 className="mb-2 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground/60">
              Upcoming
            </h4>
            <div className="max-h-[180px] overflow-y-auto rounded-xl border border-border/30">
              {events.map((event, i) => (
                <div key={i} className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/50 border-b border-border/20 last:border-0">
                  <div className={`h-2 w-2 rounded-full ${event.color} shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.78rem] font-medium text-foreground/90 group-hover:text-foreground">
                      {event.name}
                    </div>
                    <div className="text-[0.68rem] text-muted-foreground/60">
                      {event.time}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[0.5rem] px-1.5 py-0 bg-secondary/80 text-muted-foreground/60 shrink-0">
                    {event.tag}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Activity - limited height, scrollable */}
          <div className="shrink-0">
            <h4 className="mb-2 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground/60">
              Recent Activity
            </h4>
            <div className="max-h-[140px] overflow-y-auto rounded-xl border border-border/30">
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 border-b border-border/20 last:border-0">
                  <div className="mt-0.5 text-[0.8rem]">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.75rem] font-medium text-foreground/90">
                      {item.label}
                    </div>
                    <div className="text-[0.68rem] text-muted-foreground/60">
                      {item.detail}
                    </div>
                  </div>
                  <span className="text-[0.55rem] text-muted-foreground/40 shrink-0">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connected */}
      <div className="shrink-0 border-t border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Gmail
          </div>
          <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Calendar
          </div>
        </div>
      </div>
    </div>
  );
}
