import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlayerData } from '@/lib/metadata-api';
import { getPlayerHistory } from '@/lib/rankings-api';
import { PlayerProfileClient } from './PlayerProfileClient';

const BASE_URL = 'https://dinkdash.xyz';

// Cache rendered player pages for an hour (data updates once daily)
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  let player = null;
  try {
    player = await getPlayerData(slug);
  } catch {
    // Fall through to generic metadata on fetch failure
  }

  if (!player) {
    return {
      title: 'Player Profile | DinkDash',
      description: 'View player statistics and rankings on the Cayman Islands pickleball data platform.'
    };
  }

  const rating = player.latestDoubles?.rating || player.latestSingles?.rating || 0;
  const formattedRating = rating.toFixed(3);
  const playerName = player.name;

  return {
    title: `${playerName} | ${formattedRating} Rating | DinkDash`,
    description: `Check out ${playerName}'s latest ratings, global rankings, and performance history on the official Cayman Islands pickleball hub.`,
    openGraph: {
      title: `${playerName} | ${formattedRating} Rating | DinkDash`,
      description: `Check out ${playerName}'s latest pickleball stats and rankings on the Cayman Islands data platform.`,
      url: `https://dinkdash.xyz/player/${slug}`,
      siteName: 'DinkDash',
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
      title: `${playerName} | ${formattedRating} Rating | DinkDash`,
      description: `Performance history and real-time rankings for ${playerName} on the Cayman Islands hub.`,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
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
        />
      </Suspense>
    </>
  );
}
