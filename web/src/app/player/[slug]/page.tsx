"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Ranking } from '@/lib/types';
import { PlayerProfile } from '@/components/PlayerProfile';
import { unslugify } from '@/lib/slugify';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function PlayerProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const initialTab = (searchParams.get('tab') as 'doubles' | 'singles') || 'doubles';
  
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [playerHistory, setPlayerHistory] = useState<{ singles: Ranking[], doubles: Ranking[] }>({ singles: [], doubles: [] });
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      const name = unslugify(slug);
      setPlayerName(name);
      setLoading(true);
      
      try {
        // Query using ILIKE to be case-insensitive and handle slug mismatches
        const [singlesRes, doublesRes] = await Promise.all([
          supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').ilike('player_name', name).order('valid_from', { ascending: true }),
          supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').ilike('player_name', name).order('valid_from', { ascending: true })
        ]);

        // If exact name from unslugify didn't work, maybe try the first record's name
        const actualName = singlesRes.data?.[0]?.player_name || doublesRes.data?.[0]?.player_name || name;
        setPlayerName(actualName);

        setPlayerHistory({
          singles: singlesRes.data || [],
          doubles: doublesRes.data || []
        });
      } catch (err) {
        console.error('PROFILE_FETCH_ERROR:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProfile();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-12 h-12 text-volt fill-volt" />
        </motion.div>
        <p className="mt-4 font-display text-volt tracking-widest animate-pulse">LOADING PLAYER DATA...</p>
      </div>
    );
  }

  if (playerHistory.singles.length === 0 && playerHistory.doubles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h2 className="text-3xl font-display font-black text-white mb-4">PLAYER NOT FOUND</h2>
        <p className="text-ghost/40 max-w-md">We couldn't find any match history for "{playerName}".</p>
      </div>
    );
  }

  return (
    <PlayerProfile 
      playerName={playerName}
      playerHistory={playerHistory}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
