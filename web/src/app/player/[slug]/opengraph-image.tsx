import { ImageResponse } from 'next/og';
import { getPlayerHistory } from '@/lib/rankings-api';
import { BRAND_COLORS } from '@/lib/brand-config';
import { Ranking } from '@/lib/types';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Player Profile Ranking';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const SPARK_W = 310;
const SPARK_H = 110;
const SPARK_PAD = 10;
const SPARK_POINTS = 20;

function sparklineGeometry(history: Ranking[]) {
  const ratings = history.slice(-SPARK_POINTS).map((r) => r.rating);
  if (ratings.length < 2) return null;

  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  // Flat histories still get a visible centered line
  const span = max - min || 1;

  const coords = ratings.map((rating, i) => {
    const x = SPARK_PAD + (i / (ratings.length - 1)) * (SPARK_W - SPARK_PAD * 2);
    const y = SPARK_H - SPARK_PAD - ((rating - min) / span) * (SPARK_H - SPARK_PAD * 2);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  });

  const polyline = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `M${coords[0][0]},${SPARK_H} L${polyline
    .split(' ')
    .join(' L')} L${coords[coords.length - 1][0]},${SPARK_H} Z`;
  const [endX, endY] = coords[coords.length - 1];

  return { polyline, area, endX, endY };
}

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const player = await getPlayerHistory(slug).catch(() => null);

  if (!player) {
    return new ImageResponse(
      (
        <div
          style={{
            background: BRAND_COLORS.primary.hex,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND_COLORS.secondary.hex,
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '64px', fontWeight: '400', letterSpacing: '-0.02em' }}>
            DinkDash | Profile
          </h1>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  // Prefer doubles (the flagship ranking); fall back to singles-only players
  const mode = player.doubles.length > 0 ? 'doubles' : 'singles';
  const history = mode === 'doubles' ? player.doubles : player.singles;
  const current = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;

  const rating = current.rating.toFixed(3);
  const rank = current.rank_position;
  const ratingDiff = previous ? current.rating - previous.rating : 0;
  const rankDiff = previous ? previous.rank_position - current.rank_position : 0;

  const spark = sparklineGeometry(history);
  const trackedSince = new Date(history[0].valid_from).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  const upColor = BRAND_COLORS.tertiary.hex;
  const downColor = '#ef4444';

  // Font-safe arrows: inline SVG (the bundled OG font has no ▲/▼ glyphs,
  // and satori doesn't support the CSS border-triangle trick)
  const triangle = (dir: 'up' | 'down', color: string) => (
    <svg width="22" height="18" viewBox="0 0 22 18">
      <path d={dir === 'up' ? 'M11 0 L22 18 L0 18 Z' : 'M11 18 L22 0 L0 0 Z'} fill={color} />
    </svg>
  );

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
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
            marginBottom: '36px',
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
                PLAYER PROFILE
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

        {/* Player Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '104px',
              fontWeight: '900',
              color: BRAND_COLORS.secondary.hex,
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '-0.05em',
              lineHeight: '0.9',
            }}
          >
            {player.name}
          </h1>
        </div>

        {/* Bottom Horizon: Stats left, trend right */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {/* Stats Section */}
          <div style={{ display: 'flex', gap: '44px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: BRAND_COLORS.secondary.hex, opacity: 0.5, fontSize: '22px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                {mode} Rating
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px' }}>
                <span style={{ color: BRAND_COLORS.tertiary.hex, fontSize: '92px', fontWeight: '900', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                  {rating}
                </span>
                {ratingDiff !== 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
                    {triangle(ratingDiff > 0 ? 'up' : 'down', ratingDiff > 0 ? upColor : downColor)}
                    <span
                      style={{
                        color: ratingDiff > 0 ? upColor : downColor,
                        fontSize: '30px',
                        fontWeight: '700',
                        lineHeight: '1',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {ratingDiff > 0 ? '+' : ''}
                      {ratingDiff.toFixed(3)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                width: '1px',
                height: '100px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                marginTop: '25px',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: BRAND_COLORS.secondary.hex, opacity: 0.5, fontSize: '22px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Official Rank
              </span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '18px' }}>
                <span style={{ color: BRAND_COLORS.secondary.hex, fontSize: '92px', fontWeight: '900', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                  #{rank}
                </span>
                {rankDiff !== 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px' }}>
                    {triangle(rankDiff > 0 ? 'up' : 'down', rankDiff > 0 ? upColor : downColor)}
                    <span
                      style={{
                        color: rankDiff > 0 ? upColor : downColor,
                        fontSize: '30px',
                        fontWeight: '700',
                        lineHeight: '1',
                      }}
                    >
                      {Math.abs(rankDiff)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating trend sparkline */}
          {spark && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              <span style={{ color: BRAND_COLORS.secondary.hex, opacity: 0.5, fontSize: '15px', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Trend · Since {trackedSince}
              </span>
              <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}>
                <path d={spark.area} fill="rgba(204,255,0,0.12)" />
                <polyline
                  points={spark.polyline}
                  fill="none"
                  stroke={BRAND_COLORS.tertiary.hex}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx={spark.endX} cy={spark.endY} r="8" fill={BRAND_COLORS.tertiary.hex} />
                <circle cx={spark.endX} cy={spark.endY} r="14" fill="rgba(204,255,0,0.25)" />
              </svg>
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=600',
      },
    }
  );
}
