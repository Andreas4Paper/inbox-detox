'use client'

import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { InboxDetoxLogo } from './Logo'

interface NavbarProps {
  onReanalyze?: () => void
  isAnalyzing?: boolean
}

export function Navbar({ onReanalyze, isAnalyzing }: NavbarProps) {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <InboxDetoxLogo size="sm" wordmarkColor="dark" />

        {/* Right */}
        <div className="flex items-center gap-3">
          {onReanalyze && (
            <button
              onClick={onReanalyze}
              disabled={isAnalyzing}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40"
            >
              <svg
                className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Neu analysieren
            </button>
          )}

          <div className="flex items-center gap-2">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? 'User'}
                width={28}
                height={28}
                className="rounded-full ring-2 ring-slate-200"
              />
            )}
            <span className="hidden sm:block text-sm text-slate-600 max-w-[160px] truncate">
              {session?.user?.email}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Abmelden
          </button>
        </div>
      </div>
    </header>
  )
}
