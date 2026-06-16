'use client'

import { useState, useEffect } from 'react'
import { Menu, Moon, Sun } from 'lucide-react'

export function Nav() {
  const [isDark, setIsDark] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const isCurrentlyDark = html.classList.contains('dark')
    if (isCurrentlyDark) {
      html.classList.remove('dark')
      html.classList.add('light')
    } else {
      html.classList.remove('light')
      html.classList.add('dark')
    }
    setIsDark(!isDark)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-tight text-accent">Unigent</div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#hero" className="text-sm text-foreground/70 hover:text-foreground transition">
                Product
              </a>
              <a href="#integrations" className="text-sm text-foreground/70 hover:text-foreground transition">
                Integrations
              </a>
              <a href="#agent" className="text-sm text-foreground/70 hover:text-foreground transition">
                Agent
              </a>
              <a href="#pricing" className="text-sm text-foreground/70 hover:text-foreground transition">
                Pricing
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="#signin"
              className="hidden sm:inline text-sm text-foreground/70 hover:text-foreground transition"
            >
              Sign in
            </a>
            <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition">
              Get early access
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition"
              aria-label="Toggle mobile menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {['Product', 'Integrations', 'Agent', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-2 py-2 text-sm text-foreground/70 hover:text-foreground transition"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
