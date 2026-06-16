import { Search, Bell } from 'lucide-react'

export function SearchRealtime() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="rounded-lg border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="text-accent" size={24} />
            <h3 className="text-xl font-bold">Advanced Search</h3>
          </div>
          <p className="text-muted-foreground">
            Powerful semantic search across all your tools and data. Instant results, no syntax to learn — just ask in plain language.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-accent" size={24} />
            <h3 className="text-xl font-bold">Realtime agent updates</h3>
          </div>
          <p className="text-muted-foreground">
            Agent actions and results arrive instantly. No refresh. No delay. Pure realtime through the Unigent integration layer.
          </p>
        </div>
      </div>
    </section>
  )
}
