"use client";

import { useEffect, useState } from 'react';
import { Ranking } from '@/lib/types';
import { PlayerProfile } from '@/components/PlayerProfile';

interface PlayerProfileClientProps {
  slug: string;
  playerName: string;
  initialHistory: { singles: Ranking[]; doubles: Ranking[] };
}

export function PlayerProfileClient({ slug, playerName, initialHistory }: PlayerProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [backUrl, setBackUrl] = useState('/?tab=doubles');
  const [backLabel, setBackLabel] = useState('Back to Rankings');

  // Read navigation params after mount instead of useSearchParams so the
  // server-rendered profile content isn't replaced by a CSR bailout.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    const sort = searchParams.get('sort');
    const isFromActivity = searchParams.get('from') === 'activity';

    if (tab === 'singles' || tab === 'doubles') {
      setActiveTab(tab);
    }

    setBackUrl(
      isFromActivity
        ? `/activity?tab=${tab || 'doubles'}${sort ? `&sort=${sort}` : ''}`
        : `/?tab=${tab || 'doubles'}`
    );
    setBackLabel(isFromActivity ? 'Back to Activity' : 'Back to Rankings');
  }, []);

  useEffect(() => {
    // Warm the Vercel Edge Cache with an active fetch
    fetch(`/player/${slug}/opengraph-image`, { mode: 'no-cors' }).catch(() => {});
  }, [slug]);

  return (
    <PlayerProfile
      playerName={playerName}
      playerHistory={initialHistory}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      loading={false}
      backUrl={backUrl}
      backLabel={backLabel}
    />
  );
}
