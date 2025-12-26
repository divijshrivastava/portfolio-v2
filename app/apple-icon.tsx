import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

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
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '40px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: '90px',
            fontWeight: 700,
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
          }}
        >
          DS
        </div>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            fontSize: '32px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'monospace',
          }}
        >
          &lt;
        </div>
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '15px',
            fontSize: '32px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'monospace',
          }}
        >
          /&gt;
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
