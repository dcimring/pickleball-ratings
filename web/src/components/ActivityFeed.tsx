"use client";

import { motion } from 'framer-motion';
import { Users, User, Zap, ArrowUpRight, Activity, History } from 'lucide-react';
import { ActivityTier } from '@/lib/types';
import { cn } from '@/lib/utils';

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
}

export function ActivityFeed({
  tiers,
  activeTab,
  onTabChange,
  activitySort,
  onSortChange,
  pulseStats,
}: ActivityFeedProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-20 text-left min-h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-volt" />
            <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Live Feed</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
            RECENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">ACTIVITY</span>
          </h1>
          <p className="mt-4 text-ghost/60 max-w-2xl font-sans text-lg text-balance">
            Track the latest moves and matches across the Cayman Islands.
          </p>
        </div>

        <div className="flex p-1 bg-surface rounded-xl border border-white/5 w-fit h-fit">
          <button 
            onClick={() => onTabChange('doubles')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
              activeTab === 'doubles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
            )}
          >
            <Users className="w-4 h-4" /> DOUBLES
          </button>
          <button 
            onClick={() => onTabChange('singles')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
              activeTab === 'singles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
            )}
          >
            <User className="w-4 h-4" /> SINGLES
          </button>
        </div>
      </div>

      {/* Sort Toggles */}
      <div className="flex items-center gap-4 mb-8 text-[10px] font-display tracking-widest text-ghost/40">
        <span className="uppercase">Sort by:</span>
        <div className="flex gap-2">
          <button 
            onClick={() => onSortChange('date')}
            className={cn(
              "px-3 py-1.5 rounded-full border transition-all",
              activitySort === 'date' ? "bg-white/10 border-white/20 text-white" : "border-white/5 hover:border-white/10"
            )}
          >
            LATEST
          </button>
          <button 
            onClick={() => onSortChange('rating')}
            className={cn(
              "px-3 py-1.5 rounded-full border transition-all",
              activitySort === 'rating' ? "bg-white/10 border-white/20 text-white" : "border-white/5 hover:border-white/10"
            )}
          >
            BIGGEST MOVERS
          </button>
        </div>
      </div>

      {/* Daily Pulse */}
      {pulseStats && (
        <div className="mb-8 flex items-center gap-3 bg-volt/5 border border-volt/10 rounded-2xl px-6 py-4">
          <Zap className="w-4 h-4 text-volt fill-volt animate-pulse" />
          <p className="text-[11px] md:text-sm font-display tracking-wider text-ghost/80 uppercase">
            <span className="text-white font-black">{pulseStats.activeCount} Players</span> were active this week
            <span className="mx-3 text-ghost/20">|</span>
            Biggest Gainer: <span className="text-white font-black">{pulseStats.topGainerName}</span> 
            <span className="ml-2 text-green-400">+{pulseStats.topGainerValue.toFixed(3)}</span>
          </p>
        </div>
      )}

      <div className="space-y-12">
        {tiers.length > 0 ? (
          tiers.map((tier) => (
            <div key={tier.title} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-xs tracking-[0.3em] text-volt whitespace-nowrap">{tier.title}</h2>
                <div className="h-px w-full bg-gradient-to-r from-volt/20 to-transparent" />
              </div>
              
              <div className="space-y-4">
                {tier.items.map((item, idx) => (
                  <motion.div 
                    key={`${item.player_name}-${item.date}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-surface/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-xl font-black text-white">{item.player_name}</h3>
                      <span className="text-[10px] font-display text-ghost/20 uppercase tracking-[0.2em]">
                        {new Date(item.date).toLocaleDateString('en-KY', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Rating Change */}
                      {item.ratingDiff !== 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-display text-ghost/40 tracking-widest uppercase">Rating</span>
                          <div className="flex items-center gap-2">
                            <span className="text-ghost/20 text-sm">{item.previous.rating.toFixed(3)}</span>
                            <ArrowUpRight className="w-3 h-3 text-ghost/20" />
                            <span className="text-white font-bold">{item.current.rating.toFixed(3)}</span>
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded",
                              item.ratingDiff > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                            )}>
                              {item.ratingDiff > 0 ? '+' : ''}{item.ratingDiff.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rounds Change */}
                      {item.roundsDiff !== 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-display text-ghost/40 tracking-widest uppercase">Rounds Played</span>
                          <div className="flex items-center gap-2">
                            <span className="text-ghost/20 text-sm">{item.previous.rounds_played}</span>
                            <ArrowUpRight className="w-3 h-3 text-ghost/20" />
                            <span className="text-white font-bold">{item.current.rounds_played}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-volt/10 text-volt">
                              +{item.roundsDiff} MATCHES
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Rank Change */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-display text-ghost/40 tracking-widest uppercase">Rank</span>
                        <div className="flex items-center gap-2">
                          <span className="text-ghost/20 text-sm">#{item.previous.rank_position}</span>
                          <ArrowUpRight className="w-3 h-3 text-ghost/20" />
                          <span className="text-white font-bold">#{item.current.rank_position}</span>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded",
                            item.rankDiff > 0 ? "bg-green-500/10 text-green-400" : 
                            item.rankDiff < 0 ? "bg-red-500/10 text-red-400" : 
                            "bg-white/5 text-ghost/40"
                          )}>
                            {item.rankDiff > 0 ? `UP ${item.rankDiff}` : 
                             item.rankDiff < 0 ? `DOWN ${Math.abs(item.rankDiff)}` : 
                             'STABLE'}
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
          <div className="flex flex-col items-center justify-center py-20 bg-surface/30 border border-dashed border-white/5 rounded-3xl">
            <History className="w-12 h-12 text-ghost/10 mb-4" />
            <p className="font-display text-ghost/20 tracking-widest text-sm">NO RECENT CHANGES DETECTED</p>
          </div>
        )}
      </div>
    </div>
  );
}
