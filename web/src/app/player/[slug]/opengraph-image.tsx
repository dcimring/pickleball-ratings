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

// Brand Colors (Hex equivalents of OKLCH for Satori compatibility)
const COLORS = {
  background: '#063890', // Royal Athletic Base
  primary: '#238145',    // Action Green
  foreground: '#FDFFFC', // White
  muted: '#FDFFFC80',    // White (50% opacity)
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
          <h1>DinkDash | Player Profile</h1>
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
        }}
      >
        {/* Top Branding Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: COLORS.primary, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <span style={{ color: COLORS.background, fontSize: '24px', fontWeight: '900' }}>D</span>
          </div>
          <span style={{ color: COLORS.primary, fontSize: '24px', fontWeight: '800', letterSpacing: '0.1em' }}>
            PLAYER PROFILE
          </span>
        </div>
        
        {/* Player Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '60px' }}>
          <h1
            style={{
              fontSize: '110px',
              fontWeight: '900',
              color: COLORS.foreground,
              margin: '0',
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              lineHeight: '0.9',
            }}
          >
            {player.name}
          </h1>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'flex', gap: '80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ color: COLORS.muted, fontSize: '20px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Doubles Rating
            </span>
            <span style={{ color: COLORS.primary, fontSize: '80px', fontWeight: '900', lineHeight: '1' }}>
              {doublesRating}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ color: COLORS.muted, fontSize: '20px', fontWeight: '700', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Global Rank
            </span>
            <span style={{ color: COLORS.foreground, fontSize: '80px', fontWeight: '900', lineHeight: '1' }}>
              #{rank}
            </span>
          </div>
        </div>

        {/* Footer Branding */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '80px', 
            right: '80px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
          }}
        >
          <span style={{ color: COLORS.foreground, fontSize: '28px', fontWeight: '800' }}>dinkdash</span>
          <span style={{ color: COLORS.primary, fontSize: '28px', fontWeight: '800' }}>.xyz</span>
        </div>

        {/* Decorative Element */}
        <div 
          style={{
            position: 'absolute',
            top: '0',
            right: '0',
            width: '400px',
            height: '400px',
            background: `radial-gradient(circle at 100% 0%, ${COLORS.primary}20 0%, transparent 70%)`,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
