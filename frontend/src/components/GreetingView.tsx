import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'

const WAVE_BAR_COUNT = 7
const MIC_FRAGMENT_CLIPS = [
  'polygon(0 0, 50% 0, 50% 50%, 0 50%)',
  'polygon(50% 0, 100% 0, 100% 50%, 50% 50%)',
  'polygon(0 50%, 50% 50%, 50% 100%, 0 100%)',
  'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)',
] as const
const WAVE_AMPLITUDES = [0.52, 0.74, 0.98, 1.18, 0.98, 0.74, 0.52] as const

const HERO_PHRASES = [
  'deeply human.',
  'clear at last.',
  'like it clicks.',
  'made for you.',
  'unmissable.',
]

const STATIC_DEMO_PROMPTS = [
  '2x2 matrices',
  'matrix addition',
  'scalar multiplication',
] as const

function buildWaveKeyframes(index: number) {
  const amplitude = WAVE_AMPLITUDES[index] ?? 0.72

  return [
    { scaleY: 0.2 + amplitude * 0.2, duration: 0.16, ease: 'sine.inOut' },
    { scaleY: 0.46 + amplitude * 0.44, duration: 0.2, ease: 'sine.inOut' },
    { scaleY: 0.28 + amplitude * 0.3, duration: 0.18, ease: 'sine.inOut' },
    { scaleY: 0.62 + amplitude * 0.54, duration: 0.22, ease: 'sine.inOut' },
    { scaleY: 0.24 + amplitude * 0.24, duration: 0.17, ease: 'sine.inOut' },
    { scaleY: 0.54 + amplitude * 0.4, duration: 0.19, ease: 'sine.inOut' },
    { scaleY: 0.18 + amplitude * 0.16, duration: 0.15, ease: 'sine.inOut' },
  ]
}

interface Props {
  status: 'disconnected' | 'connecting' | 'connected' | 'disconnecting'
  isSpeaking: boolean
  onStart: () => void
  onStop: () => void
  onEnterDirectly: (topic: string, subject: string) => void
  error?: string | null
}

export default function GreetingView({ status, isSpeaking, onStart, onStop, onEnterDirectly, error }: Props) {
  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'
  const isStaticDemo = import.meta.env.VITE_STATIC_DEMO_MODE === 'true'
  const isSpatial = typeof document !== 'undefined'
    && document.documentElement.classList.contains('is-spatial')
  const [isWaveformMode, setIsWaveformMode] = useState(false)
  const [showBypass, setShowBypass] = useState(false)
  const [bypassTopic, setBypassTopic] = useState('')

  const heroRef = useRef<HTMLDivElement | null>(null)
  const sentenceRef = useRef<HTMLDivElement | null>(null)
  const lineOneRef = useRef<HTMLDivElement | null>(null)
  const phraseRef = useRef<HTMLSpanElement | null>(null)
  const subtitleRef = useRef<HTMLParagraphElement | null>(null)
  const micCtaRef = useRef<HTMLDivElement | null>(null)
  const micButtonRef = useRef<HTMLButtonElement | null>(null)
  const micSurfaceRef = useRef<HTMLDivElement | null>(null)
  const micVisualRef = useRef<HTMLDivElement | null>(null)
  const micSwirlRef = useRef<HTMLDivElement | null>(null)
  const micGlowRef = useRef<HTMLDivElement | null>(null)
  const micTintRef = useRef<HTMLDivElement | null>(null)
  const ringRefs = useRef<Array<HTMLSpanElement | null>>([])
  const micFragmentRefs = useRef<Array<HTMLDivElement | null>>([])
  const waveformRef = useRef<HTMLDivElement | null>(null)
  const waveBarRefs = useRef<Array<HTMLSpanElement | null>>([])
  const waveTweensRef = useRef<gsap.core.Tween[]>([])
  const phraseLoopRef = useRef<gsap.core.Timeline | null>(null)
  const shimmerTweenRef = useRef<gsap.core.Tween | null>(null)
  const isShowingLuminaryRef = useRef(false)
  const disconnectResetTimerRef = useRef<number | null>(null)
  const micGlowXToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const micGlowYToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const micSurfaceXToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const micSurfaceYToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const micSwirlXToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const micSwirlYToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)

  const clearDisconnectResetTimer = () => {
    if (disconnectResetTimerRef.current !== null) {
      window.clearTimeout(disconnectResetTimerRef.current)
      disconnectResetTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!phraseRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      if (!phraseRef.current) {
        return
      }

      const rings = ringRefs.current.filter((ring): ring is HTMLSpanElement => Boolean(ring))

      phraseRef.current.textContent = HERO_PHRASES[0]

      gsap.set(sentenceRef.current, { autoAlpha: 0, x: -88 })
      gsap.set(subtitleRef.current, { autoAlpha: 0, y: 14 })
      gsap.set(micCtaRef.current, { autoAlpha: 0, y: 22 })
      gsap.set(micGlowRef.current, { autoAlpha: 0.18, scale: 0.92, x: 0, y: 0 })
      gsap.set(micTintRef.current, { autoAlpha: 0.08 })
      gsap.set(micSurfaceRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        filter: 'brightness(1.03) contrast(1.03) saturate(1)',
      })
      gsap.set(phraseRef.current, {
        autoAlpha: 0,
        x: -52,
        yPercent: 20,
        filter: 'blur(10px)',
      })
      gsap.set(rings, {
        scale: 0.72,
        autoAlpha: 0,
        transformOrigin: '50% 50%',
      })

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro
        .to(sentenceRef.current, { autoAlpha: 1, x: 0, duration: 0.9, ease: 'expo.out' }, 0.1)
        .to(
          phraseRef.current,
          {
            autoAlpha: 1,
            x: 0,
            yPercent: 0,
            filter: 'blur(0px)',
            duration: 0.72,
            ease: 'expo.out',
          },
          0.32,
        )
        .to(subtitleRef.current, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.48)
        .to(micCtaRef.current, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.56)

      gsap.to(sentenceRef.current, {
        x: 10,
        y: -2,
        yoyo: true,
        repeat: -1,
        duration: 5.8,
        ease: 'sine.inOut',
        delay: 1.2,
      })

      gsap.to(lineOneRef.current, {
        x: -4,
        y: 2,
        yoyo: true,
        repeat: -1,
        duration: 3.8,
        ease: 'sine.inOut',
        delay: 1.35,
      })

      let activeIndex = 0
      const phraseLoop = gsap.timeline({ repeat: -1, repeatDelay: 0.08, paused: true })
      phraseLoopRef.current = phraseLoop

      for (let step = 1; step <= HERO_PHRASES.length; step += 1) {
        phraseLoop
          .to(phraseRef.current, { duration: 1.04 })
          .to(
            phraseRef.current,
            {
              x: 72,
              autoAlpha: 0,
              filter: 'blur(6px)',
              duration: 0.16,
              ease: 'power4.in',
            },
          )
          .call(() => {
            activeIndex = (activeIndex + 1) % HERO_PHRASES.length
            if (phraseRef.current) {
              phraseRef.current.textContent = HERO_PHRASES[activeIndex]
            }
          })
          .set(phraseRef.current, {
            x: -56,
            yPercent: 16,
            filter: 'blur(10px)',
          })
          .to(
            phraseRef.current,
            {
              x: 0,
              yPercent: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              duration: 0.52,
              ease: 'expo.out',
            },
          )
      }

      const ringLoop = gsap.timeline({
        repeat: -1,
        repeatDelay: 0.1,
        paused: true,
      })

      rings.forEach((ring, index) => {
        ringLoop.fromTo(
          ring,
          {
            scale: 0.72,
            autoAlpha: 0.34,
          },
          {
            scale: 1.92,
            autoAlpha: 0,
            duration: 2.35,
            ease: 'power1.out',
          },
          index * 0.52,
        )
      })

      const breatheLoop = gsap.timeline({
        repeat: -1,
        paused: true,
        defaults: { ease: 'sine.inOut', overwrite: 'auto' },
      })

      breatheLoop
        .to(
          micButtonRef.current,
          {
            scale: 1.024,
            duration: 2.25,
          },
          0,
        )
        .to(
          micGlowRef.current,
          {
            autoAlpha: 0.34,
            scale: 1.04,
            duration: 2.25,
          },
          0,
        )
        .to(
          micTintRef.current,
          {
            autoAlpha: 0.24,
            duration: 2.25,
          },
          0,
        )
        .to(
          micSurfaceRef.current,
          {
            scale: 1.012,
            filter: 'brightness(1.16) contrast(1.1) saturate(1.14)',
            duration: 2.25,
          },
          0,
        )
        .to(
          micButtonRef.current,
          {
            scale: 1,
            duration: 2.65,
          },
        )
        .to(
          micGlowRef.current,
          {
            autoAlpha: 0.16,
            scale: 0.94,
            duration: 2.65,
          },
          '<',
        )
        .to(
          micTintRef.current,
          {
            autoAlpha: 0.06,
            duration: 2.65,
          },
          '<',
        )
        .to(
          micSurfaceRef.current,
          {
            scale: 1,
            filter: 'brightness(1.03) contrast(1.03) saturate(1)',
            duration: 2.65,
          },
          '<',
        )

      micGlowXToRef.current = gsap.quickTo(micGlowRef.current, 'x', {
        duration: 0.45,
        ease: 'power3.out',
      })
      micGlowYToRef.current = gsap.quickTo(micGlowRef.current, 'y', {
        duration: 0.45,
        ease: 'power3.out',
      })
      micSurfaceXToRef.current = gsap.quickTo(micSurfaceRef.current, 'x', {
        duration: 0.55,
        ease: 'power3.out',
      })
      micSurfaceYToRef.current = gsap.quickTo(micSurfaceRef.current, 'y', {
        duration: 0.55,
        ease: 'power3.out',
      })

      micSwirlXToRef.current = gsap.quickTo(micSwirlRef.current, 'x', {
        duration: 0.85,
        ease: 'power3.out',
      })
      micSwirlYToRef.current = gsap.quickTo(micSwirlRef.current, 'y', {
        duration: 0.85,
        ease: 'power3.out',
      })

      intro.call(() => {
        phraseLoop.play()
        ringLoop.play()
        breatheLoop.play()
      })
    }, heroRef)

    return () => {
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (isConnected || isConnecting) {
      clearDisconnectResetTimer()
      setIsWaveformMode(true)
      return
    }

    if (status === 'disconnecting') {
      clearDisconnectResetTimer()
      return
    }

    if (status === 'disconnected') {
      clearDisconnectResetTimer()
      disconnectResetTimerRef.current = window.setTimeout(() => {
        setIsWaveformMode(false)
        disconnectResetTimerRef.current = null
      }, error ? 450 : 1600)
    }

    return () => {
      clearDisconnectResetTimer()
    }
  }, [error, isConnected, isConnecting, status])

  useEffect(() => () => {
    clearDisconnectResetTimer()
  }, [])

  useEffect(() => {
    const fragments = micFragmentRefs.current.filter((fragment): fragment is HTMLDivElement => Boolean(fragment))
    const waveBars = waveBarRefs.current.filter((bar): bar is HTMLSpanElement => Boolean(bar))

    waveTweensRef.current.forEach((tween) => tween.kill())
    waveTweensRef.current = []

    if (!micVisualRef.current || !waveformRef.current) {
      return
    }

    gsap.killTweensOf([
      micVisualRef.current,
      waveformRef.current,
      micGlowRef.current,
      micTintRef.current,
      ...fragments,
      ...waveBars,
    ])

    if (isWaveformMode) {
      gsap.set(waveformRef.current, {
        autoAlpha: 0,
        scale: 0.9,
        filter: 'blur(6px)',
      })
      gsap.set(waveBars, {
        transformOrigin: '50% 100%',
        scaleY: 0.18,
        autoAlpha: 0.2,
      })

      const morphIn = gsap.timeline({ defaults: { overwrite: 'auto' } })

      morphIn
        .to(
          micVisualRef.current,
          {
            autoAlpha: 0.14,
            scale: 0.9,
            filter: 'blur(4px)',
            duration: 0.52,
            ease: 'sine.inOut',
          },
          0,
        )
        .to(
          fragments,
          {
            autoAlpha: 0,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 0.92,
            duration: 0.56,
            ease: 'sine.out',
            stagger: 0.03,
          },
          0,
        )
        .to(
          waveformRef.current,
          {
            autoAlpha: 0.88,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.62,
            ease: 'sine.out',
          },
          0.06,
        )
        .to(
          waveBars,
          {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'sine.out',
            stagger: 0.01,
          },
          0.14,
        )
        .to(
          micGlowRef.current,
          {
            autoAlpha: 0.34,
            scale: 1.02,
            duration: 0.58,
            ease: 'sine.out',
          },
          0.06,
        )
        .to(
          micTintRef.current,
          {
            autoAlpha: 0.2,
            duration: 0.56,
            ease: 'sine.out',
          },
          0.06,
        )

      waveTweensRef.current = waveBars.map((bar, index) => gsap.to(bar, {
        keyframes: buildWaveKeyframes(index),
        repeat: -1,
        paused: true,
        ease: 'none',
      }))

      return
    }

    gsap.set(fragments, {
      autoAlpha: 0,
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
    })

    gsap.timeline({ defaults: { overwrite: 'auto' } })
      .to(
        waveformRef.current,
        {
          autoAlpha: 0,
          scale: 0.88,
          filter: 'blur(6px)',
          duration: 0.38,
          ease: 'sine.inOut',
        },
        0,
      )
      .to(
        waveBars,
        {
          autoAlpha: 0.2,
          duration: 0.3,
          ease: 'sine.inOut',
        },
        0,
      )
      .to(
        micVisualRef.current,
        {
          autoAlpha: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.52,
          ease: 'sine.out',
        },
        0.04,
      )
      .to(
        micGlowRef.current,
        {
          autoAlpha: 0.18,
          scale: 0.94,
          duration: 0.42,
          ease: 'sine.out',
        },
        0.04,
      )
      .to(
        micTintRef.current,
        {
          autoAlpha: 0.08,
          duration: 0.42,
          ease: 'sine.out',
        },
        0.04,
      )
  }, [isWaveformMode])

  useEffect(() => {
    const waveBars = waveBarRefs.current.filter((bar): bar is HTMLSpanElement => Boolean(bar))

    if (!isWaveformMode || !waveBars.length) {
      waveTweensRef.current.forEach((tween) => tween.pause(0))
      return
    }

    if (!isSpeaking) {
      waveTweensRef.current.forEach((tween) => tween.pause(0))

      gsap.to(waveBars, {
        scaleY: (index) => 0.18 + ((WAVE_AMPLITUDES[index] ?? 0.5) * 0.08),
        duration: 0.42,
        ease: 'power2.out',
        stagger: 0.015,
        overwrite: 'auto',
      })

      gsap.to(waveformRef.current, {
        autoAlpha: 0.76,
        duration: 0.46,
        ease: 'sine.inOut',
        overwrite: 'auto',
      })

      return
    }

    gsap.to(waveformRef.current, {
      autoAlpha: 1,
      duration: 0.5,
      ease: 'sine.inOut',
      overwrite: 'auto',
    })

    waveTweensRef.current.forEach((tween, index) => {
      tween.timeScale(0.94 + (index * 0.01))
      tween.play()
    })
  }, [isSpeaking, isWaveformMode])

  // Swap rotating phrase → "luminary" (with spotlight) while connected/connecting, back on disconnect
  useEffect(() => {
    const el = phraseRef.current
    const loop = phraseLoopRef.current
    if (!el || !loop) return

    if (isWaveformMode && !isShowingLuminaryRef.current) {
      // ── CONNECT: stop cycling, show "luminary" ──────────────────────────
      isShowingLuminaryRef.current = true
      loop.pause()
      shimmerTweenRef.current?.kill()
      gsap.killTweensOf(el)

      gsap.to(el, {
        x: 60, autoAlpha: 0, filter: 'blur(6px)',
        duration: 0.2, ease: 'power3.in', overwrite: true,
        onComplete: () => {
          el.textContent = 'luminary'

          // Gradient + background-clip for the spotlight effect
          el.style.backgroundImage = [
            'linear-gradient(90deg,',
            '#efb2ff 0%, #efb2ff 40%,',
            'rgba(255,252,255,1) 50%,',
            '#efb2ff 60%, #efb2ff 100%)',
          ].join(' ')
          el.style.backgroundSize = '400% 100%'
          el.style.backgroundPosition = '0% 50%'
          el.style.backgroundClip = 'text'
          ;(el.style as unknown as Record<string, string>)['webkitBackgroundClip'] = 'text'
          el.style.color = 'transparent'

          // Enter animation
          gsap.fromTo(
            el,
            { x: -40, yPercent: 10, filter: 'blur(8px)', autoAlpha: 0 },
            {
              x: 0, yPercent: 0, filter: 'blur(0px)', autoAlpha: 1,
              duration: 0.52, ease: 'expo.out',
              onComplete: () => {
                // Start left-to-right spotlight sweep after entry is done
                const pos = { p: 0 }
                el.style.backgroundPosition = '0% 50%'
                shimmerTweenRef.current = gsap.to(pos, {
                  p: 100,
                  duration: 2.4,
                  ease: 'sine.inOut',
                  repeat: -1,
                  repeatDelay: 0.9,
                  onUpdate() { el.style.backgroundPosition = `${pos.p}% 50%` },
                })
              },
            },
          )
        },
      })
    } else if (!isWaveformMode && isShowingLuminaryRef.current) {
      // ── DISCONNECT: fade out "luminary", restore cycling ─────────────────
      isShowingLuminaryRef.current = false
      shimmerTweenRef.current?.kill()
      shimmerTweenRef.current = null
      gsap.killTweensOf(el)

      gsap.to(el, {
        x: 60, autoAlpha: 0, filter: 'blur(6px)',
        duration: 0.2, ease: 'power3.in', overwrite: true,
        onComplete: () => {
          // Reset inline styles before restoring normal phrase color
          el.style.backgroundImage = ''
          el.style.backgroundSize = ''
          el.style.backgroundPosition = ''
          el.style.backgroundClip = ''
          ;(el.style as unknown as Record<string, string>)['webkitBackgroundClip'] = ''
          el.style.color = '#efb2ff'

          el.textContent = HERO_PHRASES[0]
          gsap.fromTo(
            el,
            { x: -52, yPercent: 16, filter: 'blur(10px)', autoAlpha: 0 },
            {
              x: 0, yPercent: 0, filter: 'blur(0px)', autoAlpha: 1,
              duration: 0.52, ease: 'expo.out',
              onComplete: () => { loop.restart() },
            },
          )
        },
      })
    }
  }, [isWaveformMode])

  // Ambient breathing glow around the mic (calm) + slightly stronger while speaking
  useEffect(() => {
    if (!micGlowRef.current) return

    // Kill any previous breathing tween attached to this element.
    gsap.killTweensOf(micGlowRef.current)

    gsap.to(micGlowRef.current, {
      autoAlpha: isSpeaking ? 0.55 : isConnected ? 0.38 : 0.22,
      scale: isSpeaking ? 1.16 : isConnected ? 1.08 : 1.02,
      duration: isSpeaking ? 0.7 : 1.1,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      overwrite: 'auto',
    })

    return () => {
      gsap.killTweensOf(micGlowRef.current)
    }
  }, [isSpeaking, isConnected])

  const handleMicAction = () => {
    if (isConnecting) {
      return
    }

    gsap.to(micGlowRef.current, {
      autoAlpha: 0.48,
      scale: 1.12,
      duration: 0.38,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      overwrite: 'auto',
    })

    gsap.to(micTintRef.current, {
      autoAlpha: 0.34,
      duration: 0.34,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      overwrite: 'auto',
    })

    if (isConnected) {
      clearDisconnectResetTimer()
      setIsWaveformMode(false)
      onStop()
      return
    }

    clearDisconnectResetTimer()
    setIsWaveformMode(true)
    onStart()
  }

  const handleMicPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2

    micGlowXToRef.current?.(offsetX * 9)
    micGlowYToRef.current?.(offsetY * 9)
    micSurfaceXToRef.current?.(offsetX * 2.6)
    micSurfaceYToRef.current?.(offsetY * 2.6)
    micSwirlXToRef.current?.(offsetX * -5.2)
    micSwirlYToRef.current?.(offsetY * -5.2)
  }

  const handleMicPointerLeave = () => {
    micGlowXToRef.current?.(0)
    micGlowYToRef.current?.(0)
    micSurfaceXToRef.current?.(0)
    micSurfaceYToRef.current?.(0)
    micSwirlXToRef.current?.(0)
    micSwirlYToRef.current?.(0)
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '34px',
        position: 'relative',
        overflow: 'hidden',
        background: isSpatial ? 'transparent' : '#000000',
        backgroundColor: isSpatial ? 'transparent' : '#000000',
      }}
    >
      <div
        ref={heroRef}
        style={{
          textAlign: 'center',
          zIndex: 1,
          width: 'min(90vw, 920px)',
        }}
      >
        <div
          ref={sentenceRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.12em',
            width: '100%',
            willChange: 'transform',
          }}
        >
          <div
            ref={lineOneRef}
            style={{
              fontSize: 'clamp(2.55rem, 5.95vw, 4.95rem)',
              fontWeight: 620,
              lineHeight: 1.05,
              letterSpacing: '-0.038em',
              color: '#ffffff',
              textShadow: '0 0 1px rgba(255,255,255,0.86), 0 0 12px rgba(255,255,255,0.07)',
            }}
          >
            I create lessons that
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'baseline',
              gap: '0.12em',
              fontSize: 'clamp(2.55rem, 5.95vw, 4.95rem)',
              fontWeight: 620,
              lineHeight: 1.05,
              letterSpacing: '-0.038em',
              color: '#ffffff',
              textShadow: '0 0 1px rgba(255,255,255,0.88), 0 0 12px rgba(255,255,255,0.07)',
            }}
          >
            <span>make hard ideas feel</span>
            <span
              style={{
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'baseline',
                minWidth: 'min(44vw, 10.5ch)',
                textAlign: 'center',
                paddingRight: '0.02em',
              }}
            >
              <span
                ref={phraseRef}
                style={{
                  display: 'inline-block',
                  fontSize: '0.92em',
                  lineHeight: 0.98,
                  color: '#efb2ff',
                  fontFamily: '"Unbounded", "SF Pro Display", "SF Pro Text", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '-0.045em',
                  textShadow: '0 0 1px rgba(255,236,255,0.96), 0 0 18px rgba(239,178,255,0.34), 0 0 34px rgba(167,72,255,0.28)',
                  willChange: 'transform, opacity, filter',
                }}
              />
            </span>
          </div>
        </div>

        <p
          ref={subtitleRef}
          style={{
            marginTop: '24px',
            color: 'rgba(255,255,255,0.36)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'none',
          }}
        />
      </div>

      <div
        ref={micCtaRef}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button
          ref={micButtonRef}
          type="button"
          onClick={handleMicAction}
          onPointerMove={handleMicPointerMove}
          onPointerLeave={handleMicPointerLeave}
          disabled={isConnecting}
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            padding: 0,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: isConnecting ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label={isConnecting ? 'Connecting' : isConnected ? 'End session' : 'Start your lesson'}
        >
          {/* Moving purple energy behind the mic */}
          <div
            aria-hidden
            ref={micSwirlRef}
            className="lm-mic-swirl"
            style={{
              position: 'absolute',
              inset: '-26px',
              borderRadius: '50%',
              background:
                'conic-gradient(from 0deg, rgba(124,58,237,0.0) 0deg, rgba(124,58,237,0.45) 55deg, rgba(239,178,255,0.18) 120deg, rgba(124,58,237,0.0) 200deg, rgba(124,58,237,0.35) 285deg, rgba(124,58,237,0.0) 360deg)',
              filter: 'blur(10px) saturate(1.25)',
              opacity: isConnected ? (isSpeaking ? 0.78 : 0.62) : 0.36,
              mixBlendMode: 'screen',
              animation: isSpeaking ? 'lmSwirlSpin 2.8s linear infinite' : 'lmSwirlSpin 6.8s linear infinite',
              transformOrigin: '50% 50%',
              pointerEvents: 'none',
            }}
          />

          <div
            ref={micGlowRef}
            style={{
              position: 'absolute',
              inset: '-6px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,72,255,0.42) 0%, rgba(140,58,255,0.22) 34%, rgba(92,32,180,0) 72%)',
              pointerEvents: 'none',
            }}
          />
          {[0, 1, 2].map((ringIndex) => (
            <span
              key={ringIndex}
              ref={(element) => {
                ringRefs.current[ringIndex] = element
              }}
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '1px solid rgba(167,72,255,0.28)',
                background: 'radial-gradient(circle, rgba(167,72,255,0.14) 0%, rgba(167,72,255,0.04) 48%, rgba(167,72,255,0) 72%)',
                pointerEvents: 'none',
              }}
            />
          ))}

          <div
            ref={micSurfaceRef}
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: isConnected
                ? `radial-gradient(circle, rgba(124,58,237,${isSpeaking ? '0.9' : '0.5'}) 0%, rgba(37,99,235,0.4) 100%)`
                : 'radial-gradient(circle, rgba(32,42,64,0.8) 0%, rgba(10,14,24,0.92) 72%, rgba(5,8,14,0.98) 100%)',
              border: `1px solid rgba(255,255,255,${isConnected ? '0.2' : '0.06'})`,
              boxShadow: isSpeaking
                ? '0 0 60px rgba(124,58,237,0.6), 0 0 120px rgba(124,58,237,0.25)'
                : isConnected
                ? '0 0 30px rgba(124,58,237,0.3)'
                : '0 16px 40px rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              transformOrigin: '50% 50%',
            }}
          >
            <div
              ref={micVisualRef}
              style={{
                position: 'absolute',
                inset: 0,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: '10px',
                  borderRadius: '50%',
                  background:
                    'conic-gradient(from 200deg, rgba(255,255,255,0) 0deg, rgba(230,198,255,0.16) 34deg, rgba(154,88,255,0.38) 106deg, rgba(65,110,255,0.18) 196deg, rgba(255,255,255,0) 270deg, rgba(186,120,255,0.24) 360deg)',
                  filter: 'blur(10px) saturate(1.16)',
                  opacity: isConnected ? (isSpeaking ? 0.86 : 0.62) : 0.44,
                  mixBlendMode: 'screen',
                  animation: isSpeaking ? 'lmCoreSpin 3.4s linear infinite' : 'lmCoreSpin 8.6s linear infinite',
                  pointerEvents: 'none',
                }}
              />
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: '18px',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 34% 28%, rgba(255,255,255,0.3) 0%, rgba(255,235,255,0.16) 18%, rgba(191,124,255,0.16) 34%, rgba(93,41,180,0.04) 60%, rgba(93,41,180,0) 78%)',
                  filter: 'blur(4px)',
                  opacity: isConnected ? 0.92 : 0.74,
                  animation: 'lmCoreDrift 6.4s ease-in-out infinite alternate',
                  pointerEvents: 'none',
                }}
              />
              <div
                ref={micTintRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(190,112,255,0.3) 0%, rgba(142,62,255,0.18) 38%, rgba(94,38,176,0.02) 72%, rgba(94,38,176,0) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: isConnected
                    ? 'radial-gradient(circle, rgba(10,10,20,0.01) 26%, rgba(10,10,20,0.08) 62%, rgba(6,8,14,0.2) 100%)'
                    : 'radial-gradient(circle, rgba(10,10,20,0.02) 28%, rgba(10,10,20,0.12) 62%, rgba(6,8,14,0.28) 100%)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -10px 18px rgba(4,6,12,0.12)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {MIC_FRAGMENT_CLIPS.map((clipPath, index) => (
              <div
                key={clipPath}
                ref={(element) => {
                  micFragmentRefs.current[index] = element
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  borderRadius: '50%',
                  clipPath,
                  background: 'linear-gradient(135deg, rgba(206,154,255,0.42), rgba(120,54,220,0.08))',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            <div
              ref={waveformRef}
              style={{
                position: 'absolute',
                inset: '32px 18px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                gap: '6px',
                opacity: 0,
                filter: 'blur(10px)',
                pointerEvents: 'none',
              }}
            >
              {Array.from({ length: WAVE_BAR_COUNT }).map((_, index) => (
                <span
                  key={index}
                  ref={(element) => {
                    waveBarRefs.current[index] = element
                  }}
                  style={{
                    width: index % 2 === 0 ? '7px' : '5px',
                    height: `${24 + ((index + 1) % 3) * 10}px`,
                    borderRadius: '999px',
                    background: 'linear-gradient(180deg, rgba(245,226,255,0.96) 0%, rgba(208,136,255,0.94) 28%, rgba(124,58,237,0.88) 72%, rgba(73,30,132,0.62) 100%)',
                    boxShadow: '0 0 12px rgba(167,72,255,0.28)',
                    transformOrigin: '50% 100%',
                  }}
                />
              ))}
            </div>
          </div>
        </button>

        <style>{`
          @keyframes lmSwirlSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes lmCoreSpin {
            from { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.04); }
            to { transform: rotate(360deg) scale(1); }
          }

          @keyframes lmCoreDrift {
            from { transform: translate3d(-3px, -2px, 0) scale(0.98); }
            to { transform: translate3d(4px, 3px, 0) scale(1.04); }
          }
        `}</style>

        <p
          style={{
            fontSize: '13px',
            color: isConnected
              ? (isSpeaking ? 'rgba(164,228,255,0.9)' : 'rgba(255,255,255,0.55)')
              : 'rgba(255,255,255,0.35)',
            fontStyle: isConnected ? 'normal' : 'italic',
            minHeight: '20px',
          }}
          >
            {isConnecting && 'Connecting…'}
          {isConnected && !isSpeaking && "Listening — tell me what you'd like to learn"}
          {isConnected && isSpeaking && 'Speaking…'}
        </p>

        {isStaticDemo && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              marginTop: '-2px',
              maxWidth: '420px',
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: '360px',
                padding: '9px 14px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.74)',
                fontSize: '11px',
                fontWeight: 500,
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              Guided demo: live voice, curated visual examples.
            </p>

            {!isConnected && !isConnecting && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.62)',
                  }}
                >
                  Best Demo Prompts
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {STATIC_DEMO_PROMPTS.map((prompt) => (
                    <span
                      key={prompt}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,0.10)',
                        background: 'rgba(255,255,255,0.035)',
                        color: 'rgba(255,255,255,0.84)',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '-0.01em',
                        boxShadow: '0 10px 24px rgba(0,0,0,0.16)',
                      }}
                    >
                      {prompt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p
            style={{
              marginTop: '-2px',
              fontSize: '12px',
              color: 'rgba(248,113,113,0.9)',
              textAlign: 'center',
              maxWidth: '280px',
            }}
          >
            {error}
          </p>
        )}

        {/* Bypass: skip voice agent, type topic/subject directly */}
        {!isConnected && !isConnecting && (
          <motion.button
            onClick={() => setShowBypass((v) => !v)}
            whileHover={{ color: 'rgba(255,255,255,0.45)', scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.2)',
              fontSize: '11px', cursor: 'pointer',
              padding: '2px 8px',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {showBypass ? 'Cancel' : 'Enter classroom manually'}
          </motion.button>
        )}

        <AnimatePresence>
          {showBypass && (
            <motion.div
              key="bypass-form"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(160deg, rgba(18,18,24,0.84) 0%, rgba(12,12,18,0.86) 100%)',
                border: '1px solid rgba(188,178,236,0.14)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02), 0 18px 42px rgba(0,0,0,0.45)',
                width: '330px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: '-30% -20% auto',
                  height: '70%',
                  background: 'radial-gradient(ellipse at center, rgba(167,72,255,0.22) 0%, rgba(167,72,255,0.06) 45%, rgba(167,72,255,0) 100%)',
                  pointerEvents: 'none',
                  filter: 'blur(8px)',
                }}
              />
              <p style={{
                margin: '0 0 2px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(205,190,255,0.72)',
                position: 'relative',
                zIndex: 1,
              }}>
                Prompt
              </p>
              <input
                autoFocus
                placeholder="Ask anything. I’ll build your lesson."
                value={bypassTopic}
                onChange={(e) => setBypassTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const q = bypassTopic.trim()
                    if (q) onEnterDirectly(q, q)
                  }
                }}
                className="lm-bypass-input"
                style={{
                  background: 'linear-gradient(180deg, rgba(24,24,34,0.92) 0%, rgba(14,14,22,0.94) 100%)',
                  border: '1px solid rgba(190,180,238,0.24)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: 'rgba(255,255,255,0.96)',
                  fontSize: '13px',
                  fontWeight: 520,
                  outline: 'none',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03), 0 10px 26px rgba(0,0,0,0.28)',
                  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                  position: 'relative',
                  zIndex: 1,
                }}
              />
              <p style={{
                margin: 0,
                fontSize: '10px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'rgba(205,190,255,0.44)',
                position: 'relative',
                zIndex: 1,
              }}>
                Press Enter to continue
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .lm-bypass-input::placeholder { color: rgba(205,205,226,0.5); }
        .lm-bypass-input:focus {
          border-color: rgba(211,189,255,0.78) !important;
          box-shadow: inset 0 0 0 1px rgba(218,199,255,0.14), 0 0 0 3px rgba(124,58,237,0.22), 0 0 24px rgba(124,58,237,0.28), 0 10px 30px rgba(0,0,0,0.34) !important;
          background: linear-gradient(180deg, rgba(32,32,44,0.95) 0%, rgba(20,20,30,0.95) 100%) !important;
        }
      `}</style>
    </div>
  )
}
