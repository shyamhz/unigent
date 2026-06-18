'use client';

import { useState, useEffect, type ReactNode } from 'react';

function CookingSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-4">
      {/* Pot body */}
      <rect x="16" y="36" width="48" height="28" rx="6" className="fill-secondary stroke-border" strokeWidth="1.5" />
      {/* Pot rim */}
      <rect x="12" y="32" width="56" height="8" rx="3" className="fill-secondary stroke-border" strokeWidth="1.5" />
      {/* Left handle */}
      <path d="M12 36H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h6" className="stroke-border" strokeWidth="1.5" fill="none" />
      {/* Right handle */}
      <path d="M68 36h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-6" className="stroke-border" strokeWidth="1.5" fill="none" />

      {/* Steam 1 */}
      <path d="M30 28c0-4 3-6 0-10" className="stroke-primary/60" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <animate attributeName="d" values="M30 28c0-4 3-6 0-10;M30 26c0-4 -3-6 0-10;M30 28c0-4 3-6 0-10" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
      </path>
      {/* Steam 2 */}
      <path d="M40 26c0-4 3-6 0-10" className="stroke-primary/40" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <animate attributeName="d" values="M40 26c0-4 -3-6 0-10;M40 24c0-4 3-6 0-10;M40 26c0-4 -3-6 0-10" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Steam 3 */}
      <path d="M50 28c0-4 3-6 0-10" className="stroke-primary/50" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <animate attributeName="d" values="M50 28c0-4 -3-6 0-10;M50 26c0-4 3-6 0-10;M50 28c0-4 -3-6 0-10" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.18;0.5" dur="1.8s" repeatCount="indefinite" />
      </path>

      {/* Bubbles inside pot */}
      <circle cx="30" cy="50" r="2" className="fill-primary/30">
        <animate attributeName="cy" values="54;42;54" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.5;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="42" cy="52" r="1.5" className="fill-primary/25">
        <animate attributeName="cy" values="56;44;56" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.4;0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="52" cy="48" r="2" className="fill-primary/20">
        <animate attributeName="cy" values="52;40;52" dur="1.7s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.45;0" dur="1.7s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default function PanelLoader({ children }: { children: ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
    return (
      <div className="flex h-full flex-col items-center justify-center animate-fade-in-up">
        <CookingSVG />
        <p className="text-sm font-medium text-foreground/80 mb-1">Agent is cooking!</p>
        <p className="text-[0.68rem] text-muted-foreground/50">Setting things up...</p>
      </div>
    );
  }

  return <>{children}</>;
}
