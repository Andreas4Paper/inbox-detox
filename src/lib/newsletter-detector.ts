import { fetchMessageIds, fetchMessageHeaders } from './gmail'
import type { NewsletterSender, EmailPreview, AnalysisResult } from '../types'

interface ParsedEmail {
  id: string
  fromRaw: string
  fromName: string
  fromEmail: string
  domain: string
  subject: string
  date: string
  snippet: string
  listUnsubscribe?: string
  listUnsubscribePost?: string
}

export interface UnsubscribeInfo {
  method: 'http' | 'mailto' | 'unknown'
  httpUrl?: string
  mailtoAddress?: string
  isOneClick?: boolean
}

export function parseListUnsubscribe(header: string): UnsubscribeInfo {
  if (!header?.trim()) return { method: 'unknown' }

  const httpMatch = header.match(/<(https?:\/\/[^>]+)>/i)
  const mailtoMatch = header.match(/<mailto:([^>?]+(?:\?[^>]*)?)>/i)

  if (httpMatch) {
    return {
      method: 'http',
      httpUrl: httpMatch[1],
      mailtoAddress: mailtoMatch?.[1],
    }
  }
  if (mailtoMatch) {
    return { method: 'mailto', mailtoAddress: mailtoMatch[1] }
  }
  // Bare URL fallback
  const bareHttp = header.match(/(https?:\/\/\S+)/i)
  if (bareHttp) return { method: 'http', httpUrl: bareHttp[1] }

  return { method: 'unknown' }
}

function parseFrom(from: string): { name: string; email: string; domain: string } {
  const match = from.match(/^(?:"?([^"<]*?)"?\s*)?<?([^\s<>]+@[^\s<>]+)>?$/)
  if (match) {
    const email = match[2].trim().toLowerCase()
    const name = match[1]?.trim() || email.split('@')[0]
    const domain = email.split('@')[1] ?? ''
    return { name, email, domain }
  }
  const emailOnly = from.trim().toLowerCase()
  return { name: emailOnly.split('@')[0], email: emailOnly, domain: emailOnly.split('@')[1] ?? '' }
}

const MARKETING_DOMAINS: string[] = [
  'mailchimp.com', 'list-manage.com', 'campaign-archive.com', 'mcsv.net', 'mcdlv.net',
  'sendgrid.net', 'sendgrid.com',
  'klaviyo.com', 'kmail-lists.com',
  'constantcontact.com', 'ccsend.com',
  'mailerlite.com', 'mlsend.com',
  'hubspot.com', 'hs-mail.com', 'hubspotemail.net',
  'marketo.com', 'mktomail.com',
  'salesforce.com', 'exacttarget.com', 'pardot.com',
  'createsend.com', 'cmail1.com', 'cmail2.com',
  'emarsys.com', 'emsec.de',
  'dotdigital.com', 'dotmailer.com',
  'mailjet.com', 'mjt.lu',
  'sendpulse.com',
  'aweber.com', 'awesomemktg.com',
  'getresponse.com', 'gr8.com',
  'brevo.com', 'sendinblue.com',
  'activecampaign.com',
  'omnisend.com',
  'mailgun.org', 'mailgun.net',
  'amazonses.com',
]

const NEWSLETTER_SUBJECT_KEYWORDS = [
  'newsletter', 'digest', 'weekly', 'monthly', 'daily', 'roundup',
  'recap', 'edition', 'issue', 'bulletin', 'update', 'dispatch',
  'briefing', 'summary', 'highlights', 'report',
]

const NOREPLY_PATTERNS = [
  'noreply', 'no-reply', 'donotreply', 'do-not-reply',
  'newsletter@', 'news@', 'notifications@', 'updates@',
  'mailer@', 'marketing@', 'info@', 'hello@',
]

function scoreEmail(
  email: ParsedEmail,
  emailCount: number,
  hasSubjectKeyword: boolean
): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  if (email.listUnsubscribe) {
    score += 45
    reasons.push('Hat List-Unsubscribe Header (RFC 2369)')
  }

  const isMarketingDomain = MARKETING_DOMAINS.some(
    (d) => email.domain.includes(d) || email.fromEmail.includes(d)
  )
  if (isMarketingDomain) {
    score += 20
    reasons.push('Versand über bekannten E-Mail-Marketing-Dienst')
  }

  if (emailCount >= 5) {
    score += 15
    reasons.push(`Wiederkehrender Absender (${emailCount} E-Mails)`)
  } else if (emailCount >= 3) {
    score += 8
    reasons.push(`Mehrere E-Mails erhalten (${emailCount})`)
  } else if (emailCount >= 2) {
    score += 3
  }

  if (hasSubjectKeyword) {
    score += 12
    reasons.push('Newsletter-Begriffe in Betreffzeilen gefunden')
  }

  const isNoReply = NOREPLY_PATTERNS.some((p) =>
    email.fromEmail.toLowerCase().includes(p)
  )
  if (isNoReply) {
    score += 8
    reasons.push('No-Reply oder automatisierte Absenderadresse')
  }

  return { score: Math.min(score, 100), reasons }
}

function getRiskLevel(
  score: number,
  method: string
): 'low' | 'medium' | 'high' {
  if (score >= 70 && method !== 'unknown') return 'low'
  if (score >= 40) return 'medium'
  return 'high'
}

const CONCURRENCY = 15
const BATCH_DELAY_MS = 80

async function runBatched<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  onBatch?: (completed: number, total: number) => void
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null)

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(batch.map(fn))
    settled.forEach((r, j) => {
      if (r.status === 'fulfilled') results[i + j] = r.value
    })
    onBatch?.(Math.min(i + CONCURRENCY, items.length), items.length)
    if (i + CONCURRENCY < items.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  return results
}

export async function analyzeEmails(
  accessToken: string,
  maxEmails = 500,
  onProgress?: (processed: number, total: number) => void
): Promise<AnalysisResult> {
  onProgress?.(0, maxEmails)

  const messageIds = await fetchMessageIds(accessToken, maxEmails)
  const total = messageIds.length
  onProgress?.(0, total)

  const rawHeaders = await runBatched(
    messageIds,
    (id) => fetchMessageHeaders(accessToken, id),
    (done) => onProgress?.(done, total)
  )

  const parsedEmails: ParsedEmail[] = []
  for (let i = 0; i < messageIds.length; i++) {
    const h = rawHeaders[i]
    if (!h) continue
    const { name, email, domain } = parseFrom(h.from)
    parsedEmails.push({
      id: messageIds[i],
      fromRaw: h.from,
      fromName: name,
      fromEmail: email,
      domain,
      subject: h.subject,
      date: h.date,
      snippet: h.snippet ?? '',
      listUnsubscribe: h.listUnsubscribe,
      listUnsubscribePost: h.listUnsubscribePost,
    })
  }

  // Group by sender email address
  const senderMap = new Map<string, ParsedEmail[]>()
  for (const email of parsedEmails) {
    const key = email.fromEmail.toLowerCase()
    const existing = senderMap.get(key) ?? []
    existing.push(email)
    senderMap.set(key, existing)
  }

  const newsletters: NewsletterSender[] = []

  for (const [emailAddr, emails] of Array.from(senderMap.entries())) {
    const sorted = [...emails].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const latest = sorted[0]

    const hasSubjectKeyword = emails.some((e: ParsedEmail) =>
      NEWSLETTER_SUBJECT_KEYWORDS.some((k) =>
        e.subject.toLowerCase().includes(k)
      )
    )

    const { score, reasons } = scoreEmail(latest, emails.length, hasSubjectKeyword)
    if (score < 20) continue

    const unsub = latest.listUnsubscribe
      ? parseListUnsubscribe(latest.listUnsubscribe)
      : { method: 'unknown' as const }

    const isOneClick = !!latest.listUnsubscribePost
      ?.toLowerCase()
      .includes('list-unsubscribe=one-click')
    if (isOneClick && unsub.method === 'http') unsub.isOneClick = true

    const sampleEmails: EmailPreview[] = sorted.slice(0, 3).map((e) => ({
      id: e.id,
      subject: e.subject,
      date: e.date,
      snippet: e.snippet,
    }))

    newsletters.push({
      id: `sender-${emailAddr.replace(/[^a-z0-9]/g, '-')}`,
      name: latest.fromName,
      email: emailAddr,
      domain: latest.domain,
      emailCount: emails.length,
      lastReceived: latest.date,
      confidenceScore: score,
      unsubscribeMethod: unsub.method,
      unsubscribeUrl: unsub.httpUrl,
      unsubscribeEmail: unsub.mailtoAddress,
      isOneClick: unsub.isOneClick,
      sampleEmails,
      status: 'subscribed',
      riskLevel: getRiskLevel(score, unsub.method),
      reasons,
    })
  }

  newsletters.sort((a, b) => b.confidenceScore - a.confidenceScore)

  const subscribedCount = newsletters.length
  const ratio = parsedEmails.length > 0 ? subscribedCount / parsedEmails.length : 0
  const healthScore = Math.max(0, Math.round(100 - ratio * 150))

  return {
    newsletters,
    totalAnalyzed: parsedEmails.length,
    healthScore,
  }
}
