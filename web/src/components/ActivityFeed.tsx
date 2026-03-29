"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Activity, History, Star, TrendingUp } from 'lucide-react';
import { ActivityTier } from '@/lib/types';
import { cn } from '@/lib/utils';
import { slugify } from '@/lib/slugify';

interface ActivityFeedProps {
  tiers: ActivityTier[];
  activeTab: 'doubles' | 'singles';
  onTabChange: (tab: 'doubles' | 'singles') => void;
  activitySort: 'rating' | 'date';
  onSortChange: (sort: 'rating' | 'date') => void;
  pulseStats: {
    activeCount: number;
    topGainerName: string;
    topGainerValue: number;
  } | null;
  loading: boolean;
}

export function ActivityFeed({
  tiers,
  activeTab,
  onTabChange,
  activitySort,
  onSortChange,
  pulseStats,
  loading,
}: ActivityFeedProps) {
  return (
    <div className="max-w-full mx-auto pb-20 text-left min-h-full bg-background">
      {/* Center Court Hero Header */}
      <header className="relative pt-24 pb-16 md:pt-32 md:pb-20 px-6 text-left bg-pressed-grass overflow-hidden mb-4 md:mb-12">
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
            className="flex flex-col md:flex-row md:items-end justify-between gap-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-tertiary px-3 py-1.5 rounded-full w-fit shadow-2xl shadow-black/20 border border-white/10 mb-6">
                <Star className="w-3.5 h-3.5 text-tertiary-foreground fill-tertiary-foreground" />
                <span className="text-tertiary-foreground font-sans font-bold tracking-[0.3em] text-[9px] uppercase">Live Tournament Feed</span>
              </div>
              <h1 className="text-6xl md:text-[7rem] font-display italic tracking-[-0.06em] text-secondary leading-[0.85] drop-shadow-sm">
                Court <br />
                Activity
              </h1>
            </div>

            <div className="flex p-1 bg-white/5 backdrop-blur-xl rounded-2xl h-fit border border-white/10 shadow-2xl">
              <button 
                onClick={() => onTabChange('doubles')}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-500 uppercase",
                  activeTab === 'doubles' ? "bg-secondary text-primary shadow-2xl scale-[1.02]" : "text-secondary/60 hover:text-secondary hover:bg-white/5"
                )}
              >
                <Users className="w-4 h-4" /> Doubles
              </button>
              <button 
                onClick={() => onTabChange('singles')}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl font-sans font-bold text-xs tracking-widest transition-all duration-500 uppercase",
                  activeTab === 'singles' ? "bg-secondary text-primary shadow-2xl scale-[1.02]" : "text-secondary/60 hover:text-secondary hover:bg-white/5"
                )}
              >
                <User className="w-4 h-4" /> Singles
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6">
        {/* Daily Pulse */}
        {pulseStats && (
          <div className="mb-6 md:mb-12 flex items-center gap-4 bg-muted rounded-2xl px-8 py-6 shadow-sm">
            <TrendingUp className="w-5 h-5 text-primary" />
            <p className="text-xs md:text-sm font-sans font-bold tracking-tight text-foreground/40 uppercase">
              <span className="text-foreground">{pulseStats.activeCount} Athletes</span> active this session
              <span className="mx-4 text-foreground/10">|</span>
              Biggest Gainer: <Link href={`/player/${slugify(pulseStats.topGainerName)}?tab=${activeTab}&sort=${activitySort}&from=activity`} className="text-foreground hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4 font-black">{pulseStats.topGainerName}</Link> 
              <span className="ml-3 text-primary">+{pulseStats.topGainerValue.toFixed(3)}</span>
            </p>
          </div>
        )}

        {/* Sort & Jump Section with Bridge */}
        <div className="bg-muted/50 rounded-2xl p-6 md:p-8 mb-10 md:mb-16">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex items-center gap-6 text-[9px] font-sans font-bold tracking-widest text-foreground/30">
              <span className="uppercase">Filter by:</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => onSortChange('date')}
                  className={cn(
                    "px-4 py-2 rounded-full transition-all font-bold",
                    activitySort === 'date' ? "bg-primary text-secondary" : "bg-muted text-foreground/40 hover:text-foreground"
                  )}
                >
                  Latest Matches
                </button>
                <button 
                  onClick={() => onSortChange('rating')}
                  className={cn(
                    "px-4 py-2 rounded-full transition-all font-bold",
                    activitySort === 'rating' ? "bg-primary text-secondary" : "bg-muted text-foreground/40 hover:text-foreground"
                  )}
                >
                  Biggest Movers
                </button>
              </div>
            </div>

            {!loading && tiers.length > 0 && (
              <div className="flex flex-wrap items-center gap-6 text-[9px] font-sans font-bold tracking-[0.2em]">
                {tiers.map((tier) => (
                  <button
                    key={tier.title}
                    onClick={() => {
                      const element = document.getElementById(`tier-${tier.title.replace(/\s+/g, '-').toLowerCase()}`);
                      if (element) {
                        const container = element.closest('.overflow-y-auto');
                        if (container) {
                          const offset = 80;
                          const elementTop = element.offsetTop;
                          container.scrollTo({
                            top: elementTop - offset,
                            behavior: 'smooth'
                          });
                        }
                      }
                    }}
                    className="text-foreground/30 hover:text-primary transition-all uppercase py-1 border-b-2 border-transparent hover:border-primary"
                  >
                    {tier.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-12 md:space-y-16">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-40 bg-muted rounded-3xl">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-12 h-12 text-primary/10 fill-primary/10" />
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col gap-12 md:gap-16">
              {tiers.map((tier) => (
                <div 
                  key={`${activeTab}-${tier.title}-${activitySort}`}
                  id={`tier-${tier.title.replace(/\s+/g, '-').toLowerCase()}`} 
                  className="space-y-6 md:space-y-8 scroll-mt-32"
                >
                  <div className="flex items-center gap-6">
                    <h2 className="font-display italic text-2xl md:text-4xl tracking-tighter text-foreground whitespace-nowrap">{tier.title}</h2>
                    <div className="h-0.5 w-full bg-muted" />
                  </div>
                  
                  <div className="space-y-1 bg-muted p-1 rounded-[2.5rem] overflow-hidden">
                    {tier.items.map((item, idx) => (
                      <div 
                        key={`${item.player_name}-${item.date}-${idx}`}
                        className="bg-secondary p-6 md:p-10 hover:bg-background transition-all duration-500 group relative overflow-hidden hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5 active:scale-100"
                      >
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                          <h3 className="font-sans font-bold text-2xl md:text-4xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                            <Link href={`/player/${slugify(item.player_name)}?tab=${activeTab}&sort=${activitySort}&from=activity`} className="hover:text-primary transition-colors">
                              {item.player_name}
                            </Link>
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                          {/* Rating Shift */}
                          <div className="space-y-2 md:space-y-4">
                            <span className="text-[9px] font-sans font-bold text-foreground/20 tracking-[0.3em] uppercase">Rating Shift</span>
                            <div className="flex items-center gap-3">
                              <span className="text-foreground font-display italic text-2xl md:text-3xl tracking-tighter tabular-nums">{item.current.rating.toFixed(3)}</span>
                              <span className={cn(
                                "text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest",
                                item.ratingDiff > 0 ? "bg-primary/10 text-primary" : 
                                item.ratingDiff < 0 ? "bg-destructive/10 text-destructive" : 
                                "bg-muted text-foreground/40"
                              )}>
                                {item.ratingDiff > 0 ? `+${item.ratingDiff.toFixed(3)}` : 
                                 item.ratingDiff < 0 ? item.ratingDiff.toFixed(3) : 
                                 'Stable'}
                              </span>
                            </div>
                          </div>

                          {/* Rounds Played */}
                          {item.roundsDiff !== 0 && (
                            <div className="space-y-2 md:space-y-4">
                              <span className="text-[9px] font-sans font-bold text-foreground/20 tracking-[0.3em] uppercase">Rounds Played</span>
                              <div className="flex items-center gap-3">
                                <span className="text-foreground font-display italic text-2xl md:text-3xl tracking-tighter tabular-nums">{item.current.rounds_played}</span>
                                <span className="text-[9px] font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary uppercase tracking-widest">
                                  +{item.roundsDiff} Sets
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Rank Movement */}
                          <div className="space-y-2 md:space-y-4">
                            <span className="text-[9px] font-sans font-bold text-foreground/20 tracking-[0.3em] uppercase">Rank Movement</span>
                            <div className="flex items-center gap-3">
                              <span className="text-foreground font-display italic text-2xl md:text-3xl tracking-tighter tabular-nums">#{item.current.rank_position}</span>
                              <span className={cn(
                                "text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest",
                                item.rankDiff > 0 ? "bg-primary/10 text-primary" : 
                                item.rankDiff < 0 ? "bg-destructive/10 text-destructive" : 
                                "bg-muted text-foreground/40"
                              )}>
                                {item.rankDiff > 0 ? `Up ${item.rankDiff}` : 
                                 item.rankDiff < 0 ? `Down ${Math.abs(item.rankDiff)}` : 
                                 'Stable'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Asymmetric Date: Absolute positioned on desktop */}
                        <div className="mt-8 md:mt-0 md:absolute md:bottom-10 md:right-10">
                          <span className="font-sans text-[9px] font-bold text-foreground/40 group-hover:text-foreground/60 transition-colors uppercase tracking-[0.4em]">
                            {new Date(item.date).toLocaleDateString('en-KY', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && tiers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-muted rounded-2xl">
              <History className="w-12 h-12 text-foreground/5 mb-4" />
              <p className="font-sans font-bold text-foreground/20 tracking-[0.4em] text-[9px] uppercase">Archive empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
