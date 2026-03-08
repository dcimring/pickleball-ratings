"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, User, Zap, ArrowUpRight, TrendingUp, Activity, History, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ranking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ShareButton } from './ShareButton';

interface PlayerProfileProps {
  playerName: string;
  playerHistory: { singles: Ranking[], doubles: Ranking[] };
  activeTab: 'doubles' | 'singles';
  onTabChange: (tab: 'doubles' | 'singles') => void;
  loading: boolean;
  backUrl?: string;
  backLabel?: string;
}

export function PlayerProfile({
  playerName,
  playerHistory,
  activeTab,
  onTabChange,
  loading,
  backUrl = "/",
  backLabel = "Back to Rankings",
}: PlayerProfileProps) {
  const [showChart, setShowChart] = useState(false);
  const hasData = playerHistory.singles.length > 0 || playerHistory.doubles.length > 0;

  // Performance-first: Defer the heavy chart rendering until the transition fade-in is complete (0.4s)
  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left min-h-full">
      <Link 
        href={backUrl}
        className="flex items-center gap-2 text-muted-foreground/50 hover:text-primary transition-colors mb-8 group w-fit"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-display text-[10px] font-bold tracking-[0.2em] uppercase">{backLabel}</span>
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span className="text-primary font-display font-bold tracking-widest text-sm uppercase">Player Profile</span>
            </div>
            <div className="flex flex-col items-start gap-4">
              <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter text-foreground leading-[0.9] uppercase">
                {playerName}
              </h1>
              <ShareButton name={playerName} />
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Current Stats Cards */}
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-secondary/30 border border-border rounded-3xl p-8 backdrop-blur-sm animate-pulse">
                <div className="h-4 w-24 bg-border/20 rounded mb-6" />
                <div className="h-12 w-32 bg-border/40 rounded mb-4" />
                <div className="h-8 w-48 bg-border/20 rounded" />
              </div>
            ))}
          </>
        ) : !hasData ? (
          <div className="col-span-full py-24 text-center bg-secondary/20 border border-dashed border-border rounded-3xl">
            <h2 className="text-4xl font-display font-bold tracking-tight text-foreground mb-4 uppercase">Player Not Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">We couldn't find any match history for "{playerName}".</p>
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
                    "bg-secondary/30 border rounded-3xl p-8 backdrop-blur-sm transition-all duration-500",
                    isActive ? "border-primary/40 shadow-[0_0_50px_-15px_oklch(var(--primary)/0.2)]" : "border-border/50 opacity-40 scale-[0.98]"
                  )}
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">{type} Rating</span>
                    {type === 'doubles' ? <Users className="w-4 h-4 text-muted-foreground/30" /> : <User className="w-4 h-4 text-muted-foreground/30" />}
                  </div>
                  {current ? (
                    <div className="space-y-6">
                      <div className="flex items-end gap-3">
                        <span className="text-6xl font-display font-bold tracking-tighter text-foreground leading-none">{current.rating.toFixed(3)}</span>
                        <span className="text-primary font-display font-bold text-[10px] mb-1 uppercase tracking-[0.2em]">Global</span>
                      </div>
                      <div className="flex items-center gap-6 text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Rank</span>
                          <span className="text-foreground font-bold text-xl tracking-tight">#{current.rank_position}</span>
                        </div>
                        <div className="w-px h-10 bg-border/50" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">Rounds</span>
                          <span className="text-foreground font-bold text-xl tracking-tight">{current.rounds_played}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-muted-foreground/10">
                      <span className="font-display font-bold text-[10px] tracking-[0.4em]">UNRANKED</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Total Stats/Activity Card */}
            <div className="bg-secondary/30 border border-border rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase">Performance</span>
                <TrendingUp className="w-4 h-4 text-muted-foreground/30" />
              </div>
              <div className="space-y-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-50">Tracking Since</span>
                  <span className="text-foreground font-bold text-xl tracking-tight">
                    {playerHistory[activeTab][0]?.valid_from 
                      ? new Date(playerHistory[activeTab][0].valid_from).toLocaleDateString('en-KY', { month: 'long', year: 'numeric' })
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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
        <div className="bg-secondary/30 border border-border rounded-3xl p-10 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase">Rating Trend</h3>
              <p className="text-[10px] text-muted-foreground font-bold tracking-[0.3em] uppercase opacity-50">Performance history over time</p>
            </div>
            <Activity className="w-6 h-6 text-primary/30" />
          </div>

          <div className="h-[450px] w-full">
            {!showChart ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-full h-full bg-secondary/50 rounded-3xl animate-pulse" />
              </div>
            ) : playerHistory[activeTab].length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={playerHistory[activeTab]}>
                  <defs>
                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border) / 0.1)" vertical={false} />
                  <XAxis 
                    dataKey="valid_from" 
                    stroke="oklch(var(--muted-foreground) / 0.3)" 
                    fontSize={10}
                    fontWeight={700}
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-KY', { month: 'short', day: 'numeric' })}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="oklch(var(--muted-foreground) / 0.3)" 
                    fontSize={10}
                    fontWeight={700}
                    domain={['auto', 'auto']}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val.toFixed(2)}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(var(--background))', 
                      border: '1px solid oklch(var(--border))',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: 'oklch(var(--primary))' }}
                    labelStyle={{ color: 'oklch(var(--muted-foreground))', marginBottom: '4px', opacity: 0.5 }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-KY', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="oklch(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRating)" 
                    animationDuration={800}
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
