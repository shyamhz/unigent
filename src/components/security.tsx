import { Lock } from 'lucide-react'

export function Security() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 mb-6">
          <Lock className="text-accent" size={24} />
        </div>
        <h2 className="text-3xl font-bold mb-4">Security &amp; Privacy</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Your data, your rules. OAuth via Google means you connect your account and we never store passwords. Unigent
          sits between you and your tools as an audited integration layer. Your data never leaves your chosen provider.
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-lg px-4 py-2 bg-muted/30">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          SOC2 Certification: In Progress
        </div>
      </div>
    </section>
  )
}
