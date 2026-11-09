import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlayerData, PlayerMetadata } from '@/lib/metadata-api';
import { getCurrentRankings, getPlayerHistory, PlayerHistory } from '@/lib/rankings-api';
import type { Ranking } from '@/lib/types';
import { NearbyPlayer, PlayerProfileClient } from './PlayerProfileClient';
import { SITE_URL as BASE_URL } from '@/lib/site-config';
import { slugify } from '@/lib/slugify';

// Cache rendered player pages for an hour (data updates once daily)
export const revalidate = 3600;

// Returning an empty list makes Next cache each profile on first request;
// without generateStaticParams this route renders on every hit.
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ slug: string }>;
}

/** Players no longer listed who only ever had one snapshot have nothing worth indexing. */
function hasMeaningfulHistory(history: PlayerHistory) {
  const isListed = [history.doubles, history.singles].some((rows) => rows[rows.length - 1]?.is_active);
  return isListed || Math.max(history.doubles.length, history.singles.length) >= 2;
}

function nearbyOnBoard(board: Ranking[], slug: string): NearbyPlayer[] {
  const index = board.findIndex((row) => slugify(row.player_name) === slug);
  if (index === -1) return [];
  return [...board.slice(Math.max(0, index - 2), index), ...board.slice(index + 1, index + 3)].map((row) => ({
    name: row.player_name,
    slug: slugify(row.player_name),
    rank: row.rank_position,
    rating: row.rating,
  }));
}

function describePlayer(player: PlayerMetadata) {
  const mode = player.latestDoubles ? 'doubles' : 'singles';
  const latest = player.latestDoubles ?? player.latestSingles;
  if (!latest) {
    return `${player.name}'s Cayman Islands pickleball rating history on CAYMANDINK, an independent ratings tracker.`;
  }
  const standing = latest.is_active
    ? `is No. ${latest.rank_position} in Cayman Islands ${mode} pickleball with a ${latest.rating.toFixed(3)} rating`
    : `has a last recorded Cayman Islands ${mode} pickleball rating of ${latest.rating.toFixed(3)}`;
  return `${player.name} ${standing}. See rating history, peak and ranking changes on CAYMANDINK, an independent ratings tracker.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let player = null;
  let history: PlayerHistory | null = null;
  try {
    player = await getPlayerData(slug);
    history = await getPlayerHistory(slug);
  } catch {
    // Fall through to generic metadata on fetch failure
  }

  if (!player) {
    return {
      title: 'Player Profile | CAYMANDINK',
      description: 'View player statistics and rankings on the Cayman Islands pickleball data platform.'
    };
  }

  const rating = player.latestDoubles?.rating || player.latestSingles?.rating || 0;
  const formattedRating = rating.toFixed(3);
  const playerName = player.name;
  const canonicalPath = `/player/${slugify(playerName)}`;
  const shareTitle = `${playerName} | ${formattedRating} Rating | CAYMANDINK`;
  const description = describePlayer(player);

  return {
    title: `${playerName} – Cayman Islands Pickleball Rating & History | CAYMANDINK`,
    description,
    alternates: { canonical: canonicalPath },
    ...(history && !hasMeaningfulHistory(history) ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: shareTitle,
      description,
      url: `${BASE_URL}${canonicalPath}`,
      siteName: 'CAYMANDINK',
      locale: 'en_US',
      type: 'profile',
      images: [
        {
          url: `/player/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${playerName} Pickleball Rating`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description,
      images: [`/player/${slug}/opengraph-image`],
    }
  };
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug } = await params;
  const history = await getPlayerHistory(slug);

  if (!history) {
    notFound();
  }

  const latestDoubles = history.doubles[history.doubles.length - 1];
  const latestSingles = history.singles[history.singles.length - 1];
  const rating = latestDoubles?.rating ?? latestSingles?.rating;

  const lastChange = [latestDoubles?.valid_from, latestSingles?.valid_from].filter(Boolean).sort().at(-1);

  const canonicalSlug = slugify(history.name);
  const rankings = await getCurrentRankings();
  const nearby = {
    doubles: nearbyOnBoard(rankings?.doubles ?? [], canonicalSlug),
    singles: nearbyOnBoard(rankings?.singles ?? [], canonicalSlug),
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: lastChange,
    mainEntity: {
      '@type': 'Person',
      name: history.name,
      url: `${BASE_URL}/player/${slug}`,
      description: rating
        ? `Cayman Islands pickleball player rated ${rating.toFixed(3)}.`
        : 'Cayman Islands pickleball player.',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <PlayerProfileClient
          slug={slug}
          playerName={history.name}
          initialHistory={{ singles: history.singles, doubles: history.doubles }}
          nearby={nearby}
        />
      </Suspense>
    </>
  );
}
