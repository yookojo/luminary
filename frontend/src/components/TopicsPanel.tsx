// TopicsPanel — right panel: covered lesson visuals + full demo library
// Click any item to replay it in the BoardPanel

import type { CompletedTopic } from '@/App'

interface Props {
  topics: CompletedTopic[]
  libraryTopics?: CompletedTopic[]
  currentVideoUrl: string | null
  onSelect: (url: string) => void
}

function normalizeVideoUrl(url: string | null) {
  return url ? url.split('?')[0] : null
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      margin: '4px 2px 2px',
      fontSize: '10px',
      fontWeight: 800,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: 'rgba(226,214,255,0.48)',
      textAlign: 'center',
    }}>
      {children}
    </p>
  )
}

interface TopicCardProps {
  topic: CompletedTopic
  badge: string
  badgeTitle: string
  currentVideoUrl: string | null
  onSelect: (url: string) => void
}

function TopicCard({ topic, badge, badgeTitle, currentVideoUrl, onSelect }: TopicCardProps) {
  const isActive = normalizeVideoUrl(topic.videoUrl) === normalizeVideoUrl(currentVideoUrl)

  return (
    <button
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
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(167,139,250,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        }
      }}
    >
      <span
        title={badgeTitle}
        style={{
          flexShrink: 0,
          minWidth: '24px',
          height: '20px',
          padding: '0 6px',
          borderRadius: '999px',
          background: isActive ? '#7c3aed' : 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          fontWeight: 800,
          color: 'white',
          marginTop: '1px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {badge}
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
          {topic.title}
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
}

export default function TopicsPanel({
  topics,
  libraryTopics = [],
  currentVideoUrl,
  onSelect,
}: Props) {
  const coveredTopics = [...topics].reverse()
  const coveredUrls = new Set(coveredTopics.map((topic) => normalizeVideoUrl(topic.videoUrl)))
  const visibleLibraryTopics = libraryTopics.filter(
    (topic) => !coveredUrls.has(normalizeVideoUrl(topic.videoUrl)),
  )
  const featuredLibraryTopics = visibleLibraryTopics.filter((topic) => topic.featured)
  const moreLibraryTopics = visibleLibraryTopics.filter((topic) => !topic.featured)
  const featuredTopic = topics[topics.length - 1] ?? visibleLibraryTopics[0] ?? null

  return (
    <div style={{
      width: '100%',
      height: '100%',
      flex: '1 1 0%',
      maxHeight: '100%',
      minHeight: 0,
      overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(30,16,48,0.92) 0%, rgba(18,14,26,0.98) 55%, rgba(14,12,20,0.98) 100%)',
      borderRadius: '18px',
      border: '1px solid rgba(196,181,253,0.22)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 22px 46px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.02)',
    }}>
      <div style={{
        padding: '16px 16px 14px',
        borderBottom: '1px solid rgba(196,181,253,0.14)',
        flexShrink: 0,
        position: 'relative',
      }}>
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

        <div style={{
          position: 'relative',
          borderRadius: '14px',
          padding: '14px 15px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(92,32,180,0.11) 100%)',
          border: '1px solid rgba(196,181,253,0.26)',
          boxShadow: '0 0 28px rgba(124,58,237,0.16), inset 0 0 0 1px rgba(239,178,255,0.05)',
          overflow: 'hidden',
        }}>
          <div aria-hidden style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(167,72,255,0.12), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {featuredTopic ? (
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
                {featuredTopic.summary ?? featuredTopic.title}
              </p>
              <p style={{
                margin: 0,
                fontSize: '10px',
                color: 'rgba(226,214,255,0.62)',
                letterSpacing: '0.01em',
                textAlign: 'center',
              }}>
                {topics.length > 0
                  ? `${topics.length} ${topics.length === 1 ? 'topic' : 'topics'} covered this session`
                  : `${libraryTopics.length} demo visuals ready to explore`}
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
        .lm-topics-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(196,181,253,0.38) transparent;
        }

        .lm-topics-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .lm-topics-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .lm-topics-scroll::-webkit-scrollbar-thumb {
          background: rgba(196,181,253,0.28);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .lm-topics-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(196,181,253,0.42);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>

      <div
        className="lm-topics-scroll"
        style={{
          flex: '1 1 0%',
          height: 0,
          maxHeight: '100%',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarGutter: 'stable',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        {coveredTopics.length === 0 && visibleLibraryTopics.length === 0 && (
          <p style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            textAlign: 'center',
            padding: '24px 8px',
            fontStyle: 'italic',
          }}>
            Demo visuals will appear here
          </p>
        )}

        {coveredTopics.length > 0 && (
          <>
            <SectionLabel>Covered This Session</SectionLabel>
            {coveredTopics.map((topic, index) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                badge={String(coveredTopics.length - index)}
                badgeTitle="Covered topic"
                currentVideoUrl={currentVideoUrl}
                onSelect={onSelect}
              />
            ))}
          </>
        )}

        {featuredLibraryTopics.length > 0 && (
          <>
            <SectionLabel>Featured Demo Visuals</SectionLabel>
            {featuredLibraryTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                badge="demo"
                badgeTitle="Demo library visual"
                currentVideoUrl={currentVideoUrl}
                onSelect={onSelect}
              />
            ))}
          </>
        )}

        {moreLibraryTopics.length > 0 && (
          <>
            <SectionLabel>More Demo Visuals</SectionLabel>
            {moreLibraryTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                badge="more"
                badgeTitle="Additional demo visual"
                currentVideoUrl={currentVideoUrl}
                onSelect={onSelect}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
