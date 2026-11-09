"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Ranking, RatingMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LOCALE, OWNER_NAME } from '@/lib/site-config';
import { BRAND_COLORS } from '@/lib/brand-config';
import { ShareButton } from './ShareButton';
import { RankingHistoryTable } from './RankingHistoryTable';
import { ModeSwitcher } from './ModeSwitcher';
import { PageHero } from './PageHero';
import { DeltaChip } from './DeltaChip';

interface PlayerProfileProps {
  playerName: string;
  playerHistory: { singles: Ranking[]; doubles: Ranking[] };
  /** Players just above and below on the active board */
  nearby?: { name: string; slug: string; rank: number; rating: number }[];
  activeTab: RatingMode;
  onTabChange: (tab: RatingMode) => void;
  loading: boolean;
  backUrl?: string;
  backLabel?: string;
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'short' });
const longDate = (iso: string) => new Date(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

function Tile({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="bg-secondary rounded-lg px-3.5 py-3 flex flex-col gap-1 min-w-0">
      <span className="kicker text-[11px] md:text-xs">{label}</span>
      <span className={cn('numeral text-[26px] md:text-[30px] flex items-baseline gap-1.5', accent && 'text-primary')}>{value}</span>
      {sub && <span className="text-[11px] md:text-xs text-muted-foreground truncate">{sub}</span>}
    </div>
  );
}

export function PlayerProfile({
  playerName,
  playerHistory,
  nearby = [],
  activeTab,
  onTabChange,
  loading,
  backUrl = "/",
  backLabel = "Back to rankings",
}: PlayerProfileProps) {
  const [showChart, setShowChart] = useState(false);
  const hasData = playerHistory.singles.length > 0 || playerHistory.doubles.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const history = useMemo(
    () => [...playerHistory[activeTab]].sort((a, b) => new Date(a.valid_from).getTime() - new Date(b.valid_from).getTime()),
    [playerHistory, activeTab]
  );
  const current = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : undefined;
  const ratingDiff = previous && current ? current.rating - previous.rating : undefined;
  const rankDiff = previous && current ? previous.rank_position - current.rank_position : 0;

  const peak = useMemo(() => (history.length ? history.reduce((best, r) => (r.rating > best.rating ? r : best), history[0]) : undefined), [history]);
  const bestRank = useMemo(() => (history.length ? history.reduce((best, r) => (r.rank_position < best.rank_position ? r : best), history[0]) : undefined), [history]);

  const otherMode: RatingMode = activeTab === 'doubles' ? 'singles' : 'doubles';
  const otherCurrent = playerHistory[otherMode][playerHistory[otherMode].length - 1];

  const modeLabels = {
    doubles: playerHistory.doubles.length ? playerHistory.doubles[playerHistory.doubles.length - 1].rating.toFixed(3) : undefined,
    singles: playerHistory.singles.length ? playerHistory.singles[playerHistory.singles.length - 1].rating.toFixed(3) : undefined,
  };

  // Plain-language facts in the server HTML, for search engines and AI answers
  const roundsText = current ? `${current.rounds_played} round${current.rounds_played === 1 ? '' : 's'}` : '';
  const summary = current
    ? `${playerName} ${
        current.is_active
          ? `is ranked No. ${current.rank_position} in Cayman Islands ${activeTab} pickleball with a ${current.rating.toFixed(3)} rating from ${roundsText}`
          : `is not currently listed in Cayman Islands ${activeTab} pickleball; their last recorded rating was ${current.rating.toFixed(3)} from ${roundsText}`
      }, last updated ${longDate(current.valid_from)}.${
        peak && history.length > 1 ? ` Peak recorded rating: ${peak.rating.toFixed(3)} on ${longDate(peak.valid_from)}.` : ''
      }`
    : undefined;

  const backLink = (
    <Link
      href={backUrl}
      className="inline-flex items-center gap-2 h-10 -ml-1 w-fit kicker text-sm hover:text-foreground transition-colors group"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      {backLabel}
    </Link>
  );

  if (!loading && !hasData) {
    return (
      <div className="min-h-full bg-background pb-24">
        <PageHero topSlot={backLink} eyebrow={['Player profile']} title={playerName} />
        <div className="px-4 md:px-10 mt-6">
          <div className="max-w-6xl mx-auto bg-secondary rounded-lg py-20 text-center flex flex-col items-center gap-2">
            <span className="font-display font-extrabold uppercase text-3xl">Not on the board</span>
            <p className="text-muted-foreground max-w-md">We have no rated games for this player yet. Ratings appear after the first rated round on pickleball.ky.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background pb-24">
      <PageHero
        topSlot={backLink}
        eyebrow={current ? ['Player', current.is_active ? `${activeTab} No. ${current.rank_position}` : `Not currently listed in ${activeTab}`, roundsText] : ['Player', `Unranked in ${activeTab}`]}
        title={playerName}
        titleClassName="text-[56px] md:text-[104px] break-words"
        lead={summary}
      >
        <ShareButton name={playerName} className="order-2 md:order-1" />
        <ModeSwitcher activeTab={activeTab} onTabChange={onTabChange} size="lg" labels={modeLabels} className="order-1 md:order-2" />
      </PageHero>

      <div className="px-4 md:px-10 mt-5 md:mt-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-3.5 md:gap-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-secondary rounded-lg h-40 animate-pulse" />
              ))}
            </div>
          ) : !current ? (
            <div className="bg-secondary rounded-lg p-6 md:p-10 flex flex-col gap-3">
              <span className="kicker text-[13px]">{activeTab} rating</span>
              <span className="font-display font-extrabold uppercase text-4xl text-muted-foreground">Unranked</span>
              <p className="text-muted-foreground text-sm max-w-md">
                No rated {activeTab} games yet.
                {otherCurrent && (
                  <>
                    {' '}Rated {otherCurrent.rating.toFixed(3)} in {otherMode}{otherCurrent.is_active ? `, No. ${otherCurrent.rank_position}` : ''}.{' '}
                    <button onClick={() => onTabChange(otherMode)} className="text-primary underline underline-offset-4">Show {otherMode}</button>
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              {/* Hero row: big number + stat tiles | chart */}
              <div className="flex flex-col md:flex-row gap-3.5 md:gap-6 md:items-stretch">
                <div className="flex flex-col gap-2 md:gap-3 md:flex-[1_1_380px] min-w-0">
                  <div className="bg-secondary rounded-lg p-4 md:p-6 flex flex-col gap-4">
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="kicker text-[13px]">{activeTab} rating</span>
                        <span className="numeral text-[84px] md:text-[96px] text-foreground">{current.rating.toFixed(3)}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 pb-1">
                        <DeltaChip value={ratingDiff} size="lg" />
                        <span className="text-[11px] md:text-xs text-muted-foreground text-right">
                          {previous ? `since ${shortDate(previous.valid_from)}` : `since ${shortDate(current.valid_from)}`}
                        </span>
                      </div>
                    </div>
                    {!previous && (
                      <p className="text-sm text-muted-foreground -mt-1">
                        Held at {current.rating.toFixed(3)} since {longDate(current.valid_from)}. The trajectory appears after the next rated change.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                    <Tile
                      label="Rank"
                      value={!current.is_active ? '—' : (
                        <>
                          {current.rank_position}
                          {rankDiff !== 0 && (
                            <span className={cn('text-sm font-bold', rankDiff > 0 ? 'text-primary' : 'text-destructive')}>
                              {rankDiff > 0 ? '▲' : '▼'}{Math.abs(rankDiff)}
                            </span>
                          )}
                        </>
                      )}
                    />
                    <Tile label="Peak" value={peak?.rating.toFixed(3)} sub={peak && shortDate(peak.valid_from)} accent={!!peak && peak.rating === current.rating && history.length > 1} />
                    <Tile label="Best rank" value={bestRank?.rank_position} sub={bestRank && shortDate(bestRank.valid_from)} />
                    <Tile label="Rounds" value={current.rounds_played} sub={otherCurrent ? `${otherMode} ${otherCurrent.rounds_played}` : undefined} />
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-secondary rounded-lg p-4 md:p-6 flex flex-col gap-3 md:flex-[999_1_560px] min-w-0">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h2 className="font-display font-bold uppercase tracking-[0.14em] text-base md:text-xl">Rating trajectory</h2>
                    <span className="text-xs md:text-[13px] text-muted-foreground">
                      {history.length} snapshot{history.length === 1 ? '' : 's'} · since {shortDate(history[0].valid_from)}
                    </span>
                  </div>
                  <div className="h-[220px] md:h-[300px] w-full">
                    {!showChart ? (
                      <div className="h-full w-full bg-muted animate-pulse rounded-md" />
                    ) : history.length >= 2 ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={history} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                          <defs>
                            <linearGradient id="voltFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={BRAND_COLORS.primary.hex} stopOpacity={0.18} />
                              <stop offset="100%" stopColor={BRAND_COLORS.primary.hex} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis
                            dataKey="valid_from"
                            stroke="transparent"
                            tick={{ fill: '#9fb0a8', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(str) => new Date(str).toLocaleDateString(LOCALE, { timeZone: 'UTC', month: 'short' })}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={24}
                            dy={8}
                          />
                          <YAxis
                            stroke="transparent"
                            tick={{ fill: '#9fb0a8', fontSize: 11, fontWeight: 600 }}
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val: number) => val.toFixed(2)}
                            width={64}
                          />
                          <Tooltip
                            cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                            contentStyle={{
                              backgroundColor: BRAND_COLORS.muted.hex,
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: BRAND_COLORS.foreground.hex,
                            }}
                            itemStyle={{ color: BRAND_COLORS.primary.hex }}
                            labelStyle={{ color: '#9fb0a8', marginBottom: '4px' }}
                            labelFormatter={(label) => longDate(String(label))}
                            formatter={(value) => [Number(value).toFixed(3), 'Rating']}
                          />
                          <Area
                            type="linear"
                            dataKey="rating"
                            stroke={BRAND_COLORS.primary.hex}
                            strokeWidth={2.5}
                            fill="url(#voltFill)"
                            dot={false}
                            activeDot={{ r: 5, fill: BRAND_COLORS.primary.hex, stroke: BRAND_COLORS.background.hex, strokeWidth: 2 }}
                            animationDuration={900}
                          />
                          {peak && history.length > 2 && (
                            <ReferenceDot x={peak.valid_from} y={peak.rating} r={4} fill={BRAND_COLORS.background.hex} stroke={BRAND_COLORS.primary.hex} strokeWidth={2} />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-4">
                        <span className="numeral text-5xl text-muted-foreground">{current.rating.toFixed(3)}</span>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          One snapshot so far. The line draws itself as soon as the rating moves.
                        </p>
                      </div>
                    )}
                  </div>
                  {peak && history.length >= 2 && (
                    <div className="flex justify-between kicker text-xs">
                      <span>{shortDate(history[0].valid_from)}</span>
                      <span className="text-primary">Peak {peak.rating.toFixed(3)} · {shortDate(peak.valid_from)}</span>
                      <span>{shortDate(current.valid_from)}</span>
                    </div>
                  )}
                </div>
              </div>

              <RankingHistoryTable history={history} activeTab={activeTab} />

              {nearby.length > 0 && (
                <section className="flex flex-col gap-3">
                  <h2 className="font-display font-bold uppercase tracking-[0.14em] text-base md:text-xl">Nearby in the {activeTab} rankings</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    {nearby.map((player) => (
                      <Link
                        key={player.slug}
                        href={`/player/${player.slug}${activeTab === 'singles' ? '?tab=singles' : ''}`}
                        className="bg-secondary rounded-lg p-3.5 flex flex-col gap-1 hover:bg-muted transition-colors min-w-0"
                      >
                        <span className="kicker text-xs">No. {player.rank}</span>
                        <span className="font-sans font-semibold text-base leading-tight truncate">{player.name}</span>
                        <span className="numeral text-2xl text-muted-foreground">{player.rating.toFixed(3)}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Independent tracker by{' '}
            <Link href="/about" className="underline underline-offset-4 hover:text-foreground">{OWNER_NAME}</Link>, using ratings published on pickleball.ky.{' '}
            <Link href="/about" className="underline underline-offset-4 hover:text-foreground">How this works</Link>
            {' · '}
            <Link href="/remove" className="underline underline-offset-4 hover:text-foreground">Request removal</Link>
            {' · '}
            <Link href="/suggest" className="underline underline-offset-4 hover:text-foreground">Suggest a feature</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
