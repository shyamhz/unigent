import type { CalendarEvent } from './types';

const CALENDAR_COLORS: Record<string, string> = {
  '1': 'bg-purple-400',
  '2': 'bg-green-500',
  '3': 'bg-purple-600',
  '4': 'bg-red-500',
  '5': 'bg-yellow-500',
  '6': 'bg-orange-500',
  '7': 'bg-teal-500',
  '8': 'bg-gray-500',
  '9': 'bg-indigo-500',
  '10': 'bg-emerald-600',
  '11': 'bg-red-600',
};

export function formatEventTime(start: string, end: string, allDay?: boolean): string {
  if (allDay) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const endStr = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${startStr} - ${endStr}`;
}

export function getEventColor(colorId?: string): string {
  if (!colorId) return 'bg-primary/50';
  return CALENDAR_COLORS[colorId] || 'bg-primary/50';
}

export function getDaysWithEvents(events: CalendarEvent[], year?: number, month?: number): Set<number> {
  const days = new Set<number>();
  for (const event of events) {
    const date = new Date(event.start);
    if (year !== undefined && month !== undefined) {
      if (date.getFullYear() === year && date.getMonth() === month) {
        days.add(date.getDate());
      }
    } else {
      days.add(date.getDate());
    }
  }
  return days;
}
