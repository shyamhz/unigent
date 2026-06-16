'use client';

import { Card } from '@/components/ui/card';
import TopBar from '@/components/dashboard/TopBar';
import GmailPanel from '@/components/dashboard/GmailPanel';
import AICommandPanel from '@/components/dashboard/AICommandPanel';
import CalendarPanel from '@/components/dashboard/CalendarPanel';
import { useRef, useState, useCallback, useEffect } from 'react';

type Panel = 'gmail' | 'ai' | 'calendar';

const PANEL_RATIOS = { gmail: 0.25, ai: 0.40, calendar: 0.35 };

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState<Panel>('gmail');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [widths, setWidths] = useState({ gmail: 0, ai: 0, calendar: 0 });
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
    if (isMobile || isTablet) return;
    const measure = () => {
      if (!containerRef.current) return;
      const total = containerRef.current.offsetWidth - 24;
      setWidths({
        gmail: total * PANEL_RATIOS.gmail,
        ai: total * PANEL_RATIOS.ai,
        calendar: total * PANEL_RATIOS.calendar,
      });
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
          <Card className="min-h-0 flex-1 overflow-hidden rounded-lg">
            {activePanel === 'gmail' && <GmailPanel />}
            {activePanel === 'ai' && <AICommandPanel />}
            {activePanel === 'calendar' && <CalendarPanel />}
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
          <Card className="min-w-0 flex-[0_0_30%] overflow-hidden rounded-lg">
            <GmailPanel />
          </Card>

          <Card className="min-w-0 flex-[0_0_35%] overflow-hidden rounded-lg">
            <AICommandPanel />
          </Card>

          <Card className="min-w-0 flex-[0_0_35%] overflow-hidden rounded-lg">
            <CalendarPanel />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar />
      <div ref={containerRef} className="flex min-h-0 flex-1 gap-3 p-3">
        <Card className="min-w-0 overflow-hidden rounded-lg" style={{ width: widths.gmail }}>
          <GmailPanel />
        </Card>

        <div
          className="flex w-2 shrink-0 cursor-col-resize items-center justify-center group"
          onMouseDown={onMouseDown}
        >
          <div className="h-8 w-0.5 rounded-full bg-border/50 group-hover:bg-primary/50 transition-colors" />
        </div>

        <Card className="min-w-0 overflow-hidden rounded-lg" style={{ width: widths.ai }}>
          <AICommandPanel />
        </Card>

        <Card className="min-w-0 overflow-hidden rounded-lg" style={{ width: widths.calendar }}>
          <CalendarPanel />
        </Card>
      </div>
    </div>
  );
}
