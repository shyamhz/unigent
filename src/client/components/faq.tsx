'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Does it work with my existing Gmail?',
    a: 'Yes. Unigent sits on top of Gmail. Connect your account and you are up and running instantly. All your existing mail and labels transfer automatically.',
  },
  {
    q: 'What can the agent actually do?',
    a: 'The agent can schedule meetings, send emails, archive threads, snooze messages, create filters, trigger webhooks, and execute multi-step workflows — all from plain language commands in the command bar.',
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. You authenticate directly with Google via OAuth. We never store your passwords. Unigent is the audited integration layer between you and your tools. SOC2 certification coming soon.',
  },
  {
    q: 'Do I need to leave Gmail?',
    a: 'No. Unigent is a frontend over Gmail. Your data stays in Gmail. At any time, you can disconnect and use Gmail normally.',
  },
  {
    q: 'Which keystrokes are supported?',
    a: 'We support all Gmail keyboard shortcuts, plus new ones: R (reply), ⌘K (command), E (archive), ⇧E (spam), ⌘\\ (theme toggle), and dozens more. Fully customizable.',
  },
  {
    q: "When's general access?",
    a: 'Early access starts this month. General access rolls out Q3 2026. Request access to join the beta and get lifetime Pro pricing.',
  },
]

export function FAQ() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-y border-border">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-4">Frequently asked</h2>
        <p className="text-center text-muted-foreground mb-12">
          Everything you need to know about Unigent.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
              className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium pr-4">{faq.q}</h3>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-muted-foreground transition-transform ${
                    expandedFAQ === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {expandedFAQ === idx && (
                <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
