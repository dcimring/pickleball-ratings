"use client";

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Minus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourneyCheckProps {
  input: string;
  onInputChange: (val: string) => void;
  onCheck: () => void;
  results: any[];
  loading: boolean;
}

export function TourneyCheck({
  input,
  onInputChange,
  onCheck,
  results,
  loading,
}: TourneyCheckProps) {
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left min-h-full">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-primary font-display font-bold tracking-widest text-sm uppercase">Advanced Tools</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.9] uppercase">
          TOURNEY <br />
          CHECK
        </h1>
        <p className="mt-6 text-muted-foreground max-w-2xl font-sans text-lg text-balance">
          Paste a list of player names below to instantly retrieve their current rankings and ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-secondary/30 border border-border/10 rounded-3xl p-8 backdrop-blur-sm text-left">
            <label className="block font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground mb-6 uppercase opacity-50">Player List</label>
            <textarea 
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter names (one per line)..."
              className="w-full h-72 bg-background border border-border/10 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-foreground placeholder:text-muted-foreground/30 font-medium resize-none"
            />
            <button 
              onClick={() => {
                onCheck();
              }}
              disabled={!input.trim()}
              className="w-full mt-8 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-display font-bold py-5 rounded-2xl transition-all tracking-[0.2em] text-sm shadow-lg shadow-primary/20"
            >
              CHECK PLAYERS
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultsSectionRef} className="lg:col-span-8">
          <div className="bg-secondary/30 border border-border/10 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[500px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-12 h-12 text-primary fill-primary" />
                </motion.div>
                <p className="mt-4 font-display text-primary font-bold tracking-widest animate-pulse text-[10px]">LOADING COURT DATA...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-12 gap-4 px-10 py-6 font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase opacity-50">
                  <div className="col-span-6">Player</div>
                  <div className="col-span-3 text-right">Singles</div>
                  <div className="col-span-3 text-right">Doubles</div>
                </div>
                <AnimatePresence mode="popLayout">
                  {results.map((result) => (
                    <motion.div 
                      layout
                      key={`tourney-${result.name}`}
                      className="grid grid-cols-12 gap-4 px-10 py-8 items-center group hover:bg-primary/[0.02] transition-colors"
                    >
                      <div className="col-span-6 font-sans font-bold text-lg text-foreground group-hover:text-primary transition-colors">{result.name}</div>
                      <div className="col-span-3 text-right">
                        {result.singles ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-primary font-display font-bold text-lg tracking-tight">#{result.singles.rank}</span>
                            <span className="text-muted-foreground font-bold text-xs opacity-50">{result.singles.rating.toFixed(3)}</span>
                          </div>
                        ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                      </div>
                      <div className="col-span-3 text-right">
                        {result.doubles ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-primary font-display font-bold text-lg tracking-tight">#{result.doubles.rank}</span>
                            <span className="text-muted-foreground font-bold text-xs opacity-50">{result.doubles.rating.toFixed(3)}</span>
                          </div>
                        ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted-foreground/10">
                <Users className="w-20 h-20 mb-6 opacity-5" />
                <p className="font-display font-bold tracking-[0.4em] text-sm uppercase">No results yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
