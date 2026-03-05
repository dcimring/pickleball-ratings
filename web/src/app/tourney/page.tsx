"use client";

import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { TourneyCheck } from '@/components/TourneyCheck';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function TourneyPage() {
  const { singles, doubles, loading } = useData();
  const [tourneyInput, setTourneyInput] = useState('');
  const [tourneyResults, setTourneyResults] = useState<any[]>([]);

  const handleTourneyCheck = () => {
    const names = tourneyInput.split('
').map(n => n.trim()).filter(n => n.length > 0);
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
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
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
    <TourneyCheck 
      input={tourneyInput}
      onInputChange={setTourneyInput}
      onCheck={handleTourneyCheck}
      results={tourneyResults}
    />
  );
}
