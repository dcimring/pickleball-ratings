import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlayerData } from '@/lib/metadata-api';
import { PlayerProfileClient } from './PlayerProfileClient';

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
  const player = await getPlayerData(slug);

  if (!player) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <PlayerProfileClient />
    </Suspense>
  );
}
