"use client";

import Link from 'next/link';
import { History } from 'lucide-react';
import { ActivityTier, ActivityItem, RatingMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';
import { LOCALE } from '@/lib/site-config';
import { PageHero } from '@/components/PageHero';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { Spinner } from '@/components/Spinner';

interface ActivityFeedProps {
  tiers: ActivityTier[];
  activeTab: RatingMode;
  onTabChange: (tab: RatingMode) => void;
  activitySort: 'rating' | 'date';
  onSortChange: (sort: 'rating' | 'date') => void;
  pulseStats: {
    activeCount: number;
    topGainerName: string;
    topGainerValue: number;
  } | null;
  loading: boolean;
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'short' });

function MoverTile({ item, href }: { item: ActivityItem; href: string }) {
  const up = item.ratingDiff > 0;
  const flat = item.ratingDiff === 0;
  const kind = flat ? 'Played' : up ? 'Riser' : 'Faller';
  const rankText =
    item.rankDiff > 0 ? `${item.previous.rank_position} → ${item.current.rank_position}` :
    item.rankDiff < 0 ? `${item.previous.rank_position} → ${item.current.rank_position}` :
    `holds ${item.current.rank_position}`;

  return (
    <Link
      href={href}
      className="bg-secondary rounded-lg p-3.5 md:p-4 flex flex-col gap-2.5 min-h-[130px] md:min-h-[150px] hover:bg-muted transition-colors"
    >
      <span className="flex items-center justify-between gap-2 kicker text-xs">
        <span className={cn(up && 'text-primary', !up && !flat && 'text-destructive')}>{kind}</span>
        <span className="tabular-nums normal-case tracking-normal font-sans font-medium">{rankText}</span>
      </span>
      <span className="font-sans font-semibold text-base md:text-[17px] leading-tight">{item.player_name}</span>
      <span className="mt-auto flex items-end justify-between gap-2">
        <span className={cn('numeral text-[32px] md:text-[36px]', up ? 'text-primary' : flat ? 'text-muted-foreground' : 'text-destructive')}>
          {flat ? `+${item.roundsDiff} rnd` : `${up ? '+' : '−'}${Math.abs(item.ratingDiff).toFixed(3)}`}
        </span>
        <span className="flex flex-col items-end text-right">
          <span className="font-display font-bold text-base md:text-[17px] tabular-nums text-muted-foreground">{item.current.rating.toFixed(3)}</span>
          <span className="text-[11px] text-muted-foreground">{shortDate(item.date)}</span>
        </span>
      </span>
    </Link>
  );
}

export function ActivityFeed({
  tiers,
  activeTab,
  onTabChange,
  activitySort,
  onSortChange,
  pulseStats,
  loading,
}: ActivityFeedProps) {
  const latestDate = tiers.flatMap((t) => t.items).reduce<string | null>((max, i) => (!max || i.date > max ? i.date : max), null);
  const gainer = pulseStats
    ? tiers.flatMap((t) => t.items).find((i) => i.player_name === pulseStats.topGainerName)
    : undefined;
  const profileHref = (name: string) => `/player/${slugify(name)}?tab=${activeTab}&sort=${activitySort}&from=activity`;

  const segmented = (
    <div className="flex w-full md:w-auto p-[3px] bg-secondary rounded-md gap-0.5" role="group" aria-label="Sort movers">
      {(['rating', 'date'] as const).map((key) => (
        <button
          key={key}
          onClick={() => onSortChange(key)}
          aria-pressed={activitySort === key}
          className={cn(
            'flex-1 md:flex-none md:px-4 h-[42px] rounded font-display font-bold text-sm uppercase tracking-[0.14em] transition-colors whitespace-nowrap',
            activitySort === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {key === 'rating' ? 'Biggest movers' : 'Latest'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pb-24 min-h-full bg-background">
      <PageHero
        eyebrow={['Movers', activeTab === 'doubles' ? 'Doubles' : 'Singles', latestDate ? `Latest change ${shortDate(latestDate)}` : 'Loading']}
        kicker="This week's"
        title="Movers"
        lead={pulseStats ? <>{pulseStats.activeCount} players moved in the latest round of changes.</> : undefined}
      >
        {segmented}
        <ModeSwitcher activeTab={activeTab} onTabChange={onTabChange} size="lg" />
      </PageHero>

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
          {loading ? (
            <div className="bg-secondary rounded-lg">
              <Spinner />
            </div>
          ) : (
            <>
              {pulseStats && (
                <Link
                  href={profileHref(pulseStats.topGainerName)}
                  className="bg-primary text-primary-foreground rounded-lg p-4 md:p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-6 hover:opacity-95 transition-opacity"
                >
                  <span className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-display font-bold text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-[#2f3a1a]">Gainer of the week</span>
                    <span className="font-sans font-semibold text-2xl md:text-[28px] leading-tight tracking-tight">{pulseStats.topGainerName}</span>
                    {gainer && (
                      <span className="text-[13px] md:text-[15px] text-[#2f3a1a]">
                        Rank {gainer.previous.rank_position} → {gainer.current.rank_position} · now {gainer.current.rating.toFixed(3)} · {gainer.current.rounds_played} rounds · {shortDate(gainer.date)}
                      </span>
                    )}
                  </span>
                  <span className="numeral text-[56px] md:text-[96px] whitespace-nowrap">+{pulseStats.topGainerValue.toFixed(3)}</span>
                </Link>
              )}

              {tiers.length > 1 && (
                <nav aria-label="Jump to tier" className="flex gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  {tiers.map((tier) => (
                    <a
                      key={tier.title}
                      href={`#tier-${tier.title.replace(/\s+/g, '-').toLowerCase()}`}
                      className="shrink-0 h-9 px-3 rounded-md shadow-outline flex items-center font-display font-bold text-[13px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground whitespace-nowrap"
                    >
                      {tier.title} <span className="ml-1.5 text-foreground/60 tabular-nums">{tier.items.length}</span>
                    </a>
                  ))}
                </nav>
              )}

              {tiers.map((tier) => (
                <section
                  key={`${activeTab}-${tier.title}-${activitySort}`}
                  id={`tier-${tier.title.replace(/\s+/g, '-').toLowerCase()}`}
                  className="flex flex-col gap-3 scroll-mt-20"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="font-display font-bold uppercase tracking-[0.14em] text-base md:text-xl whitespace-nowrap">{tier.title}</h2>
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground tabular-nums">{tier.items.length}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {tier.items.map((item, idx) => (
                      <MoverTile key={`${item.player_name}-${item.date}-${idx}`} item={item} href={profileHref(item.player_name)} />
                    ))}
                  </div>
                </section>
              ))}

              {tiers.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 bg-secondary rounded-lg text-center">
                  <History className="w-8 h-8 text-muted-foreground" />
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-lg">No moves yet</span>
                  <p className="text-sm text-muted-foreground max-w-sm">Changes appear here as soon as a rating on pickleball.ky moves.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
