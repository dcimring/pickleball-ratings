import { Metadata } from 'next';
import { ActivityClient } from './ActivityClient';

export const metadata: Metadata = {
  title: "Live Activity | DinkDash",
  description: "Track the latest ranking changes, rating gains, and match activity across the Cayman Islands pickleball community.",
  openGraph: {
    title: "Live Activity | DinkDash",
    description: "Real-time updates on rating changes and player activity in the Cayman Islands.",
  }
};

export default function ActivityPage() {
  return <ActivityClient />;
}
