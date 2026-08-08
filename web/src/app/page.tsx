import { getCurrentRankings } from '@/lib/rankings-api';
import { slugify } from '@/lib/slugify';
import { HomeClient } from './HomeClient';

const BASE_URL = 'https://dinkdash.xyz';

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
