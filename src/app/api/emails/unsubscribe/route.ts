import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { sendUnsubscribeEmail } from '@/lib/gmail'
import { parseMailtoTarget, parseUnsubscribeUrl, requestUnsubscribeUrl } from '@/lib/unsubscribe'

interface UnsubscribeBody {
  method: 'http' | 'mailto' | 'unknown'
  url?: string
  email?: string
  isOneClick?: boolean
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request })
  const accessToken = token?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  let body: UnsubscribeBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body' }, { status: 400 })
  }

  const { method, url, email, isOneClick } = body

  try {
    if (method === 'http' && typeof url === 'string') {
      if (!parseUnsubscribeUrl(url)) {
        return NextResponse.json({ error: 'Ungültige Abmelde-Adresse' }, { status: 400 })
      }

      let success = false
      try {
        success = await requestUnsubscribeUrl(url, isOneClick === true)
      } catch (err) {
        if (!isOneClick) throw err
      }
      // Some senders advertise one-click but only handle the plain link.
      if (!success && isOneClick) {
        success = await requestUnsubscribeUrl(url, false)
      }

      if (success) {
        return NextResponse.json({ success: true, method: 'http' })
      }
      return NextResponse.json({ error: 'Abmeldung fehlgeschlagen' }, { status: 502 })
    }

    if (method === 'mailto' && typeof email === 'string') {
      const target = parseMailtoTarget(email)
      if (!target) {
        return NextResponse.json({ error: 'Ungültige Abmelde-Adresse' }, { status: 400 })
      }
      const success = await sendUnsubscribeEmail(accessToken, target.to, target.subject)
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
    console.error('Unsubscribe error:', error instanceof Error ? error.name : 'unknown')
    return NextResponse.json({ error: 'Abmeldung fehlgeschlagen' }, { status: 500 })
  }
}
