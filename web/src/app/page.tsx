"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Search, Trophy, Users, User, Zap, ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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

export default function Dashboard() {
  const [singles, setSingles] = useState<Ranking[]>([]);
  const [doubles, setDoubles] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ranking; direction: 'asc' | 'desc' }>({
    key: 'rank_position',
    direction: 'asc'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [singlesRes, doublesRes] = await Promise.all([
          supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true }),
          supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true })
        ]);

        if (singlesRes.error) {
          console.error('SUPABASE_SINGLES_ERROR:', {
            message: singlesRes.error.message,
            details: singlesRes.error.details,
            hint: singlesRes.error.hint,
            code: singlesRes.error.code
          });
        }
        
        if (doublesRes.error) {
          console.error('SUPABASE_DOUBLES_ERROR:', {
            message: doublesRes.error.message,
            details: doublesRes.error.details,
            hint: doublesRes.error.hint,
            code: doublesRes.error.code
          });
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
            className="font-display font-black text-xs tracking-[0.4em] text-white"
          >
            DINKDASH<span className="text-volt">.XYZ</span>
          </motion.div>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-display tracking-widest text-ghost/40 hidden sm:block uppercase">Your Pickleball Dashboard</span>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <header className="relative pt-6 pb-12 px-6 overflow-hidden">
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
                <span className="text-volt font-display tracking-[0.2em] text-sm">CAYMAN ISLANDS</span>
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
      <section className="px-6 mb-8">
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
      <section className="px-6">
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
    </main>
  );
}
