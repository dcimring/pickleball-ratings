import { cache } from 'react';
import { supabase } from './supabase';
import { slugify } from './slugify';
import { HIDDEN_PLAYER_SLUGS } from './site-config';

/**
 * Maps a URL slug back to the exact player_name value(s) stored in the database.
 *
 * Slugs drop apostrophes, accents and punctuation, so they can't be converted
 * back to a name directly. More than one name can share a slug when the scraper
 * saw spelling variants ("ERIN HORTON" / "Erin Horton"); those share one profile.
 *
 * Returns [] for an unknown slug; throws on query errors so outages surface as
 * errors rather than fake 404s.
 */
export const resolvePlayerNames = cache(async (slug: string): Promise<string[]> => {
  if (HIDDEN_PLAYER_SLUGS.includes(slug.toLowerCase())) return [];

  const [singlesRes, doublesRes] = await Promise.all([
    supabase
      .schema('pickleball_ratings')
      .from('singles_ratings_deltas')
      .select('player_name')
      .eq('is_current', true),
    supabase
      .schema('pickleball_ratings')
      .from('doubles_ratings_deltas')
      .select('player_name')
      .eq('is_current', true),
  ]);

  if (singlesRes.error || doublesRes.error) {
    console.error('PLAYER_NAME_FETCH_ERROR:', singlesRes.error, doublesRes.error);
    throw new Error('Failed to resolve player name');
  }

  const target = slug.toLowerCase();
  const names = new Set<string>();
  for (const row of [...(singlesRes.data ?? []), ...(doublesRes.data ?? [])]) {
    if (row.player_name && slugify(row.player_name) === target) names.add(row.player_name);
  }
  return [...names];
});
