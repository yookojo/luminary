// ClassroomView — 2-panel layout: teacher/chat | board
// Shown after the agent calls the start_lesson tool.
// Teacher panel: 3D avatar driven by isTalking (from ElevenLabs isSpeaking)
// Board panel: Manim videos triggered by agent's render_animation tool calls
// NotesBar: wide bottom bar that slides up on session start

import { useState, useRef, useEffect, useCallback } from 'react'
import { initScene } from '@webspatial/react-sdk'
import { gsap } from 'gsap'
import type { LessonInfo, CompletedTopic, ChatMessage } from '@/App'
import { STATIC_DEMO_PROMPTS, type StaticDemoPrompt } from '@/lib/demoCatalog'
import TeacherPanelTabs from './TeacherPanelTabs'
import BoardPanel from './BoardPanel'
import NotesBar from './NotesBar'
import TopicsPanel from './TopicsPanel'

// true when running inside the WebSpatial / visionOS app shell
const IS_SPATIAL = import.meta.env.XR_ENV === 'avp'
const STATIC_DEMO_MODE = import.meta.env.VITE_STATIC_DEMO_MODE === 'true'
type NoteItem = { id: string; text: string; createdAt: number }

interface Props {
  lessonInfo: LessonInfo
  isTalking: boolean
  currentVideoUrl: string | null
  isRendering: boolean
  completedTopics: CompletedTopic[]
  demoLibraryTopics: CompletedTopic[]
  onSelectTopic: (url: string) => void
  conversationStatus: 'disconnected' | 'connecting' | 'connected' | 'disconnecting'
  isSpaceMode: boolean
  textMode: boolean
  demoNotice: string | null
  demoSuggestedPrompt: StaticDemoPrompt | null
  onToggleTextMode: () => void
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
}

export default function ClassroomView({
  lessonInfo,
  isTalking,
  currentVideoUrl,
  isRendering,
  completedTopics,
  demoLibraryTopics,
  onSelectTopic,
  conversationStatus,
  isSpaceMode,
  textMode,
  demoNotice,
  demoSuggestedPrompt,
  onToggleTextMode,
  messages,
  onSendMessage,
}: Props) {
  const [draft, setDraft] = useState('')
  const [isBrandHovered, setIsBrandHovered] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [notes, setNotes] = useState<NoteItem[]>([])
  const brandRef = useRef<HTMLSpanElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const teacherWinRef = useRef<WindowProxy | null>(null)
  const topicsWinRef = useRef<WindowProxy | null>(null)
  const notesLinkRef = useRef<HTMLAnchorElement>(null)
  const isTalkingRef = useRef(isTalking)
  const isSpaceModeRef = useRef(isSpaceMode)
  // stable ref so the channel listener always has the latest callback
  const onSelectTopicRef = useRef(onSelectTopic)
  useEffect(() => { onSelectTopicRef.current = onSelectTopic }, [onSelectTopic])
  useEffect(() => { isTalkingRef.current = isTalking }, [isTalking])
  useEffect(() => { isSpaceModeRef.current = isSpaceMode }, [isSpaceMode])

  // Open Teacher + Topics as separate spatial scenes on mount
  useEffect(() => {
    if (!IS_SPATIAL) return

    const channel = new BroadcastChannel('luminary-scene-sync')
    channelRef.current = channel

    channel.addEventListener('message', (e: MessageEvent) => {
      if (e.data?.type === 'select-topic') {
        onSelectTopicRef.current(e.data.videoUrl)
      }
      if (e.data?.type === 'teacher-scene-ready') {
        channel.postMessage({ type: 'teacher-state', isTalking: isTalkingRef.current })
        channel.postMessage({ type: 'teacher-mode', isSpaceMode: isSpaceModeRef.current })
      }
      if (e.data?.type === 'add-note' && e.data.note) {
        setNotes((prev) => {
          // Deduplicate in case the optimistic update in NotesScene already added it
          if (prev.some((n) => n.id === e.data.note.id)) return prev
          return [e.data.note, ...prev]
        })
      }
    })

    const base = window.location.href.split('?')[0].split('#')[0]
    let canceled = false
    const openSceneWindow = (
      sceneName: string,
      sceneQuery: string,
      setRef: (win: WindowProxy | null) => void,
    ) => {
      const open = (attempt = 0) => {
        if (canceled) return
        const win = window.open(base + sceneQuery, sceneName)
        if (win) {
          setRef(win)
          return
        }
        if (attempt < 6) {
          window.setTimeout(() => open(attempt + 1), 220 + attempt * 120)
        }
      }
      open()
    }

    initScene('luminary-teacher', (cfg) => ({
      ...cfg,
      defaultSize: isSpaceMode
        ? { width: 560, height: 780 }
        : { width: 400, height: 640 },
    }))
    openSceneWindow('luminary-teacher', '?scene=teacher', (win) => { teacherWinRef.current = win })

    initScene('luminary-topics', (cfg) => ({
      ...cfg,
      defaultSize: { width: 360, height: 560 },
    }))
    openSceneWindow('luminary-topics', '?scene=topics', (win) => { topicsWinRef.current = win })

    // Notes scene — opened via link element (WebSpatial link-element API)
    initScene('luminary-notes', (cfg) => ({
      ...cfg,
      defaultSize: { width: 980, height: 240 },
    }))
    window.setTimeout(() => {
      if (!canceled) notesLinkRef.current?.click()
    }, 60)

    // Ensure teacher scene starts in explicit idle state until speaking events arrive.
    channel.postMessage({ type: 'teacher-state', isTalking: false })
    channel.postMessage({ type: 'teacher-mode', isSpaceMode: isSpaceModeRef.current })

    return () => {
      canceled = true
      teacherWinRef.current?.close()
      topicsWinRef.current?.close()
      channel.close()
      channelRef.current = null
    }
  }, []) // run once on mount

  // Keep Teacher scene in sync with talking state
  useEffect(() => {
    channelRef.current?.postMessage({ type: 'teacher-state', isTalking })
  }, [isTalking])

  useEffect(() => {
    channelRef.current?.postMessage({ type: 'teacher-mode', isSpaceMode })
  }, [isSpaceMode])

  // Keep Topics scene in sync with completed topics + active video
  useEffect(() => {
    channelRef.current?.postMessage({
      type: 'topics-state',
      topics: completedTopics,
      libraryTopics: demoLibraryTopics,
      currentVideoUrl,
    })
  }, [completedTopics, currentVideoUrl, demoLibraryTopics])

  // Keep Notes scene in sync with notes state
  useEffect(() => {
    if (!IS_SPATIAL) return
    channelRef.current?.postMessage({ type: 'notes-state', notes })
  }, [notes])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = draft.trim()
    if (!text || isRendering) return
    onSendMessage(text)
    setDraft('')
  }

  const handleAddNote = useCallback(() => {
    const text = noteDraft.trim()
    if (!text) return
    setNotes((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, createdAt: Date.now() },
      ...prev,
    ])
    setNoteDraft('')
  }, [noteDraft])

  const requestMessages = messages.filter((msg) => msg.role === 'user')
  const effectiveTextMode = STATIC_DEMO_MODE || textMode

  const brandIsActive = conversationStatus === 'connected' || conversationStatus === 'connecting'
  const brandGlowStrength = isTalking ? 1 : brandIsActive ? 0.72 : 0.42
  const latestTopic = completedTopics[completedTopics.length - 1] ?? null
  const normalizedCurrentVideoUrl = currentVideoUrl ? currentVideoUrl.split('?')[0] : null
  const activeTopic = normalizedCurrentVideoUrl
    ? [...completedTopics].reverse().find((topic) => topic.videoUrl.split('?')[0] === normalizedCurrentVideoUrl)
      ?? demoLibraryTopics.find((topic) => topic.videoUrl.split('?')[0] === normalizedCurrentVideoUrl)
      ?? null
    : null
  const lessonSummary = latestTopic?.summary
    ?? latestTopic?.title
    ?? `Beginning with ${lessonInfo.topic} in ${lessonInfo.subject}.`
  const summaryMeta = latestTopic
    ? 'Latest lesson summary'
    : `Starting ${lessonInfo.subject}`
  const recommendedPrompts = demoSuggestedPrompt
    ? [demoSuggestedPrompt, ...STATIC_DEMO_PROMPTS.filter((prompt) => prompt !== demoSuggestedPrompt)]
    : [...STATIC_DEMO_PROMPTS]

  useEffect(() => {
    const brandEl = brandRef.current
    if (!brandEl) return

    const driftRange = isTalking ? 2 : brandIsActive ? 1.4 : 0.9
    let stopped = false
    let driftTween: gsap.core.Tween | null = null

    gsap.set(brandEl, { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' })

    const drift = () => {
      if (stopped) return
      driftTween = gsap.to(brandEl, {
        x: gsap.utils.random(-driftRange, driftRange),
        y: gsap.utils.random(-driftRange * 0.65, driftRange * 0.65),
        rotation: gsap.utils.random(-0.45, 0.45),
        duration: gsap.utils.random(1.4, 2.9),
        ease: 'sine.inOut',
        onComplete: drift,
      })
    }

    const shimmerTween = gsap.to(brandEl, {
      filter: `saturate(${isBrandHovered ? 1.28 : 1.12})`,
      duration: gsap.utils.random(1.8, 2.7),
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })

    drift()

    return () => {
      stopped = true
      driftTween?.kill()
      shimmerTween.kill()
      gsap.to(brandEl, { x: 0, y: 0, rotation: 0, duration: 0.25, ease: 'sine.out' })
    }
  }, [brandIsActive, isTalking, isBrandHovered])

  // Animation request panel — reused in both spatial and non-spatial layouts
  const chatPanel = (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: 0,
      height: '100%',
      borderRadius: '16px',
      background: 'linear-gradient(165deg, rgba(18,12,30,0.94) 0%, rgba(11,10,17,0.94) 100%)',
      border: '1px solid rgba(196,181,253,0.14)',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), 0 18px 38px rgba(0,0,0,0.24)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid rgba(196,181,253,0.10)',
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <span style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(226,214,255,0.72)',
        }}>
          Lesson Requests
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px',
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}>
        {STATIC_DEMO_MODE && (
          <div
            style={{
              marginBottom: '8px',
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid rgba(196,181,253,0.14)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
            }}
          >
            <p style={{
              margin: '0 0 4px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(226,214,255,0.68)',
              textAlign: 'center',
            }}>
              Start Here
            </p>
            <p style={{
              margin: '0 0 10px',
              fontSize: '11px',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.72)',
              textAlign: 'center',
            }}>
              For the cleanest board flow, begin with one of these guided prompts.
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
            }}>
              {recommendedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSendMessage(prompt)}
                  style={{
                    padding: '8px 11px',
                    borderRadius: '999px',
                    border: prompt === demoSuggestedPrompt
                      ? '1px solid rgba(250,204,21,0.34)'
                      : '1px solid rgba(167,72,255,0.26)',
                    background: prompt === demoSuggestedPrompt
                      ? 'rgba(250,204,21,0.14)'
                      : 'rgba(124,58,237,0.16)',
                    color: prompt === demoSuggestedPrompt
                      ? 'rgba(255,248,214,0.96)'
                      : 'rgba(255,255,255,0.9)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.18)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {STATIC_DEMO_MODE && demoNotice && (
          <div
            style={{
              marginBottom: '8px',
              padding: '12px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(250,204,21,0.22)',
              background: 'rgba(250,204,21,0.08)',
              color: 'rgba(255,245,200,0.92)',
              fontSize: '12px',
              lineHeight: 1.55,
              boxShadow: '0 12px 28px rgba(0,0,0,0.16)',
            }}
          >
            {demoNotice} Use the highlighted prompt above for the smoothest visual pivot.
          </div>
        )}

        {requestMessages.length === 0 && !isRendering && !STATIC_DEMO_MODE && (
          <p style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.34)',
            fontStyle: 'italic', textAlign: 'center', marginTop: '16px',
          }}>
            Ask for another visual and it will appear in your lesson history.
          </p>
        )}
        {requestMessages.map((msg) => (
          <div key={msg.id} style={{
            alignSelf: 'flex-end',
            maxWidth: '88%',
            padding: '8px 10px',
            borderRadius: '12px 12px 3px 12px',
            background: 'rgba(124,58,237,0.38)',
            border: '1px solid rgba(167,72,255,0.42)',
            fontSize: '11px',
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.95)',
            boxShadow: '0 0 12px rgba(124,58,237,0.18)',
          }}>
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0,
        padding: '7px', borderTop: '1px solid rgba(167,72,255,0.15)',
        display: 'flex', gap: '5px',
        background: 'rgba(92,32,180,0.06)',
      }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Transcript…"
          disabled={isRendering}
          className="lm-animate-input"
          style={{
            flex: 1,
            background: 'rgba(167,72,255,0.08)',
            border: '1px solid rgba(167,72,255,0.22)',
            borderRadius: '7px', padding: '7px 10px',
            color: 'white', fontSize: '11px', outline: 'none',
            opacity: isRendering ? 0.4 : 1,
            transition: 'border-color 0.2s',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || isRendering}
          style={{
            padding: '7px 12px', borderRadius: '7px', border: 'none',
            background: draft.trim() && !isRendering
              ? 'linear-gradient(135deg, rgba(167,72,255,0.85), rgba(124,58,237,0.9))'
              : 'rgba(124,58,237,0.18)',
            color: 'white', fontSize: '13px',
            cursor: draft.trim() && !isRendering ? 'pointer' : 'default',
            transition: 'background 0.2s, box-shadow 0.2s',
            boxShadow: draft.trim() && !isRendering ? '0 0 14px rgba(167,72,255,0.38)' : 'none',
          }}
        >↑</button>
      </div>
    </div>
  )

  const historyPanel = (
    <TopicsPanel
      topics={completedTopics}
      libraryTopics={demoLibraryTopics}
      currentVideoUrl={currentVideoUrl}
      onSelect={onSelectTopic}
    />
  )

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: IS_SPATIAL
        ? 'transparent'
        : 'radial-gradient(ellipse 55% 70% at 8% 50%, rgba(124,58,237,0.05) 0%, transparent 100%), radial-gradient(ellipse 55% 70% at 92% 50%, rgba(92,32,180,0.04) 0%, transparent 100%), #000',
    }}>
      {/* Top bar */}
      <div style={{
        minHeight: '88px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 22px',
        borderBottom: '1px solid rgba(196,181,253,0.08)',
        background: 'linear-gradient(180deg, rgba(13,11,20,0.94) 0%, rgba(10,10,14,0.72) 100%)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        position: 'relative',
        boxShadow: 'inset 0 -1px 0 rgba(196,181,253,0.08), 0 18px 38px rgba(0,0,0,0.24)',
      }}>
        {/* Left: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          <span
            ref={brandRef}
            onMouseEnter={() => setIsBrandHovered(true)}
            onMouseLeave={() => setIsBrandHovered(false)}
            style={{
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '-0.04em',
              color: '#efb2ff',
              fontFamily: '"Unbounded", "SF Pro Display", "SF Pro Text", sans-serif',
              transition: 'color 0.2s ease, text-shadow 0.2s ease',
              textShadow: `
                0 0 1px rgba(255,236,255,0.98),
                0 0 ${14 + (brandGlowStrength * 16)}px rgba(239,178,255,${0.28 + brandGlowStrength * 0.34}),
                0 0 ${24 + (brandGlowStrength * 26)}px rgba(167,72,255,${0.16 + brandGlowStrength * 0.28})
              `,
              animation: brandIsActive ? 'luminaryPulse 1.9s ease-in-out infinite' : 'none',
              cursor: 'default',
              userSelect: 'none',
              willChange: 'text-shadow, transform, opacity',
            }}
          >
            luminary
          </span>
        </div>

        {/* Middle: summary */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          pointerEvents: 'none',
          maxWidth: 'min(58vw, 760px)',
          width: '100%',
          padding: '0 180px',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(196,181,253,0.56)',
            marginBottom: '5px',
          }}>
            {summaryMeta}
          </span>
          <span style={{
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'rgba(255,255,255,0.94)',
            lineHeight: 1.28,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {lessonSummary}
          </span>
        </div>

        {/* Right: text toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2 }}>
          {STATIC_DEMO_MODE && (
            <div
              style={{
                padding: '7px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(167,139,250,0.24)',
                background: 'rgba(124,58,237,0.12)',
                color: 'rgba(255,255,255,0.78)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.01em',
                boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
              }}
            >
              Guided demo: sample visuals active
            </div>
          )}
          <button
            onClick={onToggleTextMode}
            title={effectiveTextMode ? 'Text mode active' : 'Switch to text (audio broken?)'}
            disabled={STATIC_DEMO_MODE}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: effectiveTextMode ? 'rgba(124,58,237,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${effectiveTextMode ? 'rgba(167,139,250,0.34)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '999px', padding: '6px 11px',
              color: effectiveTextMode ? 'rgba(226,214,255,0.92)' : 'rgba(255,255,255,0.48)',
              fontSize: '11px', fontWeight: 600,
              cursor: STATIC_DEMO_MODE ? 'default' : 'pointer',
              opacity: STATIC_DEMO_MODE ? 0.9 : 1,
              transition: 'all 0.2s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>
            </svg>
            {STATIC_DEMO_MODE ? 'Text Demo' : 'Text'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes luminaryPulse {
          0% { opacity: 0.9; filter: saturate(0.95); }
          50% { opacity: 1; filter: saturate(1.18); }
          100% { opacity: 0.9; filter: saturate(0.95); }
        }
        .lm-animate-input::placeholder { color: rgba(239,178,255,0.3); }
        .lm-animate-input:focus { border-color: rgba(167,72,255,0.48); }
      `}</style>

      {/* Body */}
      <div style={{
        flex: 1, display: 'flex', gap: '10px', padding: '10px 10px 0', minHeight: 0,
      }}>
        {IS_SPATIAL ? (
          // Spatial mode: teacher + topics live in their own scenes.
          <>
            {effectiveTextMode && (
              <div style={{ flex: '0 0 25%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {chatPanel}
              </div>
            )}
            <div style={{ flex: 1, minHeight: 0 }}>
              <BoardPanel
                videoUrl={currentVideoUrl}
                isRendering={isRendering}
                topic={lessonInfo.topic}
                activeVisualTitle={activeTopic?.title ?? null}
              />
            </div>
          </>
        ) : (
          // Web mode: left stack (teacher/chat + history) | board right
          <>
            <div style={{
                flex: '0 0 31%',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                overflow: 'hidden',
              }}>
              <div style={{
                flex: effectiveTextMode ? '1 1 50%' : '0 0 52%',
                minHeight: 0,
                display: 'flex',
              }}>
                {effectiveTextMode ? chatPanel : (
                  <TeacherPanelTabs isTalking={isTalking} isSpaceMode={isSpaceMode} />
                )}
              </div>
              <div style={{ flex: '1 1 0%', minHeight: 0, height: 0, display: 'flex', overflow: 'hidden' }}>
                {historyPanel}
              </div>
            </div>

            {/* Board — fills remaining space */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <BoardPanel
                videoUrl={currentVideoUrl}
                isRendering={isRendering}
                topic={lessonInfo.topic}
                activeVisualTitle={activeTopic?.title ?? null}
              />
            </div>
          </>
        )}
      </div>

      {/* Notes bar — slides up from bottom on mount (web only; spatial uses its own scene) */}
      {!IS_SPATIAL && (
        <NotesBar
          draft={noteDraft}
          notes={notes}
          onDraftChange={setNoteDraft}
          onAddNote={handleAddNote}
          isAddDisabled={!noteDraft.trim()}
        />
      )}

      {/* Hidden link element used by WebSpatial to open the notes scene window */}
      {IS_SPATIAL && (
        <a
          ref={notesLinkRef}
          href="?scene=notes"
          target="luminary-notes"
          enable-xr
          style={{ display: 'none' }}
        />
      )}
    </div>
  )
}
