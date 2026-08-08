import { MetadataRoute } from 'next';
import { BRAND_COLORS } from '@/lib/brand-config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DinkDash | Your Pickleball Dashboard',
    short_name: 'DinkDash',
    description: 'Real-time rank tracking and analytics for the Cayman Islands Pickleball community.',
    start_url: '/',
    display: 'standalone',
    background_color: BRAND_COLORS.background.hex,
    theme_color: BRAND_COLORS.primary.hex,
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
