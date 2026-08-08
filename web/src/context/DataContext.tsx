"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Ranking } from '@/lib/types';

interface DataContextType {
  singles: Ranking[];
  doubles: Ranking[];
  singlesHistory: Ranking[];
  doublesHistory: Ranking[];
  loading: boolean;
  historyLoading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchData: (isManual?: boolean) => Promise<void>;
  ensureHistory: () => void;
}

export interface InitialRankingData {
  singles: Ranking[];
  doubles: Ranking[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Don't refetch on window focus more often than this
const FOCUS_REFETCH_INTERVAL_MS = 5 * 60 * 1000;

export function DataProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: InitialRankingData | null;
}) {
  const [singles, setSingles] = useState<Ranking[]>(initialData?.singles ?? []);
  const [doubles, setDoubles] = useState<Ranking[]>(initialData?.doubles ?? []);
  const [singlesHistory, setSinglesHistory] = useState<Ranking[]>([]);
  const [doublesHistory, setDoublesHistory] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFetchedRef = useRef<number>(initialData ? Date.now() : 0);
  const historyRequestedRef = useRef(false);
  const historyLoadedRef = useRef(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const [sHistRes, dHistRes] = await Promise.all([
        supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').order('valid_from', { ascending: false }).limit(1000),
        supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').order('valid_from', { ascending: false }).limit(1000)
      ]);

      if (sHistRes.data) setSinglesHistory(sHistRes.data);
      if (dHistRes.data) setDoublesHistory(dHistRes.data);
      if (!sHistRes.error && !dHistRes.error) {
        historyLoadedRef.current = true;
      }
    } catch (err) {
      console.error('HISTORY_FETCH_ERROR:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [singlesRes, doublesRes] = await Promise.all([
        supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true }),
        supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').eq('is_current', true).order('rank_position', { ascending: true })
      ]);

      if (singlesRes.data) setSingles(singlesRes.data);
      if (doublesRes.data) setDoubles(doublesRes.data);

      // Supabase returns errors in the response rather than throwing
      if (singlesRes.error && doublesRes.error) {
        console.error('CRITICAL_FETCH_ERROR:', singlesRes.error, doublesRes.error);
        setError('Unable to load rankings. Please check your connection and try again.');
      } else {
        setError(null);
        lastFetchedRef.current = Date.now();
      }

      if (historyRequestedRef.current) {
        await fetchHistory();
      }
    } catch (err) {
      console.error('CRITICAL_FETCH_ERROR:', err);
      setError('Unable to load rankings. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchHistory]);

  // Lazily load history the first time a consumer (e.g. the activity feed) asks for it
  const ensureHistory = useCallback(() => {
    if (historyRequestedRef.current) return;
    historyRequestedRef.current = true;
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    // Server-seeded data skips the initial client fetch entirely
    if (!initialData) {
      fetchData();
    }

    const handleFocus = () => {
      if (Date.now() - lastFetchedRef.current > FOCUS_REFETCH_INTERVAL_MS) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    singles,
    doubles,
    singlesHistory,
    doublesHistory,
    loading,
    historyLoading,
    refreshing,
    error,
    fetchData,
    ensureHistory
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
