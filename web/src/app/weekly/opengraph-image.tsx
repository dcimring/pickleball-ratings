import { ImageResponse } from 'next/og';
import { getWeeklyMovers } from '@/lib/rankings-api';
import { BRAND_COLORS } from '@/lib/brand-config';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Cayman Pickleball Weekly Movers';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const movers = await getWeeklyMovers().catch(() => null);

  const weekOf = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const stats: { label: string; value: string; accent: boolean }[] = [];
  if (movers && movers.count > 0) {
    stats.push({ label: 'Players Moved', value: `${movers.count}`, accent: false });
    if (movers.topGainer) {
      stats.push({
        label: `Biggest Climb · ${movers.topGainer.name}`,
        value: `+${movers.topGainer.ratingDiff.toFixed(3)}`,
        accent: true,
      });
    }
    if (movers.milestone) {
      stats.push({
        label: `Crossed ${movers.milestone.threshold.toFixed(1)} · ${movers.milestone.name}`,
        value: movers.milestone.rating.toFixed(3),
        accent: true,
      });
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: BRAND_COLORS.primary.hex,
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Atmosphere: Subtle Light Beams */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, rgba(204,255,0,0.05) 0%, transparent 70%)`,
          }}
        />

        {/* Outer Ghost Border Frame */}
        <div
          style={{
            position: 'absolute',
            inset: '40px',
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: '32px',
          }}
        />

        {/* Top row: branding left, site right */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: BRAND_COLORS.secondary.hex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              }}
            >
              <span style={{ color: BRAND_COLORS.primary.hex, fontSize: '32px', fontWeight: '400' }}>D</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: BRAND_COLORS.secondary.hex, fontSize: '24px', fontWeight: '400', letterSpacing: '0.2em' }}>
                WEEKLY DIGEST
              </span>
              <span style={{ color: BRAND_COLORS.secondary.hex, opacity: 0.5, fontSize: '16px', fontWeight: '700', letterSpacing: '0.1em' }}>
                CAYMAN ISLANDS PICKLEBALL
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: BRAND_COLORS.secondary.hex, fontSize: '34px', fontWeight: '400', letterSpacing: '-0.02em' }}>dinkdash</span>
            <span style={{ color: BRAND_COLORS.tertiary.hex, fontSize: '34px', fontWeight: '400' }}>.xyz</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1
            style={{
              fontSize: '116px',
              fontWeight: '900',
              color: BRAND_COLORS.secondary.hex,
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '-0.05em',
              lineHeight: '0.9',
            }}
          >
            Weekly Movers
          </h1>
          <span
            style={{
              color: BRAND_COLORS.secondary.hex,
              opacity: 0.5,
              fontSize: '26px',
              fontWeight: '700',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginTop: '18px',
            }}
          >
            Week of {weekOf}
          </span>
        </div>

        {/* Stat row */}
        {stats.length > 0 ? (
          <div style={{ display: 'flex', width: '100%', gap: '36px', alignItems: 'flex-end' }}>
            {stats.map((stat, i) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'flex-end', gap: '36px' }}>
                {i > 0 && (
                  <div style={{ width: '1px', height: '90px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span
                    style={{
                      color: BRAND_COLORS.secondary.hex,
                      opacity: 0.5,
                      fontSize: '18px',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    style={{
                      color: stat.accent ? BRAND_COLORS.tertiary.hex : BRAND_COLORS.secondary.hex,
                      fontSize: '72px',
                      fontWeight: '900',
                      lineHeight: '1',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span
            style={{
              color: BRAND_COLORS.secondary.hex,
              opacity: 0.7,
              fontSize: '32px',
              fontWeight: '400',
            }}
          >
            Every rating change on the island, tracked daily.
          </span>
        )}
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
