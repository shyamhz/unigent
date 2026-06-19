"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "@/client/hooks/use-in-view"

const quotes = [
  {
    name: "Sarah Chen",
    role: "Founder, TechVentures",
    initials: "SC",
    color: "#5B6CF0",
    quote:
      "I automated 6 workflows this morning without writing a single line of code. Unigent just saved me 40 minutes.",
    short: "Saved 40 min before 9 AM.",
  },
  {
    name: "James Mitchell",
    role: "Chief of Staff",
    initials: "JM",
    color: "#1FA971",
    quote:
      "The agent cuts my task management time in half. Actually gets done what I ask, the first time.",
    short: "Gets it done the first time.",
  },
  {
    name: "Alex Patel",
    role: "Angel Investor",
    initials: "AP",
    color: "#EC4899",
    quote:
      "This is the AI agent platform I've been waiting for. Fast, precise, and it respects my time.",
    short: "Fast, precise, respectful.",
  },
  {
    name: "Priya Nair",
    role: "Operations Lead",
    initials: "PN",
    color: "#F59E0B",
    quote:
      "Calendar chaos is over. Unigent handles all my scheduling conflicts before I even notice them.",
    short: "Calendar chaos — solved.",
  },
  {
    name: "David Osei",
    role: "Product Manager",
    initials: "DO",
    color: "#8B5CF6",
    quote:
      "Our entire team onboarded in an afternoon. The agent just works, no babysitting required.",
    short: "No babysitting required.",
  },
]

const marqueeItems = [
  "Inbox zero by 8 AM",
  "Meetings booked automatically",
  "Zero missed follow-ups",
  "Draft → Send in seconds",
  "Context-aware replies",
  "Workflows that finish themselves",
]

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

// Typewriter that types a string character by character then holds, then resets
function Typewriter({ text, speed = 28 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing">("typing")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDisplayed("")
    setPhase("typing")
  }, [text])

  useEffect(() => {
    if (phase === "typing") {
      if (displayed.length < text.length) {
        timeoutRef.current = setTimeout(
          () => setDisplayed(text.slice(0, displayed.length + 1)),
          speed
        )
      } else {
        timeoutRef.current = setTimeout(() => setPhase("hold"), 2200)
      }
    } else if (phase === "hold") {
      timeoutRef.current = setTimeout(() => setPhase("erasing"), 600)
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          speed * 0.5
        )
      }
      // parent controls cycling via the hold → erase completion
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [displayed, phase, text, speed])

  return (
    <span>
      {displayed}
      <span className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-0.5 animate-pulse" />
    </span>
  )
}

// Cell 1 — large pull-quote with typewriter
function BigQuoteCell() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIdx((i) => (i + 1) % quotes.length)
        setFade(true)
      }, 350)
    }, 5600)
    return () => clearInterval(id)
  }, [])

  const q = quotes[idx]

  return (
    <div className="bento-cell flex flex-col justify-between h-full min-h-[220px]">
      <span className="text-5xl leading-none text-primary font-serif select-none">&ldquo;</span>

      <div
        className="flex-1 flex items-center transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <p className="text-base font-medium leading-relaxed text-foreground">
          <Typewriter text={q.quote} speed={22} />
        </p>
      </div>

      <div
        className="flex items-center gap-2.5 mt-5 transition-all duration-400"
        style={{ opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(6px)" }}
      >
        <Avatar initials={q.initials} color={q.color} />
        <div>
          <p className="text-sm font-semibold leading-tight">{q.name}</p>
          <p className="text-xs text-muted-foreground">{q.role}</p>
        </div>
      </div>
    </div>
  )
}

// Animated count-up on mount + live increment
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const start = useRef<number | null>(null)
  const from = useRef(0)

  useEffect(() => {
    from.current = 0
    start.current = null
    const step = (ts: number) => {
      if (!start.current) start.current = ts
      const prog = Math.min((ts - start.current) / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - prog, 3)
      setValue(Math.floor(from.current + eased * (target - from.current)))
      if (prog < 1) requestAnimationFrame(step)
      else setValue(target)
    }
    requestAnimationFrame(step)
  }, [target, duration])

  return value
}

// Animated progress bar that grows from 0 on mount
function AnimBar({ pct, color = "bg-primary" }: { pct: number; color?: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 120)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div className="h-1 w-full rounded-full bg-border overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

// Cell 2 — live hours saved counter with count-up
function HoursSavedCell() {
  const [base] = useState(12847)
  const [live, setLive] = useState(base)

  useEffect(() => {
    const id = setInterval(() => {
      setLive((c) => c + Math.floor(Math.random() * 3 + 1))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  const displayed = useCountUp(live, 900)
  const barPct = ((live % 1000) / 1000) * 100

  return (
    <div className="bento-cell flex flex-col justify-between h-full">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Hours saved</p>
      <p
        className="text-5xl font-bold tabular-nums text-foreground leading-none mt-2 transition-all duration-300"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {displayed.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground mt-2">and counting — across all active users</p>
      <div className="mt-4">
        <AnimBar pct={barPct} />
      </div>
    </div>
  )
}

// Cell 3 — stacked short-quote cards with slide-in animation
function QuoteStackCell() {
  const [top, setTop] = useState(0)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setEntering(true)
      setTimeout(() => {
        setTop((t) => (t + 1) % quotes.length)
        setEntering(false)
      }, 300)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  const visible = [
    quotes[top % quotes.length],
    quotes[(top + 1) % quotes.length],
    quotes[(top + 2) % quotes.length],
  ]

  return (
    <div className="bento-cell flex flex-col gap-2.5 h-full overflow-hidden">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">What they say</p>
      {visible.map((q, i) => (
        <div
          key={q.initials + top + i}
          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/40"
          style={{
            opacity: entering && i === 0 ? 0 : i === 0 ? 1 : i === 1 ? 0.65 : 0.35,
            transform: `translateY(${entering && i === 0 ? "-8px" : "0px"}) scale(${1 - i * 0.03})`,
            transition: "opacity 300ms ease, transform 300ms ease",
          }}
        >
          <Avatar initials={q.initials} color={q.color} size={28} />
          <p className="text-xs font-medium leading-snug text-foreground">{q.short}</p>
        </div>
      ))}
    </div>
  )
}

// Animated stat cell — count up the number portion
function StatCell({ value, label, sub, barPct }: { value: string; label: string; sub: string; barPct?: number }) {
  const num = parseInt(value.replace(/\D/g, ""), 10)
  const suffix = value.replace(/[\d]/g, "")
  const animated = useCountUp(num, 1600)

  return (
    <div className="bento-cell flex flex-col justify-between h-full gap-1">
      <div>
        <p className="text-4xl font-bold text-foreground leading-tight">
          {animated}{suffix}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{sub}</p>
      </div>
      {barPct !== undefined && (
        <div className="mt-3">
          <AnimBar pct={barPct} color="bg-primary" />
        </div>
      )}
    </div>
  )
}

// Cell 5 — marquee with smooth JS scroll
function MarqueeCell() {
  const ref = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const speed = 0.55
    const tick = () => {
      xRef.current -= speed
      const halfW = el.scrollWidth / 2
      if (Math.abs(xRef.current) >= halfW) xRef.current = 0
      el.style.transform = `translateX(${xRef.current}px)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const items = [...marqueeItems, ...marqueeItems]

  return (
    <div className="bento-cell overflow-hidden flex items-center h-full py-3">
      <div ref={ref} className="flex gap-8 whitespace-nowrap will-change-transform">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// Cell 6 — avatar cluster
function JoinedCell() {
  const recent = quotes.slice(0, 4)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bento-cell flex flex-col justify-between h-full">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Joined this week</p>
      <div className="flex -space-x-2.5 mt-3">
        {recent.map((q, i) => (
          <div
            key={q.initials}
            className="transition-transform duration-300"
            style={{ transform: pulse && i === recent.length - 1 ? "scale(1.15)" : "scale(1)" }}
          >
            <Avatar initials={q.initials} color={q.color} size={36} />
          </div>
        ))}
        <div
          className="w-9 h-9 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-semibold text-muted-foreground transition-all duration-300"
          style={{ transform: pulse ? "scale(1.1)" : "scale(1)" }}
        >
          +2k
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">New power users every day</p>
    </div>
  )
}

export function Testimonials() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.15 })
  const [playKey, setPlayKey] = useState(0)

  // Each time the section scrolls into view, bump the key to remount the grid
  // so every mount-based animation (count-ups, bars, slide-ins) replays.
  useEffect(() => {
    if (inView) setPlayKey(k => k + 1)
  }, [inView])

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-2 text-balance">Loved by power users</h2>
        <p className="text-center text-muted-foreground mb-12 text-sm">
          Founders, operators, and decision-makers save hours every week.
        </p>

        <div key={playKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-auto">

          {/* Big quote — 2 cols × 2 rows */}
          <div className="lg:col-span-2 lg:row-span-2">
            <BigQuoteCell />
          </div>

          {/* Hours saved */}
          <div className="lg:col-span-1">
            <HoursSavedCell />
          </div>

          {/* Joined */}
          <div className="lg:col-span-1">
            <JoinedCell />
          </div>

          {/* Quote stack */}
          <div className="lg:col-span-1">
            <QuoteStackCell />
          </div>

          {/* Stat */}
          <div className="lg:col-span-1">
            <StatCell
              value="94%"
              label="Tasks completed"
              sub="Unigent agents finish what they start, without follow-up."
              barPct={94}
            />
          </div>

          {/* Marquee — full width */}
          <div className="lg:col-span-4 md:col-span-2">
            <MarqueeCell />
          </div>

        </div>
      </div>
    </section>
  )
}
