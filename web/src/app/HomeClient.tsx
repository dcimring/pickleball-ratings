"use client";

import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { RankingTable } from '@/components/RankingTable';
import { Ranking } from '@/lib/types';

export function HomeClient() {
  const { singles, doubles, loading, error, fetchData, refreshing } = useData();
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

  const handleSort = (key: keyof Ranking) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const currentData = activeTab === 'doubles' ? doubles : singles;

  if (error && !loading && currentData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="font-display italic text-3xl text-primary mb-2">Something went wrong</p>
        <p className="text-foreground/60 mb-6 max-w-sm">{error}</p>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="px-8 py-3 bg-primary text-white rounded-full font-bold tracking-widest text-sm uppercase disabled:opacity-50"
        >
          {refreshing ? 'Retrying…' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <RankingTable
      data={currentData}
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
