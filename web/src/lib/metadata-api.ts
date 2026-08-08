import { cache } from 'react';
import { supabase } from './supabase';
import { unslugify, escapeLike } from './slugify';
import { Ranking } from './types';

export interface PlayerMetadata {
  name: string;
  latestSingles?: Ranking;
  latestDoubles?: Ranking;
}

/**
 * Fetches the latest ratings for a player by their slug.
 * Intended for server-side use (generateMetadata, opengraph-image, pages).
 *
 * Wrapped in React cache() so multiple calls within one request
 * (metadata + page body) hit Supabase only once.
 *
 * Returns null when the player genuinely has no rows; throws on query errors
 * so outages surface as errors rather than fake 404s.
 */
export const getPlayerData = cache(async (slug: string): Promise<PlayerMetadata | null> => {
  const name = unslugify(slug);
  const pattern = escapeLike(name);

  // Fetch latest from both tables in parallel
  const [singlesRes, doublesRes] = await Promise.all([
    supabase
      .schema('pickleball_ratings')
      .from('singles_ratings_deltas')
      .select('*')
      .ilike('player_name', pattern)
      .order('valid_from', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('*')
      .ilike('player_name', pattern)
      .order('valid_from', { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  // maybeSingle() only sets error on real failures (zero rows -> data: null, no error)
  if (singlesRes.error && doublesRes.error) {
    console.error('METADATA_FETCH_ERROR:', singlesRes.error, doublesRes.error);
    throw new Error('Failed to fetch player data');
  }

  if (!singlesRes.data && !doublesRes.data) {
    return null;
  }

  const actualName = singlesRes.data?.player_name || doublesRes.data?.player_name || name;

  return {
    name: actualName,
    latestSingles: singlesRes.data || undefined,
    latestDoubles: doublesRes.data || undefined
  };
});
