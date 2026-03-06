import { supabase } from './supabase';
import { unslugify } from './slugify';
import { Ranking } from './types';

export interface PlayerMetadata {
  name: string;
  latestSingles?: Ranking;
  latestDoubles?: Ranking;
}

/**
 * Fetches the latest ratings for a player by their slug.
 * This is intended for use in server-side functions like generateMetadata
 * and opengraph-image.tsx.
 */
export async function getPlayerData(slug: string): Promise<PlayerMetadata | null> {
  const name = unslugify(slug);
  
  try {
    // Fetch latest from both tables in parallel
    const [singlesRes, doublesRes] = await Promise.all([
      supabase
        .schema('pickleball_ratings')
        .from('singles_ratings_deltas')
        .select('*')
        .ilike('player_name', name)
        .order('valid_from', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .schema('pickleball_ratings')
        .from('doubles_ratings_deltas')
        .select('*')
        .ilike('player_name', name)
        .order('valid_from', { ascending: false })
        .limit(1)
        .single()
    ]);

    // If no data found in either, return null
    if (singlesRes.error && doublesRes.error) {
      return null;
    }

    // Use the actual name from the DB if available, otherwise the unslugified name
    const actualName = singlesRes.data?.player_name || doublesRes.data?.player_name || name;

    return {
      name: actualName,
      latestSingles: singlesRes.data || undefined,
      latestDoubles: doublesRes.data || undefined
    };
  } catch (err) {
    console.error('METADATA_FETCH_ERROR:', err);
    return null;
  }
}
