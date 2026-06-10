import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

function createClient(accessToken: string) {
  const auth = new OAuth2Client()
  auth.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth })
}

export async function fetchMessageIds(
  accessToken: string,
  maxResults = 500
): Promise<string[]> {
  const gmail = createClient(accessToken)
  const ids: string[] = []
  let pageToken: string | undefined

  while (ids.length < maxResults) {
    const remaining = maxResults - ids.length
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: Math.min(remaining, 500),
      ...(pageToken ? { pageToken } : {}),
    })

    const messages = res.data.messages ?? []
    ids.push(...messages.map((m) => m.id!).filter(Boolean))

    pageToken = res.data.nextPageToken ?? undefined
    if (!pageToken || messages.length === 0) break
  }

  return ids.slice(0, maxResults)
}

export interface RawHeaders {
  from: string
  subject: string
  date: string
  listUnsubscribe?: string
  listUnsubscribePost?: string
  snippet?: string
}

export async function fetchMessageHeaders(
  accessToken: string,
  messageId: string
): Promise<RawHeaders | null> {
  const gmail = createClient(accessToken)

  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'metadata',
      metadataHeaders: [
        'From',
        'Subject',
        'Date',
        'List-Unsubscribe',
        'List-Unsubscribe-Post',
      ],
    })

    const headers = res.data.payload?.headers ?? []
    const get = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
      undefined

    const from = get('From') ?? ''
    if (!from) return null

    return {
      from,
      subject: get('Subject') ?? '(no subject)',
      date: get('Date') ?? '',
      listUnsubscribe: get('List-Unsubscribe'),
      listUnsubscribePost: get('List-Unsubscribe-Post'),
      snippet: res.data.snippet ?? '',
    }
  } catch {
    return null
  }
}

export async function sendUnsubscribeEmail(
  accessToken: string,
  to: string,
  subject = 'Unsubscribe'
): Promise<boolean> {
  const gmail = createClient(accessToken)

  const rawMessage = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    'Please unsubscribe me from this mailing list.',
  ].join('\r\n')

  const encoded = Buffer.from(rawMessage).toString('base64url')

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encoded },
    })
    return true
  } catch {
    return false
  }
}
