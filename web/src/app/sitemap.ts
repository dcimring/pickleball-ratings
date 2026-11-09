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
        .select('player_name, valid_from')
        .eq('is_current', true)
        .eq('is_active', true),
      supabase
        .schema('pickleball_ratings')
        .from('doubles_ratings_deltas')
        .select('player_name, valid_from')
        .eq('is_current', true)
        .eq('is_active', true),
    ]);

    // Keyed by slug so spelling variants of one name produce a single URL
    const lastChangeBySlug = new Map<string, string>();
    let newestChange: string | undefined;
    for (const row of [...(singlesRes.data ?? []), ...(doublesRes.data ?? [])]) {
      if (!row.player_name) continue;
      const slug = slugify(row.player_name);
      const known = lastChangeBySlug.get(slug);
      if (!known || row.valid_from > known) lastChangeBySlug.set(slug, row.valid_from);
      if (!newestChange || row.valid_from > newestChange) newestChange = row.valid_from;
    }

    const playerRoutes: MetadataRoute.Sitemap = Array.from(lastChangeBySlug).map(([slug, lastModified]) => ({
      url: `${BASE_URL}/player/${slug}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    // The board and movers feed change whenever any rating does
    const datedStaticRoutes = staticRoutes.map((route) =>
      newestChange && (route.url === BASE_URL || route.url === `${BASE_URL}/activity`)
        ? { ...route, lastModified: newestChange }
        : route
    );

    return [...datedStaticRoutes, ...playerRoutes];
  } catch (err) {
    console.error('SITEMAP_FETCH_ERROR:', err);
    return staticRoutes;
  }
}
