"use client";

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, User, Zap, TrendingUp, TrendingDown, Minus, X, Star, ChevronDown } from 'lucide-react';
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
  const [visibleCount, setVisibleCount] = useState(50);

  // Reset pagination when filter/sort state changes
  useEffect(() => {
    setVisibleCount(50);
  }, [activeTab, searchQuery, sortConfig]);

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

  const visibleData = useMemo(() => {
    return sortedAndFilteredData.slice(0, visibleCount);
  }, [sortedAndFilteredData, visibleCount]);

  const hasMore = visibleCount < sortedAndFilteredData.length;

  return (
    <div className="pb-20 min-h-full bg-background">
      {/* Center Court Hero Header */}
      <header className="relative pt-24 pb-16 md:pt-32 md:pb-20 px-6 text-left bg-primary overflow-hidden">
        {/* Pressed Grass Texture Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
        
        {/* Kinetic Cut Accent */}
        <div 
          className="absolute bottom-0 left-0 w-full h-12 bg-background" 
          style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="text-secondary font-sans font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Community Dashboard</span>
              </div>
              <h1 className="text-6xl md:text-[7rem] font-display italic tracking-tighter text-secondary leading-[0.85]">
                Cayman <br />
                Rankings
              </h1>
            </div>

            <div className="flex p-1 bg-white/10 backdrop-blur-md rounded-2xl h-fit">
              <button 
                onClick={() => onTabChange('doubles')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-300 uppercase",
                  activeTab === 'doubles' ? "bg-secondary text-primary shadow-xl" : "text-secondary/60 hover:text-secondary"
                )}
              >
                <Users className="w-4 h-4" /> Doubles
              </button>
              <button 
                onClick={() => onTabChange('singles')}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-300 uppercase",
                  activeTab === 'singles' ? "bg-secondary text-primary shadow-xl" : "text-secondary/60 hover:text-secondary"
                )}
              >
                <User className="w-4 h-4" /> Singles
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Search Bridge */}
      <section ref={searchSectionRef} className="sticky top-16 md:top-20 z-40 px-6 py-0 -mt-6 md:-mt-8 text-left transition-all overflow-visible mb-6">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="relative group shadow-2xl shadow-primary/20 rounded-[2.5rem]">
            <div className="absolute left-8 inset-y-0 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-primary group-focus-within:scale-110 transition-transform" />
            </div>
            <input 
              type="text"
              placeholder="Search by player name"
              value={searchQuery}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onSearchChange('');
                }
              }}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-secondary rounded-[2.5rem] py-6 pl-16 pr-14 outline-none focus:ring-8 focus:ring-primary/5 transition-all font-sans text-lg text-foreground placeholder:text-foreground/20"
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
                <>
                  {visibleData.map((player) => (
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
                  ))}

                  {/* Show More Button */}
                  {hasMore && (
                    <div className="py-12 flex justify-center">
                      <button
                        onClick={() => setVisibleCount(prev => prev + 50)}
                        className="group flex flex-col items-center gap-4 transition-all"
                      >
                        <div className="px-10 py-5 bg-primary text-secondary font-sans font-bold text-xs tracking-[0.2em] uppercase rounded-2xl shadow-xl shadow-primary/10 group-hover:opacity-95 active:scale-95 transition-all">
                          Show More Results
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                          <ChevronDown className="w-5 h-5 animate-bounce" />
                          <span className="text-[10px] font-sans font-bold tracking-widest uppercase">
                            {sortedAndFilteredData.length - visibleCount} more athletes remaining
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
