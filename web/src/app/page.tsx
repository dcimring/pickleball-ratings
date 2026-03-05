"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { RankingTable } from '@/components/RankingTable';
import { Ranking } from '@/lib/types';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

function RankingsContent() {
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

export default function RankingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-12 h-12 text-volt fill-volt" />
        </motion.div>
        <p className="mt-4 font-display text-volt tracking-widest animate-pulse">PREPARING RANKINGS...</p>
      </div>
    }>
      <RankingsContent />
    </Suspense>
  );
}
