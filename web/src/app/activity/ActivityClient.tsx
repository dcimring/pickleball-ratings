"use client";

import { useMemo, useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Ranking, ActivityItem, ActivityTier } from '@/lib/types';

interface ActivityClientProps {
  /** Server-rendered doubles rows, shown until the full client history loads */
  initialDoubles: Ranking[];
  /** Server clock, so the first client render buckets tiers identically */
  renderedAt: number;
}

export function ActivityClient({ initialDoubles, renderedAt }: ActivityClientProps) {
  const { singlesHistory, doublesHistory, loading, historyLoading, ensureHistory } = useData();
  const [activeTab, setActiveTab] = useState<'doubles' | 'singles'>('doubles');
  const [activitySort, setActivitySort] = useState<'rating' | 'date'>('rating');
  const [now, setNow] = useState(renderedAt);
  const [urlRead, setUrlRead] = useState(false);

  // Read URL state after mount instead of useSearchParams so the
  // server-rendered feed isn't replaced by a CSR bailout.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const sort = params.get('sort');
    if (tab === 'singles' || tab === 'doubles') setActiveTab(tab);
    if (sort === 'rating' || sort === 'date') setActivitySort(sort);
    setNow(Date.now());
    setUrlRead(true);
  }, []);

  // History is lazy-loaded; request it when the feed mounts
  useEffect(() => {
    ensureHistory();
  }, [ensureHistory]);

  // Update URL when state changes
  useEffect(() => {
    if (!urlRead) return;
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    params.set('sort', activitySort);
    window.history.replaceState(window.history.state, '', `/activity?${params.toString()}${window.location.hash}`);
  }, [activeTab, activitySort, urlRead]);

  const history = activeTab === 'doubles'
    ? (doublesHistory.length > 0 ? doublesHistory : initialDoubles)
    : singlesHistory;

  const activityFeed = useMemo(() => {
    const groupedByPlayer = history.reduce((acc, curr) => {
      if (!acc[curr.player_name]) acc[curr.player_name] = [];
      acc[curr.player_name].push(curr);
      return acc;
    }, {} as Record<string, Ranking[]>);

    const allChanges = Object.entries(groupedByPlayer)
      .map(([name, records]) => {
        const sorted = [...records].sort((a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime());
        if (sorted.length < 2) return null;

        const current = sorted[0];
        const previous = sorted[1];

        const ratingDiff = current.rating - previous.rating;
        const roundsDiff = current.rounds_played - previous.rounds_played;
        const rankDiff = previous.rank_position - current.rank_position;

        if (ratingDiff === 0 && roundsDiff === 0) return null;

        return {
          player_name: name,
          current,
          previous,
          ratingDiff,
          roundsDiff,
          rankDiff,
          date: current.valid_from
        } as ActivityItem;
      })
      .filter((item): item is ActivityItem => item !== null);

    allChanges.sort((a, b) => {
      if (activitySort === 'rating') {
        if (Math.abs(b.ratingDiff) !== Math.abs(a.ratingDiff)) return Math.abs(b.ratingDiff) - Math.abs(a.ratingDiff);
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const tiers: ActivityTier[] = [
      { title: 'THIS WEEK', items: [] },
      { title: 'LAST WEEK', items: [] },
      { title: 'OLDER', items: [] },
    ];

    allChanges.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate >= oneWeekAgo) {
        tiers[0].items.push(item);
      } else if (itemDate >= twoWeeksAgo) {
        tiers[1].items.push(item);
      } else {
        tiers[2].items.push(item);
      }
    });

    return tiers.filter(tier => tier.items.length > 0);
  }, [history, activitySort, now]);

  const pulseStats = useMemo(() => {
    const thisWeekTier = activityFeed.find(tier => tier.title === 'THIS WEEK');
    if (!thisWeekTier || thisWeekTier.items.length === 0) return null;

    const items = thisWeekTier.items;
    const topGainer = [...items].sort((a, b) => b.ratingDiff - a.ratingDiff)[0];

    return {
      activeCount: items.length,
      topGainerName: topGainer.player_name,
      topGainerValue: topGainer.ratingDiff
    };
  }, [activityFeed]);

  return (
    <ActivityFeed 
      tiers={activityFeed}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      activitySort={activitySort}
      onSortChange={setActivitySort}
      pulseStats={pulseStats}
      loading={history.length === 0 && (loading || historyLoading)}
    />
  );
}
