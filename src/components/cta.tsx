"use client"

import { useRef, useEffect, useState } from "react"

// Draws two glowing dots travelling along the input border perimeter
function AnimatedBorderCanvas({ width, height }: { width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rad = 8 // match rounded-lg ~8px

    // Build perimeter as discrete points along 4 straight edges
    function buildPerimeter(w: number, h: number, steps = 500) {
      const pts: [number, number][] = []
      const seg = steps / 4
      for (let i = 0; i <= seg; i++) pts.push([rad + (w - 2 * rad) * (i / seg), 0])
      for (let i = 1; i <= seg; i++) pts.push([w, rad + (h - 2 * rad) * (i / seg)])
      for (let i = 1; i <= seg; i++) pts.push([w - rad - (w - 2 * rad) * (i / seg), h])
      for (let i = 1; i <= seg; i++) pts.push([0, h - rad - (h - 2 * rad) * (i / seg)])
      return pts
    }

    const perimeter = buildPerimeter(width, height)
    const total = perimeter.length

    const DOTS = [
      { phaseOffset: 0,             r: 129, g: 140, b: 248 }, // indigo-400
      { phaseOffset: total * 0.5,   r:  99, g: 102, b: 241 }, // indigo-500
    ]

    const TAIL = 45
    const SPEED = 0.55 // pts per ms at 60 fps base
    let pos = 0
    let lastTs = 0
    let frame: number

    const tick = (ts: number) => {
      const dt = Math.min(ts - lastTs, 50)
      lastTs = ts
      pos = (pos + SPEED * (dt / 16)) % total

      ctx.clearRect(0, 0, width, height)

      // dim static border
      ctx.beginPath()
      ctx.roundRect(0.75, 0.75, width - 1.5, height - 1.5, rad)
      ctx.strokeStyle = "rgba(99,102,241,0.15)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      for (const dot of DOTS) {
        const head = Math.floor((pos + dot.phaseOffset) % total)

        // tail
        for (let t = TAIL; t >= 1; t--) {
          const idx = (head - t + total) % total
          const [x, y] = perimeter[idx]
          const alpha = ((TAIL - t) / TAIL) * 0.75
          const size  = 1 + ((TAIL - t) / TAIL) * 2
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${dot.r},${dot.g},${dot.b},${alpha})`
          ctx.fill()
        }

        // bright head
        const [hx, hy] = perimeter[head]
        const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 10)
        grd.addColorStop(0, `rgba(${dot.r},${dot.g},${dot.b},1)`)
        grd.addColorStop(0.4, `rgba(${dot.r},${dot.g},${dot.b},0.5)`)
        grd.addColorStop(1,   `rgba(${dot.r},${dot.g},${dot.b},0)`)
        ctx.beginPath()
        ctx.arc(hx, hy, 10, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  )
}

function AnimatedInputWrapper({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 320, h: 48 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    // set initial size immediately
    setSize({ w: el.offsetWidth, h: el.offsetHeight })
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="relative flex-1 w-full">
      <AnimatedBorderCanvas width={size.w} height={size.h} />
      {children}
    </div>
  )
}

export function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold mb-6 text-balance">
          Stop managing tasks.<br />Start delegating them.
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Unigent is in early access. Join hundreds of power users automating their workflows with AI agents.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
          <AnimatedInputWrapper>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-card rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </AnimatedInputWrapper>
          <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition whitespace-nowrap">
            Request access
          </button>
        </div>
      </div>
    </section>
  )
}
