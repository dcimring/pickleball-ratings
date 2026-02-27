"use client";

import { useEffect, useState, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { submitFeatureRequest } from './actions';
import { Search, Trophy, Users, User, Zap, ArrowUpRight, TrendingUp, TrendingDown, Minus, Send, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Ranking = {
  id: number;
  player_name: string;
  rank_position: number;
  rating: number;
  rounds_played: number;
  valid_from: string;
  is_current: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full mt-6 bg-volt hover:bg-volt/90 disabled:opacity-50 disabled:hover:bg-volt text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm flex items-center justify-center gap-2"
    >
      {pending ? (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-4 h-4 fill-background" />
        </motion.div>
      ) : <Send className="w-4 h-4" />}
      {pending ? "SENDING..." : "SUBMIT FEATURE REQUEST"}
    </button>
  );
}

export default function Dashboard() {
  const [singles, setSingles] = useState<Ranking[]>([]);
  const [doubles, setDoubles] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'rankings' | 'tourney' | 'feature-request'>('rankings');
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tourneyInput, setTourneyInput] = useState('');
  const [tourneyResults, setTourneyResults] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ranking; direction: 'asc' | 'desc' }>({
    key: 'rank_position',
    direction: 'asc'
  });

  const [formState, formAction] = useFormState(submitFeatureRequest, {});

  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => {
        setActiveView('rankings');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [singlesRes, doublesRes] = await Promise.all([
          supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true }),
          supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true })
        ]);

        if (singlesRes.error) {
          console.error('SUPABASE_SINGLES_ERROR:', singlesRes.error);
        }
        
        if (doublesRes.error) {
          console.error('SUPABASE_DOUBLES_ERROR:', doublesRes.error);
        }

        if (singlesRes.data) setSingles(singlesRes.data);
        if (doublesRes.data) setDoubles(doublesRes.data);
      } catch (err) {
        console.error('CRITICAL_FETCH_ERROR:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSort = (key: keyof Ranking) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTourneyCheck = () => {
    const names = tourneyInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const results = names.map(name => {
      const sMatch = singles.find(p => p.player_name.toLowerCase() === name.toLowerCase());
      const dMatch = doubles.find(p => p.player_name.toLowerCase() === name.toLowerCase());
      
      return {
        name,
        singles: sMatch ? { rank: sMatch.rank_position, rating: sMatch.rating } : null,
        doubles: dMatch ? { rank: dMatch.rank_position, rating: dMatch.rating } : null
      };
    });

    // Sort results by Doubles rank (lowest number first), unranked at the end
    results.sort((a, b) => {
      const rankA = a.doubles ? a.doubles.rank : Infinity;
      const rankB = b.doubles ? b.doubles.rank : Infinity;
      return rankA - rankB;
    });

    setTourneyResults(results);
  };

  const currentData = activeTab === 'doubles' ? doubles : singles;
  
  const sortedAndFilteredData = useMemo(() => {
    let data = [...currentData];
    
    // Filter
    if (searchQuery) {
      data = data.filter(p => 
        p.player_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    data.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [currentData, searchQuery, sortConfig]);

  const SortIndicator = ({ column }: { column: keyof Ranking }) => {
    if (sortConfig.key !== column) return <Minus className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? <TrendingUp className="w-3 h-3 text-volt" /> : <TrendingDown className="w-3 h-3 text-volt" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-12 h-12 text-volt fill-volt" />
        </motion.div>
        <p className="mt-4 font-display text-volt tracking-widest animate-pulse">LOADING COURT DATA...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-20 relative">
      {/* Navigation / Brand Bar */}
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-white/5 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-black text-xs tracking-[0.4em] text-white cursor-pointer"
            onClick={() => setActiveView('rankings')}
          >
            DINKDASH<span className="text-volt">.XYZ</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveView('rankings')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'rankings' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              RANKINGS
            </button>
            <button 
              onClick={() => setActiveView('tourney')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'tourney' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              TOURNEY CHECK
            </button>
            <button 
              onClick={() => setActiveView('feature-request')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'feature-request' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              SUGGEST FEATURE
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-volt p-2"
            >
              <Zap className={cn("w-5 h-5 transition-transform duration-300", isMobileMenuOpen ? "rotate-180" : "")} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-surface overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 text-left">
                <button 
                  onClick={() => { setActiveView('rankings'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'rankings' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  RANKINGS
                </button>
                <button 
                  onClick={() => { setActiveView('tourney'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'tourney' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  TOURNEY CHECK
                </button>
                <button 
                  onClick={() => { setActiveView('feature-request'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'feature-request' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  SUGGEST FEATURE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence mode="wait">
        {activeView === 'rankings' ? (
          <motion.div
            key="rankings-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header Section */}
            <header className="relative pt-6 pb-12 px-6 overflow-hidden text-left">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(223,255,0,0.15),transparent_50%)]" />
              
              <div className="max-w-6xl mx-auto relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-volt fill-volt" />
                      <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Cayman Islands</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
                      PICKLEBALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">RANKINGS</span>
                    </h1>
                  </div>

                  <div className="flex p-1 bg-surface rounded-xl border border-white/5">
                    <button 
                      onClick={() => setActiveTab('doubles')}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
                        activeTab === 'doubles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
                      )}
                    >
                      <Users className="w-4 h-4" /> DOUBLES
                    </button>
                    <button 
                      onClick={() => setActiveTab('singles')}
                      className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
                        activeTab === 'singles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
                      )}
                    >
                      <User className="w-4 h-4" /> SINGLES
                    </button>
                  </div>
                </motion.div>
              </div>
            </header>

            {/* Search & Stats */}
            <section className="px-6 mb-8 text-left">
              <div className="max-w-6xl mx-auto">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ghost/30 group-focus-within:text-volt transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search by player name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-volt/50 transition-all font-sans text-lg"
                  />
                </div>
              </div>
            </section>

            {/* Table Section */}
            <section className="px-6 text-left">
              <div className="max-w-6xl mx-auto">
                <div className="bg-surface/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                  <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-6 border-b border-white/5 font-display text-[10px] tracking-[0.3em] text-ghost/40 select-none">
                    <button 
                      onClick={() => handleSort('rank_position')}
                      className="col-span-3 md:col-span-2 flex items-center gap-1 md:gap-2 hover:text-ghost transition-colors group"
                    >
                      RANK <SortIndicator column="rank_position" />
                    </button>
                    <button 
                      onClick={() => handleSort('player_name')}
                      className="col-span-5 md:col-span-5 flex items-center gap-1 md:gap-2 hover:text-ghost transition-colors group"
                    >
                      PLAYER <SortIndicator column="player_name" />
                    </button>
                    <button 
                      onClick={() => handleSort('rounds_played')}
                      className="hidden md:flex col-span-2 items-center justify-end gap-2 hover:text-ghost transition-colors group text-right"
                    >
                      ROUNDS <SortIndicator column="rounds_played" />
                    </button>
                    <button 
                      onClick={() => handleSort('rating')}
                      className="col-span-4 md:col-span-3 flex items-center justify-end gap-1 md:gap-2 hover:text-ghost transition-colors group text-right"
                    >
                      RATING <SortIndicator column="rating" />
                    </button>
                  </div>

                  <div className="min-h-[400px]">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {sortedAndFilteredData.map((player, index) => (
                        <motion.div
                          layout
                          key={`${activeTab}-${player.player_name}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: Math.min(index * 0.01, 0.2),
                            layout: { duration: 0.4, ease: "easeInOut" } 
                          }}
                          className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-6 hover:bg-white/[0.02] transition-colors items-center group"
                        >
                          <div className="col-span-3 md:col-span-2 flex items-center gap-3">
                            <span className={cn(
                              "font-display text-xl md:text-2xl font-black",
                              index === 0 ? "text-volt" : "text-ghost/20"
                            )}>
                              {player.rank_position}
                            </span>
                          </div>
                          <div className="col-span-5 md:col-span-5">
                            <div className="font-sans font-bold text-base md:text-lg text-white group-hover:text-volt transition-colors">
                              {player.player_name}
                            </div>
                            <div className="flex items-center gap-2 mt-1 md:hidden">
                              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider text-ghost/40">
                                {player.rounds_played} Rounds
                              </span>
                            </div>
                          </div>
                          <div className="hidden md:block col-span-2 text-right">
                            <div className="font-display text-lg text-white/60 group-hover:text-white transition-colors">
                              {player.rounds_played}
                            </div>
                          </div>
                          <div className="col-span-4 md:col-span-3 text-right">
                            <div className="font-display text-lg md:text-xl text-white">
                              {player.rating.toFixed(3)}
                            </div>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-green-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TrendingUp className="w-3 h-3" />
                              STABLE
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        ) : activeView === 'tourney' ? (
          <motion.div
            key="tourney-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-6 pt-6 pb-12 text-left"
          >
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
                <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                  <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 mb-4 uppercase">Player List</label>
                  <textarea 
                    value={tourneyInput}
                    onChange={(e) => setTourneyInput(e.target.value)}
                    placeholder="Enter names (one per line)..."
                    className="w-full h-64 bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20 resize-none"
                  />
                  <button 
                    onClick={handleTourneyCheck}
                    disabled={!tourneyInput.trim()}
                    className="w-full mt-6 bg-volt hover:bg-volt/90 disabled:opacity-50 disabled:hover:bg-volt text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm"
                  >
                    CHECK PLAYERS
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-8">
                <div className="bg-surface/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[400px]">
                  {tourneyResults.length > 0 ? (
                    <div className="divide-y divide-white/5">
                      <div className="grid grid-cols-12 gap-4 px-8 py-6 font-display text-[10px] tracking-[0.3em] text-ghost/40">
                        <div className="col-span-6">PLAYER</div>
                        <div className="col-span-3 text-right">SINGLES</div>
                        <div className="col-span-3 text-right">DOUBLES</div>
                      </div>
                      <AnimatePresence mode="popLayout">
                        {tourneyResults.map((result, idx) => (
                          <motion.div 
                            key={`tourney-${result.name}-${idx}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.5) }}
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
          </motion.div>
        ) : (
          <motion.div
            key="feature-request-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-xl mx-auto px-6 pt-6 pb-12 text-left"
          >
            <div className="mb-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquarePlus className="w-5 h-5 text-volt" />
                <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Roadmap</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-white uppercase">
                SUGGEST A <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">FEATURE</span>
              </h1>
              <p className="mt-4 text-ghost/60 font-sans text-lg text-balance">
                Have an idea to make DinkDash better? Let us know what tools or data you want to see next.
              </p>
            </div>

            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
              {formState.success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center flex flex-col items-center"
                >
                  <CheckCircle2 className="w-16 h-16 text-volt mb-4" />
                  <h3 className="font-display text-2xl font-black text-white mb-2 tracking-tight">DINK RECEIVED!</h3>
                  <p className="text-ghost/60 font-sans">Thanks for the suggestion. Redirecting you back...</p>
                </motion.div>
              ) : (
                <form action={formAction} className="space-y-6">
                  {/* Honeypot */}
                  <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                  
                  <div className="space-y-2">
                    <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase ml-1">Your Name</label>
                    <input 
                      name="user_name"
                      required
                      placeholder="Enter your name"
                      className="w-full bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase ml-1">The Feature Idea</label>
                    <textarea 
                      name="details"
                      required
                      placeholder="Describe the feature and how it helps players..."
                      className="w-full h-48 bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20 resize-none"
                    />
                  </div>

                  {formState.error && (
                    <p className="text-red-400 text-xs font-sans text-center">{formState.error}</p>
                  )}

                  <SubmitButton />
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
