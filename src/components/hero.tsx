import { Zap } from 'lucide-react'

export function Hero() {
  return (
    <section id="hero" className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-block px-3 py-1 bg-muted/50 border border-border rounded-full text-xs font-medium text-muted-foreground">
          Keyboard-first. AI Agents. Every workflow unified.
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-balance">
          AI agents at the speed of thought.
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground mb-8 text-balance">
          One keyboard-first workspace powered by intelligent agents — automate tasks, manage communications,
          and let Unigent handle the rest.
        </p>

        <div id="hero-showcase" className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition">
            Get early access
          </button>
          <button className="border border-border bg-muted/50 hover:bg-muted text-foreground px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2">
            <span>Watch 60-second tour</span>
            <span className="text-xs bg-border text-foreground px-1.5 py-0.5 rounded ml-2">⌘K</span>
          </button>
        </div>

        {/* Product Screenshot Area */}
        <div className="relative rounded-lg border border-border bg-card overflow-hidden shadow-lg">
          <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
            <div className="text-center">
              <Zap className="w-16 h-16 mx-auto mb-4 text-accent/50" />
              <p className="text-muted-foreground">Unigent agent dashboard — coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
