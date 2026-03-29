"use client";

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Minus, Zap, Star } from 'lucide-react';
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
    <div className="max-w-full mx-auto pb-20 text-left min-h-full bg-background">
      {/* Center Court Hero Header */}
      <header className="relative pt-24 pb-16 md:pt-32 md:pb-20 px-6 text-left bg-pressed-grass overflow-hidden mb-12">
        {/* Editorial Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        {/* Kinetic Cut Accent */}
        <div 
          className="absolute bottom-0 left-0 w-full h-12 bg-background" 
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-secondary font-sans font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Roster Analysis Tool</span>
            </div>
            <h1 className="text-6xl md:text-[7rem] font-display italic tracking-[-0.06em] text-secondary leading-[0.85] drop-shadow-sm">
              Tourney <br />
              Check
            </h1>
          </motion.div>
        </div>
      </header>

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
              onClick={() => {
                onCheck();
              }}
              disabled={!input.trim()}
              className="w-full mt-10 bg-primary hover:opacity-95 disabled:opacity-50 text-secondary font-sans font-bold py-5 rounded-2xl transition-all tracking-[0.2em] text-xs uppercase shadow-xl shadow-primary/10"
            >
              Execute Analysis
            </button>
          </div>

          {/* Results Section */}
          <div ref={resultsSectionRef} className="lg:col-span-8 bg-secondary flex flex-col min-h-[500px]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-40">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-12 h-12 text-primary/10 fill-primary/10" />
                </motion.div>
              </div>
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
