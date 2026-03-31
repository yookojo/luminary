const COOKIE_NAME = 'luminary_demo_gate'
const DEMO_DURATION_SECONDS = 180
const ADMIN_DURATION_SECONDS = 60 * 60 * 12
const encoder = new TextEncoder()

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    (cookieHeader || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=')
        return separatorIndex === -1
          ? [part, '']
          : [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))]
      }),
  )
}

function toBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function signPayload(encodedPayload, signingSecret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload))
  return bytesToHex(new Uint8Array(signature))
}

async function createSessionToken(payload, signingSecret) {
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await signPayload(encodedPayload, signingSecret)
  return `${encodedPayload}.${signature}`
}

async function readSession(cookieHeader, signingSecret) {
  const token = parseCookies(cookieHeader)[COOKIE_NAME]
  if (!token) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = await signPayload(encodedPayload, signingSecret)
  if (signature !== expectedSignature) {
    return null
  }

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload)))
    if (payload.role !== 'demo' && payload.role !== 'admin') {
      return null
    }

    if (typeof payload.expiresAt === 'number' && payload.expiresAt <= Date.now()) {
      return null
    }

    return {
      role: payload.role,
      expiresAt: typeof payload.expiresAt === 'number' ? payload.expiresAt : null,
    }
  } catch {
    return null
  }
}

function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

function loginPage(error = false) {
  return `<!doctype html>
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
  </head>
  <body class="min-h-screen bg-black text-white antialiased">
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.22),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.16),_transparent_30%)]"></div>
      <div class="relative w-full max-w-md rounded-[30px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
        <div class="mb-7 flex items-center justify-between">
          <div>
            <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/45">Luminary Demo</p>
            <h1 class="text-3xl font-semibold tracking-[-0.04em]">Protected access</h1>
          </div>
          <div class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/55">3 min AI</div>
        </div>

        <div class="mb-6 rounded-2xl border border-violet-400/15 bg-violet-400/8 px-4 py-3 text-sm text-white/70">
          The demo password unlocks a 3-minute AI session. The admin password unlocks full access.
        </div>

        <div class="mb-6 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/62">
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
          <button
            type="button"
            onclick="const el = document.getElementById('contact-email'); el.classList.toggle('hidden')"
            class="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Need access? Click to reveal contact
          </button>
          <div id="contact-email" class="mt-3 hidden rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
            nesubonteng@gmail.com
          </div>
        </div>
      </div>
    </main>
  </body>
</html>`
}

function unauthorizedResponse(error = false) {
  return new Response(loginPage(error), {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': clearCookieHeader(),
    },
  })
}

export async function onRequest(context) {
  const { env, request, next } = context
  const demoPassword = env.SITE_PASSWORD
  const adminPassword = env.SITE_ADMIN_PASSWORD

  if (!demoPassword && !adminPassword) {
    return next()
  }

  const signingSecret = `luminary:${demoPassword || ''}:${adminPassword || ''}`
  const url = new URL(request.url)
  const session = await readSession(request.headers.get('cookie'), signingSecret)

  if (url.pathname === '/__unlock' && request.method === 'POST') {
    const formData = await request.formData()
    const submittedPassword = String(formData.get('password') || '')
    const isAdminPassword = Boolean(adminPassword) && submittedPassword === adminPassword
    const isDemoPassword = Boolean(demoPassword) && submittedPassword === demoPassword

    if (!isAdminPassword && !isDemoPassword) {
      return unauthorizedResponse(true)
    }

    const role = isAdminPassword ? 'admin' : 'demo'
    const durationSeconds = role === 'admin' ? ADMIN_DURATION_SECONDS : DEMO_DURATION_SECONDS
    const expiresAt = Date.now() + (durationSeconds * 1000)
    const token = await createSessionToken({ role, expiresAt }, signingSecret)

    return new Response(null, {
      status: 303,
      headers: {
        Location: '/',
        'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${durationSeconds}`,
        'Cache-Control': 'no-store',
      },
    })
  }

  if (url.pathname === '/__access-meta') {
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'Set-Cookie': clearCookieHeader(),
        },
      })
    }

    const remainingSeconds = session.expiresAt === null
      ? null
      : Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000))

    return new Response(JSON.stringify({ role: session.role, remainingSeconds }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  }

  if (session) {
    return next()
  }

  return unauthorizedResponse(false)
}
