"use client";

import { Ranking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LOCALE } from '@/lib/site-config';
import { DeltaChip } from '@/components/DeltaChip';

interface RankingHistoryTableProps {
  history: Ranking[];
  activeTab: 'doubles' | 'singles';
  /** How many changes to list, newest first */
  limit?: number;
}

/** "Record of changes" board: date, rating, change, rank, rounds. */
export function RankingHistoryTable({ history, activeTab, limit = 6 }: RankingHistoryTableProps) {
  // Need at least 2 entries to show a change
  if (history.length < 2) {
    return null;
  }

  const sorted = [...history].sort((a, b) => new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime());
  const peak = Math.max(...sorted.map((r) => r.rating));

  const rows = sorted
    .map((current, index) => {
      const previous = sorted[index - 1];
      if (!previous) return null;
      return {
        current,
        ratingDiff: current.rating - previous.rating,
        rankDiff: previous.rank_position - current.rank_position, // positive = climbed
        previousRank: previous.rank_position,
        roundsDiff: current.rounds_played - previous.rounds_played,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .reverse()
    .slice(0, limit);

  const gridCols = 'grid-cols-[60px_minmax(0,1fr)_72px_72px] md:grid-cols-[120px_140px_140px_160px_minmax(0,1fr)]';

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display font-bold uppercase tracking-[0.14em] text-base md:text-xl normal-case">Record of changes</h2>
        <span className="text-xs md:text-[13px] text-muted-foreground">
          {activeTab} · newest first
        </span>
      </div>
      <div className="bg-secondary rounded-lg flex flex-col">
        <div className={cn('grid gap-2 md:gap-4 px-3 md:px-5 py-2.5 kicker text-xs shadow-hairline', gridCols)}>
          <span>Date</span>
          <span>Rating</span>
          <span className="text-right md:text-left">Change</span>
          <span className="text-right md:text-left">Rank</span>
          <span className="hidden md:block">Rounds</span>
        </div>
        {rows.map((row) => {
          const isPeak = row.current.rating === peak && row.ratingDiff > 0;
          return (
            <div
              key={row.current.id}
              className={cn('grid gap-2 md:gap-4 items-center px-3 md:px-5 min-h-[48px] md:min-h-[54px] py-1.5 shadow-hairline last:shadow-none text-sm md:text-[15px]', gridCols)}
            >
              <span className="text-muted-foreground whitespace-nowrap">
                {new Date(row.current.valid_from).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}
              </span>
              <span className={cn('numeral text-xl md:text-[22px]', isPeak && 'text-primary')}>
                {row.current.rating.toFixed(3)}
                {isPeak && <span className="ml-2 kicker text-[10px] text-primary">Peak</span>}
              </span>
              <span className="justify-self-end md:justify-self-start">
                <DeltaChip value={row.ratingDiff} />
              </span>
              <span className="text-right md:text-left text-muted-foreground tabular-nums whitespace-nowrap">
                {row.rankDiff === 0 ? `holds ${row.current.rank_position}` : `${row.previousRank} → ${row.current.rank_position}`}
              </span>
              <span className="hidden md:block text-muted-foreground tabular-nums">
                {row.current.rounds_played}
                {row.roundsDiff > 0 && <span className="text-foreground/60"> (+{row.roundsDiff})</span>}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
