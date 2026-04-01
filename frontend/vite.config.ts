import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import webSpatial from '@webspatial/vite-plugin'
import { createHtmlPlugin } from 'vite-plugin-html'
import crypto from 'node:crypto'

function createPasswordGatePlugin(password?: string, adminPassword?: string) {
  if (!password && !adminPassword) {
    return null
  }

  const cookieName = 'luminary_demo_gate'
  const demoDurationSeconds = 180
  const adminDurationSeconds = 60 * 60 * 12
  const signingSecret = crypto
    .createHash('sha256')
    .update(`luminary:${password || ''}:${adminPassword || ''}`)
    .digest('hex')

  type AccessRole = 'demo' | 'admin'

  function signSession(payload: { role: AccessRole; expiresAt: number | null }) {
    const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
    const signature = crypto.createHmac('sha256', signingSecret).update(encodedPayload).digest('hex')
    return `${encodedPayload}.${signature}`
  }

  function parseCookies(cookieHeader?: string) {
    return Object.fromEntries(
      (cookieHeader || '')
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const eq = part.indexOf('=')
          return eq === -1
            ? [part, '']
            : [part.slice(0, eq), decodeURIComponent(part.slice(eq + 1))]
        }),
    )
  }

  function readSession(cookieHeader?: string): { role: AccessRole; expiresAt: number | null } | null {
    const token = parseCookies(cookieHeader)[cookieName]
    if (!token) {
      return null
    }

    const [encodedPayload, signature] = token.split('.')
    if (!encodedPayload || !signature) {
      return null
    }

    const expectedSignature = crypto.createHmac('sha256', signingSecret).update(encodedPayload).digest('hex')
    if (signature !== expectedSignature) {
      return null
    }

    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as {
        role?: AccessRole
        expiresAt?: number | null
      }

      if (payload.role !== 'demo' && payload.role !== 'admin') {
        return null
      }

      if (typeof payload.expiresAt === 'number' && payload.expiresAt <= Date.now()) {
        return null
      }

      return {
        role: payload.role,
        expiresAt: payload.expiresAt ?? null,
      }
    } catch {
      return null
    }
  }

  function clearGateCookie(res: any) {
    res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`)
  }

  const loginPage = (error = false) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Luminary Access</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
              glow: '0 20px 80px rgba(0,0,0,0.45)',
            },
          },
        },
      }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      body {
        background:
          radial-gradient(circle at top, rgba(139, 92, 246, 0.12), transparent 34%),
          radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.1), transparent 28%),
          #05050a;
      }

      .glass-shell {
        background: rgba(255, 255, 255, 0.04);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.06),
          0 18px 60px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(22px);
      }

      .glass-panel {
        background: rgba(255, 255, 255, 0.035);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(18px);
      }
    </style>
  </head>
  <body class="min-h-screen bg-black text-white antialiased">
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-5 md:px-8 md:py-8">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.22),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.16),_transparent_30%)]"></div>
      <div class="glass-shell relative z-10 w-full max-w-7xl rounded-[36px] border border-white/10 p-4 md:min-h-[86vh] md:p-5">
        <div class="grid gap-4 lg:min-h-[82vh] lg:grid-cols-[minmax(360px,430px)_minmax(0,1fr)]">
          <section class="glass-panel rounded-[30px] border border-white/10 p-7">
            <div class="mb-7 flex items-start justify-between gap-4">
              <div>
                <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/45">Luminary Demo</p>
                <h1 class="text-3xl font-semibold tracking-[-0.04em]">Protected access</h1>
                <p class="mt-3 max-w-sm text-sm leading-6 text-white/64">
                  Unlock a guided preview of Luminary's classroom experience. The voice interaction is live, and the visuals are curated to show how learning feels inside the product.
                </p>
              </div>
              <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/55">3 min AI</div>
            </div>

            <div class="mb-5 rounded-2xl border border-violet-400/15 bg-violet-400/8 px-4 py-3 text-sm text-white/70">
              The demo password unlocks a 3-minute AI session. The admin password unlocks full access.
            </div>

            <div class="mb-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/64">
              This is a curated demo of Luminary's teaching experience. Voice interaction is live, and the visual lessons shown here are representative sample animations.
            </div>

            <div class="mb-6 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-4">
              <p class="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">Best Demo Topics</p>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/82">2x2 matrices</span>
                <span class="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/82">matrix addition</span>
                <span class="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/82">scalar multiplication</span>
              </div>
              <p class="mt-3 text-sm leading-6 text-white/72">
                Built to showcase Luminary's real-time teaching experience for interviews, portfolio review, and product demos.
              </p>
            </div>

            <form method="POST" action="/__unlock" class="space-y-4">
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                autocomplete="current-password"
                autofocus
                class="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[15px] text-white outline-none transition focus:border-violet-400/55 focus:ring-4 focus:ring-violet-400/15"
              />
              <button
                type="submit"
                class="w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:brightness-110"
              >
                Unlock
              </button>
            </form>

            ${error ? '<div class="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">Incorrect password.</div>' : ''}

            <div class="mt-6 border-t border-white/10 pt-5">
              <div class="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Access + Contact</p>
                <p class="mt-2 text-sm leading-6 text-white/68">
                  For interview access, product questions, or a direct walkthrough, reach out here.
                </p>
                <a
                  href="mailto:nesubonteng@gmail.com"
                  class="mt-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/84 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  nesubonteng@gmail.com
                </a>
              </div>
            </div>
          </section>

          <section class="glass-panel rounded-[30px] border border-white/10 p-4 md:p-5">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/48">Demo Preview</p>
                <h2 class="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white/92">See Luminary before you unlock it</h2>
              </div>
              <a
                href="https://www.youtube.com/watch?v=lTyLXeKav9A&t"
                target="_blank"
                rel="noreferrer"
                class="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/74 transition hover:border-white/20 hover:text-white"
              >
                Open on YouTube
              </a>
            </div>

            <div class="overflow-hidden rounded-[24px] border border-white/10 bg-black/40">
              <div class="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/lTyLXeKav9A?start=0"
                  title="Luminary demo video"
                  class="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
            </div>

            <details open class="mt-4 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-white/78">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white/88 marker:content-none">
                <span>Project Overview</span>
                <span class="text-xs font-medium uppercase tracking-[0.18em] text-white/48">Product Story</span>
              </summary>
              <div class="mt-4 grid gap-4 text-sm leading-6 text-white/72 md:grid-cols-2">
                <div>
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Luminary</p>
                  <p>A spatial learning experience built to make great teaching feel personal, visual, and close at hand.</p>
                </div>
                <div>
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">What It Does</p>
                  <p>This demo shows Luminary as a live, voice-driven teacher inside a spatial classroom. The current guided experience focuses on a small set of polished visual lessons so people can feel the teaching style, pacing, and atmosphere of the product.</p>
                </div>
                <div>
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Inspiration</p>
                  <p>We're both African immigrants. Our parents came to this country and were figuring everything out, new jobs, new culture, new everything. They didn't always have time to sit down and walk us through homework or explain hard concepts. We didn't have tutors. We had to figure it out.</p>
                  <p class="mt-2">That stayed with us. We kept coming back to the same question: what if every student, regardless of where they're from or what school they go to, had access to a teacher that was always there and could actually show them things visually?</p>
                </div>
                <div>
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">How We Built It</p>
                  <p>We split frontend and backend and built feature by feature. React, Vite and WebSpatial SDK on the front. Flask on an AMD MI300X GPU on the back. ElevenLabs for voice. Gemini for lessons. Manim for the animations. We took a 3D scan of one of us, rigged it in Mixamo, converted it to USDZ and dropped it into the spatial scene as the actual teacher.</p>
                </div>
                <div>
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Challenges</p>
                  <p>Three.js frameworks were outdated and we had to step in ourselves when the fixes kept looping. Getting the visionOS simulator running at all took way longer than it should have. Syncing Manim with the ElevenLabs voice so they land at the right moment was genuinely painful. Building the solar system with a proper 3D orbital algorithm was hard. Storing recordings with state. All of it at the same time.</p>
                </div>
                <div>
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">What We're Proud Of</p>
                  <p>A 3D version of one of us is literally standing in the app as the teacher. Manim runs in sync with the ElevenLabs voice agent. The spatial experience works on visionOS, and the classroom feels like an actual place to learn instead of a novelty demo.</p>
                </div>
                <div class="md:col-span-2">
                  <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">What's Next</p>
                  <p>NVIDIA Audio2Face for realistic facial animation synced to the voice. Broader subject coverage. Free access for underfunded schools. YC.</p>
                </div>
              </div>
            </details>
          </section>
        </div>
      </div>
    </main>
  </body>
</html>`

  const gate = (req: any, res: any, next: () => void) => {
    const url = (req.url || '/').split('?')[0]
    const session = readSession(req.headers.cookie)

    if (url === '/__unlock' && req.method === 'POST') {
      let body = ''
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString('utf8')
      })
      req.on('end', () => {
        const form = new URLSearchParams(body)
        const submittedPassword = form.get('password') || ''
        const isAdminPassword = Boolean(adminPassword) && submittedPassword === adminPassword
        const isDemoPassword = Boolean(password) && submittedPassword === password

        if (isAdminPassword || isDemoPassword) {
          const role: AccessRole = isAdminPassword ? 'admin' : 'demo'
          const expiresAt = role === 'demo' ? Date.now() + (demoDurationSeconds * 1000) : Date.now() + (adminDurationSeconds * 1000)
          const token = signSession({ role, expiresAt })
          const maxAge = role === 'demo' ? demoDurationSeconds : adminDurationSeconds
          res.statusCode = 303
          res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`)
          res.setHeader('Location', '/')
          res.end()
          return
        }

        res.statusCode = 401
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(loginPage(true))
      })
      return
    }

    if (url === '/__access-meta') {
      if (!session) {
        clearGateCookie(res)
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'Unauthorized' }))
        return
      }

      const remainingSeconds = session.expiresAt === null
        ? null
        : Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000))

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify({ role: session.role, remainingSeconds }))
      return
    }

    if (session) {
      next()
      return
    }

    clearGateCookie(res)
    res.statusCode = 401
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(loginPage(false))
  }

  return {
    name: 'luminary-password-gate',
    configureServer(server: any) {
      server.middlewares.use(gate)
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(gate)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv with '' prefix reads ALL env vars including XR_ENV set via CLI
  const env = loadEnv(mode, '.', '')
  const xrEnv = env['XR_ENV']
  const sitePassword = env['SITE_PASSWORD']
  const adminPassword = env['SITE_ADMIN_PASSWORD']
  const passwordGatePlugin = createPasswordGatePlugin(sitePassword, adminPassword)

  return {
    server: {
      port: 5174,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    plugins: [
      webSpatial(),
      react(),
      tailwindcss(),
      ...(passwordGatePlugin ? [passwordGatePlugin] : []),
      createHtmlPlugin({
        inject: {
          data: { XR_ENV: xrEnv },
        },
      }),
    ],
  }
})
