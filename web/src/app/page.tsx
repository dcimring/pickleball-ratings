"use client";

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { RankingTable } from '@/components/RankingTable';
import { Ranking } from '@/lib/types';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function RankingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'doubles' | 'singles') || 'doubles';
  
  const { singles, doubles, loading } = useData();
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ranking; direction: 'asc' | 'desc' }>({
    key: 'rank_position',
    direction: 'asc'
  });

  const handleSort = (key: keyof Ranking) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const currentData = activeTab === 'doubles' ? doubles : singles;

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
