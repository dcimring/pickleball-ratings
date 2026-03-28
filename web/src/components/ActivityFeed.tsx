"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, User, Zap, ArrowUpRight, Activity, History, Star, TrendingUp } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left min-h-full bg-background">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-primary font-sans font-bold tracking-[0.2em] text-[10px] uppercase">Live Tournament Feed</span>
          </div>
          <h1 className="text-6xl md:text-[7rem] font-display italic tracking-tighter text-foreground leading-[0.85]">
            Court <br />
            Activity
          </h1>
          <p className="text-foreground/40 max-w-xl font-medium text-lg text-balance">
            Real-time movement and performance tracking across the Cayman Islands Pickleball network.
          </p>
        </div>

        <div className="flex p-1.5 bg-muted rounded-2xl shadow-inner h-fit">
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

      {/* Daily Pulse */}
      {pulseStats && (
        <div className="mb-12 flex items-center gap-4 bg-muted rounded-2xl px-8 py-6 shadow-sm">
          <TrendingUp className="w-5 h-5 text-primary" />
          <p className="text-xs md:text-sm font-sans font-bold tracking-tight text-foreground/40 uppercase">
            <span className="text-foreground">{pulseStats.activeCount} Athletes</span> active this session
            <span className="mx-4 text-foreground/10">|</span>
            Leader: <Link href={`/player/${slugify(pulseStats.topGainerName)}?tab=${activeTab}&sort=${activitySort}&from=activity`} className="text-foreground hover:text-primary transition-colors underline decoration-primary/20 underline-offset-4 font-black">{pulseStats.topGainerName}</Link> 
            <span className="ml-3 text-primary">+{pulseStats.topGainerValue.toFixed(3)}</span>
          </p>
        </div>
      )}

      {/* Sort & Jump Section */}
      <div className="flex flex-col gap-8 mb-16">
        <div className="flex items-center gap-6 text-[10px] font-sans font-bold tracking-widest text-foreground/30">
          <span className="uppercase">Filter by:</span>
          <div className="flex gap-3">
            <button 
              onClick={() => onSortChange('date')}
              className={cn(
                "px-6 py-3 rounded-full transition-all font-bold",
                activitySort === 'date' ? "bg-primary text-secondary" : "bg-muted text-foreground/40 hover:text-foreground"
              )}
            >
              Latest Matches
            </button>
            <button 
              onClick={() => onSortChange('rating')}
              className={cn(
                "px-6 py-3 rounded-full transition-all font-bold",
                activitySort === 'rating' ? "bg-primary text-secondary" : "bg-muted text-foreground/40 hover:text-foreground"
              )}
            >
              Power Movers
            </button>
          </div>
        </div>

        {!loading && tiers.length > 0 && (
          <div className="flex flex-wrap items-center gap-8 text-[10px] font-sans font-bold tracking-[0.2em]">
            {tiers.map((tier) => (
              <button
                key={tier.title}
                onClick={() => {
                  const element = document.getElementById(`tier-${tier.title.replace(/\s+/g, '-').toLowerCase()}`);
                  if (element) {
                    const container = element.closest('.overflow-y-auto');
                    if (container) {
                      const offset = 100;
                      const elementTop = element.offsetTop;
                      container.scrollTo({
                        top: elementTop - offset,
                        behavior: 'smooth'
                      });
                    }
                  }
                }}
                className="text-foreground/30 hover:text-primary transition-all uppercase py-2 border-b-2 border-transparent hover:border-primary"
              >
                {tier.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-24">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-40 bg-muted rounded-3xl">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-12 h-12 text-primary/10 fill-primary/10" />
            </motion.div>
          </div>
        ) : tiers.length > 0 ? (
          tiers.map((tier) => (
            <div key={tier.title} id={`tier-${tier.title.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-12 scroll-mt-32">
              <div className="flex items-center gap-6">
                <h2 className="font-display italic text-4xl tracking-tighter text-foreground whitespace-nowrap">{tier.title}</h2>
                <div className="h-0.5 w-full bg-muted" />
              </div>
              
              <div className="space-y-1 bg-muted p-1 rounded-[2.5rem] overflow-hidden">
                {tier.items.map((item) => (
                  <motion.div 
                    layout
                    key={`${item.player_name}-${item.date}`}
                    className="bg-secondary p-10 hover:bg-background transition-colors group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="font-display italic text-4xl tracking-tighter text-foreground">
                        <Link href={`/player/${slugify(item.player_name)}?tab=${activeTab}&sort=${activitySort}&from=activity`} className="hover:text-primary transition-colors">
                          {item.player_name}
                        </Link>
                      </h3>
                      <span className="font-sans text-[10px] font-bold text-foreground/20 uppercase tracking-[0.4em]">
                        {new Date(item.date).toLocaleDateString('en-KY', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                      {/* Rating Change */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-sans font-bold text-foreground/20 tracking-[0.3em] uppercase">Rating Shift</span>
                        <div className="flex items-center gap-4">
                          <span className="text-foreground font-display italic text-3xl tracking-tighter tabular-nums">{item.current.rating.toFixed(3)}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest",
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

                      {/* Rounds Change */}
                      {item.roundsDiff !== 0 && (
                        <div className="space-y-4">
                          <span className="text-[10px] font-sans font-bold text-foreground/20 tracking-[0.3em] uppercase">Session Play</span>
                          <div className="flex items-center gap-4">
                            <span className="text-foreground font-display italic text-3xl tracking-tighter tabular-nums">{item.current.rounds_played}</span>
                            <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary uppercase tracking-widest">
                              +{item.roundsDiff} Sets
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rank Change */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-sans font-bold text-foreground/20 tracking-[0.3em] uppercase">Seed Movement</span>
                        <div className="flex items-center gap-4">
                          <span className="text-foreground font-display italic text-3xl tracking-tighter tabular-nums">#{item.current.rank_position}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest",
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
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-muted rounded-3xl">
            <History className="w-16 h-16 text-foreground/5 mb-6" />
            <p className="font-sans font-bold text-foreground/20 tracking-[0.4em] text-[10px] uppercase">Archive empty — no recent movements</p>
          </div>
        )}
      </div>
    </div>
  );
}
