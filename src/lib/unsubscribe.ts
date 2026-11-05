import { lookup as dnsLookup } from 'node:dns'
import type { LookupAddress } from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import { BlockList, isIP } from 'node:net'

const MAX_REDIRECTS = 5
const TIMEOUT_MS = 12_000

const blockedAddresses = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16], // includes cloud metadata endpoints
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blockedAddresses.addSubnet(network, prefix, 'ipv4')
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  // No ::ffff:0:0/96 rule: BlockList checks IPv4-mapped addresses against the IPv4 rules
  // above, and such a rule would match every IPv4 address.
  ['64:ff9b::', 96], // NAT64
  ['2001:db8::', 32],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blockedAddresses.addSubnet(network, prefix, 'ipv6')
}

export function isBlockedAddress(address: string): boolean {
  const version = isIP(address)
  if (version === 0) return true
  return blockedAddresses.check(address, version === 4 ? 'ipv4' : 'ipv6')
}

/** Validates addresses at connection time, so a hostname cannot resolve differently after a check. */
function safeLookup(
  hostname: string,
  options: { all?: boolean; family?: number | string },
  callback: (...args: any[]) => void
) {
  dnsLookup(hostname, { ...options, all: true } as any, (error: Error | null, result: any) => {
    if (error) return callback(error)
    const addresses = result as LookupAddress[]
    if (addresses.length === 0 || addresses.some((a) => isBlockedAddress(a.address))) {
      return callback(new Error('Blocked address'))
    }
    if (options.all) return callback(null, addresses)
    callback(null, addresses[0].address, addresses[0].family)
  })
}

export function parseUnsubscribeUrl(value: string): URL | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username || url.password) return null
  if (url.port && url.port !== '80' && url.port !== '443') return null
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (isIP(host) !== 0 && isBlockedAddress(host)) return null
  return url
}

function sendRequest(
  url: URL,
  method: 'GET' | 'POST',
  isOneClick: boolean,
  signal: AbortSignal
): Promise<{ status: number; location?: string }> {
  const client = url.protocol === 'https:' ? https : http
  const sendsOneClickBody = isOneClick && method === 'POST'
  return new Promise((resolve, reject) => {
    const request = client.request(
      url,
      {
        method,
        signal,
        lookup: safeLookup as any,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; InboxDetox/1.0)',
          ...(sendsOneClickBody
            ? { 'Content-Type': 'application/x-www-form-urlencoded' }
            : {}),
        },
      },
      (response) => {
        response.resume()
        resolve({ status: response.statusCode ?? 0, location: response.headers.location })
      }
    )
    request.on('error', reject)
    request.end(sendsOneClickBody ? 'List-Unsubscribe=One-Click' : undefined)
  })
}

/**
 * Calls a sender's unsubscribe URL. Only public hosts on standard ports are reachable,
 * also after redirects. Resolves to true if the final response is not an error.
 */
export async function requestUnsubscribeUrl(value: string, isOneClick: boolean): Promise<boolean> {
  const signal = AbortSignal.timeout(TIMEOUT_MS)
  let url = parseUnsubscribeUrl(value)
  let method: 'GET' | 'POST' = isOneClick ? 'POST' : 'GET'

  for (let hop = 0; url && hop <= MAX_REDIRECTS; hop++) {
    const { status, location } = await sendRequest(url, method, isOneClick, signal)
    if (status < 300 || status >= 400 || !location) return status >= 200 && status < 300
    if (status !== 307 && status !== 308) method = 'GET'
    url = parseUnsubscribeUrl(new URL(location, url).toString())
  }
  return false
}

const EMAIL_PATTERN = /^[^\s@<>,;:"()\[\]\\]+@[^\s@<>,;:"()\[\]\\]+\.[^\s@<>,;:"()\[\]\\]+$/

/** Splits the value of a mailto: unsubscribe target and rejects anything unsafe in a mail header. */
export function parseMailtoTarget(value: string): { to: string; subject: string } | null {
  const [address, query = ''] = value.split('?', 2)
  let to: string
  let requested: string
  try {
    to = decodeURIComponent(address).trim()
    requested = new URLSearchParams(query).get('subject') ?? ''
  } catch {
    return null
  }
  if (!EMAIL_PATTERN.test(to)) return null
  // Some lists need their token in the subject; non-ASCII would need header encoding.
  const usable = /^[\x20-\x7e]{1,200}$/.test(requested)
  return { to, subject: usable ? requested : 'Unsubscribe' }
}
