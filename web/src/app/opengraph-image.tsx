import { ImageResponse } from 'next/og';
import { OG_COLORS } from '@/lib/brand-config';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

// Site-wide share card. No data, so it is rendered once at build time.
export const alt = 'CAYMANDINK Cayman Islands Pickleball Rankings';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const condensed = {
  fontWeight: 800 as const,
  letterSpacing: '-0.03em',
  lineHeight: 0.84,
};

const COURT_LINE = 'rgba(255,255,255,0.22)';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: OG_COLORS.ground,
          color: OG_COLORS.text,
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Court lines: outer boundary, kitchen line and centre line */}
        <div style={{ position: 'absolute', top: '40px', right: '-260px', width: '560px', height: '550px', border: `6px solid ${COURT_LINE}`, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '40px', right: '30px', width: '6px', height: '550px', backgroundColor: COURT_LINE, display: 'flex' }} />
        <div style={{ position: 'absolute', top: '312px', right: '-260px', width: '290px', height: '6px', backgroundColor: COURT_LINE, display: 'flex' }} />

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '7px',
                backgroundColor: OG_COLORS.volt,
                color: OG_COLORS.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 800,
              }}
            >
              C
            </div>
            <span style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{SITE_NAME}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: OG_COLORS.muted, fontSize: '22px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: OG_COLORS.volt, boxShadow: `0 0 12px ${OG_COLORS.volt}` }} />
              Cayman Islands · Doubles &amp; Singles
            </div>
            <div style={{ ...condensed, fontSize: '150px', textTransform: 'uppercase', display: 'flex', flexDirection: 'column' }}>
              <span>Pickleball</span>
              <span style={{ color: OG_COLORS.volt }}>Rankings</span>
            </div>
            <span style={{ color: OG_COLORS.muted, fontSize: '30px', lineHeight: 1.3, maxWidth: '640px' }}>
              Every rating change on the island, tracked daily.
            </span>
          </div>

          <div style={{ display: 'flex', color: OG_COLORS.muted, fontSize: '22px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {SITE_URL.replace('https://', '')}
          </div>
        </div>
      </div>
    ),
    size
  );
}
