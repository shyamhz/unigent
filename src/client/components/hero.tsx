import { Zap } from 'lucide-react'

export function Hero() {
  return (
    <section id="hero" className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
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

        {/* Dashboard Preview */}
        <div className="relative rounded-lg border border-border bg-card overflow-hidden shadow-2xl">
          {/* TopBar */}
          <div className="flex h-10 items-center justify-between border-b border-border/50 bg-background/80 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                <Zap className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground">Unigent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded border border-border/50 bg-secondary/30 px-2 py-0.5 text-[0.6rem]">
                <span>✉️</span>
                <span className="text-muted-foreground">Gmail</span>
                <span className="h-0.5 w-0.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-1 rounded border border-border/50 bg-secondary/30 px-2 py-0.5 text-[0.6rem]">
                <span>📅</span>
                <span className="text-muted-foreground">Calendar</span>
                <span className="h-0.5 w-0.5 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.55rem] text-muted-foreground/60">6 actions</span>
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-teal-800 to-teal-700 flex items-center justify-center">
                <span className="text-[0.45rem] font-medium text-white">JM</span>
              </div>
            </div>
          </div>

          {/* Dashboard Panels */}
          <div className="flex h-[400px] gap-2 p-2">
            {/* Gmail Panel */}
            <div className="flex-[0_0_25%] overflow-hidden rounded border border-border/30 bg-card">
              <div className="flex items-center justify-between border-b border-border/30 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">✉️</span>
                  <span className="text-xs font-medium">Inbox</span>
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[0.55rem] text-muted-foreground/60">Auto-sorted</span>
              </div>
              <div className="p-2 space-y-1">
                {[
                  { name: 'CEO', subject: 'Q3...', time: '9:14 AM', badge: 'Critical', color: 'bg-red-500' },
                  { name: 'Recruiter', subject: 'O...', time: '9:00 AM', badge: 'Low', color: 'bg-blue-500' },
                  { name: 'Dev Team', subject: 'D...', time: 'Yesterday', badge: 'High', color: 'bg-amber-500' },
                  { name: 'Newsletter', subject: '5...', time: 'Yesterday', badge: '', color: 'bg-purple-500' },
                  { name: 'Alex Chen', subject: 'Re: In...', time: 'Mon', badge: 'High', color: 'bg-emerald-500' },
                  { name: 'Finance', subject: 'Invoic...', time: 'Mon', badge: 'Critical', color: 'bg-red-500' },
                ].map((email, i) => (
                  <div key={i} className="flex items-center gap-2 rounded p-1.5 hover:bg-secondary/50 cursor-pointer">
                    <div className={`h-6 w-6 rounded-full ${email.color} flex items-center justify-center`}>
                      <span className="text-[0.5rem] font-medium text-white">{email.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[0.65rem] font-medium truncate">{email.name}</span>
                        {email.badge && (
                          <span className={`text-[0.45rem] px-1 rounded ${
                            email.badge === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            email.badge === 'High' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {email.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[0.55rem] text-muted-foreground/60 truncate block">{email.subject}</span>
                    </div>
                    <span className="text-[0.5rem] text-muted-foreground/40">{email.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Chat Panel */}
            <div className="flex-[0_0_40%] overflow-hidden rounded border border-border/30 bg-card">
              <div className="flex items-center gap-2 border-b border-border/30 px-3 py-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-medium">Unigent</span>
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                <span className="text-[0.55rem] text-emerald-400">Active</span>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-[0.65rem]">Schedule a call with Alex for Thursday 3pm and send a confirmation</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 shrink-0">
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-secondary/50 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-[0.65rem]">Done. Calendar event created for Thu 3:00–3:30 PM and confirmation email sent to alex@team.io.</p>
                    <span className="text-[0.5rem] text-emerald-400 mt-1 block">✓ Completed</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary/10 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-[0.65rem]">Remind me to follow up with Finance on Invoice 2047 tomorrow at 10am</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 shrink-0">
                    <Zap className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-secondary/50 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-[0.65rem]">Scheduled. I&apos;ll ping you tomorrow at 10:00 AM and draft a follow-up if needed.</p>
                    <span className="text-[0.5rem] text-emerald-400 mt-1 block">✓ Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Panel */}
            <div className="flex-[0_0_35%] overflow-hidden rounded border border-border/30 bg-card">
              <div className="flex items-center justify-between border-b border-border/30 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">📅</span>
                  <span className="text-xs font-medium">Calendar</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  <span className="text-[0.55rem] text-muted-foreground/60">Synced</span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">June 2026</span>
                  <div className="flex gap-1">
                    <button className="text-muted-foreground/60 hover:text-foreground text-xs">‹</button>
                    <button className="text-muted-foreground/60 hover:text-foreground text-xs">›</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5 mb-3">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
                    <div key={d} className="text-center text-[0.5rem] text-muted-foreground/60 py-0.5">{d}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={`text-center text-[0.55rem] py-0.5 rounded ${
                        day === 17 ? 'bg-primary text-primary-foreground font-medium' :
                        day === 18 || day === 19 || day === 20 ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="text-[0.55rem] text-muted-foreground/60 uppercase tracking-wider">Upcoming</div>
                  {[
                    { name: 'Call with Alex', time: '3:00 – 3:30 PM', tag: 'AI-created', color: 'bg-primary' },
                    { name: 'Dev Team Sync', time: '4:00 – 4:30 PM', tag: 'Meeting', color: 'bg-blue-500' },
                    { name: 'Finance Follow-up', time: '10:00 AM', tag: 'Reminder', color: 'bg-amber-500' },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary/50">
                      <div className={`h-1.5 w-1.5 rounded-full ${event.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[0.6rem] font-medium truncate">{event.name}</div>
                        <div className="text-[0.5rem] text-muted-foreground/60">{event.time}</div>
                      </div>
                      <span className="text-[0.45rem] text-muted-foreground/40 bg-secondary/50 px-1 py-0.5 rounded">{event.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
