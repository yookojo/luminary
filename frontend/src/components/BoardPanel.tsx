// BoardPanel — the middle panel: shows Manim videos and a loading state

import LoadingScene from './LoadingScene'

interface Props {
  videoUrl: string | null
  isRendering: boolean
  topic: string
  activeVisualTitle?: string | null
}

export default function BoardPanel({ videoUrl, isRendering, topic, activeVisualTitle }: Props) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(160deg, #06060b 0%, #09090f 100%)',
      borderRadius: '16px',
      border: '1px solid rgba(167,72,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header bar */}
      <div style={{
        padding: '12px 18px',
        borderBottom: '1px solid rgba(167,72,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        <span style={{
          fontSize: '12px', fontWeight: 600,
          color: 'rgba(239,178,255,0.45)',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {topic}
        </span>
        {activeVisualTitle && (
          <span style={{
            maxWidth: '55%',
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.68)',
            letterSpacing: '-0.01em',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {activeVisualTitle}
          </span>
        )}
      </div>

      {/* Main area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Video */}
        {videoUrl && !isRendering && (
          <video
            key={videoUrl}
            src={videoUrl}
            autoPlay
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}

        {/* Loading scene — replaces the old spinner */}
        {isRendering && (
          <LoadingScene label="Generating animation…" mode="fill" />
        )}

        {/* Empty state */}
        {!videoUrl && !isRendering && (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, rgba(239,178,255,0.16), rgba(167,72,255,0.07))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '12px',
            }}>
              luminary
            </p>
            <p style={{ color: 'rgba(239,178,255,0.2)', fontSize: '12px' }}>
              Animations will appear here as you learn
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
