import { ImageResponse } from 'next/og';
import { getPlayerHistory } from '@/lib/rankings-api';
import { OG_COLORS } from '@/lib/brand-config';
import { SITE_NAME, SITE_URL } from '@/lib/site-config';
import { Ranking } from '@/lib/types';

// Image metadata
export const alt = 'Player Profile Ranking';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const SPARK_W = 420;
const SPARK_H = 200;
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
  const area = `M${coords[0][0]},${SPARK_H} L${polyline.split(' ').join(' L')} L${coords[coords.length - 1][0]},${SPARK_H} Z`;
  const [endX, endY] = coords[coords.length - 1];
  const peakIndex = ratings.indexOf(max);
  const [peakX, peakY] = coords[peakIndex];

  return { polyline, area, endX, endY, peakX, peakY, max };
}

const condensed = {
  fontFamily: 'sans-serif',
  fontWeight: 800 as const,
  letterSpacing: '-0.03em',
  lineHeight: 0.9,
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await getPlayerHistory(slug).catch(() => null);

  if (!player) {
    return new ImageResponse(
      (
        <div
          style={{
            background: OG_COLORS.ground,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: OG_COLORS.text,
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '72px', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            {SITE_NAME} · Player
          </h1>
        </div>
      ),
      { ...size }
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
  const spark = sparklineGeometry(history);

  const dateLabel = new Date(current.valid_from).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const trackedSince = new Date(history[0].valid_from).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });

  const up = ratingDiff > 0;
  const moveColor = up ? OG_COLORS.volt : OG_COLORS.coral;
  const moveBg = up ? 'rgba(204,255,0,0.14)' : 'rgba(255,122,92,0.14)';

  // Font-safe arrows: inline SVG (the bundled OG font has no ▲/▼ glyphs)
  const triangle = (dir: 'up' | 'down', color: string) => (
    <svg width="18" height="14" viewBox="0 0 22 18">
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
          justifyContent: 'space-between',
          backgroundColor: OG_COLORS.ground,
          color: OG_COLORS.text,
          padding: '64px 72px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ghost rank numeral */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            top: '-110px',
            fontSize: '560px',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            color: '#121916',
            display: 'flex',
          }}
        >
          {rank}
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: OG_COLORS.muted, fontSize: '20px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: OG_COLORS.volt, boxShadow: `0 0 12px ${OG_COLORS.volt}` }} />
            Cayman {mode} · {dateLabel}
          </div>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '48px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: OG_COLORS.volt }}>
              No. {rank} in {mode}
            </span>
            <div
              style={{
                ...condensed,
                fontSize: player.name.length > 16 ? '80px' : '104px',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              {player.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '22px', marginTop: '6px' }}>
              <span style={{ ...condensed, fontSize: '96px', fontVariantNumeric: 'tabular-nums' }}>{rating}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '8px' }}>
                {ratingDiff !== 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: moveColor,
                      backgroundColor: moveBg,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '26px',
                      fontWeight: 700,
                      alignSelf: 'flex-start',
                    }}
                  >
                    {triangle(up ? 'up' : 'down', moveColor)}
                    {Math.abs(ratingDiff).toFixed(3)}
                  </div>
                ) : (
                  <span style={{ color: OG_COLORS.muted, fontSize: '22px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Unchanged</span>
                )}
                <span style={{ color: OG_COLORS.muted, fontSize: '18px' }}>
                  {previous && previous.rank_position !== rank ? `Rank ${previous.rank_position} → ${rank} · ` : ''}
                  {current.rounds_played} rounds
                </span>
              </div>
            </div>
          </div>

          {spark && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: `${SPARK_W}px` }}>
              <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}>
                <path d={spark.area} fill="rgba(204,255,0,0.10)" />
                <polyline points={spark.polyline} fill="none" stroke={OG_COLORS.volt} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={spark.endX} cy={spark.endY} r="7" fill={OG_COLORS.volt} />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: OG_COLORS.muted, fontSize: '18px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <span>Trend · since {trackedSince}</span>
                <span style={{ color: OG_COLORS.volt }}>Peak {spark.max.toFixed(3)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '22px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: OG_COLORS.muted,
          }}
        >
          <span style={{ fontSize: '20px' }}>{SITE_URL.replace('https://', '')}/player/{slug}</span>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Every rating change, recorded daily</span>
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
