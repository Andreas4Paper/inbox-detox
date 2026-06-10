'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { InboxDetoxLogo } from '@/components/Logo'

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function MockDashboard() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 animate-fade-in">
      {/* Mini navbar */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <InboxDetoxLogo size="sm" wordmarkColor="dark" />
        <div className="w-20 h-5 bg-slate-100 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Newsletter', value: '23', color: 'text-violet-600' },
          { label: 'Abgemeldet', value: '8', color: 'text-emerald-600' },
          { label: 'Health', value: '74%', color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Newsletter list */}
      <div className="space-y-2">
        {[
          { name: 'The Verge', email: 'newsletter@theverge.com', score: 95, sub: false },
          { name: 'Hacker News', email: 'noreply@ycombinator.com', score: 82, sub: true },
          { name: 'Morning Brew', email: 'hello@morningbrew.com', score: 91, sub: false },
          { name: 'Product Hunt', email: 'ph@producthunt.com', score: 78, sub: false },
        ].map((nl) => (
          <div
            key={nl.email}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center flex-shrink-0">
                <span className="text-violet-700 text-sm font-bold">
                  {nl.name[0]}
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm text-slate-800 truncate">{nl.name}</div>
                <div className="text-xs text-slate-400 truncate">{nl.email}</div>
              </div>
            </div>
            <div className="ml-2 flex-shrink-0">
              {nl.sub ? (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                  ✓ Weg
                </span>
              ) : (
                <div className="w-16 h-5 bg-violet-100 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/dashboard')
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <InboxDetoxLogo size="md" wordmarkColor="white" />
        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-medium">
            Beta · Kostenlos
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-slow" />
              Sicher · Privatsphäre-freundlich · Open Source
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-5">
              Dein Postfach.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                Endlich aufgeräumt.
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-xl">
              Inbox Detox erkennt automatisch alle Newsletter in deinem Gmail und
              ermöglicht dir die <strong className="text-slate-300">Abmeldung mit einem einzigen Klick</strong>.
              Keine gespeicherten E-Mails. Keine Passwörter.
            </p>

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="group inline-flex items-center gap-3 px-7 py-4 bg-white text-slate-900 rounded-2xl font-semibold text-lg hover:bg-slate-50 active:scale-[0.98] transition-all duration-150 shadow-xl shadow-black/20"
            >
              <GoogleIcon />
              Mit Google anmelden
              <svg
                className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="flex flex-wrap gap-5 mt-6">
              {[
                { icon: '🔒', text: 'Nur Lesezugriff auf Gmail' },
                { icon: '🚫', text: 'Keine E-Mails gespeichert' },
                { icon: '⚡', text: 'Analyse in Sekunden' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: mock dashboard */}
          <div className="hidden lg:block">
            <MockDashboard />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-4 py-6 text-slate-600 text-sm">
        <span>Inbox Detox &mdash; Dein E-Mail-Detox Tool</span>
        <span className="text-slate-700">·</span>
        <a href="/impressum" className="hover:text-slate-400 transition-colors">
          Impressum
        </a>
      </footer>
    </main>
  )
}
