'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  dot?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Select...', className }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setHighlightedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  useEffect(() => {
    if (open && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(options.findIndex((o) => o.value === value));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
        }
        close();
        break;
      case 'Escape':
        close();
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-[0.78rem] transition-colors',
          'border-border/30 bg-secondary/30 text-foreground',
          'hover:border-primary/40 hover:bg-secondary/50',
          'focus:outline-none focus:ring-1 focus:ring-primary/30',
          '[color-scheme:dark]',
          open && 'border-primary/40 ring-1 ring-primary/30'
        )}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.dot && (
            <span className={cn('h-2 w-2 rounded-full shrink-0', selectedOption.dot)} />
          )}
          <span className={cn(!selectedOption && 'text-muted-foreground/50')}>
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('shrink-0 text-muted-foreground/50 transition-transform duration-200', open && 'rotate-180')}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          ref={listRef}
          className={cn(
            'absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border/40',
            'bg-card/95 backdrop-blur-xl shadow-lg shadow-black/20',
            'animate-in fade-in-0 zoom-in-95',
            'max-h-52 overflow-y-auto'
          )}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              data-option
              type="button"
              onClick={() => {
                onChange(option.value);
                close();
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-[0.78rem] text-left transition-colors',
                'hover:bg-primary/10 hover:text-primary',
                index === highlightedIndex && 'bg-primary/10 text-primary',
                option.value === value && 'bg-primary/10 font-medium text-primary'
              )}
            >
              {option.dot && (
                <span className={cn('h-2 w-2 rounded-full shrink-0', option.dot)} />
              )}
              <span className="truncate">{option.label}</span>
              {option.value === value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="ml-auto shrink-0 text-primary"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
