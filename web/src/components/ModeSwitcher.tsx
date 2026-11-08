"use client";

import { cn } from '@/lib/utils';
import { RatingMode } from '@/lib/types';

interface ModeSwitcherProps {
  activeTab: RatingMode;
  onTabChange: (tab: RatingMode) => void;
  /** 'lg' for page headers; 'md' inside cards */
  size?: 'lg' | 'md';
  /** Optional per-mode suffix, e.g. a rating shown next to the label */
  labels?: Partial<Record<RatingMode, string>>;
  className?: string;
}

/** Shared doubles/singles segmented control. Fills its row on phones. */
export function ModeSwitcher({ activeTab, onTabChange, size = 'md', labels, className }: ModeSwitcherProps) {
  const button = (mode: RatingMode, label: string) => (
    <button
      key={mode}
      onClick={() => onTabChange(mode)}
      role="tab"
      aria-selected={activeTab === mode}
      className={cn(
        'flex-1 md:flex-none md:px-4 rounded font-display font-bold uppercase tracking-[0.14em] transition-colors whitespace-nowrap',
        size === 'lg' ? 'h-[42px] text-sm' : 'h-9 text-[13px]',
        activeTab === mode
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      {labels?.[mode] && <span className="ml-1.5 opacity-70 tabular-nums">{labels[mode]}</span>}
    </button>
  );

  return (
    <div
      className={cn('flex w-full md:w-auto p-[3px] bg-secondary rounded-md gap-0.5', className)}
      role="tablist"
      aria-label="Rating mode"
    >
      {button('doubles', 'Doubles')}
      {button('singles', 'Singles')}
    </div>
  );
}
