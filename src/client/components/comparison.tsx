import { Check, X } from 'lucide-react'

const comparisonRows = [
  { feature: 'AI agent actions',       unigent: true,      zapier: true,   make: false },
  { feature: 'Natural language input', unigent: true,      zapier: false,  make: false },
  { feature: 'Keyboard-first UI',      unigent: true,      zapier: false,  make: false },
  { feature: 'Custom workflows',       unigent: true,      zapier: true,   make: true  },
  { feature: 'Real-time execution',    unigent: true,      zapier: true,   make: true  },
  { feature: 'Price',                  unigent: '$0–29/mo', zapier: '$19+/mo', make: '$9+/mo' },
]

export function Comparison() {
  return (
    <section id="comparison" className="py-24 px-4 sm:px-6 lg:px-8 border-y border-border">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-4">Switch in seconds</h2>
        <p className="text-center text-muted-foreground mb-12">
          Compare with the power users&apos; toolkit
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-foreground">Feature</th>
                <th className="text-center py-3 px-4 font-medium">
                  <div className="text-accent">Unigent</div>
                </th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Zapier</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Make</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 text-foreground">{row.feature}</td>
                  <td className="text-center py-3 px-4">
                    {row.unigent === true ? (
                      <Check className="w-5 h-5 text-accent mx-auto" />
                    ) : row.unigent === false ? (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-foreground font-medium">{row.unigent}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {row.zapier === true ? (
                      <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : row.zapier === false ? (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">{row.zapier}</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    {row.make === true ? (
                      <Check className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : row.make === false ? (
                      <X className="w-5 h-5 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">{row.make}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
