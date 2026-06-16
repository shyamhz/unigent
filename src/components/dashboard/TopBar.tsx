import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 grid h-12 grid-cols-3 items-center border-b border-border/50 bg-background/80 px-5 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-2 justify-start">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className="text-[0.85rem] font-semibold text-foreground">Unigent</span>
      </div>

      {/* Center */}
      <div className="hidden sm:flex items-center justify-center gap-2">
        {[
          { icon: '✉️', label: 'Gmail', color: 'text-destructive' },
          { icon: '📅', label: 'Calendar', color: 'text-blue-400' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-2.5 py-1 text-[0.7rem]">
            <span>{item.icon}</span>
            <span className="text-muted-foreground">{item.label}</span>
            <span className="h-1 w-1 rounded-full bg-emerald-400" />
          </div>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 justify-end">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.65rem] text-muted-foreground/60">6 actions</span>
        </div>
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-gradient-to-br from-teal-800 to-teal-700 text-[0.6rem] font-medium">
            JM
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
