"use client";

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, User, Zap, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';
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
    <div className="pb-[80vh] min-h-full">
      {/* Header Section */}
      <header className="relative pt-24 pb-12 px-6 overflow-hidden text-left">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary fill-primary" />
                <span className="text-primary font-display font-bold tracking-widest text-sm uppercase">Cayman Islands</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.9]">
                PICKLEBALL <br />
                <span className="text-primary">RANKINGS</span>
              </h1>
            </div>

            <div className="flex p-1 bg-secondary rounded-xl border border-border">
              <button 
                onClick={() => onTabChange('doubles')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-display font-bold text-sm tracking-wider transition-all duration-300",
                  activeTab === 'doubles' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="w-4 h-4" /> DOUBLES
              </button>
              <button 
                onClick={() => onTabChange('singles')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-lg font-display font-bold text-sm tracking-wider transition-all duration-300",
                  activeTab === 'singles' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="w-4 h-4" /> SINGLES
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Stats - Sticky on scroll */}
      <section ref={searchSectionRef} className="sticky top-16 md:top-20 z-40 px-6 py-4 mb-2 bg-background/95 backdrop-blur-md border-b border-border text-left transition-all">
        <div className="max-w-6xl mx-auto">
          <div className="relative group">
            <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search by player name..."
              value={searchQuery}
              onFocus={() => {
                if (window.innerWidth < 768 && searchSectionRef.current) {
                  const header = searchSectionRef.current.previousElementSibling as HTMLElement;
                  const dockingPoint = header ? header.offsetHeight : 0;
                  const container = searchSectionRef.current.closest('.overflow-y-auto');
                  if (container && container.scrollTop < dockingPoint) {
                    setTimeout(() => {
                      container.scrollTop = dockingPoint;
                    }, 0);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onSearchChange('');
                }
              }}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-secondary border border-border rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-base text-foreground placeholder:text-muted-foreground/50"
            />
            <AnimatePresence>
              {searchQuery && (
                <div className="absolute right-2 inset-y-0 flex items-center">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => onSearchChange('')}
                    className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-full transition-colors group/clear"
                  >
                    <X className="w-5 h-5 text-muted-foreground group-hover/clear:text-primary transition-colors" />
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
          <div className="bg-secondary/30 border border-border rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-6 border-b border-border font-display text-[10px] font-bold tracking-[0.3em] text-muted-foreground select-none uppercase">
              <button 
                onClick={() => onSort('rank_position')}
                className="col-span-3 md:col-span-2 flex items-center gap-1 md:gap-2 hover:text-foreground transition-colors group"
              >
                RANK <SortIndicator column="rank_position" />
              </button>
              <button 
                onClick={() => onSort('player_name')}
                className="col-span-5 md:col-span-5 flex items-center gap-1 md:gap-2 hover:text-foreground transition-colors group"
              >
                PLAYER <SortIndicator column="player_name" />
              </button>
              <button 
                onClick={() => onSort('rounds_played')}
                className="hidden md:flex col-span-2 items-center justify-end gap-2 hover:text-foreground transition-colors group text-right"
              >
                ROUNDS <SortIndicator column="rounds_played" />
              </button>
              <button 
                onClick={() => onSort('rating')}
                className="col-span-4 md:col-span-3 flex items-center justify-end gap-1 md:gap-2 hover:text-foreground transition-colors group text-right"
              >
                RATING <SortIndicator column="rating" />
              </button>
            </div>

            <div className="min-h-[400px] flex flex-col">
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
              ) : (
                sortedAndFilteredData.map((player) => (
                  <motion.div
                    layout
                    key={`${activeTab}-${player.player_name}`}
                    transition={{ 
                      layout: { duration: 0.4, ease: "easeInOut" } 
                    }}
                    className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-6 hover:bg-primary/[0.02] transition-colors items-center group border-b border-border/50 last:border-0"
                  >
                    <div className="col-span-3 md:col-span-2 flex items-center gap-3">
                      <span className={cn(
                        "font-display text-xl md:text-3xl font-bold tracking-tighter",
                        player.rank_position === 1 ? "text-primary" : "text-muted-foreground/30"
                      )}>
                        {player.rank_position}
                      </span>
                    </div>
                    <div className="col-span-5 md:col-span-5">
                      <Link 
                        href={`/player/${slugify(player.player_name)}?tab=${activeTab}`}
                        className="font-sans text-base md:text-lg text-foreground hover:text-primary transition-colors text-left"
                      >
                        {player.player_name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded uppercase tracking-wider text-muted-foreground">
                          {player.rounds_played} Rounds
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block col-span-2 text-right">
                      <div className="font-display font-medium text-lg text-muted-foreground group-hover:text-foreground transition-colors">
                        {player.rounds_played}
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-3 text-right">
                      <div className="font-display font-bold text-lg md:text-2xl text-foreground">
                        {player.rating.toFixed(3)}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrendingUp className="w-3 h-3" />
                        STABLE
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
