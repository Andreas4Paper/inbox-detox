import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGIN = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect dashboard: redirect unauthenticated users to landing page
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect email API routes
  if (pathname.startsWith('/api/emails')) {
    const token = await getToken({ req: request })
    if (!token) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // CSRF: POST requests must originate from the same origin
    if (request.method === 'POST') {
      const origin = request.headers.get('origin')
      if (origin && origin !== ALLOWED_ORIGIN) {
        return NextResponse.json({ error: 'Ungültige Herkunft' }, { status: 403 })
      }
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/emails/:path*'],
}
