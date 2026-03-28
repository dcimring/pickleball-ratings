"use client";

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, User, Zap, TrendingUp, TrendingDown, Minus, X, Star } from 'lucide-react';
import { Ranking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';

interface RankingTableProps {
  data: Ranking[];
  activeTab: 'doubles' | 'singles';
  onTabChange: (tab: 'doubles' | 'singles') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortConfig: { key: keyof Ranking; direction: 'asc' | 'desc' };
  onSort: (key: keyof Ranking) => void;
  loading: boolean;
}

export function RankingTable({
  data,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSort,
  loading,
}: RankingTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLElement>(null);

  const SortIndicator = ({ column }: { column: keyof Ranking }) => {
    if (sortConfig.key !== column) return <Minus className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-primary" />;
  };

  const sortedAndFilteredData = useMemo(() => {
    let filtered = [...data];
    
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.player_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchQuery, sortConfig]);

  return (
    <div className="pb-20 min-h-full bg-background">
      {/* Header Section */}
      <header className="relative pt-24 pb-8 px-6 text-left">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-primary font-sans font-bold tracking-[0.2em] text-[10px] uppercase">Official Community Dashboard</span>
              </div>
              <h1 className="text-6xl md:text-[7rem] font-display italic tracking-tighter text-foreground leading-[0.85]">
                Cayman <br />
                Rankings
              </h1>
            </div>

            <div className="flex p-1.5 bg-muted rounded-2xl shadow-inner">
              <button 
                onClick={() => onTabChange('doubles')}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-300 uppercase",
                  activeTab === 'doubles' ? "bg-secondary text-foreground shadow-sm" : "text-foreground/40 hover:text-foreground"
                )}
              >
                <Users className="w-4 h-4" /> Doubles
              </button>
              <button 
                onClick={() => onTabChange('singles')}
                className={cn(
                  "flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-300 uppercase",
                  activeTab === 'singles' ? "bg-secondary text-foreground shadow-sm" : "text-foreground/40 hover:text-foreground"
                )}
              >
                <User className="w-4 h-4" /> Singles
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Stats - Sticky on scroll */}
      <section ref={searchSectionRef} className="sticky top-16 md:top-20 z-40 px-6 py-6 bg-secondary/80 backdrop-blur-xl text-left transition-all overflow-hidden mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="relative group">
            <div className="absolute left-6 inset-y-0 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Find a Player..."
              value={searchQuery}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onSearchChange('');
                }
              }}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-background rounded-[2rem] py-5 pl-14 pr-14 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-sans text-lg text-foreground placeholder:text-foreground/20"
            />
            <AnimatePresence>
              {searchQuery && (
                <div className="absolute right-3 inset-y-0 flex items-center">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => onSearchChange('')}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-full transition-colors group/clear"
                  >
                    <X className="w-5 h-5 text-foreground/40 group-hover/clear:text-primary transition-colors" />
                  </motion.button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="px-6 text-left">
        <div className="max-w-6xl mx-auto">
          <div className="overflow-hidden">
            <div className="grid grid-cols-12 gap-2 md:gap-4 px-8 py-8 font-sans text-[10px] font-bold tracking-[0.3em] text-foreground/30 select-none uppercase">
              <button 
                onClick={() => onSort('rank_position')}
                className="col-span-3 md:col-span-2 flex items-center gap-2 hover:text-foreground transition-colors group"
              >
                Rank <SortIndicator column="rank_position" />
              </button>
              <button 
                onClick={() => onSort('player_name')}
                className="col-span-5 md:col-span-5 flex items-center gap-2 hover:text-foreground transition-colors group"
              >
                Player <SortIndicator column="player_name" />
              </button>
              <button 
                onClick={() => onSort('rounds_played')}
                className="hidden md:flex col-span-2 items-center justify-end gap-2 hover:text-foreground transition-colors group text-right"
              >
                Rounds <SortIndicator column="rounds_played" />
              </button>
              <button 
                onClick={() => onSort('rating')}
                className="col-span-4 md:col-span-3 flex items-center justify-end gap-2 hover:text-foreground transition-colors group text-right"
              >
                Rating <SortIndicator column="rating" />
              </button>
            </div>

            <div className="min-h-[400px] flex flex-col gap-1">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-40">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-12 h-12 text-primary/10 fill-primary/10" />
                  </motion.div>
                </div>
              ) : (
                sortedAndFilteredData.map((player) => (
                  <motion.div
                    layout
                    key={`${activeTab}-${player.player_name}`}
                    className={cn(
                      "grid grid-cols-12 gap-2 md:gap-4 px-8 py-8 items-center group transition-all duration-300 relative rounded-2xl",
                      player.rank_position % 2 === 0 ? "bg-muted" : "bg-secondary"
                    )}
                  >
                    {/* Wimbledon Stripe */}
                    {player.rank_position === 1 && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-tertiary rounded-r-full" />
                    )}
                    
                    <div className="col-span-3 md:col-span-2 flex items-center gap-4">
                      <span className={cn(
                        "font-display text-2xl md:text-5xl tracking-tighter tabular-nums italic",
                        player.rank_position <= 3 ? "text-primary" : "text-foreground/10"
                      )}>
                        {player.rank_position}
                      </span>
                    </div>
                    <div className="col-span-5 md:col-span-5">
                      <Link 
                        href={`/player/${slugify(player.player_name)}?tab=${activeTab}`}
                        className="font-sans text-lg md:text-xl font-semibold text-foreground hover:text-primary transition-colors text-left tracking-tight"
                      >
                        {player.player_name}
                      </Link>
                    </div>
                    <div className="hidden md:block col-span-2 text-right">
                      <div className="font-sans font-medium text-xl text-foreground/40 group-hover:text-foreground transition-colors">
                        {player.rounds_played}
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-3 text-right">
                      <div className="font-sans font-bold text-xl md:text-3xl text-foreground tabular-nums tracking-tighter">
                        {player.rating.toFixed(3)}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
