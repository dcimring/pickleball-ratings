"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  /** Ticker-strip text, e.g. "Live board · Doubles · Updated 8 Nov". Segments are joined with middots. */
  eyebrow: string | string[];
  /** Small caps line directly above the headline */
  kicker?: string;
  title: ReactNode;
  /** Short lead paragraph under the headline */
  lead?: ReactNode;
  /** Controls rendered under the headline on mobile and to its right on desktop */
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  /** Rendered above the ticker strip, e.g. a back link */
  topSlot?: ReactNode;
}

/**
 * Shared "Broadcast" page header: live ticker strip, condensed headline,
 * optional lead copy and a controls row that never shares a line with the
 * headline on phones.
 */
export function PageHero({ eyebrow, kicker, title, lead, children, className, titleClassName, topSlot }: PageHeroProps) {
  const segments = Array.isArray(eyebrow) ? eyebrow : [eyebrow];

  return (
    <header className={cn('pt-[72px] md:pt-[100px] px-4 md:px-10', className)}>
      <div className="max-w-6xl mx-auto">
        {/* CSS-only entrance so the server-rendered header is visible before hydration */}
        <div className="flex flex-col gap-5 md:gap-7 animate-fade-in">
          {topSlot}

          <div className="min-h-[30px] md:min-h-8 py-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 px-3 bg-secondary rounded-md kicker text-[13px] md:text-sm w-fit max-w-full">
            <span className="live-dot shrink-0" aria-hidden="true" />
            {segments.map((seg, i) => (
              <span key={i} className="flex items-center gap-2.5">
                {i > 0 && <span aria-hidden="true">·</span>}
                <span className={i === 0 ? 'text-primary' : undefined}>{seg}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-8">
            <div className="flex flex-col gap-2 min-w-0">
              {kicker && <span className="kicker text-sm md:text-base tracking-[0.24em] font-semibold">{kicker}</span>}
              <h1
                className={cn(
                  'text-[64px] md:text-[120px] leading-[0.86] md:leading-[0.84] text-foreground',
                  titleClassName
                )}
              >
                {title}
              </h1>
              {lead && <p className="mt-2 text-[15px] md:text-base leading-relaxed text-muted-foreground max-w-xl">{lead}</p>}
            </div>

            {children && <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full md:w-auto shrink-0">{children}</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
