import { cache } from 'react';
import { supabase } from './supabase';
import { unslugify, escapeLike } from './slugify';
import { Ranking } from './types';

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
        .order('rank_position', { ascending: true }),
      supabase
        .schema('pickleball_ratings')
        .from('doubles_ratings_deltas')
        .select('*')
        .eq('is_current', true)
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

/**
 * Server-side fetch of a player's full rating history for both modes,
 * ascending by valid_from. Returns null when the player has no rows at all.
 * Throws on query errors so outages don't masquerade as 404s.
 */
export const getPlayerHistory = cache(async (slug: string): Promise<PlayerHistory | null> => {
  const name = unslugify(slug);
  const pattern = escapeLike(name);

  const [singlesRes, doublesRes] = await Promise.all([
    supabase
      .schema('pickleball_ratings')
      .from('singles_ratings_deltas')
      .select('*')
      .ilike('player_name', pattern)
      .order('valid_from', { ascending: true }),
    supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('*')
      .ilike('player_name', pattern)
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
    name: singles[0]?.player_name || doubles[0]?.player_name || name,
    singles,
    doubles,
  };
});
