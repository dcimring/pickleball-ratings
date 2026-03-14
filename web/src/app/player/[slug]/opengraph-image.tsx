import { ImageResponse } from 'next/og';
import { getPlayerData } from '@/lib/metadata-api';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Player Profile Ranking';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Brand Colors (Athletic Royal Scheme)
const COLORS = {
  background: '#1247b1', // Primary Base
  primary: '#47b112',    // Action Green
  foreground: '#FDFFFC', // White
  muted: '#FDFFFC80',    // White (50% opacity)
  ghost: 'rgba(253, 255, 252, 0.1)', // Ghost Border
};

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const player = await getPlayerData(slug);

  if (!player) {
    return new ImageResponse(
      (
        <div
          style={{
            background: COLORS.background,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.primary,
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-0.02em' }}>
            DINKDASH | PROFILE
          </h1>
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const doublesRating = player.latestDoubles?.rating.toFixed(3) || 'N/A';
  const singlesRating = player.latestSingles?.rating.toFixed(3) || 'N/A';
  const rank = player.latestDoubles?.rank_position || player.latestSingles?.rank_position || 'N/A';

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
          backgroundColor: COLORS.background,
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Atmosphere: Stadium Beam Gradients */}
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '800px',
            height: '800px',
            background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
          }}
        />
        <div 
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: `radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)`,
          }}
        />

        {/* Outer Ghost Border Frame */}
        <div 
          style={{
            position: 'absolute',
            inset: '40px',
            border: `1px solid ${COLORS.ghost}`,
            borderRadius: '32px',
          }}
        />

        {/* Top Branding Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', zIndex: 10 }}>
          <div 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              backgroundColor: COLORS.primary, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(35, 129, 69, 0.3)',
            }}
          >
            <span style={{ color: COLORS.foreground, fontSize: '32px', fontWeight: '900' }}>D</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: COLORS.primary, fontSize: '24px', fontWeight: '900', letterSpacing: '0.2em' }}>
              PLAYER PROFILE
            </span>
            <span style={{ color: COLORS.muted, fontSize: '16px', fontWeight: '700', letterSpacing: '0.1em' }}>
              CAYMAN ISLANDS PICKLEBALL
            </span>
          </div>
        </div>
        
        {/* Player Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '60px', zIndex: 10 }}>
          <h1
            style={{
              fontSize: '130px',
              fontWeight: '900',
              color: COLORS.foreground,
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '-0.05em',
              lineHeight: '0.9',
            }}
          >
            {player.name}
          </h1>
        </div>

        {/* Bottom Horizon: Stats & Branding aligned to the same baseline */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 10 }}>
          {/* Stats Section */}
          <div style={{ display: 'flex', gap: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: COLORS.muted, fontSize: '22px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Rating
              </span>
              <span style={{ color: COLORS.primary, fontSize: '100px', fontWeight: '900', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                {doublesRating}
              </span>
            </div>
            
            <div 
              style={{ 
                width: '1px', 
                height: '110px', 
                backgroundColor: COLORS.ghost, 
                marginTop: '25px' 
              }} 
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: COLORS.muted, fontSize: '22px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Official Rank
              </span>
              <span style={{ color: COLORS.foreground, fontSize: '100px', fontWeight: '900', lineHeight: '1', fontVariantNumeric: 'tabular-nums' }}>
                #{rank}
              </span>
            </div>
          </div>

          {/* Footer Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '5px' }}>
            <span style={{ color: COLORS.foreground, fontSize: '38px', fontWeight: '900', letterSpacing: '-0.02em' }}>dinkdash</span>
            <span style={{ color: COLORS.primary, fontSize: '38px', fontWeight: '900' }}>.xyz</span>
          </div>
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
