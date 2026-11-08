"use client";

import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { RankingTable } from '@/components/RankingTable';
import { Ranking } from '@/lib/types';

export function HomeClient() {
  const { singles, doubles, singlesHistory, doublesHistory, loading, error, fetchData, refreshing, ensureHistory } = useData();
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ranking; direction: 'asc' | 'desc' }>({
    key: 'rank_position',
    direction: 'asc'
  });

  // Read ?tab= after mount instead of useSearchParams so the page can be
  // statically rendered with real content (useSearchParams forces a CSR bailout).
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'singles' || tab === 'doubles') {
      setActiveTab(tab);
    }
  }, []);

  // History powers the "Move" column; it is lazy-loaded and the board renders
  // without it (chips show a dash until it arrives).
  useEffect(() => {
    ensureHistory();
  }, [ensureHistory]);

  const handleSort = (key: keyof Ranking) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const currentData = activeTab === 'doubles' ? doubles : singles;
  const history = activeTab === 'doubles' ? doublesHistory : singlesHistory;

  // Previous snapshot per player = the newest row that is not the current one.
  // History arrives newest-first.
  const previous = useMemo(() => {
    if (history.length === 0) return undefined;
    const map: Record<string, Ranking | undefined> = {};
    const seen = new Set<string>();
    for (const row of history) {
      if (row.is_current) continue;
      if (seen.has(row.player_name)) continue;
      seen.add(row.player_name);
      map[row.player_name] = row;
    }
    return map;
  }, [history]);

  if (error && !loading && currentData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-3">
        <p className="font-display font-extrabold uppercase text-3xl text-foreground">Board unavailable</p>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="mt-3 h-11 px-5 rounded-md bg-primary text-primary-foreground font-display font-bold text-sm uppercase tracking-[0.14em] disabled:opacity-50"
        >
          {refreshing ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <RankingTable
      data={currentData}
      previous={previous}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      sortConfig={sortConfig}
      onSort={handleSort}
      loading={loading}
    />
  );
}
