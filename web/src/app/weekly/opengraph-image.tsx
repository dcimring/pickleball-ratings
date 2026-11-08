import { ImageResponse } from 'next/og';
import { getWeeklyMovers } from '@/lib/rankings-api';
import { OG_COLORS } from '@/lib/brand-config';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';

// Image metadata
export const alt = 'Cayman Pickleball Weekly Movers';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const condensed = {
  fontFamily: 'sans-serif',
  fontWeight: 800 as const,
  letterSpacing: '-0.03em',
  lineHeight: 0.9,
};

export default async function Image() {
  const movers = await getWeeklyMovers().catch(() => null);

  const weekOf = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const gainer = movers?.topGainer ?? null;
  const milestone = movers?.milestone ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: OG_COLORS.ground,
          color: OG_COLORS.text,
          padding: '56px 72px',
          gap: '56px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left: headline + gainer */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '5px',
                  backgroundColor: OG_COLORS.volt,
                  color: OG_COLORS.ground,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                C
              </div>
              <span style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{SITE_NAME}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: OG_COLORS.muted, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: OG_COLORS.volt, boxShadow: `0 0 12px ${OG_COLORS.volt}` }} />
              Week of {weekOf} · Doubles
            </div>
            <div style={{ ...condensed, fontSize: '120px', lineHeight: 0.84, textTransform: 'uppercase', display: 'flex', flexDirection: 'column' }}>
              <span>Weekly</span>
              <span>Movers</span>
            </div>
          </div>

          {gainer ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '20px',
                backgroundColor: OG_COLORS.volt,
                color: OG_COLORS.ground,
                borderRadius: '10px',
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: OG_COLORS.voltInk }}>Gainer of the week</span>
                <span style={{ fontSize: gainer.name.length > 18 ? '26px' : '32px', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.01em' }}>{gainer.name}</span>
                <span style={{ fontSize: '17px', color: OG_COLORS.voltInk }}>
                  {gainer.rankDiff > 0 ? `Up ${gainer.rankDiff} to No. ${gainer.rank}` : `No. ${gainer.rank}`} · now {gainer.rating.toFixed(3)}
                </span>
              </div>
              <span style={{ ...condensed, fontSize: '72px', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>+{gainer.ratingDiff.toFixed(3)}</span>
            </div>
          ) : (
            <span style={{ color: OG_COLORS.muted, fontSize: '28px', lineHeight: 1.3 }}>Every rating change on the island, tracked daily.</span>
          )}
        </div>

        {/* Right: board */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '420px',
            backgroundColor: OG_COLORS.surface,
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', padding: '16px 20px', color: OG_COLORS.muted, fontSize: '16px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', borderBottom: `1px solid ${OG_COLORS.hairline}` }}>
            This week
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 20px', borderBottom: `1px solid ${OG_COLORS.hairline}` }}>
            <span style={{ color: OG_COLORS.muted, fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Players moved</span>
            <span style={{ ...condensed, fontSize: '72px' }}>{movers?.count ?? '—'}</span>
          </div>

          {milestone ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 20px', borderBottom: `1px solid ${OG_COLORS.hairline}` }}>
              <span style={{ color: OG_COLORS.muted, fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Crossed {milestone.threshold.toFixed(1)}</span>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>{milestone.name}</span>
              <span style={{ ...condensed, fontSize: '48px', color: OG_COLORS.volt }}>{milestone.rating.toFixed(3)}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '18px 20px', borderBottom: `1px solid ${OG_COLORS.hairline}` }}>
              <span style={{ color: OG_COLORS.muted, fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Risers and fallers</span>
              <span style={{ fontSize: '20px', color: OG_COLORS.muted, lineHeight: 1.4 }}>Open the link for the full board and every player&apos;s trajectory.</span>
            </div>
          )}

          <div style={{ display: 'flex', marginTop: 'auto', padding: '16px 20px', color: OG_COLORS.muted, fontSize: '17px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {SITE_URL.replace('https://', '')}/weekly
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        // Shorter cache than player cards: this image changes weekly and
        // WhatsApp fetches it at post time.
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
      },
    }
  );
}
