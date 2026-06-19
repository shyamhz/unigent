'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an element is currently within the viewport using
 * IntersectionObserver. Returns a ref to attach to the target element and a
 * boolean that flips to `true` while the element is on screen.
 *
 * Animations gated on this value will (re)start every time the element scrolls
 * back into view, instead of running once on mount while off-screen.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit & { once?: boolean },
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { once, ...observerOptions } = options ?? {}

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: 0.25, ...observerOptions },
    )

    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ref, inView }
}
