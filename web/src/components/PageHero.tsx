"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HERO_TEXTURE_URL } from '@/lib/site-config';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  /** Optional content rendered to the right of the title (e.g. a ModeSwitcher) */
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  align?: 'left' | 'center';
}

/**
 * Shared "Center Court" hero header used across all pages: pressed-grass
 * background, texture overlay, starred eyebrow, and display-italic title.
 */
export function PageHero({ eyebrow, title, children, className, titleClassName, align = 'left' }: PageHeroProps) {
  return (
    <header className={cn('relative pt-24 pb-12 md:pt-28 md:pb-12 px-6 bg-pressed-grass overflow-hidden', align === 'center' ? 'text-center' : 'text-left', className)}>
      {/* Editorial Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url('${HERO_TEXTURE_URL}')` }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn(children ? 'flex flex-col md:flex-row md:items-end justify-between gap-10 text-left' : 'space-y-4')}
        >
          <div className="space-y-4">
            <div className={cn('flex items-center gap-2 mb-6', align === 'center' && 'justify-center')}>
              <Star className="w-3.5 h-3.5 text-tertiary fill-tertiary" />
              <span className="text-tertiary font-sans font-bold tracking-[0.3em] text-xs uppercase">{eyebrow}</span>
            </div>
            <h1 className={cn('text-6xl md:text-[7rem] font-display italic tracking-[-0.06em] text-secondary leading-[0.85] drop-shadow-sm', titleClassName)}>
              {title}
            </h1>
          </div>

          {children}
        </motion.div>
      </div>
    </header>
  );
}
