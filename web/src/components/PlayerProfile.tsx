"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, User, Zap, ArrowUpRight, TrendingUp, Activity, History, ArrowLeft, Star } from 'lucide-react';
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

  useEffect(() => {
    const timer = setTimeout(() => setShowChart(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-full bg-background relative overflow-hidden">
      {/* Editorial Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-[600px] bg-primary/5 -skew-x-12 translate-x-1/4 -z-10" />
      
      <div className="max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20 text-left">
        <Link 
          href={backUrl}
          className="flex items-center gap-2 text-foreground/30 hover:text-primary transition-colors mb-12 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase">{backLabel}</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-primary font-sans font-bold tracking-[0.2em] text-[10px] uppercase">Athlete Profile</span>
              </div>
              <div className="flex flex-col items-start gap-6">
                <h1 className="text-6xl md:text-[8rem] font-display italic tracking-tighter text-foreground leading-[0.85]">
                  {playerName}
                </h1>
                <ShareButton name={playerName} />
              </div>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mb-20 bg-muted p-1 rounded-3xl overflow-hidden">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-secondary p-10 animate-pulse">
                  <div className="h-4 w-24 bg-muted rounded mb-10" />
                  <div className="h-16 w-32 bg-muted rounded mb-6" />
                </div>
              ))}
            </>
          ) : !hasData ? (
            <div className="col-span-full py-32 text-center bg-secondary">
              <h2 className="text-5xl font-display italic tracking-tight text-foreground mb-6">Player Not Found</h2>
              <p className="text-foreground/40 max-w-md mx-auto font-medium">We couldn&apos;t find any match history for this athlete.</p>
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
                      "bg-secondary p-10 transition-all duration-500 flex flex-col justify-between h-[300px]",
                      isActive ? "z-10 shadow-xl" : "opacity-40 grayscale"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/30 uppercase">{type} Rating</span>
                    </div>
                    {current ? (
                      <div className="space-y-8 text-right self-end w-full">
                        <div className="flex items-end justify-between">
                           <span className="text-primary font-sans font-bold text-[10px] uppercase tracking-[0.3em]">Official Seed</span>
                           <span className="text-7xl font-display italic tracking-tighter text-foreground leading-none tabular-nums">{current.rating.toFixed(3)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-10 text-foreground/40">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">Rank</span>
                            <span className="text-foreground font-bold text-2xl tracking-tighter tabular-nums">#{current.rank_position}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30">Rounds</span>
                            <span className="text-foreground font-bold text-2xl tracking-tighter tabular-nums">{current.rounds_played}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-foreground/5 italic">
                        <span className="font-display text-4xl tracking-tighter">Unranked</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="bg-secondary p-10 flex flex-col justify-between h-[300px]">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[10px] font-bold tracking-[0.4em] text-foreground/30 uppercase">Performance</span>
                </div>
                <div className="space-y-8 text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[9px] text-foreground/30 font-bold uppercase tracking-[0.4em]">Tracking Since</span>
                    <span className="text-foreground font-bold text-2xl tracking-tighter italic font-display">
                      {playerHistory[activeTab][0]?.valid_from 
                        ? new Date(playerHistory[activeTab][0].valid_from).toLocaleDateString('en-KY', { month: 'long', year: 'numeric' })
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="pt-8">
                    <p className="text-[10px] text-foreground/20 leading-relaxed font-bold uppercase tracking-widest">
                      Cayman Islands Proprietary <br /> Rating System
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Performance Chart */}
        {!loading && hasData && (
          <div className="bg-muted p-1 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5">
            <div className="bg-secondary p-12">
              <div className="flex items-center justify-between mb-20">
                <div className="space-y-4">
                  <h3 className="font-display text-4xl italic tracking-tighter text-foreground">Rating Trend</h3>
                  <div className="w-12 h-1 bg-primary rounded-full" />
                </div>
                <Activity className="w-8 h-8 text-primary/20" />
              </div>

              <div className="h-[450px] min-h-[450px] w-full">
                {!showChart ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="w-full h-full bg-muted animate-pulse rounded-2xl" />
                  </div>
                ) : playerHistory[activeTab].length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={playerHistory[activeTab]}>
                      <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--foreground) / 0.05)" vertical={false} />
                      <XAxis 
                        dataKey="valid_from" 
                        stroke="oklch(var(--foreground) / 0.2)" 
                        fontSize={10}
                        fontWeight={700}
                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-KY', { month: 'short' })}
                        axisLine={false}
                        tickLine={false}
                        dy={20}
                      />
                      <YAxis 
                        stroke="oklch(var(--foreground) / 0.2)" 
                        fontSize={10}
                        fontWeight={700}
                        domain={['auto', 'auto']}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => val.toFixed(2)}
                        dx={-20}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'oklch(var(--secondary))', 
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: 'oklch(var(--primary))' }}
                        labelStyle={{ color: 'oklch(var(--foreground) / 0.4)', marginBottom: '4px' }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-KY', { month: 'long', day: 'numeric', year: 'numeric' })}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="oklch(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRating)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-foreground/5 gap-6">
                    <History className="w-16 h-16" />
                    <p className="font-sans text-[10px] tracking-[0.4em] font-bold uppercase opacity-30">Historical analysis pending more data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
