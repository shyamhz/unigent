'use client'

import { useEffect, useState } from 'react'
import { useInView } from '@/client/hooks/use-in-view'
import {
  Sparkles, Mail, Calendar, Brain, Route, CheckCircle2,
  Clock3, Send, type LucideIcon,
} from 'lucide-react'

// ─── Constants (shared brand palette, matches Integrations bento) ─────────────
const INDIGO = '#5B6CF0'
const GMAIL_RED = '#EA4335'
const GCAL_BLUE = '#4285F4'

type Chip = { label: string; kind: 'intent' | 'entity' | 'time' }

type Scenario = {
  command: string
  chips: Chip[]
  gmail: { action: string; detail: string }
  calendar: { action: string; detail: string }
}

const SCENARIOS: Scenario[] = [
  {
    command: 'Schedule a call with Alex for Thursday 3pm and send a confirmation',
    chips: [
      { label: 'schedule_event', kind: 'intent' },
      { label: 'send_email', kind: 'intent' },
      { label: 'Alex', kind: 'entity' },
      { label: 'Thu · 3:00 PM', kind: 'time' },
    ],
    gmail: { action: 'Confirmation sent', detail: 'Drafted & dispatched to alex@team.io' },
    calendar: { action: 'Event created', detail: 'Call with Alex · Thu 3:00–3:30 PM' },
  },
  {
    command: 'Summarise unread threads this week and flag anything urgent',
    chips: [
      { label: 'summarise_inbox', kind: 'intent' },
      { label: 'flag_priority', kind: 'intent' },
      { label: 'unread', kind: 'entity' },
      { label: 'this week', kind: 'time' },
    ],
    gmail: { action: 'Threads summarised', detail: '12 unread condensed · 2 flagged urgent' },
    calendar: { action: 'Focus block held', detail: 'Review time · Today 4:00–4:30 PM' },
  },
  {
    command: "Reply to Sarah and block 90 minutes of focus time tomorrow",
    chips: [
      { label: 'send_email', kind: 'intent' },
      { label: 'block_time', kind: 'intent' },
      { label: 'Sarah', kind: 'entity' },
      { label: 'tomorrow · 90m', kind: 'time' },
    ],
    gmail: { action: 'Reply sent', detail: 'Response composed & sent to Sarah' },
    calendar: { action: 'Focus time blocked', detail: 'Deep work · Tomorrow 9:00–10:30 AM' },
  },
]

// ─── Agent reasoning pipeline ─────────────────────────────────────────────────
const PIPELINE: { icon: LucideIcon; label: string; sub: string; color: string }[] = [
  { icon: Brain, label: 'Understand', sub: 'Parse intent & context', color: INDIGO },
  { icon: Route, label: 'Plan', sub: 'Sequence the actions', color: INDIGO },
  { icon: Mail, label: 'Act · Gmail', sub: 'Draft & send', color: GMAIL_RED },
  { icon: Calendar, label: 'Act · Calendar', sub: 'Create & block', color: GCAL_BLUE },
  { icon: CheckCircle2, label: 'Confirm', sub: 'Report result back', color: '#22C55E' },
]

const chipStyle: Record<Chip['kind'], { color: string; bg: string; border: string }> = {
  intent: { color: INDIGO, bg: `${INDIGO}14`, border: `${INDIGO}33` },
  entity: { color: 'var(--muted-foreground)', bg: 'var(--muted)', border: 'var(--border)' },
  time: { color: GCAL_BLUE, bg: `${GCAL_BLUE}14`, border: `${GCAL_BLUE}33` },
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AgentSection() {
  const [idx, setIdx] = useState(0)
  // phase: 0 typing · 1 parsing · 2 acting · 3 done
  const [phase, setPhase] = useState(0)
  const [typed, setTyped] = useState(0)
  const [chips, setChips] = useState(0)
  const [steps, setSteps] = useState(0)
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.2 })

  const scenario = SCENARIOS[idx]

  // Reset whenever the section leaves the viewport so it replays cleanly.
  useEffect(() => {
    if (inView) return
    setIdx(0); setPhase(0); setTyped(0); setChips(0); setSteps(0)
  }, [inView])

  // Phase 0 — type the command character by character.
  useEffect(() => {
    if (!inView || phase !== 0) return
    if (typed < scenario.command.length) {
      const t = setTimeout(() => setTyped(v => v + 1), 26)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setPhase(1), 550)
    return () => clearTimeout(t)
  }, [inView, phase, typed, scenario.command.length])

  // Phase 1 — reveal extracted intent chips one by one.
  useEffect(() => {
    if (!inView || phase !== 1) return
    if (chips < scenario.chips.length) {
      const t = setTimeout(() => setChips(v => v + 1), 320)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setPhase(2), 500)
    return () => clearTimeout(t)
  }, [inView, phase, chips, scenario.chips.length])

  // Phase 2 — light up the reasoning pipeline step by step.
  useEffect(() => {
    if (!inView || phase !== 2) return
    if (steps < PIPELINE.length) {
      const t = setTimeout(() => setSteps(v => v + 1), 520)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setPhase(3), 400)
    return () => clearTimeout(t)
  }, [inView, phase, steps])

  // Phase 3 — hold the completed result, then advance to the next scenario.
  useEffect(() => {
    if (!inView || phase !== 3) return
    const t = setTimeout(() => {
      setTyped(0); setChips(0); setSteps(0); setPhase(0)
      setIdx(i => (i + 1) % SCENARIOS.length)
    }, 3200)
    return () => clearTimeout(t)
  }, [inView, phase])

  const gmailDone = steps >= 3
  const calDone = steps >= 4
  const progress = Math.round(
    ((phase >= 1 ? 1 : typed / scenario.command.length) * 0.25 +
      (chips / scenario.chips.length) * 0.25 +
      (steps / PIPELINE.length) * 0.5) * 100,
  )

  return (
    <section
      ref={ref}
      id="agent"
      className="py-28 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border overflow-hidden"
    >
      <style>{`
        @keyframes agentIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        {/* Heading — matches the Integrations badge/title pattern */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-accent mb-4 px-3 py-1 rounded-full border border-accent/30 bg-accent/5">
            <Sparkles size={11} />
            AI Agent
          </div>
          <h2 className="text-4xl font-bold mb-4 text-balance">The agent that understands context</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Give Unigent a plain-language command. It extracts the intent, plans the steps, and acts across Gmail and Calendar — then reports back.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid gap-3 md:grid-cols-3 md:grid-rows-[auto_auto]">
          {/* A — Command + extracted intent (col 1-2, row 1) */}
          <div className="md:col-span-2">
            <div className="bento-cell flex flex-col gap-4">
              {/* terminal header */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: `${GMAIL_RED}99` }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FBBF2499' }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22C55E99' }} />
                <span className="ml-2 text-xs font-mono text-muted-foreground">unigent · command</span>
                <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-mono text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  live
                </span>
              </div>

              {/* command line */}
              <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 min-h-[64px] flex items-start gap-2">
                <span className="mt-0.5 text-accent text-sm font-mono select-none">{'>'}</span>
                <p className="font-mono text-sm leading-relaxed text-foreground">
                  {scenario.command.slice(0, typed)}
                  {phase === 0 && (
                    <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 align-middle animate-pulse" />
                  )}
                </p>
              </div>

              {/* extracted intent */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                  Extracted intent
                </p>
                <div className="flex flex-wrap gap-2 min-h-[28px]">
                  {scenario.chips.slice(0, chips).map((chip, i) => {
                    const s = chipStyle[chip.kind]
                    return (
                      <span
                        key={chip.label + i}
                        className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md border"
                        style={{
                          color: s.color,
                          background: s.bg,
                          borderColor: s.border,
                          animation: 'agentIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
                        }}
                      >
                        {chip.label}
                      </span>
                    )
                  })}
                  {chips === 0 && (
                    <span className="text-xs text-muted-foreground/60 font-mono">
                      awaiting command…
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* B — Reasoning pipeline (col 3, spans both rows) */}
          <div className="md:row-span-2">
            <div className="bento-cell relative flex flex-col overflow-hidden h-full">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${INDIGO}12 0%, transparent 60%)` }}
              />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    Agent reasoning
                  </span>
                  <Brain size={14} style={{ color: INDIGO }} />
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  {PIPELINE.map((p, i) => {
                    const active = phase >= 2 && i === steps
                    const done = (phase >= 2 && i < steps) || phase === 3
                    const Icon = p.icon
                    const lit = active || done
                    return (
                      <div key={p.label} className="flex flex-col">
                        <div
                          className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-300"
                          style={{
                            background: active ? `${p.color}10` : 'transparent',
                            opacity: lit ? 1 : 0.45,
                          }}
                        >
                          <span
                            className="flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 transition-all duration-300"
                            style={{
                              borderColor: lit ? `${p.color}66` : 'var(--border)',
                              background: lit ? `${p.color}14` : 'var(--muted)',
                              boxShadow: active ? `0 0 12px ${p.color}40` : 'none',
                            }}
                          >
                            {done ? (
                              <CheckCircle2 size={15} style={{ color: p.color }} />
                            ) : (
                              <Icon size={15} style={{ color: lit ? p.color : 'var(--muted-foreground)' }} />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p
                              className="text-xs font-semibold truncate"
                              style={{ color: lit ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                            >
                              {p.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">{p.sub}</p>
                          </div>
                          {active && (
                            <span className="ml-auto flex gap-0.5 shrink-0">
                              {[0, 1, 2].map(d => (
                                <span
                                  key={d}
                                  className="w-1 h-1 rounded-full animate-bounce"
                                  style={{ background: p.color, animationDelay: `${d * 150}ms` }}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                        {i < PIPELINE.length - 1 && (
                          <span
                            className="ml-[1.45rem] w-px h-2 transition-colors duration-300"
                            style={{ background: i < steps ? `${p.color}66` : 'var(--border)' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* progress footer */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {phase === 3 ? 'Action complete' : 'Processing'}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums" style={{ color: INDIGO }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: INDIGO, boxShadow: `0 0 8px ${INDIGO}80` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C — Gmail result (col 1, row 2) */}
          <ResultCard
            label="Gmail"
            Icon={Mail}
            color={GMAIL_RED}
            ActionIcon={Send}
            active={gmailDone}
            action={scenario.gmail.action}
            detail={scenario.gmail.detail}
          />

          {/* D — Calendar result (col 2, row 2) */}
          <ResultCard
            label="Calendar"
            Icon={Calendar}
            color={GCAL_BLUE}
            ActionIcon={Clock3}
            active={calDone}
            action={scenario.calendar.action}
            detail={scenario.calendar.detail}
          />
        </div>
      </div>
    </section>
  )
}

// ─── Result card (Gmail / Calendar) ───────────────────────────────────────────
function ResultCard({
  label, Icon, color, ActionIcon, active, action, detail,
}: {
  label: string
  Icon: LucideIcon
  color: string
  ActionIcon: LucideIcon
  active: boolean
  action: string
  detail: string
}) {
  return (
    <div className="bento-cell flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{label}</span>
        <Icon size={13} style={{ color: active ? color : 'var(--muted-foreground)', transition: 'color 0.4s' }} />
      </div>

      {active ? (
        <div
          className="flex items-start gap-2.5 rounded-lg p-3 flex-1"
          style={{
            background: `${color}0C`,
            borderLeft: `2px solid ${color}`,
            animation: 'agentIn 0.45s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <ActionIcon size={13} className="mt-0.5 shrink-0" style={{ color }} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground">{action}</p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{detail}</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="h-3 rounded-md bg-muted animate-pulse w-3/4" />
          <div className="h-3 rounded-md bg-muted/60 animate-pulse w-1/2" />
          <p className="text-[10px] text-muted-foreground/60 mt-1">waiting for agent…</p>
        </div>
      )}
    </div>
  )
}
