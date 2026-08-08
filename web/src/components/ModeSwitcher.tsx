"use client";

import { Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RatingMode } from '@/lib/types';

interface ModeSwitcherProps {
  activeTab: RatingMode;
  onTabChange: (tab: RatingMode) => void;
  /** 'lg' matches the rankings hero (taller buttons); 'md' everywhere else */
  size?: 'lg' | 'md';
}

/** Shared doubles/singles pill switcher used in page heroes. */
export function ModeSwitcher({ activeTab, onTabChange, size = 'md' }: ModeSwitcherProps) {
  const buttonBase = cn(
    'flex items-center gap-2 px-8 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-500 uppercase',
    size === 'lg' ? 'py-4' : 'py-3'
  );

  return (
    <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-2xl h-fit border border-white/10 shadow-2xl" role="tablist" aria-label="Rating mode">
      <button
        onClick={() => onTabChange('doubles')}
        role="tab"
        aria-selected={activeTab === 'doubles'}
        className={cn(
          buttonBase,
          activeTab === 'doubles' ? 'bg-secondary text-primary shadow-2xl scale-[1.02]' : 'text-secondary/60 hover:text-secondary hover:bg-white/5'
        )}
      >
        <Users className="w-4 h-4" /> Doubles
      </button>
      <button
        onClick={() => onTabChange('singles')}
        role="tab"
        aria-selected={activeTab === 'singles'}
        className={cn(
          buttonBase,
          activeTab === 'singles' ? 'bg-secondary text-primary shadow-2xl scale-[1.02]' : 'text-secondary/60 hover:text-secondary hover:bg-white/5'
        )}
      >
        <User className="w-4 h-4" /> Singles
      </button>
    </div>
  );
}
