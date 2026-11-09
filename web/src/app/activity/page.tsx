import { Metadata } from 'next';
import { getInitialActivityHistory } from '@/lib/rankings-api';
import { ActivityClient } from './ActivityClient';

export const metadata: Metadata = {
  alternates: { canonical: '/activity' },
  title: "Live Activity | CAYMANDINK",
  description: "Track the latest ranking changes, rating gains, and match activity across the Cayman Islands pickleball community.",
  openGraph: {
    title: "Live Activity | CAYMANDINK",
    description: "Real-time updates on rating changes and player activity in the Cayman Islands.",
  }
};

export default async function ActivityPage() {
  const initialDoubles = await getInitialActivityHistory();

  return <ActivityClient initialDoubles={initialDoubles} renderedAt={Date.now()} />;
}
