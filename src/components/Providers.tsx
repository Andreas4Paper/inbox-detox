'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  // The static GitHub Pages build has no /api/auth routes to talk to.
  if (process.env.NEXT_PUBLIC_STATIC_SITE === '1') return <>{children}</>
  return <SessionProvider>{children}</SessionProvider>
}
