'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'
import {
  Mail, Calendar, Sparkles, CheckCircle2, Clock3,
  FileText, CalendarPlus, Reply, AlertCircle, Tag,
  CalendarCheck, Zap, ArrowRightLeft,
} from 'lucide-react'

// ─── Constants ───────────────────────────────────────────────────────────────

const GMAIL_RED = '#EA4335'
const GCAL_BLUE = '#4285F4'
const INDIGO = '#5B6CF0'

const INTEGRATIONS = [
  { name: 'Gmail',            Icon: Mail,     color: GMAIL_RED, orbitRadius: 110, orbitDuration: 13, startAngle: -90 },
  { name: 'Google Calendar',  Icon: Calendar, color: GCAL_BLUE, orbitRadius: 165, orbitDuration: 21, startAngle: 60  },
]

type FeedItem = {
  Icon: typeof Mail
  color: string
  action: string
  detail: string
  ts: string
}

const FEED_POOL: Omit<FeedItem, 'ts'>[] = [
  { Icon: FileText,    color: GMAIL_RED,  action: 'Thread summarised',   detail: '3 unread emails condensed into 1 brief'       },
  { Icon: CalendarPlus,color: GCAL_BLUE,  action: 'Meeting scheduled',   detail: 'Team sync booked for Tue 3 pm'                },
  { Icon: Reply,       color: GMAIL_RED,  action: 'Draft sent',          detail: 'Reply composed & dispatched to Alex'          },
  { Icon: ArrowRightLeft, color: GCAL_BLUE, action: 'Conflict resolved', detail: 'Overlapping events rearranged automatically'  },
  { Icon: AlertCircle, color: GMAIL_RED,  action: 'Priority flagged',    detail: 'Invoice email marked urgent, owner notified'  },
  { Icon: CalendarCheck, color: GCAL_BLUE, action: 'Reminder created',   detail: 'Follow-up reminder set for Friday 9 am'       },
  { Icon: Tag,         color: GMAIL_RED,  action: 'Label applied',       detail: 'Finance thread auto-tagged & archived'        },
  { Icon: CalendarCheck, color: GCAL_BLUE, action: 'Event updated',      detail: 'Location added to All-hands calendar event'   },
]

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Orbit planet ─────────────────────────────────────────────────────────────

function Planet({
  intg, cx, cy, angle, active,
}: {
  intg: typeof INTEGRATIONS[number]
  cx: number; cy: number; angle: number; active: boolean
}) {
  const rad = (angle * Math.PI) / 180
  const nx = cx + intg.orbitRadius * Math.cos(rad)
  const ny = cy + intg.orbitRadius * Math.sin(rad)
  const { Icon } = intg

  return (
    <g transform={`translate(${nx},${ny})`}>
      {active && (
        <>
          <circle r="26" fill="none" stroke={intg.color} strokeWidth="1" opacity="0.2">
            <animate attributeName="r" values="22;34;22" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <circle
        r="20"
        fill="var(--card)"
        stroke={active ? intg.color : 'var(--border)'}
        strokeWidth={active ? 1.8 : 1}
        style={{
          filter: active ? `drop-shadow(0 0 8px ${intg.color}60)` : 'none',
          transition: 'stroke 0.5s, filter 0.5s',
        }}
      />
      <foreignObject x="-11" y="-11" width="22" height="22">
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
        >
          <Icon
            size={12}
            style={{ color: active ? intg.color : 'var(--muted-foreground)', transition: 'color 0.5s' }}
          />
        </div>
      </foreignObject>
      <text
        y="33" textAnchor="middle" fontSize="7.5" fontWeight="600"
        fill={active ? intg.color : 'var(--muted-foreground)'}
        fontFamily="inherit"
        style={{ transition: 'fill 0.5s' }}
      >
        {intg.name}
      </text>
    </g>
  )
}

// ─── Cell A — Orbit diagram (large, spans 2 rows) ─────────────────────────────

function OrbitCell({ angles, activeIdx }: { angles: number[]; activeIdx: number }) {
  const cx = 190, cy = 190, vSize = 380

  return (
    <div className="bento-cell row-span-2 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${INDIGO}12 0%, transparent 65%)` }}
      />

      <div className="relative z-10">
        <svg viewBox={`0 0 ${vSize} ${vSize}`} width={vSize} height={vSize} className="overflow-visible" aria-hidden>
          {/* Orbit rings */}
          {INTEGRATIONS.map(intg => (
            <circle key={intg.name + '-ring'}
              cx={cx} cy={cy} r={intg.orbitRadius}
              fill="none" stroke="currentColor" strokeWidth="1"
              strokeDasharray="3 7" className="text-border" opacity="0.45"
            />
          ))}

          {/* Connector lines */}
          {INTEGRATIONS.map((intg, i) => {
            const rad = (angles[i] * Math.PI) / 180
            const nx = cx + intg.orbitRadius * Math.cos(rad)
            const ny = cy + intg.orbitRadius * Math.sin(rad)
            const active = activeIdx === i
            return (
              <line key={intg.name + '-line'}
                x1={cx} y1={cy} x2={nx} y2={ny}
                stroke={active ? intg.color : 'currentColor'}
                strokeWidth={active ? 1.2 : 0.7}
                strokeDasharray="4 5"
                className={active ? '' : 'text-border'}
                opacity={active ? 0.55 : 0.25}
                style={{ transition: 'stroke 0.5s, opacity 0.5s' }}
              />
            )
          })}

          {/* Traveling dot on active beam */}
          {INTEGRATIONS.map((intg, i) => {
            if (activeIdx !== i) return null
            const rad = (angles[i] * Math.PI) / 180
            const nx = cx + intg.orbitRadius * Math.cos(rad)
            const ny = cy + intg.orbitRadius * Math.sin(rad)
            return (
              <circle key={intg.name + '-dot'} r="3" fill={intg.color}
                style={{ filter: `drop-shadow(0 0 4px ${intg.color})` }}>
                <animateMotion dur="0.9s" repeatCount="indefinite"
                  path={`M${cx},${cy} L${nx},${ny}`} />
              </circle>
            )
          })}

          {/* Planets */}
          {INTEGRATIONS.map((intg, i) => (
            <Planet key={intg.name} intg={intg} cx={cx} cy={cy}
              angle={angles[i]} active={activeIdx === i} />
          ))}

          {/* Central UNIGENT node */}
          <g transform={`translate(${cx},${cy})`}>
            <circle r="46" fill={INDIGO} opacity="0.10">
              <animate attributeName="r" values="44;52;44" dur="3.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.10;0.05;0.10" dur="3.2s" repeatCount="indefinite" />
            </circle>
            <circle r="38" fill={INDIGO} style={{ filter: `drop-shadow(0 0 16px ${INDIGO}80)` }} />
            <circle r="38" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12" />
            <text textAnchor="middle" y="-4" fontSize="9.5" fontWeight="700"
              fill="white" letterSpacing="0.08em" fontFamily="inherit">UNIGENT</text>
            <text textAnchor="middle" y="9" fontSize="7.5" fill="white" opacity="0.6" fontFamily="inherit">AI Agent</text>
          </g>
        </svg>
      </div>

      {/* Bottom label */}
      <p className="relative z-10 text-xs text-muted-foreground mt-2 font-medium tracking-wide">
        Gmail &amp; Google Calendar — live
      </p>
    </div>
  )
}

// ─── Cell B — Live activity feed ──────────────────────────────────────────────

function ActivityCell({ feed }: { feed: FeedItem[] }) {
  return (
    <div className="bento-cell flex flex-col overflow-hidden">
      <div className="flex items-center justify-between pb-3 shrink-0">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Agent Activity
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col gap-2">
        {feed.slice(0, 4).map((item, i) => {
          const { Icon } = item
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all"
              style={{
                background: i === 0 ? `${item.color}0C` : 'transparent',
                opacity: 1 - i * 0.2,
                borderLeft: i === 0 ? `2px solid ${item.color}` : '2px solid transparent',
              }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${item.color}18` }}
              >
                <Icon size={11} style={{ color: item.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-none truncate"
                  style={{ color: i === 0 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                  {item.action}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.detail}</p>
              </div>
              {i === 0 && <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Cell C — Integration cards (Gmail + Google Cal) ─────────────────────────

function IntegrationCards({ activeIdx }: { activeIdx: number }) {
  return (
    <div className="bento-cell flex flex-col gap-3">
      <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
        Connected
      </span>
      {INTEGRATIONS.map((intg, i) => {
        const { Icon } = intg
        const active = activeIdx === i
        return (
          <div
            key={intg.name}
            className="flex items-center gap-3 rounded-xl border p-3 transition-all duration-500"
            style={{
              borderColor: active ? `${intg.color}55` : 'var(--border)',
              background: active ? `${intg.color}08` : 'transparent',
              boxShadow: active ? `0 0 0 1px ${intg.color}30` : 'none',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${intg.color}18` }}
            >
              <Icon size={16} style={{ color: intg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none">{intg.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {intg.name === 'Gmail' ? 'Read, draft & send emails' : 'Schedule, create & modify events'}
              </p>
            </div>
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500"
              style={{ background: active ? intg.color : 'var(--muted)', boxShadow: active ? `0 0 6px ${intg.color}` : 'none' }}
            />
          </div>
        )
      })}
    </div>
  )
}

// ─── Cell D — Actions counter ─────────────────────────────────────────────────

function ActionsCell({ actionCount }: { actionCount: number }) {
  return (
    <div className="bento-cell flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Actions</span>
        <Zap size={13} style={{ color: INDIGO }} />
      </div>
      <div>
        <p
          className="text-5xl font-bold tabular-nums leading-none"
          style={{ color: INDIGO, fontVariantNumeric: 'tabular-nums' }}
        >
          {actionCount}
        </p>
        <p className="text-xs text-muted-foreground mt-1">taken this session</p>
      </div>
      {/* Mini bar graph */}
      <div className="flex items-end gap-1 h-8">
        {Array.from({ length: 8 }).map((_, i) => {
          const height = 20 + Math.sin(i * 1.1 + actionCount * 0.3) * 14
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all duration-700"
              style={{
                height: `${Math.max(4, Math.round(height))}px`,
                background: i === 7 ? INDIGO : `${INDIGO}40`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Cell E — Inbox control stat ──────────────────────────────────────────────

function InboxCell() {
  return (
    <div className="bento-cell flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Inbox</span>
        <Mail size={13} style={{ color: GMAIL_RED }} />
      </div>
      <div>
        <p className="text-5xl font-bold leading-none" style={{ color: GMAIL_RED }}>
          100<span className="text-2xl">%</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">automated coverage</p>
      </div>
      {/* Ring progress */}
      <div className="flex items-center gap-3">
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
          <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="20" cy="20" r="16" fill="none"
            stroke={GMAIL_RED} strokeWidth="4"
            strokeDasharray="100.53" strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ filter: `drop-shadow(0 0 4px ${GMAIL_RED}70)` }}
          />
        </svg>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Every thread read,<br />labelled &amp; actioned.
        </p>
      </div>
    </div>
  )
}

// ─── Cell F — Calendar coverage ───────────────────────────────────────────────

function CalendarCell({ feed }: { feed: FeedItem[] }) {
  const calEvents = feed.filter(f => f.color === GCAL_BLUE).slice(0, 2)
  const days = ['M', 'T', 'W', 'T', 'F']
  return (
    <div className="bento-cell flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Calendar</span>
        <Calendar size={13} style={{ color: GCAL_BLUE }} />
      </div>
      {/* Mini week view */}
      <div className="flex gap-1.5">
        {days.map((d, i) => {
          const hasEvent = calEvents.length > 0 && i === 1
          return (
            <div key={d + i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-muted-foreground font-medium">{d}</span>
              <div
                className="w-full rounded-md transition-all duration-500"
                style={{
                  height: hasEvent ? '28px' : '18px',
                  background: hasEvent ? `${GCAL_BLUE}25` : 'var(--muted)',
                  border: hasEvent ? `1px solid ${GCAL_BLUE}50` : '1px solid transparent',
                  boxShadow: hasEvent ? `0 0 6px ${GCAL_BLUE}30` : 'none',
                }}
              />
            </div>
          )
        })}
      </div>
      {/* Latest event */}
      {calEvents[0] ? (
        <div className="flex items-center gap-2 rounded-lg p-2"
          style={{ background: `${GCAL_BLUE}0C`, borderLeft: `2px solid ${GCAL_BLUE}` }}>
          <Clock3 size={10} style={{ color: GCAL_BLUE }} className="shrink-0" />
          <p className="text-[10px] text-muted-foreground truncate">{calEvents[0].detail}</p>
        </div>
      ) : (
        <div className="h-8 rounded-lg animate-pulse" style={{ background: 'var(--muted)' }} />
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function Integrations() {
  const [angles, setAngles] = useState(() => INTEGRATIONS.map(intg => intg.startAngle))
  const [activeIdx, setActiveIdx] = useState(0)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [actionCount, setActionCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const poolIdx = useRef(0)
  const { ref: inViewRef, inView } = useInView<HTMLElement>({ threshold: 0.15 })

  // Orbit animation
  useEffect(() => {
    if (!inView) return
    startRef.current = null
    const tick = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = (ts - startRef.current) / 1000
      setAngles(INTEGRATIONS.map(intg => intg.startAngle + (elapsed / intg.orbitDuration) * 360))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [inView])

  // Feed cycling
  useEffect(() => {
    if (!inView) return
    const cycle = () => {
      const idx = poolIdx.current % FEED_POOL.length
      const src = FEED_POOL[idx]
      const intgIdx = src.color === GMAIL_RED ? 0 : 1
      setActiveIdx(intgIdx)
      setFeed(prev => [{ ...src, ts: nowStr() }, ...prev].slice(0, 8))
      setActionCount(prev => prev + 1)
      poolIdx.current++
    }
    cycle()
    const id = setInterval(cycle, 2600)
    return () => clearInterval(id)
  }, [inView])

  return (
    <section ref={inViewRef} id="integrations" className="py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-accent mb-4 px-3 py-1 rounded-full border border-accent/30 bg-accent/5">
            <Sparkles size={11} />
            AI-Powered Integrations
          </div>
          <h2 className="text-4xl font-bold mb-4 text-balance">Two tools. One intelligent agent.</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto text-balance">
            Unigent connects to Gmail and Google Calendar — reading, drafting, scheduling, and acting on your behalf.
          </p>
        </div>

        {/* Bento grid */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'auto auto auto',
          }}
        >
          {/* A: Orbit — col 1, rows 1–2 */}
          <div style={{ gridColumn: '1', gridRow: '1 / span 2' }}>
            <OrbitCell angles={angles} activeIdx={activeIdx} />
          </div>

          {/* B: Activity feed — col 2–3, row 1 */}
          <div style={{ gridColumn: '2 / span 2', gridRow: '1' }}>
            <ActivityCell feed={feed} />
          </div>

          {/* C: Connected integrations — col 2, row 2 */}
          <div style={{ gridColumn: '2', gridRow: '2' }}>
            <IntegrationCards activeIdx={activeIdx} />
          </div>

          {/* D: Actions counter — col 3, row 2 */}
          <div style={{ gridColumn: '3', gridRow: '2' }}>
            <ActionsCell actionCount={actionCount} />
          </div>

          {/* E: Inbox — col 1, row 3 */}
          <div style={{ gridColumn: '1', gridRow: '3' }}>
            <InboxCell />
          </div>

          {/* F: Calendar — col 2, row 3 */}
          <div style={{ gridColumn: '2', gridRow: '3' }}>
            <CalendarCell feed={feed} />
          </div>

          {/* G: CTA — col 3, row 3 */}
          <div style={{ gridColumn: '3', gridRow: '3' }}>
            <div className="bento-cell flex flex-col justify-between h-full">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Get started</span>
                <p className="text-sm font-semibold mt-2 text-balance leading-snug">
                  Connect your Google account in seconds.
                </p>
              </div>
              <a
                href="#"
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: INDIGO,
                  color: 'white',
                  boxShadow: `0 0 20px ${INDIGO}40`,
                }}
              >
                Connect now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
