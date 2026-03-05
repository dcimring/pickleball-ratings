"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, User, Zap, ArrowUpRight, TrendingUp, Activity, History, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ranking } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlayerProfileProps {
  playerName: string;
  playerHistory: { singles: Ranking[], doubles: Ranking[] };
  activeTab: 'doubles' | 'singles';
  onTabChange: (tab: 'doubles' | 'singles') => void;
  loading: boolean;
}

export function PlayerProfile({
  playerName,
  playerHistory,
  activeTab,
  onTabChange,
  loading,
}: PlayerProfileProps) {
  const hasData = playerHistory.singles.length > 0 || playerHistory.doubles.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 pt-6 pb-20 text-left min-h-full">
      <Link 
        href="/"
        className="flex items-center gap-2 text-ghost/40 hover:text-volt transition-colors mb-8 group w-fit"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-display text-[10px] tracking-[0.2em] uppercase">Back to Rankings</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-volt" />
            <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Player Profile</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white uppercase">
            {playerName}
          </h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Current Stats Cards */}
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm animate-pulse">
                <div className="h-4 w-24 bg-white/5 rounded mb-6" />
                <div className="h-12 w-32 bg-white/10 rounded mb-4" />
                <div className="h-8 w-48 bg-white/5 rounded" />
              </div>
            ))}
          </>
        ) : !hasData ? (
          <div className="col-span-full py-20 text-center bg-surface/30 border border-dashed border-white/5 rounded-3xl">
            <h2 className="text-3xl font-display font-black text-white mb-4 uppercase">Player Not Found</h2>
            <p className="text-ghost/40 max-w-md mx-auto">We couldn't find any match history for "{playerName}".</p>
          </div>
        ) : (
          <>
            {(['doubles', 'singles'] as const).map((type) => {
              const data = type === 'doubles' ? playerHistory.doubles : playerHistory.singles;
              const current = data[data.length - 1];
              const isActive = activeTab === type;

              return (
                <div 
                  key={type}
                  className={cn(
                    "bg-surface/50 border rounded-3xl p-8 backdrop-blur-sm transition-all duration-500",
                    isActive ? "border-volt/30 shadow-[0_0_40px_-15px_rgba(223,255,0,0.15)]" : "border-white/5 opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase">{type} Rating</span>
                    {type === 'doubles' ? <Users className="w-4 h-4 text-ghost/20" /> : <User className="w-4 h-4 text-ghost/20" />}
                  </div>
                  {current ? (
                    <div className="space-y-4">
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-display font-black text-white">{current.rating.toFixed(3)}</span>
                        <span className="text-volt font-display text-sm mb-1 uppercase tracking-widest">Global</span>
                      </div>
                      <div className="flex items-center gap-4 text-ghost/40">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest">Rank</span>
                          <span className="text-white font-bold">#{current.rank_position}</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest">Rounds</span>
                          <span className="text-white font-bold">{current.rounds_played}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-ghost/10">
                      <span className="font-display text-[10px] tracking-widest">UNRANKED</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total Stats/Activity Card */}
            <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase">Performance</span>
                <TrendingUp className="w-4 h-4 text-ghost/20" />
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-ghost/40 uppercase tracking-widest">Tracking Since</span>
                  <span className="text-white font-bold">
                    {playerHistory[activeTab][0]?.valid_from 
                      ? new Date(playerHistory[activeTab][0].valid_from).toLocaleDateString('en-KY', { month: 'long', year: 'numeric' })
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-ghost/60 leading-relaxed">
                    Rating is calculated using the Cayman Islands proprietary rating system and official match data.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Performance Chart */}
      {!loading && hasData && (
        <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-1">
              <h3 className="font-display text-xl font-black text-white tracking-tight uppercase">Rating Trend</h3>
              <p className="text-[10px] text-ghost/40 tracking-[0.2em] uppercase">Performance history over time</p>
            </div>
            <Activity className="w-5 h-5 text-volt/20" />
          </div>

          <div className="h-[400px] w-full">
            {playerHistory[activeTab].length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={playerHistory[activeTab]}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DFFF00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#DFFF00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="valid_from" 
                    stroke="#ffffff20" 
                    fontSize={10}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-KY', { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10}
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val.toFixed(2)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0f1a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#DFFF00' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-KY', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#DFFF00" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRating)" 
                    animationDuration={500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-ghost/10 gap-4">
                <History className="w-12 h-12" />
                <p className="font-display text-[10px] tracking-[0.3em] uppercase">Need more match data to generate chart</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
