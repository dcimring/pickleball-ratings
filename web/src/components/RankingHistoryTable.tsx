"use client";

import { Ranking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface RankingHistoryTableProps {
  history: Ranking[];
  activeTab: 'doubles' | 'singles';
}

export function RankingHistoryTable({ history, activeTab }: RankingHistoryTableProps) {
  // Get last 6 to calculate delta for the 5th one, then reverse for newest first
  const displayHistory = [...history].slice(-6).reverse();
  
  // We need at least 2 entries to show a change
  if (history.length < 2) {
    return null;
  }

  const rows = displayHistory.slice(0, 5).map((current, index) => {
    const previous = displayHistory[index + 1];
    if (!previous) return null;

    const ratingDiff = current.rating - previous.rating;
    const rankDiff = previous.rank_position - current.rank_position; // Lower rank is better
    const roundsDiff = current.rounds_played - previous.rounds_played;

    return {
      current,
      ratingDiff,
      rankDiff,
      roundsDiff,
    };
  }).filter(Boolean);

  return (
    <div className="mt-8 bg-muted p-1 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
      <div className="bg-secondary p-8 md:p-12">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-4">
            <h3 className="font-display text-4xl italic tracking-tighter text-foreground">Recent Activity</h3>
            <div className="w-12 h-1 bg-primary rounded-full" />
          </div>
          <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/20 uppercase hidden md:block">
            Last 5 Updates • {activeTab}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-foreground/5">
                <th className="pb-6 font-sans text-[10px] font-bold tracking-[0.3em] text-foreground/30 uppercase">Date</th>
                <th className="pb-6 font-sans text-[10px] font-bold tracking-[0.3em] text-foreground/30 uppercase text-right">Rating</th>
                <th className="pb-6 font-sans text-[10px] font-bold tracking-[0.3em] text-foreground/30 uppercase text-right">Rank</th>
                <th className="pb-6 font-sans text-[10px] font-bold tracking-[0.3em] text-foreground/30 uppercase text-right">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/[0.02]">
              {rows.map((row, i) => (
                <tr key={row!.current.id} className="group hover:bg-foreground/[0.01] transition-colors">
                  <td className="py-6">
                    <span className="font-sans text-[11px] font-bold text-foreground/40 uppercase tracking-wider">
                      {new Date(row!.current.valid_from).toLocaleDateString('en-KY', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric' 
                      })}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-display text-2xl italic text-foreground tabular-nums">
                        {row!.current.rating.toFixed(3)}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1 font-sans text-[10px] font-bold tabular-nums",
                        row!.ratingDiff > 0 ? "text-primary" : row!.ratingDiff < 0 ? "text-red-500" : "text-foreground/20"
                      )}>
                        {row!.ratingDiff > 0 ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            {Math.abs(row!.ratingDiff).toFixed(3)}
                          </>
                        ) : row!.ratingDiff < 0 ? (
                          <>
                            <ArrowDownRight className="w-3 h-3" />
                            {Math.abs(row!.ratingDiff).toFixed(3)}
                          </>
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-display text-2xl italic text-foreground tabular-nums">
                        #{row!.current.rank_position}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1 font-sans text-[10px] font-bold tabular-nums",
                        row!.rankDiff > 0 ? "text-primary" : row!.rankDiff < 0 ? "text-red-500" : "text-foreground/20"
                      )}>
                        {row!.rankDiff > 0 ? (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            {Math.abs(row!.rankDiff)}
                          </>
                        ) : row!.rankDiff < 0 ? (
                          <>
                            <ArrowDownRight className="w-3 h-3" />
                            {Math.abs(row!.rankDiff)}
                          </>
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-display text-2xl italic text-foreground tabular-nums">
                        {row!.current.rounds_played}
                      </span>
                      {row!.roundsDiff !== 0 && (
                        <div className="flex items-center gap-1 font-sans text-[10px] font-bold text-foreground/20 tabular-nums">
                          <span className="opacity-50">+</span>
                          {row!.roundsDiff}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
