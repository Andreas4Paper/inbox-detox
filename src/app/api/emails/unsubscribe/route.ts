import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendUnsubscribeEmail } from '@/lib/gmail'

interface UnsubscribeBody {
  method: 'http' | 'mailto' | 'unknown'
  url?: string
  email?: string
  isOneClick?: boolean
  senderName?: string
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  let body: UnsubscribeBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }

  const { method, url, email, isOneClick, senderName } = body

  try {
    if (method === 'http' && url) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const fetchMethod = isOneClick ? 'POST' : 'GET'
      const fetchOptions: RequestInit = {
        method: fetchMethod,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; InboxDetox/1.0)',
          ...(isOneClick
            ? {
                'Content-Type': 'application/x-www-form-urlencoded',
                'List-Unsubscribe': 'One-Click',
              }
            : {}),
        },
        signal: controller.signal,
        redirect: 'follow',
        ...(isOneClick
          ? { body: 'List-Unsubscribe=One-Click' }
          : {}),
      }

      try {
        await fetch(url, fetchOptions)
        clearTimeout(timeoutId)
        return NextResponse.json({ success: true, method: 'http' })
      } catch (err) {
        clearTimeout(timeoutId)
        // If one-click POST failed, try GET as fallback
        if (isOneClick) {
          await fetch(url, { method: 'GET', redirect: 'follow' })
          return NextResponse.json({ success: true, method: 'http-fallback' })
        }
        throw err
      }
    }

    if (method === 'mailto' && email) {
      const subject = 'Unsubscribe'
      const success = await sendUnsubscribeEmail(
        session.accessToken,
        email,
        subject
      )
      if (success) {
        return NextResponse.json({ success: true, method: 'mailto' })
      }
      return NextResponse.json(
        { error: 'E-Mail konnte nicht gesendet werden' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Keine gültige Abmelde-Methode angegeben' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      {
        error: 'Abmeldung fehlgeschlagen',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
