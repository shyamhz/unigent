'use client';

import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem',
            fontSize: '0.78rem',
            padding: '0.75rem 1rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: 'var(--card)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'var(--card)',
            },
          },
        }}
      />
    </>
  );
}
