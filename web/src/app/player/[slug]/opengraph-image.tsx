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

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const player = await getPlayerData(slug);

  if (!player) {
    return new ImageResponse(
      (
        <div
          style={{
            background: '#020617',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DFFF00',
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

  const rating = player.latestDoubles?.rating || player.latestSingles?.rating || 0;
  const formattedRating = rating.toFixed(3);
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
          backgroundColor: '#020617',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #0a0f1a 0%, #020617 100%)',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#DFFF00', width: '24px', height: '24px', borderRadius: '4px' }} />
          <span style={{ color: '#DFFF00', fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.2em' }}>
            PLAYER PROFILE
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <h1
            style={{
              fontSize: '100px',
              fontWeight: '900',
              color: 'white',
              margin: '0',
              textTransform: 'uppercase',
              lineHeight: '1.1',
            }}
          >
            {player.name}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '60px', marginTop: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', letterSpacing: '0.3em', marginBottom: '10px' }}>
              DOUBLES RATING
            </span>
            <span style={{ color: '#DFFF00', fontSize: '72px', fontWeight: 'bold' }}>
              {player.latestDoubles?.rating.toFixed(3) || 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', letterSpacing: '0.3em', marginBottom: '10px' }}>
              GLOBAL RANK
            </span>
            <span style={{ color: 'white', fontSize: '72px', fontWeight: 'bold' }}>
              #{rank}
            </span>
          </div>
        </div>

        <div 
          style={{ 
            position: 'absolute', 
            bottom: '80px', 
            right: '80px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            opacity: 0.5
          }}
        >
          <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>dinkdash</span>
          <span style={{ color: '#DFFF00', fontSize: '24px' }}>.xyz</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
