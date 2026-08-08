import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { slugify } from '@/lib/slugify';

import { SITE_URL as BASE_URL } from '@/lib/site-config';

// Regenerate the sitemap at most once per hour
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/activity`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tourney`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/alerts`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/suggest`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
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

    const names = new Set<string>();
    for (const row of [...(singlesRes.data ?? []), ...(doublesRes.data ?? [])]) {
      if (row.player_name) names.add(row.player_name);
    }

    const playerRoutes: MetadataRoute.Sitemap = Array.from(names).map((name) => ({
      url: `${BASE_URL}/player/${slugify(name)}`,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...staticRoutes, ...playerRoutes];
  } catch (err) {
    console.error('SITEMAP_FETCH_ERROR:', err);
    return staticRoutes;
  }
}
