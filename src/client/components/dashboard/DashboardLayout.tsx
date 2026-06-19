'use client';

import { Card } from '@/client/components/ui/card';
import TopBar from '@/client/components/dashboard/TopBar';
import GmailPanel from '@/client/components/dashboard/GmailPanel';
import AICommandPanel from '@/client/components/dashboard/AICommandPanel';
import CalendarPanel from '@/client/components/dashboard/CalendarPanel';
import { useRef, useState, useCallback, useEffect } from 'react';

type Panel = 'gmail' | 'ai' | 'calendar';

const PANEL_RATIOS = { gmail: 0.25, ai: 0.40, calendar: 0.35 };

interface DashboardLayoutProps {
  showConnectBanner?: boolean;
  gmailConnected?: boolean;
  calendarConnected?: boolean;
}

export default function DashboardLayout({ showConnectBanner = false, gmailConnected = false, calendarConnected = false }: DashboardLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState<Panel>('gmail');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [widths, setWidths] = useState({ gmail: 0, ai: 0, calendar: 0 });
  const [ready, setReady] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidths = useRef({ gmail: 0, ai: 0 });

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1280);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile || isTablet) {
      setReady(true);
      return;
    }
    const measure = () => {
      if (!containerRef.current) return;
      const total = containerRef.current.offsetWidth - 24;
      if (total <= 0) return;
      setWidths({
        gmail: total * PANEL_RATIOS.gmail,
        ai: total * PANEL_RATIOS.ai,
        calendar: total * PANEL_RATIOS.calendar,
      });
      setReady(true);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile, isTablet]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startWidths.current = { gmail: widths.gmail, ai: widths.ai };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [widths.gmail, widths.ai]);

  useEffect(() => {
    if (isMobile || isTablet) return;
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const dx = e.clientX - startX.current;
      const total = containerRef.current.offsetWidth - 24;
      const minW = total * 0.18;
      const maxW = total * 0.50;
      const newGmail = Math.min(maxW, Math.max(minW, startWidths.current.gmail + dx));
      const newAI = Math.min(maxW, Math.max(minW, startWidths.current.ai - dx));
      setWidths({ gmail: newGmail, ai: newAI, calendar: total - newGmail - newAI });
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isMobile, isTablet]);

  const tabs: { id: Panel; label: string; icon: string }[] = [
    { id: 'gmail', label: 'Gmail', icon: '✉️' },
    { id: 'ai', label: 'AI Agent', icon: '🤖' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
  ];

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className="flex gap-2 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  activePanel === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <Card className="h-full min-h-0 overflow-hidden rounded-lg">
            {activePanel === 'gmail' && <GmailPanel isConnected={gmailConnected} />}
            {activePanel === 'ai' && <AICommandPanel />}
            {activePanel === 'calendar' && <CalendarPanel isConnected={calendarConnected} />}
          </Card>
        </div>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <div className="flex min-h-0 flex-1 gap-3 p-3">
          <Card className="h-full min-w-0 flex-[0_0_30%] overflow-hidden rounded-lg">
            <GmailPanel isConnected={gmailConnected} />
          </Card>
          <Card className="h-full min-w-0 flex-[0_0_35%] overflow-hidden rounded-lg">
            <AICommandPanel />
          </Card>
          <Card className="h-full min-w-0 flex-[0_0_35%] overflow-hidden rounded-lg">
            <CalendarPanel isConnected={calendarConnected} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      {showConnectBanner && (
        <div className="shrink-0 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span className="text-sm text-amber-200">Connect your Gmail and Google Calendar to start using Unigent AI.</span>
            </div>
            <a
              href="/api/corsair/connect"
              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/30 transition-colors"
            >
              Connect Accounts
            </a>
          </div>
        </div>
      )}
      <div ref={containerRef} className="relative flex min-h-0 flex-1 gap-3 p-3">
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background px-6">
            <div className="flex flex-col items-center gap-8 animate-fade-in-up">
              <svg width="120" height="40" viewBox="0 0 120 40" fill="none" className="w-full max-w-[120px] sm:max-w-[160px]">
                {/* Line 1 - draws in */}
                <line x1="10" y1="8" x2="110" y2="8" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" opacity="0.15" />
                <line x1="10" y1="8" x2="110" y2="8" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="100" strokeDashoffset="100" opacity="0.6">
                  <animate attributeName="stroke-dashoffset" values="100;0;100" dur="2.5s" repeatCount="indefinite" />
                </line>
                {/* Line 2 - draws in delayed */}
                <line x1="20" y1="20" x2="100" y2="20" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" opacity="0.12" />
                <line x1="20" y1="20" x2="100" y2="20" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="80" strokeDashoffset="80" opacity="0.5">
                  <animate attributeName="stroke-dashoffset" values="80;0;80" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
                </line>
                {/* Line 3 - draws in delayed more */}
                <line x1="30" y1="32" x2="90" y2="32" stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" opacity="0.1" />
                <line x1="30" y1="32" x2="90" y2="32" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="60" opacity="0.4">
                  <animate attributeName="stroke-dashoffset" values="60;0;60" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                </line>
                {/* Dot at end of line 1 */}
                <circle cx="110" cy="8" r="2" className="fill-primary" opacity="0">
                  <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" />
                </circle>
                {/* Dot at end of line 2 */}
                <circle cx="100" cy="20" r="2" className="fill-primary" opacity="0">
                  <animate attributeName="opacity" values="0;0.6;0" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
                </circle>
                {/* Dot at end of line 3 */}
                <circle cx="90" cy="32" r="2" className="fill-primary" opacity="0">
                  <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                </circle>
              </svg>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground/90">
                <span className="inline-block animate-pulse">Agent</span>{' '}
                <span className="inline-block text-primary animate-pulse" style={{ animationDelay: '0.15s' }}>is</span>{' '}
                <span className="inline-block animate-pulse" style={{ animationDelay: '0.3s' }}>cooking!</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground/60 animate-pulse" style={{ animationDelay: '0.45s' }}>
                Setting up your workspace
              </p>
            </div>
          </div>
        )}

        <Card className="h-full min-w-0 overflow-hidden rounded-lg" style={{ width: widths.gmail }}>
          <GmailPanel isConnected={gmailConnected} />
        </Card>

        <div
          className="flex w-2 shrink-0 cursor-col-resize items-center justify-center group"
          onMouseDown={onMouseDown}
        >
          <div className="h-8 w-0.5 rounded-full bg-border/50 group-hover:bg-primary/50 transition-colors" />
        </div>

        <Card className="h-full min-w-0 overflow-hidden rounded-lg" style={{ width: widths.ai }}>
          <AICommandPanel />
        </Card>

        <Card className="h-full min-w-0 overflow-hidden rounded-lg" style={{ width: widths.calendar }}>
          <CalendarPanel isConnected={calendarConnected} />
        </Card>
      </div>
    </div>
  );
}
