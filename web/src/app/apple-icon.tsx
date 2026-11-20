import { ImageResponse } from 'next/og';
import { OG_COLORS } from '@/lib/brand-config';

// iOS home-screen icon (Safari ignores SVG icons). Mirrors app/icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: OG_COLORS.surface,
        }}
      >
        <div
          style={{
            width: '124px',
            height: '124px',
            borderRadius: '22px',
            backgroundColor: OG_COLORS.volt,
            color: OG_COLORS.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '96px',
            fontWeight: 800,
            fontFamily: 'sans-serif',
          }}
        >
          C
        </div>
      </div>
    ),
    size
  );
}
