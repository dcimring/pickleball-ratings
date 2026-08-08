"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TourneyResult } from '@/lib/types';
import { PageHero } from '@/components/PageHero';
import { Spinner } from '@/components/Spinner';

interface TourneyCheckProps {
  input: string;
  onInputChange: (val: string) => void;
  onCheck: () => void;
  results: TourneyResult[];
  loading: boolean;
}

export function TourneyCheck({
  input,
  onInputChange,
  onCheck,
  results,
  loading,
}: TourneyCheckProps) {
  return (
    <div className="max-w-full mx-auto pb-20 text-left min-h-full bg-background">
      {/* Center Court Hero Header */}
      <PageHero
        eyebrow="Roster Analysis Tool"
        title={<>Tourney <br /> Check</>}
        className="mb-8"
      />

      <div className="max-w-6xl mx-auto px-6">
        <p className="text-foreground/40 max-w-xl font-medium text-lg text-balance mb-12">
          Paste a roster of player names to instantly retrieve their seed rankings and official ratings.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-muted p-1 rounded-[2.5rem] overflow-hidden">
          {/* Input Section */}
          <div className="lg:col-span-4 bg-secondary p-10 flex flex-col justify-between min-h-[500px]">
            <div className="space-y-8">
              <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/30 uppercase">Input Roster</span>
              <textarea 
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Paste names here..."
                className="w-full h-80 bg-background rounded-2xl p-6 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-sans text-foreground placeholder:text-foreground/20 font-medium resize-none text-lg"
              />
            </div>
            <button
              onClick={onCheck}
              disabled={!input.trim()}
              className="w-full mt-10 bg-primary hover:opacity-95 disabled:opacity-50 text-secondary font-sans font-bold py-5 rounded-2xl transition-all tracking-[0.2em] text-xs uppercase shadow-xl shadow-primary/10"
            >
              Execute Analysis
            </button>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-8 bg-secondary flex flex-col min-h-[500px]">
            {loading ? (
              <Spinner />
            ) : results.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-12 gap-4 px-10 py-10 font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/30 uppercase">
                  <div className="col-span-6">Player Name</div>
                  <div className="col-span-3 text-right">Singles</div>
                  <div className="col-span-3 text-right">Doubles</div>
                </div>
                <div className="flex flex-col gap-1 bg-muted flex-1">
                  <AnimatePresence mode="popLayout">
                    {results.map((result, idx) => (
                      <motion.div 
                        layout
                        key={`tourney-${result.name}`}
                        className={cn(
                          "grid grid-cols-12 gap-4 px-10 py-10 items-center group transition-colors",
                          idx % 2 === 0 ? "bg-secondary" : "bg-muted"
                        )}
                      >
                        <div className="col-span-6 font-sans font-bold text-xl text-foreground group-hover:text-primary transition-colors tracking-tight">{result.name}</div>
                        <div className="col-span-3 text-right">
                          {result.singles ? (
                            <div className="flex flex-col gap-1 items-end">
                              <span className="text-foreground font-display italic text-3xl tracking-tighter">#{result.singles.rank}</span>
                              <span className="text-foreground/20 font-bold text-[10px] tracking-widest uppercase tabular-nums">{result.singles.rating.toFixed(3)}</span>
                            </div>
                          ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                        </div>
                        <div className="col-span-3 text-right">
                          {result.doubles ? (
                            <div className="flex flex-col gap-1 items-end">
                              <span className="text-foreground font-display italic text-3xl tracking-tighter">#{result.doubles.rank}</span>
                              <span className="text-foreground/20 font-bold text-[10px] tracking-widest uppercase tabular-nums">{result.doubles.rating.toFixed(3)}</span>
                            </div>
                          ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-40 text-foreground/5 gap-10">
                <Users className="w-24 h-24 opacity-5" />
                <p className="font-sans font-bold tracking-[0.4em] text-[10px] uppercase opacity-30 text-foreground">Analysis Queue Empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
