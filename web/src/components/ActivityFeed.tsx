"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, User, Zap, ArrowUpRight, Activity, History } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left min-h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="text-primary font-display font-bold tracking-widest text-sm uppercase">Live Feed</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.9]">
            RECENT <br />
            <span className="text-primary">ACTIVITY</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl font-sans text-lg text-balance">
            Track the latest moves and matches across the Cayman Islands.
          </p>
        </div>

        <div className="flex p-1 bg-secondary rounded-xl border border-border w-fit h-fit">
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

      {/* Sort Toggles */}
      <div className="flex items-center gap-4 mb-8 text-[10px] font-display font-bold tracking-widest text-muted-foreground">
        <span className="uppercase">Sort by:</span>
        <div className="flex gap-2">
          <button 
            onClick={() => onSortChange('date')}
            className={cn(
              "px-4 py-2 rounded-full border transition-all font-bold",
              activitySort === 'date' ? "bg-primary/10 border-primary/20 text-primary" : "border-border hover:border-primary/20"
            )}
          >
            LATEST
          </button>
          <button 
            onClick={() => onSortChange('rating')}
            className={cn(
              "px-4 py-2 rounded-full border transition-all font-bold",
              activitySort === 'rating' ? "bg-primary/10 border-primary/20 text-primary" : "border-border hover:border-primary/20"
            )}
          >
            BIGGEST MOVERS
          </button>
        </div>
      </div>

      {/* Daily Pulse */}
      {pulseStats && (
        <div className="mb-12 flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-6 py-5">
          <Zap className="w-4 h-4 text-primary fill-primary animate-pulse" />
          <p className="text-[11px] md:text-sm font-display font-bold tracking-wider text-muted-foreground uppercase">
            <span className="text-foreground font-black">{pulseStats.activeCount} Players</span> were active this week
            <span className="mx-3 text-border">|</span>
            Biggest Gainer: <Link href={`/player/${slugify(pulseStats.topGainerName)}?tab=${activeTab}&sort=${activitySort}&from=activity`} className="text-foreground font-black hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">{pulseStats.topGainerName}</Link> 
            <span className="ml-2 text-primary">+{pulseStats.topGainerValue.toFixed(3)}</span>
          </p>
        </div>
      )}

      <div className="space-y-16">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-secondary/30 border border-dashed border-border rounded-3xl">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Zap className="w-12 h-12 text-primary fill-primary" />
            </motion.div>
            <p className="mt-4 font-display text-primary font-bold tracking-widest animate-pulse text-[10px]">LOADING ACTIVITY...</p>
          </div>
        ) : tiers.length > 0 ? (
          tiers.map((tier) => (
            <div key={tier.title} className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-[10px] font-bold tracking-[0.4em] text-primary whitespace-nowrap uppercase">{tier.title}</h2>
                <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              
              <div className="space-y-4">
                {tier.items.map((item) => (
                  <motion.div 
                    layout
                    key={`${item.player_name}-${item.date}`}
                    className="bg-secondary/30 border border-border rounded-3xl p-8 backdrop-blur-sm hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                        <Link href={`/player/${slugify(item.player_name)}?tab=${activeTab}&sort=${activitySort}&from=activity`} className="hover:text-primary transition-colors">
                          {item.player_name}
                        </Link>
                      </h3>
                      <span className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-[0.2em]">
                        {new Date(item.date).toLocaleDateString('en-KY', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Rating Change */}
                      {item.ratingDiff !== 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-display font-bold text-muted-foreground tracking-widest uppercase">Rating</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground/50 text-base">{item.previous.rating.toFixed(3)}</span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                            <span className="text-foreground font-bold text-lg">{item.current.rating.toFixed(3)}</span>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded",
                              item.ratingDiff > 0 ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-400"
                            )}>
                              {item.ratingDiff > 0 ? '+' : ''}{item.ratingDiff.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rounds Change */}
                      {item.roundsDiff !== 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-display font-bold text-muted-foreground tracking-widest uppercase">Rounds Played</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground/50 text-base">{item.previous.rounds_played}</span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                            <span className="text-foreground font-bold text-lg">{item.current.rounds_played}</span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase">
                              +{item.roundsDiff} Matches
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rank Change */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-display font-bold text-muted-foreground tracking-widest uppercase">Rank</span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground/50 text-base">#{item.previous.rank_position}</span>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                          <span className="text-foreground font-bold text-lg">#{item.current.rank_position}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded uppercase",
                            item.rankDiff > 0 ? "bg-primary/10 text-primary" : 
                            item.rankDiff < 0 ? "bg-red-500/10 text-red-400" : 
                            "bg-secondary text-muted-foreground/40"
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
          <div className="flex flex-col items-center justify-center py-20 bg-secondary/30 border border-dashed border-border rounded-3xl">
            <History className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="font-display font-bold text-muted-foreground/30 tracking-widest text-sm uppercase">No recent changes detected</p>
          </div>
        )}
      </div>
    </div>
  );
}
