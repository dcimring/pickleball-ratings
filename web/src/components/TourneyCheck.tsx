"use client";

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Minus } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-20 text-left min-h-full">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-volt" />
          <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Advanced Tools</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
          TOURNEY <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">CHECK</span>
        </h1>
        <p className="mt-4 text-ghost/60 max-w-2xl font-sans text-lg text-balance">
          Paste a list of player names below to instantly retrieve their current rankings and ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm text-left scroll-mt-20">
            <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 mb-4 uppercase">Player List</label>
            <textarea 
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={(e) => {
                if (window.innerWidth < 768) {
                  setTimeout(() => {
                    e.target.closest('.scroll-mt-20')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              placeholder="Enter names (one per line)..."
              className="w-full h-64 bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20 resize-none"
            />
            <button 
              onClick={() => {
                onCheck();
                if (window.innerWidth < 1024) {
                  setTimeout(() => {
                    resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }
              }}
              disabled={!input.trim()}
              className="w-full mt-6 bg-volt hover:bg-volt/90 disabled:opacity-50 disabled:hover:bg-volt text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm"
            >
              CHECK PLAYERS
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div ref={resultsSectionRef} className="lg:col-span-8 scroll-mt-20">
          <div className="bg-surface/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-12 h-12 text-volt fill-volt" />
                </motion.div>
                <p className="mt-4 font-display text-volt tracking-widest animate-pulse text-[10px]">LOADING COURT DATA...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="divide-y divide-white/5">
                <div className="grid grid-cols-12 gap-4 px-8 py-6 font-display text-[10px] tracking-[0.3em] text-ghost/40">
                  <div className="col-span-6">PLAYER</div>
                  <div className="col-span-3 text-right">SINGLES</div>
                  <div className="col-span-3 text-right">DOUBLES</div>
                </div>
                <AnimatePresence mode="popLayout">
                  {results.map((result) => (
                    <motion.div 
                      layout
                      key={`tourney-${result.name}`}
                      className="grid grid-cols-12 gap-4 px-8 py-6 items-center group hover:bg-white/[0.02]"
                    >
                      <div className="col-span-6 font-sans font-bold text-white group-hover:text-volt transition-colors">{result.name}</div>
                      <div className="col-span-3 text-right">
                        {result.singles ? (
                          <div className="flex flex-col">
                            <span className="text-volt font-display text-xs">#{result.singles.rank}</span>
                            <span className="text-ghost/40 text-[10px]">{result.singles.rating.toFixed(3)}</span>
                          </div>
                        ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                      </div>
                      <div className="col-span-3 text-right">
                        {result.doubles ? (
                          <div className="flex flex-col">
                            <span className="text-volt font-display text-xs">#{result.doubles.rank}</span>
                            <span className="text-ghost/40 text-[10px]">{result.doubles.rating.toFixed(3)}</span>
                          </div>
                        ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-ghost/20">
                <Users className="w-16 h-16 mb-4 opacity-10" />
                <p className="font-display tracking-widest text-sm">NO RESULTS YET</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
