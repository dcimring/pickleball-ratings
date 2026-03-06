import { Metadata } from 'next';
import { TourneyClient } from './TourneyClient';

export const metadata: Metadata = {
  title: "Tournament Bracket Check | DinkDash",
  description: "Instantly check ratings and rankings for entire tournament brackets or player lists in the Cayman Islands.",
  openGraph: {
    title: "Tournament Bracket Check | DinkDash",
    description: "Bulk rating lookup for pickleball tournaments in the Cayman Islands.",
  }
};

export default function TourneyPage() {
  return <TourneyClient />;
}
