import type { Metadata } from 'next';
import { getCurrentRankings } from '@/lib/rankings-api';
import { slugify } from '@/lib/slugify';
import { OWNER_NAME, OWNER_URL, SITE_NAME, SITE_URL as BASE_URL } from '@/lib/site-config';
import { HomeClient } from './HomeClient';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      image: `${BASE_URL}/og-image.jpg`,
      description: 'Independent tracker of Cayman Islands pickleball ratings and rating history.',
      areaServed: { '@type': 'Country', name: 'Cayman Islands' },
      founder: { '@type': 'Person', name: OWNER_NAME, url: OWNER_URL, sameAs: [OWNER_URL] },
    },
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: SITE_NAME,
      url: BASE_URL,
      publisher: { '@id': `${BASE_URL}/#organization` },
    },
  ],
};

export default async function RankingsPage() {
  // Shares the request-level cache with the layout's fetch
  const rankings = await getCurrentRankings();

  const jsonLd = rankings
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Cayman Islands Pickleball Doubles Rankings',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: rankings.doubles.length,
        itemListElement: rankings.doubles.slice(0, 25).map((player) => ({
          '@type': 'ListItem',
          position: player.rank_position,
          name: player.player_name,
          url: `${BASE_URL}/player/${slugify(player.player_name)}`,
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HomeClient />
    </>
  );
}
