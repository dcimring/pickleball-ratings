import { cache } from 'react';
import { supabase } from './supabase';
import { resolvePlayerNames } from './player-names';
import { Ranking } from './types';
import { computeDoublesRecords, DoublesRecords, RecordRow } from './records';
import { HIDDEN_PLAYER_SLUGS } from './site-config';

export interface CurrentRankings {
  singles: Ranking[];
  doubles: Ranking[];
}

export interface PlayerHistory {
  name: string;
  singles: Ranking[];
  doubles: Ranking[];
}

/**
 * Server-side fetch of the current rankings for both modes.
 * cache()-wrapped so layout and page share one fetch per request.
 * Returns null on failure so callers can fall back to client-side fetching.
 */
export const getCurrentRankings = cache(async (): Promise<CurrentRankings | null> => {
  try {
    const [singlesRes, doublesRes] = await Promise.all([
      supabase
        .schema('pickleball_ratings')
        .from('singles_ratings_deltas')
        .select('*')
        .eq('is_current', true)
        .eq('is_active', true)
        .order('rank_position', { ascending: true }),
      supabase
        .schema('pickleball_ratings')
        .from('doubles_ratings_deltas')
        .select('*')
        .eq('is_current', true)
        .eq('is_active', true)
        .order('rank_position', { ascending: true }),
    ]);

    if (singlesRes.error && doublesRes.error) {
      console.error('RANKINGS_FETCH_ERROR:', singlesRes.error, doublesRes.error);
      return null;
    }

    return {
      singles: singlesRes.data ?? [],
      doubles: doublesRes.data ?? [],
    };
  } catch (err) {
    console.error('RANKINGS_FETCH_ERROR:', err);
    return null;
  }
});

export interface WeeklyMover {
  name: string;
  rating: number;
  rank: number;
  ratingDiff: number;
  rankDiff: number;
}

export interface WeeklyMovers {
  count: number;
  topGainer: WeeklyMover | null;
  milestone: (WeeklyMover & { threshold: number }) | null;
}

const MILESTONE_THRESHOLDS = [5.0, 4.5, 4.0, 3.5, 3.0];

/**
 * Server-side digest of the past week's doubles movement, mirroring the
 * ActivityClient "THIS WEEK" tier: players whose latest snapshot landed in the
 * last 7 days, diffed against their previous snapshot. Powers the /weekly
 * link-preview card (see docs/weekly-movers-digest.md).
 */
export const getWeeklyMovers = cache(async (): Promise<WeeklyMovers | null> => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const recentRes = await supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('player_name')
      .gte('valid_from', weekAgo);

    if (recentRes.error) {
      console.error('WEEKLY_MOVERS_FETCH_ERROR:', recentRes.error);
      return null;
    }

    const names = [...new Set((recentRes.data ?? []).map((r) => r.player_name))];
    if (names.length === 0) {
      return { count: 0, topGainer: null, milestone: null };
    }

    const historyRes = await supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('*')
      .in('player_name', names)
      .order('valid_from', { ascending: true });

    if (historyRes.error) {
      console.error('WEEKLY_MOVERS_FETCH_ERROR:', historyRes.error);
      return null;
    }

    const byPlayer = (historyRes.data ?? []).reduce((acc, row) => {
      (acc[row.player_name] ??= []).push(row);
      return acc;
    }, {} as Record<string, Ranking[]>);

    const movers: (WeeklyMover & { previousRating: number })[] = [];
    for (const rows of Object.values(byPlayer) as Ranking[][]) {
      if (rows.length < 2) continue;
      const current = rows[rows.length - 1];
      const previous = rows[rows.length - 2];
      const ratingDiff = current.rating - previous.rating;
      const roundsDiff = current.rounds_played - previous.rounds_played;
      if (ratingDiff === 0 && roundsDiff === 0) continue;
      movers.push({
        name: current.player_name,
        rating: current.rating,
        rank: current.rank_position,
        ratingDiff,
        rankDiff: previous.rank_position - current.rank_position,
        previousRating: previous.rating,
      });
    }

    const gainers = movers.filter((m) => m.ratingDiff > 0).sort((a, b) => b.ratingDiff - a.ratingDiff);

    let milestone: WeeklyMovers['milestone'] = null;
    for (const threshold of MILESTONE_THRESHOLDS) {
      const crosser = gainers.find((m) => m.previousRating < threshold && m.rating >= threshold);
      if (crosser) {
        milestone = { ...crosser, threshold };
        break;
      }
    }

    return {
      count: movers.length,
      topGainer: gainers[0] ?? null,
      milestone,
    };
  } catch (err) {
    console.error('WEEKLY_MOVERS_FETCH_ERROR:', err);
    return null;
  }
});

const PAGE_SIZE = 1000;

/** Leaderboards for /records. Pages through every snapshot; null on failure. */
export const getDoublesRecords = cache(async (): Promise<DoublesRecords | null> => {
  try {
    const rows: RecordRow[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .schema('pickleball_ratings')
        .from('doubles_ratings_deltas')
        .select('player_name, valid_from, rating, rounds_played, is_active')
        .order('valid_from', { ascending: true })
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error('RECORDS_FETCH_ERROR:', error);
        return null;
      }
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE_SIZE) break;
    }

    return computeDoublesRecords(rows, HIDDEN_PLAYER_SLUGS);
  } catch (err) {
    console.error('RECORDS_FETCH_ERROR:', err);
    return null;
  }
});

export interface TrackingStats {
  firstRecorded: string;
  snapshots: number;
}

/** Totals for the methodology page. Returns null on failure so the page still renders. */
export const getTrackingStats = cache(async (): Promise<TrackingStats | null> => {
  try {
    const table = (name: string) => supabase.schema('pickleball_ratings').from(name);
    const [firstRes, singlesCount, doublesCount] = await Promise.all([
      table('doubles_ratings_deltas').select('valid_from').order('valid_from', { ascending: true }).limit(1).maybeSingle(),
      table('singles_ratings_deltas').select('*', { count: 'exact', head: true }),
      table('doubles_ratings_deltas').select('*', { count: 'exact', head: true }),
    ]);

    if (firstRes.error || singlesCount.error || doublesCount.error || !firstRes.data) {
      console.error('TRACKING_STATS_ERROR:', firstRes.error, singlesCount.error, doublesCount.error);
      return null;
    }

    return {
      firstRecorded: firstRes.data.valid_from,
      snapshots: (singlesCount.count ?? 0) + (doublesCount.count ?? 0),
    };
  } catch (err) {
    console.error('TRACKING_STATS_ERROR:', err);
    return null;
  }
});

/**
 * Seeds the server-rendered /activity page with the same doubles rows the
 * client feed loads. Only each player's two newest snapshots affect the feed,
 * so the rest are dropped to keep the page payload small.
 */
export const getInitialActivityHistory = cache(async (): Promise<Ranking[]> => {
  try {
    const { data, error } = await supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('*')
      .order('valid_from', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('ACTIVITY_FETCH_ERROR:', error);
      return [];
    }

    const seen = new Map<string, number>();
    return (data ?? []).filter((row: Ranking) => {
      const count = seen.get(row.player_name) ?? 0;
      seen.set(row.player_name, count + 1);
      return count < 2;
    });
  } catch (err) {
    console.error('ACTIVITY_FETCH_ERROR:', err);
    return [];
  }
});

/**
 * Server-side fetch of a player's full rating history for both modes,
 * ascending by valid_from. Returns null when the player has no rows at all.
 * Throws on query errors so outages don't masquerade as 404s.
 */
export const getPlayerHistory = cache(async (slug: string): Promise<PlayerHistory | null> => {
  const names = await resolvePlayerNames(slug);
  if (names.length === 0) return null;

  const [singlesRes, doublesRes] = await Promise.all([
    supabase
      .schema('pickleball_ratings')
      .from('singles_ratings_deltas')
      .select('*')
      .in('player_name', names)
      .order('valid_from', { ascending: true }),
    supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('*')
      .in('player_name', names)
      .order('valid_from', { ascending: true }),
  ]);

  if (singlesRes.error && doublesRes.error) {
    console.error('PLAYER_HISTORY_FETCH_ERROR:', singlesRes.error, doublesRes.error);
    throw new Error('Failed to fetch player history');
  }

  const singles = singlesRes.data ?? [];
  const doubles = doublesRes.data ?? [];

  if (singles.length === 0 && doubles.length === 0) {
    return null;
  }

  return {
    name: singles[0]?.player_name || doubles[0]?.player_name || names[0],
    singles,
    doubles,
  };
});
