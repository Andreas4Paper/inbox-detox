'use client'

import { useState } from 'react'
import type { NewsletterSender } from '@/types'
import { timeAgo, formatDate, getRiskBadge, getScoreColor, cn } from '@/lib/utils'

interface NewsletterDetailProps {
  newsletter: NewsletterSender
  onUnsubscribe: (newsletter: NewsletterSender) => Promise<void>
  onClose: () => void
}

export function NewsletterDetail({ newsletter, onUnsubscribe, onClose }: NewsletterDetailProps) {
  const [loading, setLoading] = useState(false)
  const risk = getRiskBadge(newsletter.riskLevel)
  const isUnsubscribed = newsletter.status === 'unsubscribed'

  const handleUnsubscribe = async () => {
    setLoading(true)
    try {
      await onUnsubscribe(newsletter)
    } finally {
      setLoading(false)
    }
  }

  const methodLabel =
    newsletter.unsubscribeMethod === 'http'
      ? 'HTTP Link (automatisch)'
      : newsletter.unsubscribeMethod === 'mailto'
      ? 'E-Mail senden'
      : 'Manuell (kein Header)'

  const methodIcon =
    newsletter.unsubscribeMethod === 'http'
      ? '🌐'
      : newsletter.unsubscribeMethod === 'mailto'
      ? '📧'
      : '⚠️'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center font-bold text-lg text-violet-700 flex-shrink-0">
              {(newsletter.name || newsletter.email)[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{newsletter.name}</h2>
              <p className="text-sm text-slate-500">{newsletter.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">Empfangen</div>
            <div className="text-2xl font-bold text-slate-900">{newsletter.emailCount}</div>
            <div className="text-xs text-slate-400">E-Mails</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">Zuletzt erhalten</div>
            <div className="text-sm font-semibold text-slate-900">{timeAgo(newsletter.lastReceived)}</div>
            <div className="text-xs text-slate-400">{formatDate(newsletter.lastReceived)}</div>
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Newsletter-Konfidenz</span>
            <span className="text-sm font-bold text-slate-900">{newsletter.confidenceScore}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full', getScoreColor(newsletter.confidenceScore))}
              style={{ width: `${newsletter.confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Detection reasons */}
        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">Erkennungsmerkmale</div>
          <div className="space-y-1.5">
            {newsletter.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {reason}
              </div>
            ))}
            {newsletter.reasons.length === 0 && (
              <div className="text-sm text-slate-400 italic">Keine spezifischen Merkmale</div>
            )}
          </div>
        </div>

        {/* Unsubscribe method */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span>{methodIcon}</span>
            <span className="text-sm font-medium text-slate-700">Abmelde-Methode</span>
          </div>
          <p className="text-sm text-slate-600">{methodLabel}</p>
          {newsletter.unsubscribeMethod === 'http' && newsletter.unsubscribeUrl && (
            <a
              href={newsletter.unsubscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-600 hover:underline mt-1 block truncate"
            >
              {newsletter.unsubscribeUrl}
            </a>
          )}
          {newsletter.unsubscribeMethod === 'mailto' && newsletter.unsubscribeEmail && (
            <p className="text-xs text-slate-500 mt-1">{newsletter.unsubscribeEmail}</p>
          )}
        </div>

        {/* Risk level */}
        {newsletter.riskLevel !== 'low' && (
          <div className={cn(
            'rounded-xl p-4 flex items-start gap-3',
            newsletter.riskLevel === 'high' ? 'bg-red-50' : 'bg-amber-50'
          )}>
            <span className="text-lg flex-shrink-0">
              {newsletter.riskLevel === 'high' ? '⚠️' : 'ℹ️'}
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-800 mb-0.5">
                {newsletter.riskLevel === 'high' ? 'Unsichere Abmeldung' : 'Manuell prüfen'}
              </div>
              <p className="text-xs text-slate-600">
                {newsletter.riskLevel === 'high'
                  ? 'Kein List-Unsubscribe Header gefunden. Möglicherweise kein echter Newsletter. Zur Website navigieren, um sicher abzumelden.'
                  : 'Die Erkennung ist nicht vollständig sicher. Prüfe die Beispiel-E-Mails, bevor du dich abmeldest.'}
              </p>
              {newsletter.unsubscribeMethod === 'unknown' && newsletter.domain && (
                <a
                  href={`https://${newsletter.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-slate-700 hover:underline mt-1.5 inline-flex items-center gap-1"
                >
                  {newsletter.domain} besuchen →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Sample emails */}
        {newsletter.sampleEmails.length > 0 && (
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Beispiel-E-Mails</div>
            <div className="space-y-2">
              {newsletter.sampleEmails.map((email) => (
                <div key={email.id} className="border border-slate-100 rounded-xl p-3">
                  <div className="text-sm font-medium text-slate-800 truncate">{email.subject}</div>
                  {email.snippet && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{email.snippet}</p>
                  )}
                  <div className="text-xs text-slate-400 mt-1">{formatDate(email.date)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="pt-1">
          {isUnsubscribed ? (
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 rounded-xl text-emerald-700 font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Erfolgreich abgemeldet
            </div>
          ) : (
            <button
              onClick={handleUnsubscribe}
              disabled={loading || newsletter.status === 'pending'}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all',
                newsletter.riskLevel === 'high'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-700 text-white',
                (loading || newsletter.status === 'pending') && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Abmelden…
                </span>
              ) : newsletter.riskLevel === 'high' ? (
                '⚠️ Trotzdem abmelden'
              ) : (
                '🚫 Jetzt abmelden'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
