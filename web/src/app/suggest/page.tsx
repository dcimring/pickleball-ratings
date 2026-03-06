import { Metadata } from 'next';
import { SuggestClient } from './SuggestClient';

export const metadata: Metadata = {
  title: "Suggest a Feature | DinkDash",
  description: "Have an idea to improve the Cayman Islands pickleball dashboard? Let us know what features or data you'd like to see next.",
  openGraph: {
    title: "Suggest a Feature | DinkDash",
    description: "Help us shape the future of Cayman pickleball analytics.",
  }
};

export default function SuggestPage() {
  return <SuggestClient />;
}
