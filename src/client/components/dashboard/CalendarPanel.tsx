'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/nextjs';
import { Badge } from '@/client/components/ui/badge';
import { Input } from '@/client/components/ui/input';
import { CustomSelect } from '@/client/components/ui/custom-select';
import {
  getEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/server/actions/calendar';

import type { CalendarEvent, CreateEventParams, UpdateEventParams } from '@/server/services/googlecalendar/types';
import { formatEventTime, getEventColor, getDaysWithEvents } from '@/server/services/googlecalendar/utils';
import { playCreateSound, playUpdateSound, playDeleteSound, playErrorSound } from '@/client/utils/sounds';
import { ConnectButton } from './ConnectButton';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CALENDAR_COLORS = [
  { id: '', label: 'Default' },
  { id: '1', label: 'Lavender', dot: 'bg-purple-400' },
  { id: '2', label: 'Sage', dot: 'bg-green-500' },
  { id: '3', label: 'Grape', dot: 'bg-purple-600' },
  { id: '4', label: 'Flamingo', dot: 'bg-red-500' },
  { id: '5', label: 'Banana', dot: 'bg-yellow-500' },
  { id: '6', label: 'Tangerine', dot: 'bg-orange-500' },
  { id: '7', label: 'Peacock', dot: 'bg-teal-500' },
  { id: '8', label: 'Graphite', dot: 'bg-gray-500' },
  { id: '9', label: 'Blueberry', dot: 'bg-indigo-500' },
  { id: '10', label: 'Basil', dot: 'bg-emerald-600' },
  { id: '11', label: 'Tomato', dot: 'bg-red-600' },
];

const VISIBILITY_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'confidential', label: 'Confidential' },
] as const;

const TRANSPARENCY_OPTIONS = [
  { value: 'opaque', label: 'Blocks time' },
  { value: 'transparent', label: 'Free time' },
] as const;

interface ReminderDraft {
  method: 'email' | 'popup';
  minutes: number;
}

interface EventForm {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  attendees: string[];
  colorId: string;
  visibility: string;
  transparency: string;
  reminders: ReminderDraft[];
}

function toLocalISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T09:00`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

type ModalMode = 'create' | 'edit' | null;

const inputClass =
  'h-9 bg-secondary/30 border-border/30 text-[0.82rem] placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30 [color-scheme:dark]';
const selectClass =
  'w-full h-9 rounded-lg border border-border/30 bg-secondary/30 px-3 text-[0.78rem] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 [color-scheme:dark]';
const labelClass = 'text-[0.65rem] text-muted-foreground/60 mb-1 block';

interface CalendarPanelProps {
  isConnected: boolean;
}

export default function CalendarPanel({ isConnected }: CalendarPanelProps) {
  const { user } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<EventForm>({
    summary: '',
    description: '',
    location: '',
    start: '',
    end: '',
    allDay: false,
    attendees: [],
    colorId: '',
    visibility: 'default',
    transparency: 'opaque',
    reminders: [],
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchMonthEvents = useCallback(async (year: number, month: number) => {
    setLoading(true);
    try {
      const timeMin = new Date(year, month, 1).toISOString();
      const timeMax = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const result = await getEvents(timeMin, timeMax);
      setEvents(result);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchMonthEvents(currentYear, currentMonth);
    }
  }, [isConnected, currentYear, currentMonth, fetchMonthEvents]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const openCreateModal = () => {
    const defaultDate = selectedDate ?? new Date();
    setModalMode('create');
    setEditingEvent(null);
    setAttendeeInput('');
    setSaveError(null);
    setForm({
      summary: '',
      description: '',
      location: '',
      start: toLocalISOString(defaultDate),
      end: toLocalISOString(new Date(defaultDate.getTime() + 3600000)),
      allDay: false,
      attendees: [],
      colorId: '',
      visibility: 'default',
      transparency: 'opaque',
      reminders: [],
    });
  };

  const openEditModal = (event: CalendarEvent) => {
    setModalMode('edit');
    setEditingEvent(event);
    setAttendeeInput('');
    setSaveError(null);
    setForm({
      summary: event.summary,
      description: event.description ?? '',
      location: event.location ?? '',
      start: event.allDay ? event.start.slice(0, 10) : event.start.slice(0, 16),
      end: event.allDay ? event.end.slice(0, 10) : event.end.slice(0, 16),
      allDay: event.allDay,
      attendees: event.attendees?.map((a) => a.email) ?? [],
      colorId: event.colorId ?? '',
      visibility: event.visibility ?? 'default',
      transparency: event.transparency ?? 'opaque',
      reminders: event.reminders?.overrides?.map((r) => ({ method: r.method, minutes: r.minutes })) ?? [],
    });
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingEvent(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!form.summary.trim()) {
      setSaveError('Event title is required.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const baseParams = {
        summary: form.summary,
        description: form.description || undefined,
        location: form.location || undefined,
        start: form.start,
        end: form.end,
        allDay: form.allDay,
        colorId: form.colorId || undefined,
        visibility: form.visibility as CreateEventParams['visibility'],
        transparency: form.transparency as CreateEventParams['transparency'],
        attendees: form.attendees.length > 0 ? form.attendees : undefined,
        reminders: form.reminders.length > 0
          ? form.reminders.map((r) => ({ method: r.method, minutes: r.minutes }))
          : undefined,
      };

      if (modalMode === 'create') {
        const created = await createCalendarEvent(baseParams);
        setEvents((prev) => [...prev, created]);
        playCreateSound();
        toast.success(`Event "${created.summary}" created`);
      } else if (modalMode === 'edit' && editingEvent) {
        const updateParams: UpdateEventParams = baseParams;
        const updated = await updateCalendarEvent(editingEvent.id, updateParams);
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        playUpdateSound();
        toast.success(`Event "${updated.summary}" updated`);
      }
      closeModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save event. Please try again.';
      setSaveError(message);
      playErrorSound();
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    setDeletingId(eventId);
    try {
      await deleteCalendarEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      playDeleteSound();
      toast.success(`Event "${event?.summary ?? 'event'}" deleted`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete event.';
      setSaveError(message);
      playErrorSound();
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const daysWithEvents = useMemo(() => getDaysWithEvents(events, currentYear, currentMonth), [events, currentYear, currentMonth]);

  const calendarDays = useMemo(() => {
    const days: { day: number; overflow: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ day: 0, overflow: true });
    for (let d = 1; d <= daysInMonth; d++) days.push({ day: d, overflow: false });
    while (days.length % 7 !== 0) days.push({ day: 0, overflow: true });
    return days;
  }, [firstDay, daysInMonth]);

  const filteredEvents = useMemo(() => {
    const visible = events
      .filter((e) => e.status !== 'cancelled')
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    if (!selectedDate) {
      const now = new Date();
      return visible.filter((e) => {
        const end = new Date(e.end);
        return end >= now;
      });
    }

    return visible.filter((e) => {
      const start = new Date(e.start);
      return isSameDay(start, selectedDate);
    });
  }, [events, selectedDate]);

  const isUserLoaded = user !== undefined;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="text-sm font-medium text-foreground">Calendar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[0.65rem]">
            <span className={`h-1.5 w-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-muted-foreground">{loading ? 'Syncing' : 'Synced'}</span>
          </div>
          {isConnected && (
            <button
              onClick={openCreateModal}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading state while user data loads */}
      {!isUserLoaded && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/60 animate-shimmer" />
            <div className="h-3 w-32 rounded-full bg-secondary/60 animate-shimmer" />
          </div>
        </div>
      )}

      {/* Connect Button if user loaded but Calendar not connected */}
      {isUserLoaded && !isConnected && (
        <div className="flex-1 flex items-center justify-center">
          <ConnectButton type="calendar" isConnected={isConnected} />
        </div>
      )}

      {/* Content */}
      {isUserLoaded && isConnected && (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          {/* Month Header */}
          <div className="flex shrink-0 items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                ‹
              </button>
              <button
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                ›
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="text-center text-[0.6rem] font-medium uppercase text-muted-foreground/60 py-1">
                {d}
              </div>
            ))}
            {calendarDays.map((item, i) => {
              if (item.day === 0) return <div key={i} className="invisible" />;
              const date = new Date(currentYear, currentMonth, item.day);
              const today = isToday(date);
              const selected = selectedDate && isSameDay(date, selectedDate);
              const hasEvent = daysWithEvents.includes(item.day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`relative flex h-8 w-full items-center justify-center rounded-lg text-[0.75rem] transition-colors ${
                    today
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : selected
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {item.day}
                  {hasEvent && !today && (
                    <div className="absolute bottom-1 h-0.5 w-0.5 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Upcoming Events */}
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground/60">
                {selectedDate
                  ? isSameDay(selectedDate, new Date())
                    ? 'Today'
                    : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Upcoming'}
              </h4>
              {selectedDate && !isSameDay(selectedDate, new Date()) && (
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="text-[0.6rem] text-primary hover:underline"
                >
                  Today
                </button>
              )}
            </div>
            <div className="max-h-[180px] overflow-y-auto rounded-xl border border-border/30">
              {loading ? (
                <div className="flex flex-col">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-border/20 last:border-0">
                      <div className="h-2 w-2 rounded-full bg-secondary/60 shrink-0 animate-shimmer" />
                      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                        <div className="h-3 rounded-full animate-shimmer" style={{ width: `${45 + (i % 2) * 15}%` }} />
                        <div className="h-2.5 rounded-full animate-shimmer" style={{ width: `${30 + (i % 3) * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-40">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <span className="text-[0.78rem]">No events</span>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary/50 border-b border-border/20 last:border-0"
                  >
                    <div className={`h-2 w-2 rounded-full ${getEventColor(event)} shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[0.78rem] font-medium text-foreground/90 group-hover:text-foreground truncate">
                        {event.summary}
                      </div>
                      <div className="text-[0.68rem] text-muted-foreground/60">
                        {formatEventTime(event)}
                      </div>
                    </div>
                    {event.hangoutLink && (
                      <Badge variant="secondary" className="text-[0.5rem] px-1.5 py-0 bg-green-500/10 text-green-600 dark:text-green-400 shrink-0">
                        Meet
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {deletingId !== event.id && (
                        <button
                          onClick={() => openEditModal(event)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-secondary transition-all"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-100"
                      >
                        {deletingId === event.id ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-red-400">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Footer */}
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

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl bg-card border border-border/50 p-5 shadow-lg animate-fade-in-up">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {modalMode === 'create' ? 'New event' : 'Edit event'}
            </h3>
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Event title"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                className={inputClass}
              />
              <Input
                type="text"
                placeholder="Location (optional)"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className={inputClass}
              />

              {/* All day toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(e) => {
                    const allDay = e.target.checked;
                    setForm((f) => {
                      let start = f.start;
                      let end = f.end;
                      if (allDay) {
                        start = start.slice(0, 10);
                        end = end.slice(0, 10);
                      } else {
                        if (start.length === 10) start = start + 'T09:00';
                        if (end.length === 10) end = end + 'T10:00';
                      }
                      return { ...f, allDay, start, end };
                    });
                  }}
                  className="h-3.5 w-3.5 rounded border-border/50 bg-secondary/30 accent-blue-500"
                />
                <span className="text-[0.78rem] text-muted-foreground">All day event</span>
              </label>

              {/* Start / End */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Start</label>
                  <input
                    type={form.allDay ? 'date' : 'datetime-local'}
                    value={form.start}
                    onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
                    className={selectClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End</label>
                  <input
                    type={form.allDay ? 'date' : 'datetime-local'}
                    value={form.end}
                    onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
                    className={selectClass}
                  />
                </div>
              </div>

              <Input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputClass}
              />

              {/* Separator */}
              <div className="border-t border-border/30 pt-3">
                <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground/60">Details</span>
              </div>

              {/* Color */}
              <div>
                <label className={labelClass}>Color</label>
                <CustomSelect
                  value={form.colorId}
                  onChange={(value) => setForm((f) => ({ ...f, colorId: value }))}
                  options={CALENDAR_COLORS.map((c) => ({ value: c.id, label: c.label, dot: c.dot }))}
                />
              </div>

              {/* Visibility */}
              <div>
                <label className={labelClass}>Visibility</label>
                <CustomSelect
                  value={form.visibility}
                  onChange={(value) => setForm((f) => ({ ...f, visibility: value }))}
                  options={VISIBILITY_OPTIONS as unknown as { value: string; label: string }[]}
                />
              </div>

              {/* Transparency */}
              <div>
                <label className={labelClass}>Transparency</label>
                <CustomSelect
                  value={form.transparency}
                  onChange={(value) => setForm((f) => ({ ...f, transparency: value }))}
                  options={TRANSPARENCY_OPTIONS as unknown as { value: string; label: string }[]}
                />
              </div>

              {/* Attendees */}
              <div>
                <label className={labelClass}>Attendees</label>
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/30 bg-secondary/30 px-2.5 py-2 min-h-[2.25rem] focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/40 transition-colors">
                  {form.attendees.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[0.72rem] font-medium text-primary"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, attendees: f.attendees.filter((e) => e !== email) }))}
                        className="ml-0.5 hover:text-primary/70 transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={form.attendees.length === 0 ? 'Add emails, press Enter' : ''}
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ',') && attendeeInput.trim()) {
                        e.preventDefault();
                        const email = attendeeInput.trim().replace(/,$/, '');
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(email) && !form.attendees.includes(email)) {
                          setForm((f) => ({ ...f, attendees: [...f.attendees, email] }));
                        }
                        setAttendeeInput('');
                      }
                    }}
                    className="flex-1 min-w-[120px] bg-transparent text-[0.78rem] text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                </div>
                <p className="text-[0.6rem] text-muted-foreground/40 mt-1">Type an email and press Enter to add</p>
              </div>

              {/* Reminders */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelClass}>Reminders</label>
                  {form.reminders.length < 4 && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          reminders: [...f.reminders, { method: 'popup', minutes: 10 }],
                        }))
                      }
                      className="text-[0.65rem] text-primary hover:underline"
                    >
                      + Add
                    </button>
                  )}
                </div>
                {form.reminders.length === 0 ? (
                  <p className="text-[0.72rem] text-muted-foreground/50">Uses default reminders</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {form.reminders.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CustomSelect
                          value={r.method}
                          onChange={(value) =>
                            setForm((f) => ({
                              ...f,
                              reminders: f.reminders.map((rr, idx) =>
                                idx === i ? { ...rr, method: value as 'email' | 'popup' } : rr
                              ),
                            }))
                          }
                          options={[
                            { value: 'popup', label: 'Popup' },
                            { value: 'email', label: 'Email' },
                          ]}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min={0}
                          max={40320}
                          value={r.minutes}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              reminders: f.reminders.map((rr, idx) =>
                                idx === i ? { ...rr, minutes: Number(e.target.value) } : rr
                              ),
                            }))
                          }
                          className={`${selectClass} w-20`}
                        />
                        <span className="text-[0.65rem] text-muted-foreground/60 shrink-0">min</span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              reminders: f.reminders.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {saveError && (
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-[0.72rem] text-red-400">
                {saveError}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="h-8 px-3 rounded-lg text-[0.78rem] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.summary.trim() || saving}
                className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-[0.78rem] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
