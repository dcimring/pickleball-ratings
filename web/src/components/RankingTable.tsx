"use client";

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Ranking, RatingMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';
import { LOCALE } from '@/lib/site-config';
import { PageHero } from '@/components/PageHero';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { Spinner } from '@/components/Spinner';
import { DeltaChip } from '@/components/DeltaChip';

interface RankingTableProps {
  data: Ranking[];
  /** Previous snapshot per player name (from lazily loaded history); undefined until loaded */
  previous?: Record<string, Ranking | undefined>;
  activeTab: RatingMode;
  onTabChange: (tab: RatingMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortConfig: { key: keyof Ranking; direction: 'asc' | 'desc' };
  onSort: (key: keyof Ranking) => void;
  loading: boolean;
}

const PAGE_SIZE = 50;

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'short' });
}

export function RankingTable({
  data,
  previous,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSort,
  loading,
}: RankingTableProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when filter/sort state changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, searchQuery, sortConfig]);

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...data];

    if (searchQuery) {
      filtered = filtered.filter((p) => p.player_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchQuery, sortConfig]);

  const lastUpdated = useMemo(() => {
    if (data.length === 0) return null;
    const latest = data.reduce((max, r) => (r.valid_from > max ? r.valid_from : max), data[0].valid_from);
    return formatShortDate(latest);
  }, [data]);

  const isDefaultView = !searchQuery && sortConfig.key === 'rank_position' && sortConfig.direction === 'asc';
  const leader = isDefaultView ? sortedAndFilteredData[0] : undefined;
  const boardRows = leader ? sortedAndFilteredData.slice(1, visibleCount) : sortedAndFilteredData.slice(0, visibleCount);
  const hasMore = visibleCount < sortedAndFilteredData.length;
  const shownCount = Math.min(visibleCount, sortedAndFilteredData.length);

  const SortIndicator = ({ column }: { column: keyof Ranking }) => {
    if (sortConfig.key !== column) return <Minus className="w-3 h-3 opacity-30" aria-hidden="true" />;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-primary" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" aria-hidden="true" />
    );
  };

  const headerButton = (key: keyof Ranking, label: string, className?: string) => (
    <button
      onClick={() => onSort(key)}
      className={cn('flex items-center gap-1.5 hover:text-foreground transition-colors', className)}
      aria-label={`Sort by ${label.toLowerCase()}${sortConfig.key === key ? `, currently ${sortConfig.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}
    >
      {label} <SortIndicator column={key} />
    </button>
  );

  const gridCols = 'grid-cols-[36px_minmax(0,1fr)_76px_72px] md:grid-cols-[80px_minmax(0,2fr)_minmax(0,1.4fr)_120px_100px_130px]';

  return (
    <div className="pb-24 min-h-full bg-background">
      <PageHero
        eyebrow={['Live board', activeTab === 'doubles' ? 'Doubles' : 'Singles', lastUpdated ? `Updated ${lastUpdated}` : 'Updating']}
        kicker="Cayman Islands"
        title="Rankings"
        lead={
          <>
            Every rating change since February, for all {data.length.toLocaleString()} rated players. Updated daily from pickleball.ky.
          </>
        }
      >
        <ModeSwitcher activeTab={activeTab} onTabChange={onTabChange} size="lg" className="order-1 md:order-2" />
        <div className="order-2 md:order-1 relative flex items-center h-12 md:h-[42px] md:w-72 px-3.5 gap-2.5 bg-secondary rounded-md shadow-outline focus-within:shadow-[inset_0_0_0_1px_oklch(var(--primary))] transition-shadow">
          <Search className="w-[18px] h-[18px] text-primary shrink-0" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search by player name"
            placeholder="Search by player name"
            value={searchQuery}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onSearchChange('');
            }}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-0 h-full bg-transparent outline-none font-sans font-medium text-[15px] text-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="w-8 h-8 -mr-1.5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </PageHero>

      <section className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-3.5">
          {loading ? (
            <div className="bg-secondary rounded-lg">
              <Spinner />
            </div>
          ) : (
            <>
              {leader && (
                <Link
                  href={`/player/${slugify(leader.player_name)}?tab=${activeTab}`}
                  className="relative overflow-hidden bg-secondary rounded-lg p-4 md:p-6 flex flex-col gap-2.5 hover:bg-muted transition-colors group"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-6 md:-top-10 font-display font-extrabold text-[150px] md:text-[260px] leading-none text-muted select-none pointer-events-none"
                  >
                    1
                  </span>
                  <span className="relative kicker text-[13px] text-primary">No. 1 · Leader</span>
                  <span className="relative font-sans font-semibold text-2xl md:text-3xl tracking-tight">{leader.player_name}</span>
                  <span className="relative flex items-end justify-between gap-4">
                    <span className="numeral text-[64px] md:text-[88px] text-foreground">{leader.rating.toFixed(3)}</span>
                    <span className="flex flex-col items-end gap-0.5 text-right text-xs md:text-sm text-muted-foreground">
                      <span className="text-foreground font-semibold">{leader.rounds_played} rounds</span>
                      <span>Rating unchanged<br className="md:hidden" /> since {formatShortDate(leader.valid_from)}</span>
                    </span>
                  </span>
                </Link>
              )}

              {/* Real table elements for crawlers and screen readers; ARIA roles restore
                  the semantics that display:grid removes. */}
              <table role="table" className="block">
                <caption className="sr-only">Cayman Islands pickleball {activeTab} rankings</caption>
                <thead role="rowgroup" className="block mb-2">
                  <tr role="row" className={cn('grid gap-2.5 md:gap-4 px-3 md:px-6 pb-1 kicker text-xs select-none', gridCols)}>
                    <th role="columnheader" scope="col" className="font-[inherit] text-left">{headerButton('rank_position', 'Pos')}</th>
                    <th role="columnheader" scope="col" className="font-[inherit] text-left">{headerButton('player_name', 'Player')}</th>
                    <th role="columnheader" scope="col" className="hidden md:block font-[inherit] text-left">Last change</th>
                    <th role="columnheader" scope="col" className="font-[inherit] text-right">Move</th>
                    <th role="columnheader" scope="col" className="hidden md:block font-[inherit]">{headerButton('rounds_played', 'Rounds', 'w-full justify-end')}</th>
                    <th role="columnheader" scope="col" className="font-[inherit]">{headerButton('rating', 'Rating', 'w-full justify-end')}</th>
                  </tr>
                </thead>

                <tbody role="rowgroup" className="block bg-secondary rounded-lg">
                  {/* The leader is shown as the card above; keep No. 1 in the table data too */}
                  {leader && (
                    <tr aria-hidden="true" className="sr-only">
                      <td>{leader.rank_position}</td>
                      <td>{leader.player_name}</td>
                      <td>{formatShortDate(leader.valid_from)}</td>
                      <td />
                      <td>{leader.rounds_played}</td>
                      <td>{leader.rating.toFixed(3)}</td>
                    </tr>
                  )}
                  {boardRows.map((player) => {
                    const prev = previous?.[player.player_name];
                    const ratingDiff = prev ? player.rating - prev.rating : undefined;
                    const rankDiff = prev ? prev.rank_position - player.rank_position : 0;
                    const top3 = player.rank_position <= 3;
                    return (
                      <tr
                        role="row"
                        key={`${activeTab}-${player.player_name}`}
                        className={cn(
                          'relative grid gap-2.5 md:gap-4 items-center px-3 md:px-6 min-h-[60px] md:min-h-[64px] py-2 shadow-hairline last:shadow-none hover:bg-muted transition-colors',
                          gridCols
                        )}
                      >
                        <td role="cell" className={cn('numeral text-[26px] md:text-[34px]', top3 ? 'text-primary' : 'text-muted-foreground')}>
                          {player.rank_position}
                        </td>
                        <td role="cell" className="flex flex-col gap-0.5 min-w-0">
                          {/* after:inset-0 stretches the link across the whole row */}
                          <Link
                            href={`/player/${slugify(player.player_name)}?tab=${activeTab}`}
                            className="font-sans font-semibold text-base md:text-lg truncate after:absolute after:inset-0"
                          >
                            {player.player_name}
                          </Link>
                          <span className="text-[11px] text-muted-foreground md:hidden">
                            {player.rounds_played} rounds · {formatShortDate(player.valid_from)}
                            {rankDiff > 0 && ` · up ${rankDiff}`}
                            {rankDiff < 0 && ` · down ${Math.abs(rankDiff)}`}
                          </span>
                        </td>
                        <td role="cell" className="hidden md:block text-[13px] text-muted-foreground">
                          {formatShortDate(player.valid_from)}
                          {rankDiff > 0 && ` · up ${rankDiff} place${rankDiff === 1 ? '' : 's'}`}
                          {rankDiff < 0 && ` · down ${Math.abs(rankDiff)} place${rankDiff === -1 ? '' : 's'}`}
                        </td>
                        <td role="cell" className="justify-self-end">
                          <DeltaChip value={ratingDiff} />
                        </td>
                        <td role="cell" className="hidden md:block text-right text-base text-muted-foreground tabular-nums">{player.rounds_played}</td>
                        <td role="cell" className="numeral text-2xl md:text-[30px] text-right">{player.rating.toFixed(3)}</td>
                      </tr>
                    );
                  })}

                  {boardRows.length === 0 && !leader && (
                    <tr role="row" className="block">
                      <td role="cell" className="py-16 text-center flex flex-col items-center gap-2">
                        <span className="font-display font-bold uppercase tracking-[0.12em] text-lg">No players match</span>
                        <span className="text-sm text-muted-foreground">Try a shorter name, or clear the search.</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex flex-col items-center gap-3 pt-2">
                {hasMore && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="w-full h-14 rounded-md bg-primary text-primary-foreground font-display font-bold text-base uppercase tracking-[0.16em] hover:opacity-90 transition-opacity"
                  >
                    Show {Math.min(PAGE_SIZE, sortedAndFilteredData.length - visibleCount)} more players
                  </button>
                )}
                <span className="text-xs md:text-sm text-muted-foreground">
                  {shownCount} of {sortedAndFilteredData.length} rated players
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
