import { Metadata } from 'next';
import { Alerts } from '@/components/Alerts';

export const metadata: Metadata = {
  title: "Performance Alerts | DinkDash",
  description: "Stay updated on the biggest movers and latest ranking changes in the Cayman Islands pickleball scene.",
  openGraph: {
    title: "Performance Alerts | DinkDash",
    description: "Real-time notifications for ranking changes and performance milestones.",
  }
};

export default function AlertsPage() {
  return <Alerts />;
}
