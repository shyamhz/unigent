const keyboardShortcuts = [
  { key: 'R', action: 'Reply' },
  { key: '⌘K', action: 'Command' },
  { key: 'E', action: 'Archive' },
  { key: '⌘\\', action: 'Theme' },
  { key: 'J', action: 'Next' },
  { key: 'K', action: 'Previous' },
]

export function KeyboardShortcuts() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-4">Your hands never leave the keyboard.</h2>
        <p className="text-lg text-muted-foreground mb-12">
          Every core action has a keystroke. No mouse required. Ever.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {keyboardShortcuts.map((shortcut, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-4">
              <div className="text-sm font-mono font-bold text-accent mb-2">{shortcut.key}</div>
              <div className="text-sm text-foreground">{shortcut.action}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
