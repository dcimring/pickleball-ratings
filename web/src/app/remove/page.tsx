import { Metadata } from 'next';
import { RemoveClient } from './RemoveClient';

export const metadata: Metadata = {
  title: 'Request Profile Removal | CAYMANDINK',
  description: 'Ask CAYMANDINK to remove your player profile.',
  alternates: { canonical: '/remove' },
  robots: { index: false, follow: true },
};

export default function RemovePage() {
  return <RemoveClient />;
}
