// TopicsPanel — right panel: scrollable list of completed animations
// Click any item to replay it in the BoardPanel

import type { CompletedTopic } from '@/App'

interface Props {
  topics: CompletedTopic[]
  currentVideoUrl: string | null
  onSelect: (url: string) => void
}

export default function TopicsPanel({ topics, currentVideoUrl, onSelect }: Props) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 0,
      background: 'linear-gradient(180deg, rgba(30,16,48,0.92) 0%, rgba(18,14,26,0.98) 55%, rgba(14,12,20,0.98) 100%)',
      borderRadius: '18px',
      border: '1px solid rgba(196,181,253,0.22)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 22px 46px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.02)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 16px 14px',
        borderBottom: '1px solid rgba(196,181,253,0.14)',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Label */}
        <p style={{
          margin: '0 0 12px',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: 'rgba(226,214,255,0.76)',
          textAlign: 'center',
          textShadow: '0 0 18px rgba(167,72,255,0.22)',
        }}>
          Lesson History
        </p>

        {/* Summary card — shows latest topic summary when available */}
        <div style={{
          position: 'relative',
          borderRadius: '14px',
          padding: '14px 15px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(92,32,180,0.11) 100%)',
          border: '1px solid rgba(196,181,253,0.26)',
          boxShadow: '0 0 28px rgba(124,58,237,0.16), inset 0 0 0 1px rgba(239,178,255,0.05)',
          overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(167,72,255,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {topics.length > 0 ? (
            <>
              <p style={{
                margin: '0 0 5px',
                fontSize: 'clamp(16px, 1.7vw, 20px)',
                fontWeight: 900,
                lineHeight: 1.22,
                letterSpacing: '-0.025em',
                backgroundImage: 'linear-gradient(135deg, #ffffff 0%, rgba(239,178,255,0.92) 55%, rgba(196,181,253,0.85) 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                position: 'relative',
                textAlign: 'center',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {topics[topics.length - 1].summary ?? topics[topics.length - 1].title}
              </p>
              <p style={{
                margin: 0,
                fontSize: '10px',
                color: 'rgba(226,214,255,0.62)',
                letterSpacing: '0.01em',
                textAlign: 'center',
              }}>
                {topics.length} {topics.length === 1 ? 'topic' : 'topics'} covered
              </p>
            </>
          ) : (
            <p style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'rgba(226,214,255,0.34)',
              lineHeight: 1.4,
              textAlign: 'center',
            }}>
              Your lesson summary will appear here
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes lmSparkDrift {
          0% { transform: translate3d(0, 0, 0); opacity: 0.75; }
          50% { transform: translate3d(0, 2px, 0); opacity: 0.92; }
          100% { transform: translate3d(0, 0, 0); opacity: 0.75; }
        }
      `}</style>

      {/* Topic list */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollbarGutter: 'stable',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}>
        {topics.length === 0 && (
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            textAlign: 'center',
            padding: '24px 8px',
            fontStyle: 'italic',
          }}>
            Completed topics will appear here
          </p>
        )}

        {[...topics].reverse().map((topic, i) => {
          const isActive = topic.videoUrl === currentVideoUrl
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.videoUrl)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 13px',
                borderRadius: '12px',
                border: `1px solid ${isActive ? 'rgba(196,181,253,0.58)' : 'rgba(255,255,255,0.06)'}`,
                background: isActive
                  ? 'rgba(124,58,237,0.28)'
                  : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                boxShadow: isActive ? '0 0 22px rgba(124,58,237,0.16)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(167,139,250,0.1)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              {/* Index badge */}
              <span style={{
                flexShrink: 0,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: isActive ? '#7c3aed' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 700,
                color: 'white',
                marginTop: '1px',
              }}>
                {topics.length - i}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.82)',
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
                }}>
                  {topic.summary ?? topic.title}
                </p>

                <p style={{
                  margin: '2px 0 0',
                  fontSize: '10px',
                  color: isActive ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
                }}>
                  {topic.summary ? topic.title : 'Generating summary…'}
                </p>

                {topic.keyPoints && topic.keyPoints.length > 0 && (
                  <div style={{
                    marginTop: '6px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}>
                    {topic.keyPoints.slice(0, 3).map((kp, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '9px',
                          padding: '3px 7px',
                          borderRadius: '999px',
                          border: `1px solid ${isActive ? 'rgba(196,181,253,0.30)' : 'rgba(255,255,255,0.07)'}`,
                          background: isActive ? 'rgba(196,181,253,0.10)' : 'rgba(255,255,255,0.02)',
                          color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)',
                        }}
                      >
                        {kp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
