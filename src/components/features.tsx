'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'
import { Zap, CheckCircle2, Clock, ArrowRight, Mail, Calendar, MessageSquare, Star, AlertCircle } from 'lucide-react'

/* ─────────────────────────────────────────────
   Card 1 – Agent command terminal
   Shows a natural-language command being typed,
   then steps appearing one-by-one as the agent acts.
───────────────────────────────────────────── */
const COMMAND = 'Invite Dev Thursday 9 AM and send a confirmation'
const STEPS = [
  { icon: Calendar, label: 'Checking calendar availability…', done: false },
  { icon: Mail,     label: 'Drafting invite to dev@team.io', done: false },
  { icon: CheckCircle2, label: 'Invite sent · confirmation queued', done: true },
]

function AgentCard() {
  const [typed, setTyped]   = useState(0)
  const [step,  setStep]    = useState(-1)
  const [done,  setDone]    = useState(false)
  const { ref, inView } = useInView<HTMLDivElement>()

  useEffect(() => {
    if (!inView) {
      // Reset so the sequence replays from the top when scrolled back into view.
      setTyped(0); setStep(-1); setDone(false)
      return
    }
    let t: ReturnType<typeof setTimeout>
    if (typed < COMMAND.length) {
      t = setTimeout(() => setTyped(typed + 1), 38)
    } else if (step < STEPS.length - 1) {
      t = setTimeout(() => setStep(step + 1), 600)
    } else if (!done) {
      t = setTimeout(() => setDone(true), 400)
    } else {
      // restart loop
      t = setTimeout(() => { setTyped(0); setStep(-1); setDone(false) }, 3200)
    }
    return () => clearTimeout(t)
  }, [typed, step, done, inView])

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card overflow-hidden h-full min-h-[260px] flex flex-col">
      {/* title bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/40">
        <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-chart-5/60" />
        <span className="w-2.5 h-2.5 rounded-full bg-chart-2/60" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">unigent agent</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* prompt */}
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-accent text-xs font-mono select-none">{'>'}</span>
          <p className="font-mono text-xs leading-relaxed text-foreground">
            {COMMAND.slice(0, typed)}
            {typed < COMMAND.length && (
              <span className="inline-block w-1.5 h-3.5 bg-accent ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>

        {/* steps */}
        {step >= 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {STEPS.slice(0, step + 1).map((s, i) => {
              const Icon = s.icon
              const isLast = i === step
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 transition-all duration-300
                    ${s.done
                      ? 'bg-chart-2/10 text-chart-2 border border-chart-2/20'
                      : 'bg-muted/50 text-muted-foreground'
                    }`}
                  style={{ opacity: isLast && !done ? 0.85 : 1 }}
                >
                  <Icon size={12} />
                  <span className="font-mono">{s.label}</span>
                  {isLast && !done && (
                    <span className="ml-auto flex gap-0.5">
                      {[0,1,2].map(d => (
                        <span key={d} className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce"
                          style={{ animationDelay: `${d * 150}ms` }} />
                      ))}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Card 2 – Workflow pipeline
   A horizontal chain of nodes with a travelling
   token that pulses through each step.
───────────────────────────────────────────── */
const PIPELINE = [
  { label: 'Trigger',  sub: 'Email received',  color: 'text-chart-5' },
  { label: 'Parse',    sub: 'Extract intent',  color: 'text-accent'  },
  { label: 'Act',      sub: 'Run agent tool',  color: 'text-chart-3' },
  { label: 'Notify',   sub: 'Send summary',    color: 'text-chart-2' },
]

function WorkflowCard() {
  const [active, setActive] = useState(0)
  const { ref, inView } = useInView<HTMLDivElement>()

  useEffect(() => {
    if (!inView) {
      setActive(0)
      return
    }
    const id = setInterval(() => {
      setActive(a => (a + 1) % PIPELINE.length)
    }, 900)
    return () => clearInterval(id)
  }, [inView])

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card overflow-hidden h-full min-h-[260px] flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Workflow run #1,847</p>
      </div>
      <div className="flex-1 flex flex-col justify-center px-4 py-5 gap-3">
        {/* horizontal pipeline */}
        <div className="flex items-center gap-0">
          {PIPELINE.map((node, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex flex-col items-center flex-1 gap-1 transition-all duration-300 ${
                i === active ? 'scale-105' : 'scale-100 opacity-60'
              }`}>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-all duration-300 ${
                  i < active
                    ? 'bg-chart-2/10 border-chart-2/40 text-chart-2'
                    : i === active
                    ? `bg-accent/10 border-accent/40 text-accent ring-2 ring-accent/20`
                    : 'bg-muted/30 border-border'
                }`}>
                  {i < active ? <CheckCircle2 size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`text-[10px] font-semibold ${i === active ? node.color : 'text-muted-foreground'}`}>
                  {node.label}
                </span>
                <span className="text-[9px] text-muted-foreground/70 text-center leading-tight">{node.sub}</span>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className={`h-px flex-none w-4 mx-1 transition-all duration-500 ${
                  i < active ? 'bg-chart-2/50' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* live log line */}
        <div className="mt-2 rounded-lg bg-muted/40 border border-border px-3 py-2 font-mono text-[10px] text-muted-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-chart-2 animate-pulse flex-none" />
          <span>
            {active === 0 && 'Watching inbox for triggers…'}
            {active === 1 && 'Intent extracted: schedule_meeting'}
            {active === 2 && 'Tool call: calendar.create_event()'}
            {active === 3 && 'Summary dispatched · 0 errors'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Card 3 – Priority inbox triage
   Messages scroll in with a priority score badge,
   simulating LLM triage happening in real time.
───────────────────────────────────────────── */
const MESSAGES = [
  { from: 'CEO',        subject: 'Q3 board deck — needs review',  pri: 'Critical', priColor: 'text-destructive bg-destructive/10 border-destructive/20', icon: AlertCircle },
  { from: 'Recruiter',  subject: 'Open role follow-up',           pri: 'Low',      priColor: 'text-muted-foreground bg-muted/40 border-border',           icon: Mail        },
  { from: 'Dev Team',   subject: 'Deploy window confirmed Fri',   pri: 'High',     priColor: 'text-chart-5 bg-chart-5/10 border-chart-5/20',              icon: Star        },
  { from: 'Newsletter', subject: '5 productivity tips inside',    pri: 'Ignore',   priColor: 'text-muted-foreground/50 bg-muted/20 border-border/50',     icon: Mail        },
  { from: 'Finance',    subject: 'Invoice #9201 approved',        pri: 'Medium',   priColor: 'text-chart-2 bg-chart-2/10 border-chart-2/20',              icon: CheckCircle2 },
]

function PriorityCard() {
  const [visible, setVisible] = useState(0)
  const [scored,  setScored]  = useState<number[]>([])
  const { ref, inView } = useInView<HTMLDivElement>()

  useEffect(() => {
    if (!inView) {
      setVisible(0); setScored([])
      return
    }
    if (visible < MESSAGES.length) {
      const t = setTimeout(() => {
        setVisible(v => v + 1)
        setTimeout(() => setScored(s => [...s, visible]), 320)
      }, 700)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => { setVisible(0); setScored([]) }, 2800)
      return () => clearTimeout(t)
    }
  }, [visible, inView])

  return (
    <div ref={ref} className="rounded-xl border border-border bg-card overflow-hidden h-full min-h-[260px] flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Inbox triage</p>
        <span className="flex items-center gap-1 text-[10px] text-accent font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          LLM scoring
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 p-3 overflow-hidden">
        {MESSAGES.slice(0, visible).map((msg, i) => {
          const Icon = msg.icon
          const isScored = scored.includes(i)
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/20 px-3 py-2 transition-all duration-300"
              style={{
                opacity: isScored ? 1 : 0.5,
                transform: isScored ? 'translateX(0)' : 'translateX(-6px)',
              }}
            >
              <Icon size={11} className="text-muted-foreground flex-none" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-foreground truncate">{msg.from}</p>
                <p className="text-[9px] text-muted-foreground truncate">{msg.subject}</p>
              </div>
              {isScored && (
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border flex-none ${msg.priColor}`}>
                  {msg.pri}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main section
───────────────────────────────────────────── */
const FEATURES = [
  {
    title: 'Agents that actually do it',
    description:
      'Plain language commands. "Invite Dev Thursday 9 AM and send a confirmation." Done. Unigent agents understand context, take action, and report back.',
    Card: AgentCard,
  },
  {
    title: 'Every workflow automated',
    description:
      'Multi-step automation without the config hell. Chain actions across tools, set conditions, and let your agents run in the background.',
    Card: WorkflowCard,
  },
  {
    title: 'Only what matters, first',
    description:
      'LLM-powered priority triage. Your tasks and communications filtered to what is important — instantly, every single time.',
    Card: PriorityCard,
  },
]

export function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-20">
          {FEATURES.map(({ title, description, Card }, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
                idx % 2 === 1 ? 'md:grid-flow-dense' : ''
              }`}
            >
              <div className={idx % 2 === 1 ? 'md:col-start-2' : ''}>
                <h3 className="text-3xl font-bold mb-4 text-balance">{title}</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{description}</p>
                <div className="inline-flex items-center gap-2 text-accent">
                  <Zap size={14} />
                  <span className="text-sm font-medium">Built into every keystroke</span>
                  <ArrowRight size={13} />
                </div>
              </div>
              <Card />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
