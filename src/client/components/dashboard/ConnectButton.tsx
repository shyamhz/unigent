'use client';

import { getConnectUrl } from '@/server/actions/corsair';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ConnectButtonProps {
  type: 'gmail' | 'calendar';
  isConnected: boolean;
  onError?: (error: string) => void;
}

export function ConnectButton({ type, isConnected, onError }: ConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  if (isConnected) return null;

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await getConnectUrl();
      if (!url) throw new Error('Failed to generate connect URL');
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      toast.error(message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    gmail: { title: 'Connect Gmail', desc: 'Connect your Gmail to read, send, and manage emails' },
    calendar: { title: 'Connect Calendar', desc: 'Connect Google Calendar to manage your events' },
  };

  const config = labels[type];

  return (
    <div className="flex h-full flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {type === 'gmail' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
      </div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{config.title}</h3>
      <p className="mb-4 text-xs text-muted-foreground max-w-[200px]">{config.desc}</p>
      <button
        onClick={handleConnect}
        disabled={loading}
        className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect with Google'}
      </button>
    </div>
  );
}
