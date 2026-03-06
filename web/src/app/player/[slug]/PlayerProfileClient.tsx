"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Ranking } from '@/lib/types';
import { PlayerProfile } from '@/components/PlayerProfile';
import { unslugify } from '@/lib/slugify';

export function PlayerProfileClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [loading, setLoading] = useState(true);
  const [playerHistory, setPlayerHistory] = useState<{ singles: Ranking[], doubles: Ranking[] }>({ singles: [], doubles: [] });
  const [playerName, setPlayerName] = useState('');

  const isFromActivity = searchParams.get('from') === 'activity';
  const backUrl = isFromActivity ? '/activity' : '/';
  const backLabel = isFromActivity ? 'Back to Activity' : 'Back to Rankings';

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
        const [singlesRes, doublesRes] = await Promise.all([
          supabase.schema('pickleball_ratings').from('singles_ratings_deltas').select('*').ilike('player_name', name).order('valid_from', { ascending: true }),
          supabase.schema('pickleball_ratings').from('doubles_ratings_deltas').select('*').ilike('player_name', name).order('valid_from', { ascending: true })
        ]);

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
      backUrl={backUrl}
      backLabel={backLabel}
    />
  );
}
