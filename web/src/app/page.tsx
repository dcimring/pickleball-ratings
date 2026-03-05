"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { submitFeatureRequest } from './actions';
import { Search, Trophy, Users, User, Zap, ArrowUpRight, TrendingUp, TrendingDown, Minus, Send, CheckCircle2, MessageSquarePlus, X, RefreshCw, Activity, History, MessageCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Ranking = {
  id: number;
  player_name: string;
  rank_position: number;
  rating: number;
  rounds_played: number;
  valid_from: string;
  is_current: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full mt-6 bg-volt hover:bg-volt/90 disabled:opacity-50 disabled:hover:bg-volt text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm flex items-center justify-center"
    >
      {pending ? "SENDING..." : "SUBMIT FEATURE REQUEST"}
    </button>
  );
}

export default function Dashboard() {
  const [singles, setSingles] = useState<Ranking[]>([]);
  const [doubles, setDoubles] = useState<Ranking[]>([]);
  const [singlesHistory, setSinglesHistory] = useState<Ranking[]>([]);
  const [doublesHistory, setDoublesHistory] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'rankings' | 'tourney' | 'feature-request' | 'activity' | 'whatsapp'>('rankings');
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [activitySort, setActivitySort] = useState<'rating' | 'date'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tourneyInput, setTourneyInput] = useState('');
  const [tourneyResults, setTourneyResults] = useState<any[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ranking; direction: 'asc' | 'desc' }>({
    key: 'rank_position',
    direction: 'asc'
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const searchSectionRef = useRef<HTMLElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const [formState, formAction] = useFormState(submitFeatureRequest, {});

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [singlesRes, doublesRes, sHistRes, dHistRes] = await Promise.all([
        supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true }),
        supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true }),
        supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').order('valid_from', { ascending: false }).limit(1000),
        supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').order('valid_from', { ascending: false }).limit(1000)
      ]);

      if (singlesRes.data) setSingles(singlesRes.data);
      if (doublesRes.data) setDoubles(doublesRes.data);
      if (sHistRes.data) setSinglesHistory(sHistRes.data);
      if (dHistRes.data) setDoublesHistory(dHistRes.data);
    } catch (err) {
      console.error('CRITICAL_FETCH_ERROR:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and window focus re-validation
  useEffect(() => {
    fetchData();

    const handleFocus = () => {
      // Re-fetch in background on window focus
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Unique names for autocomplete
  const allUniqueNames = useMemo(() => {
    const names = new Set([...singles, ...doubles].map(p => p.player_name));
    return Array.from(names).sort();
  }, [singles, doubles]);

  const nameSuggestions = useMemo(() => {
    if (!nameInput.trim()) return [];
    return allUniqueNames
      .filter(n => n.toLowerCase().includes(nameInput.toLowerCase()))
      .slice(0, 5); // Limit to 5 suggestions
  }, [allUniqueNames, nameInput]);

  // Force window scroll to 0 to prevent iOS panning issues
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle scroll reset after animation completes
  const handleViewStable = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => {
        setActiveView('rankings');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  const handleSort = (key: keyof Ranking) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleTourneyCheck = () => {
    const names = tourneyInput.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const results = names.map(name => {
      const sMatch = singles.find(p => p.player_name.toLowerCase() === name.toLowerCase());
      const dMatch = doubles.find(p => p.player_name.toLowerCase() === name.toLowerCase());
      
      return {
        name,
        singles: sMatch ? { rank: sMatch.rank_position, rating: sMatch.rating } : null,
        doubles: dMatch ? { rank: dMatch.rank_position, rating: dMatch.rating } : null
      };
    });

    // Sort results by Doubles rank (lowest number first), unranked at the end
    results.sort((a, b) => {
      const rankA = a.doubles ? a.doubles.rank : Infinity;
      const rankB = b.doubles ? b.doubles.rank : Infinity;
      return rankA - rankB;
    });

    setTourneyResults(results);

    // On mobile, auto-scroll to results after a short delay
    if (window.innerWidth < 1024) { // Using 1024 to match the LG breakpoint where layout stacks
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const currentData = activeTab === 'doubles' ? doubles : singles;
  
  const activityFeed = useMemo(() => {
    const history = activeTab === 'doubles' ? doublesHistory : singlesHistory;
    // Group by player name
    const groupedByPlayer = history.reduce((acc, curr) => {
      if (!acc[curr.player_name]) acc[curr.player_name] = [];
      acc[curr.player_name].push(curr);
      return acc;
    }, {} as Record<string, Ranking[]>);

    const allChanges = Object.entries(groupedByPlayer)
      .map(([name, records]) => {
        const sorted = [...records].sort((a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime());
        if (sorted.length < 2) return null;

        const current = sorted[0];
        const previous = sorted[1];

        const ratingDiff = current.rating - previous.rating;
        const roundsDiff = current.rounds_played - previous.rounds_played;
        const rankDiff = previous.rank_position - current.rank_position;

        if (ratingDiff === 0 && roundsDiff === 0) return null;

        return {
          player_name: name,
          current,
          previous,
          ratingDiff,
          roundsDiff,
          rankDiff,
          date: current.valid_from
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Sort all changes based on preference
    allChanges.sort((a, b) => {
      if (activitySort === 'rating') {
        if (b.ratingDiff !== a.ratingDiff) return b.ratingDiff - a.ratingDiff;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    // Group into tiers
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const tiers = [
      { title: 'THIS WEEK', items: [] as typeof allChanges },
      { title: 'LAST WEEK', items: [] as typeof allChanges },
      { title: 'OLDER', items: [] as typeof allChanges },
    ];

    allChanges.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate >= oneWeekAgo) {
        tiers[0].items.push(item);
      } else if (itemDate >= twoWeeksAgo) {
        tiers[1].items.push(item);
      } else {
        tiers[2].items.push(item);
      }
    });

    return tiers.filter(tier => tier.items.length > 0);
  }, [activeTab, singlesHistory, doublesHistory, activitySort]);

  const pulseStats = useMemo(() => {
    const thisWeekTier = activityFeed.find(tier => tier.title === 'THIS WEEK');
    if (!thisWeekTier || thisWeekTier.items.length === 0) return null;

    const items = thisWeekTier.items;
    const topGainer = [...items].sort((a, b) => b.ratingDiff - a.ratingDiff)[0];

    return {
      activeCount: items.length,
      topGainerName: topGainer.player_name,
      topGainerValue: topGainer.ratingDiff
    };
  }, [activityFeed]);

  const sortedAndFilteredData = useMemo(() => {
    let data = [...currentData];
    
    // Filter
    if (searchQuery) {
      data = data.filter(p => 
        p.player_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    data.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [currentData, searchQuery, sortConfig]);

  // Reset scroll to top of search when results change to keep table visible
  useEffect(() => {
    const container = scrollRef.current;
    const searchSection = searchSectionRef.current;
    
    if (searchQuery && container && searchSection) {
      // The reliable docking point is the height of the header above the search bar
      const header = searchSection.previousElementSibling as HTMLElement;
      const dockingPoint = header ? header.offsetHeight : 0;
      
      if (container.scrollTop > dockingPoint) {
        // Small timeout to allow the DOM to update with filtered results
        const timer = setTimeout(() => {
          container.scrollTop = dockingPoint;
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [searchQuery, sortedAndFilteredData.length]);

  const SortIndicator = ({ column }: { column: keyof Ranking }) => {
    if (sortConfig.key !== column) return <Minus className="w-3 h-3 opacity-20" />;
    return sortConfig.direction === 'asc' ? <TrendingUp className="w-3 h-3 text-volt" /> : <TrendingDown className="w-3 h-3 text-volt" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-12 h-12 text-volt fill-volt" />
        </motion.div>
        <p className="mt-4 font-display text-volt tracking-widest animate-pulse">LOADING COURT DATA...</p>
      </div>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col overflow-hidden relative overscroll-none">
      {/* Navigation / Brand Bar - Part of flex flow */}
      <nav className="sticky top-0 z-50 w-full bg-background/60 backdrop-blur-xl border-b border-white/10 px-6 py-3 shadow-[0_1px_0_0_rgba(223,255,0,0.05)] flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display font-black text-xs tracking-[0.4em] text-white cursor-pointer"
            onClick={() => setActiveView('rankings')}
          >
            DINKDASH<span className="text-volt">.XYZ</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveView('rankings')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'rankings' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              RANKINGS
            </button>
            <button 
              onClick={() => setActiveView('activity')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'activity' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              ACTIVITY
            </button>
            <button 
              onClick={() => setActiveView('whatsapp')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'whatsapp' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              ALERTS
            </button>
            <button 
              onClick={() => setActiveView('tourney')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'tourney' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              TOURNEY CHECK
            </button>
            <button 
              onClick={() => setActiveView('feature-request')}
              className={cn(
                "text-[10px] font-display tracking-[0.2em] transition-colors",
                activeView === 'feature-request' ? "text-volt" : "text-ghost/40 hover:text-ghost"
              )}
            >
              SUGGEST FEATURE
            </button>
            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="ml-4 p-2 text-ghost/40 hover:text-volt transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing ? "animate-spin text-volt" : "")} />
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 text-ghost/40 active:text-volt transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={cn("w-5 h-5", refreshing ? "animate-spin text-volt" : "")} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-volt p-2"
            >
              <Zap className={cn("w-5 h-5 transition-transform duration-300", isMobileMenuOpen ? "rotate-180" : "")} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-surface overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 text-left">
                <button 
                  onClick={() => { setActiveView('rankings'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'rankings' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  RANKINGS
                </button>
                <button 
                  onClick={() => { setActiveView('activity'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'activity' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  ACTIVITY
                </button>
                <button 
                  onClick={() => { setActiveView('whatsapp'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'whatsapp' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  ALERTS
                </button>
                <button 
                  onClick={() => { setActiveView('tourney'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'tourney' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  TOURNEY CHECK
                </button>
                <button 
                  onClick={() => { setActiveView('feature-request'); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-left font-display text-sm tracking-widest",
                    activeView === 'feature-request' ? "text-volt" : "text-ghost/40"
                  )}
                >
                  SUGGEST FEATURE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Scrollable Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false} onExitComplete={handleViewStable}>
          {activeView === 'rankings' ? (
            <motion.div
              key="rankings-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pb-[80vh] min-h-full"
            >
              {/* Header Section */}
              <header className="relative pt-6 pb-6 px-6 overflow-hidden text-left">
                <div className="max-w-6xl mx-auto relative z-10">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-volt fill-volt" />
                        <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Cayman Islands</span>
                      </div>
                      <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
                        PICKLEBALL <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">RANKINGS</span>
                      </h1>
                    </div>

                    <div className="flex p-1 bg-surface rounded-xl border border-white/5">
                      <button 
                        onClick={() => setActiveTab('doubles')}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
                          activeTab === 'doubles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
                        )}
                      >
                        <Users className="w-4 h-4" /> DOUBLES
                      </button>
                      <button 
                        onClick={() => setActiveTab('singles')}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
                          activeTab === 'singles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
                        )}
                      >
                        <User className="w-4 h-4" /> SINGLES
                      </button>
                    </div>
                  </motion.div>
                </div>
              </header>

              {/* Search & Stats - Sticky on scroll */}
              <section ref={searchSectionRef} className="sticky top-0 z-40 px-6 py-4 mb-2 bg-background/95 backdrop-blur-sm border-b border-white/[0.02] text-left transition-all">
                <div className="max-w-6xl mx-auto">
                  <div className="relative group">
                    <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-ghost/30 group-focus-within:text-volt transition-colors" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Search by player name..."
                      value={searchQuery}
                      onFocus={() => {
                        // On mobile, if we are at the top, snap search to docking point instantly
                        if (window.innerWidth < 768 && scrollRef.current && searchSectionRef.current) {
                          const container = scrollRef.current;
                          const header = searchSectionRef.current.previousElementSibling as HTMLElement;
                          const dockingPoint = header ? header.offsetHeight : 0;
                          
                          if (container.scrollTop < dockingPoint) {
                            // Using a timeout allows the browser to complete the focus/keyboard opening 
                            // before we move the element, which prevents the caret (blinking cursor) from disappearing.
                            setTimeout(() => {
                              container.scrollTop = dockingPoint;
                            }, 0);
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setSearchQuery('');
                        }
                      }}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-surface border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-volt/50 transition-all font-sans text-lg"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <div className="absolute right-2 inset-y-0 flex items-center">
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setSearchQuery('')}
                            className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors group/clear"
                          >
                            <X className="w-5 h-5 text-ghost/60 group-hover/clear:text-volt transition-colors" />
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
                  <div className="bg-surface/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-6 border-b border-white/5 font-display text-[10px] tracking-[0.3em] text-ghost/40 select-none">
                      <button 
                        onClick={() => handleSort('rank_position')}
                        className="col-span-3 md:col-span-2 flex items-center gap-1 md:gap-2 hover:text-ghost transition-colors group"
                      >
                        RANK <SortIndicator column="rank_position" />
                      </button>
                      <button 
                        onClick={() => handleSort('player_name')}
                        className="col-span-5 md:col-span-5 flex items-center gap-1 md:gap-2 hover:text-ghost transition-colors group"
                      >
                        PLAYER <SortIndicator column="player_name" />
                      </button>
                      <button 
                        onClick={() => handleSort('rounds_played')}
                        className="hidden md:flex col-span-2 items-center justify-end gap-2 hover:text-ghost transition-colors group text-right"
                      >
                        ROUNDS <SortIndicator column="rounds_played" />
                      </button>
                      <button 
                        onClick={() => handleSort('rating')}
                        className="col-span-4 md:col-span-3 flex items-center justify-end gap-1 md:gap-2 hover:text-ghost transition-colors group text-right"
                      >
                        RATING <SortIndicator column="rating" />
                      </button>
                    </div>

                    <div className="min-h-[400px]">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {sortedAndFilteredData.map((player, index) => (
                          <motion.div
                            layout
                            key={`${activeTab}-${player.player_name}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: Math.min(index * 0.01, 0.2),
                              layout: { duration: 0.4, ease: "easeInOut" } 
                            }}
                            className="grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-8 py-6 hover:bg-white/[0.02] transition-colors items-center group"
                          >
                            <div className="col-span-3 md:col-span-2 flex items-center gap-3">
                              <span className={cn(
                                "font-display text-xl md:text-2xl font-black",
                                index === 0 ? "text-volt" : "text-ghost/20"
                              )}>
                                {player.rank_position}
                              </span>
                            </div>
                            <div className="col-span-5 md:col-span-5">
                              <div className="font-sans font-bold text-base md:text-lg text-white group-hover:text-volt transition-colors">
                                {player.player_name}
                              </div>
                              <div className="flex items-center gap-2 mt-1 md:hidden">
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider text-ghost/40">
                                  {player.rounds_played} Rounds
                                </span>
                              </div>
                            </div>
                            <div className="hidden md:block col-span-2 text-right">
                              <div className="font-display text-lg text-white/60 group-hover:text-white transition-colors">
                                {player.rounds_played}
                              </div>
                            </div>
                            <div className="col-span-4 md:col-span-3 text-right">
                              <div className="font-display text-lg md:text-xl text-white">
                                {player.rating.toFixed(3)}
                              </div>
                              <div className="flex items-center justify-end gap-1 text-[10px] text-green-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrendingUp className="w-3 h-3" />
                                STABLE
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          ) : activeView === 'activity' ? (
            <motion.div
              key="activity-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto px-6 pt-6 pb-20 text-left min-h-full"
            >
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
                    onClick={() => setActiveTab('doubles')}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm tracking-wider transition-all duration-300",
                      activeTab === 'doubles' ? "bg-volt text-background" : "text-ghost/50 hover:text-ghost"
                    )}
                  >
                    <Users className="w-4 h-4" /> DOUBLES
                  </button>
                  <button 
                    onClick={() => setActiveTab('singles')}
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
                    onClick={() => setActivitySort('date')}
                    className={cn(
                      "px-3 py-1.5 rounded-full border transition-all",
                      activitySort === 'date' ? "bg-white/10 border-white/20 text-white" : "border-white/5 hover:border-white/10"
                    )}
                  >
                    LATEST
                  </button>
                  <button 
                    onClick={() => setActivitySort('rating')}
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
                {activityFeed.length > 0 ? (
                  activityFeed.map((tier) => (
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
            </motion.div>
          ) : activeView === 'whatsapp' ? (
            <motion.div
              key="whatsapp-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto px-6 pt-6 pb-20 text-center min-h-full"
            >
              <div className="mb-12">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-volt" />
                  <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Community</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
                  REAL-TIME <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">ALERTS</span>
                </h1>
                <p className="mt-4 text-ghost/60 max-w-lg mx-auto font-sans text-lg text-balance">
                  Join our WhatsApp group to get instant notifications when rankings change or new matches are logged.
                </p>
              </div>

              <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden">
                {/* Desktop/Tablet View: QR Code */}
                <div className="hidden md:flex flex-col items-center gap-8">
                  <div className="bg-white p-4 rounded-2xl">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x250&data=${encodeURIComponent('https://chat.whatsapp.com/Ct260BAJJ2xGslKvhlR6wJ?mode=hq1tcli')}`}
                      alt="WhatsApp Group QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-display text-lg font-bold tracking-tight">SCAN TO JOIN</p>
                    <p className="text-ghost/40 text-sm">Open your phone's camera to scan the code</p>
                  </div>
                </div>

                {/* Mobile View: Join Button */}
                <div className="md:hidden flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-volt/10 rounded-full flex items-center justify-center mb-2">
                    <MessageCircle className="w-10 h-10 text-volt" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-display text-xl font-black">STAY IN THE LOOP</h3>
                    <p className="text-ghost/60 text-sm">Tap the button below to join the Cayman Pickleball Alerts group.</p>
                  </div>
                  <a 
                    href="https://chat.whatsapp.com/Ct260BAJJ2xGslKvhlR6wJ?mode=hq1tcli"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-volt hover:bg-volt/90 text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm text-center"
                  >
                    JOIN GROUP
                  </a>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
                <div className="flex flex-col items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-[8px] font-display tracking-widest">INSTANT</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-[8px] font-display tracking-widest">COMMUNITY</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-[8px] font-display tracking-widest">COMPETITIVE</span>
                </div>
              </div>
            </motion.div>
          ) : activeView === 'tourney' ? (
            <motion.div
              key="tourney-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto px-6 pt-6 pb-20 text-left min-h-full"
            >
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-volt" />
                  <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Advanced Tools</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
                  TOURNEY <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">CHECK</span>
                </h1>
                <p className="mt-4 text-ghost/60 max-w-2xl font-sans text-lg text-balance">
                  Paste a list of player names below to instantly retrieve their current rankings and ratings.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-surface/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm text-left scroll-mt-20">
                    <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 mb-4 uppercase">Player List</label>
                    <textarea 
                      value={tourneyInput}
                      onChange={(e) => setTourneyInput(e.target.value)}
                      onFocus={(e) => {
                        if (window.innerWidth < 768) {
                          setTimeout(() => {
                            e.target.closest('.scroll-mt-20')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                      }}
                      placeholder="Enter names (one per line)..."
                      className="w-full h-64 bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20 resize-none"
                    />
                    <button 
                      onClick={handleTourneyCheck}
                      disabled={!tourneyInput.trim()}
                      className="w-full mt-6 bg-volt hover:bg-volt/90 disabled:opacity-50 disabled:hover:bg-volt text-background font-display font-black py-4 rounded-2xl transition-all tracking-widest text-sm"
                    >
                      CHECK PLAYERS
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                <div ref={resultsSectionRef} className="lg:col-span-8 scroll-mt-20">
                  <div className="bg-surface/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[400px]">
                    {tourneyResults.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        <div className="grid grid-cols-12 gap-4 px-8 py-6 font-display text-[10px] tracking-[0.3em] text-ghost/40">
                          <div className="col-span-6">PLAYER</div>
                          <div className="col-span-3 text-right">SINGLES</div>
                          <div className="col-span-3 text-right">DOUBLES</div>
                        </div>
                        <AnimatePresence mode="popLayout">
                          {tourneyResults.map((result, idx) => (
                            <motion.div 
                              key={`tourney-${result.name}-${idx}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                              className="grid grid-cols-12 gap-4 px-8 py-6 items-center group hover:bg-white/[0.02]"
                            >
                              <div className="col-span-6 font-sans font-bold text-white group-hover:text-volt transition-colors">{result.name}</div>
                              <div className="col-span-3 text-right">
                                {result.singles ? (
                                  <div className="flex flex-col">
                                    <span className="text-volt font-display text-xs">#{result.singles.rank}</span>
                                    <span className="text-ghost/40 text-[10px]">{result.singles.rating.toFixed(3)}</span>
                                  </div>
                                ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                              </div>
                              <div className="col-span-3 text-right">
                                {result.doubles ? (
                                  <div className="flex flex-col">
                                    <span className="text-volt font-display text-xs">#{result.doubles.rank}</span>
                                    <span className="text-ghost/40 text-[10px]">{result.doubles.rating.toFixed(3)}</span>
                                  </div>
                                ) : <Minus className="w-4 h-4 ml-auto opacity-10" />}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-ghost/20">
                        <Users className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-display tracking-widest text-sm">NO RESULTS YET</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feature-request-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto px-6 pt-6 pb-20 text-left min-h-full"
            >
              <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageSquarePlus className="w-5 h-5 text-volt" />
                  <span className="text-volt font-display tracking-[0.2em] text-sm uppercase">Roadmap</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter text-white uppercase">
                  SUGGEST A <span className="text-transparent bg-clip-text bg-gradient-to-r from-volt to-white">FEATURE</span>
                </h1>
                <p className="mt-4 text-ghost/60 font-sans text-lg text-balance">
                  Have an idea to make DinkDash better? Let us know what tools or data you want to see next.
                </p>
              </div>

              <div className="bg-surface/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden scroll-mt-20">
                {formState.success ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center flex flex-col items-center"
                  >
                    <CheckCircle2 className="w-16 h-16 text-volt mb-4" />
                    <h3 className="font-display text-2xl font-black text-white mb-2 tracking-tight">DINK RECEIVED!</h3>
                    <p className="text-ghost/60 font-sans">Thanks for the suggestion. Redirecting you back...</p>
                  </motion.div>
                ) : (
                  <form action={formAction} className="space-y-6">
                    {/* Honeypot */}
                    <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                    
                    <div className="space-y-2 relative">
                      <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase ml-1">Your Name</label>
                      <input 
                        name="user_name"
                        required
                        value={nameInput}
                        onChange={(e) => {
                          setNameInput(e.target.value);
                          setShowNameSuggestions(true);
                        }}
                        onFocus={(e) => {
                          if (window.innerWidth < 768) {
                            setTimeout(() => {
                              e.target.closest('.scroll-mt-20')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }
                        }}
                        onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                        placeholder="Enter your name"
                        className="w-full bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20"
                      />
                      
                      {/* Autocomplete Suggestions */}
                      <AnimatePresence>
                        {showNameSuggestions && nameSuggestions.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 left-0 right-0 top-full mt-2 bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
                          >
                            {nameSuggestions.map((name) => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => {
                                  setNameInput(name);
                                  setShowNameSuggestions(false);
                                }}
                                className="w-full px-6 py-4 text-left hover:bg-white/5 text-ghost/60 hover:text-volt transition-colors font-sans text-sm border-b border-white/5 last:border-0"
                              >
                                {name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display text-[10px] tracking-[0.3em] text-ghost/40 uppercase ml-1">The Feature Idea</label>
                      <textarea 
                        name="details"
                        required
                        onFocus={(e) => {
                          if (window.innerWidth < 768) {
                            setTimeout(() => {
                              e.target.closest('.scroll-mt-20')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }
                        }}
                        placeholder="Describe the feature and how it helps players..."
                        className="w-full h-48 bg-background border border-white/5 rounded-2xl p-4 outline-none focus:border-volt/50 transition-all font-sans text-ghost placeholder:text-ghost/20 resize-none"
                      />
                    </div>

                    {formState.error && (
                      <p className="text-red-400 text-xs font-sans text-center">{formState.error}</p>
                    )}

                    <SubmitButton />
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
