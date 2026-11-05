'use client'

import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn('google', { callbackUrl: '/dashboard' })
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Lade…</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Dashboard />
      </main>
      <footer className="flex items-center justify-center gap-4 py-6 text-slate-500 text-sm">
        <Link href="/impressum" className="hover:text-slate-900 transition-colors">
          Impressum
        </Link>
        <span className="text-slate-300">·</span>
        <Link href="/datenschutz" className="hover:text-slate-900 transition-colors">
          Datenschutz
        </Link>
      </footer>
    </div>
  )
}
