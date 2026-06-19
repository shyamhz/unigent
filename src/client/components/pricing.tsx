import { Check } from 'lucide-react'

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
        <p className="text-lg text-muted-foreground mb-12">Start free. Scale as you grow.</p>

        <div className="relative isolate grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* background radial glow — explicit color so blur renders regardless of CSS var support */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[1050px] h-[570px] rounded-full blur-[160px]"
            style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, #818cf8 40%, transparent 70%)', opacity: 0.35 }}
          />
          {/* Free Tier */}
          <div className="rounded-lg border border-border bg-card p-8 text-left">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-6">$0 forever</p>
            <button className="w-full border border-border bg-transparent text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted transition mb-8">
              Start free
            </button>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Keyboard-first workspace</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Gmail &amp; Calendar integration</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Basic AI agent actions</span>
              </li>
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="relative rounded-lg border border-accent bg-card p-8 text-left ring-1 ring-accent/20">
            <div className="absolute -top-3 left-6 bg-background px-3 py-1 text-xs font-medium text-accent">
              Early bird pricing
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-muted-foreground mb-6">$29/mo (lifetime after launch)</p>
            <button className="w-full bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium hover:bg-accent/90 transition mb-8">
              Get early access
            </button>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Everything in Free, plus</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Unlimited agent multi-step actions</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Advanced AI priority triage</span>
              </li>
              <li className="flex items-center gap-3">
                <Check size={16} className="text-accent flex-shrink-0" />
                <span>Custom workflows &amp; automations</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
