"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Users, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TourneyResult } from '@/lib/types';
import { slugify } from '@/lib/slugify';
import { PageHero } from '@/components/PageHero';
import { Spinner } from '@/components/Spinner';

interface TourneyCheckProps {
  input: string;
  onInputChange: (val: string) => void;
  onCheck: () => void;
  results: TourneyResult[];
  loading: boolean;
}

function RatingCell({ value, accent }: { value: { rank: number; rating: number } | null; accent?: boolean }) {
  if (!value) {
    return <span className="text-right font-display font-bold text-base text-muted-foreground" aria-label="No rating">—</span>;
  }
  return (
    <span className="flex flex-col items-end">
      <span className={cn('numeral text-[22px]', accent && 'text-primary')}>#{value.rank}</span>
      <span className="text-[11px] text-muted-foreground tabular-nums">{value.rating.toFixed(3)}</span>
    </span>
  );
}

export function TourneyCheck({ input, onInputChange, onCheck, results, loading }: TourneyCheckProps) {
  const [copied, setCopied] = useState(false);
  const nameCount = input.split('\n').map((n) => n.trim()).filter(Boolean).length;
  const matched = results.filter((r) => r.singles || r.doubles).length;

  const copyTable = async () => {
    const lines = results.map((r) =>
      [
        r.name,
        r.doubles ? `D #${r.doubles.rank} ${r.doubles.rating.toFixed(3)}` : 'D —',
        r.singles ? `S #${r.singles.rank} ${r.singles.rating.toFixed(3)}` : 'S —',
      ].join('  ')
    );
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; nothing to do
    }
  };

  return (
    <div className="pb-24 min-h-full bg-background">
      <PageHero
        eyebrow={['Roster tool', 'Doubles + singles']}
        kicker="Seed a draw in seconds"
        title={<>Tourney<br />Check</>}
        lead="Paste a roster of player names to pull everyone's current rank and rating in both formats."
      />

      <div className="px-4 md:px-10 mt-6 md:mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3.5 md:gap-6 md:items-start">
          {/* Input */}
          <div className="bg-secondary rounded-lg p-3.5 md:p-5 flex flex-col gap-2.5 md:flex-[1_1_360px] md:sticky md:top-24">
            <label htmlFor="roster" className="kicker text-[13px]">Paste your roster, one name per line</label>
            <textarea
              id="roster"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={"Caleb Sunkur\nMichael Carse\n…"}
              rows={8}
              className="w-full bg-background rounded-md p-3 outline-none font-sans font-medium text-[15px] leading-relaxed text-foreground resize-none focus:shadow-[inset_0_0_0_1px_oklch(var(--primary))] transition-shadow"
            />
            <button
              onClick={onCheck}
              disabled={nameCount === 0}
              className="h-12 rounded-md bg-primary text-primary-foreground font-display font-bold text-[15px] uppercase tracking-[0.16em] hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40"
            >
              {nameCount > 0 ? `Check ${nameCount} player${nameCount === 1 ? '' : 's'}` : 'Check roster'}
            </button>
          </div>

          {/* Results */}
          <div className="flex flex-col gap-2 md:flex-[999_1_520px] min-w-0">
            {loading ? (
              <div className="bg-secondary rounded-lg">
                <Spinner />
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-[minmax(0,1fr)_80px_80px] gap-2.5 px-3 pb-1 kicker text-xs">
                  <span>Player</span>
                  <span className="text-right">Singles</span>
                  <span className="text-right">Doubles</span>
                </div>
                <div className="bg-secondary rounded-lg flex flex-col -mt-1">
                  {results.map((result) => {
                    const found = result.singles || result.doubles;
                    return (
                      <Link
                        key={`tourney-${result.name}`}
                        href={found ? `/player/${slugify(result.name)}` : '#'}
                        aria-disabled={!found}
                        className={cn(
                          'grid grid-cols-[minmax(0,1fr)_80px_80px] gap-2.5 items-center px-3 min-h-[60px] py-2 shadow-hairline last:shadow-none transition-colors',
                          found ? 'hover:bg-muted' : 'pointer-events-none'
                        )}
                      >
                        <span className="flex flex-col min-w-0">
                          <span className={cn('font-sans font-semibold text-base truncate', !found && 'text-muted-foreground')}>{result.name}</span>
                          {!found && <span className="text-[11px] text-muted-foreground">Not found. Check the spelling against the board.</span>}
                        </span>
                        <RatingCell value={result.singles} />
                        <RatingCell value={result.doubles} accent />
                      </Link>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between gap-3 pt-1 px-1">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {matched} of {results.length} matched. A dash means no rating in that format.
                  </span>
                  <button
                    onClick={copyTable}
                    className="h-11 px-3.5 rounded-md shadow-outline font-display font-bold text-[13px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy table'}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-secondary rounded-lg flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Users className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                <span className="font-display font-bold uppercase tracking-[0.12em] text-lg">No roster yet</span>
                <p className="text-sm text-muted-foreground max-w-xs">Results appear here, sorted by doubles rank, with a link to each player&apos;s trajectory.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
