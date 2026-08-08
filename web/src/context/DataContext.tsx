"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Ranking } from '@/lib/types';

interface DataContextType {
  singles: Ranking[];
  doubles: Ranking[];
  singlesHistory: Ranking[];
  doublesHistory: Ranking[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchData: (isManual?: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [singles, setSingles] = useState<Ranking[]>([]);
  const [doubles, setDoubles] = useState<Ranking[]>([]);
  const [singlesHistory, setSinglesHistory] = useState<Ranking[]>([]);
  const [doublesHistory, setDoublesHistory] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Supabase returns errors in the response rather than throwing
      if (singlesRes.error && doublesRes.error) {
        console.error('CRITICAL_FETCH_ERROR:', singlesRes.error, doublesRes.error);
        setError('Unable to load rankings. Please check your connection and try again.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('CRITICAL_FETCH_ERROR:', err);
      setError('Unable to load rankings. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const value = {
    singles,
    doubles,
    singlesHistory,
    doublesHistory,
    loading,
    refreshing,
    error,
    fetchData
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
