import { Metadata } from 'next';
import { getWeeklyMovers } from '@/lib/rankings-api';
import { WeeklyRedirect } from './WeeklyRedirect';

const DIGEST_DESTINATION =
  '/activity?utm_source=whatsapp&utm_medium=digest&utm_campaign=weekly-movers';

/**
 * Landing page for the weekly WhatsApp Movers digest link.
 *
 * This is a real page (not a bare redirect) so link-preview crawlers —
 * which don't follow 30x responses — get full OG tags and the digest
 * card from ./opengraph-image.tsx. Humans are bounced to the Activity
 * page immediately by <WeeklyRedirect />. See docs/weekly-movers-digest.md.
 */
export async function generateMetadata(): Promise<Metadata> {
  const movers = await getWeeklyMovers().catch(() => null);

  const description = movers?.topGainer
    ? `${movers.count} players moved in the Cayman pickleball rankings this week. Biggest climb: ${movers.topGainer.name} +${movers.topGainer.ratingDiff.toFixed(3)}.`
    : 'Weekly movers in the Cayman Islands pickleball rankings — every rating change, tracked daily.';

  return {
    title: 'Weekly Movers | DinkDash',
    description,
    openGraph: {
      title: 'Cayman Pickleball Weekly Movers',
      description,
    },
    alternates: { canonical: '/activity' },
    robots: { index: false },
  };
}

export default function WeeklyPage() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <WeeklyRedirect destination={DIGEST_DESTINATION} />
      <a href={DIGEST_DESTINATION}>View this week&apos;s movers →</a>
    </main>
  );
}
