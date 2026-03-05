"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Ranking } from '@/lib/types';
import { PlayerProfile } from '@/components/PlayerProfile';
import { unslugify } from '@/lib/slugify';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

function PlayerProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [loading, setLoading] = useState(true);
  const [playerHistory, setPlayerHistory] = useState<{ singles: Ranking[], doubles: Ranking[] }>({ singles: [], doubles: [] });
  const [playerName, setPlayerName] = useState('');

  // Handle initial tab from URL search params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'singles' || tab === 'doubles') {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  return (
    <PlayerProfile 
      playerName={playerName}
      playerHistory={playerHistory}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
    />
  );
}

export default function PlayerProfilePage() {
  return (
    <Suspense fallback={null}>
      <PlayerProfileContent />
    </Suspense>
  );
}
