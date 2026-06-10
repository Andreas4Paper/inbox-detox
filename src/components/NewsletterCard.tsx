'use client'

import { useState } from 'react'
import type { NewsletterSender } from '@/types'
import { timeAgo, getScoreColor, getRiskBadge, cn } from '@/lib/utils'

interface NewsletterCardProps {
  newsletter: NewsletterSender
  onUnsubscribe: (newsletter: NewsletterSender) => Promise<void>
  onSelect: (newsletter: NewsletterSender) => void
  isSelected: boolean
}

export function NewsletterCard({
  newsletter,
  onUnsubscribe,
  onSelect,
  isSelected,
}: NewsletterCardProps) {
  const [unsubLoading, setUnsubLoading] = useState(false)
  const risk = getRiskBadge(newsletter.riskLevel)

  const initial = (newsletter.name || newsletter.email)[0]?.toUpperCase() ?? '?'

  const handleUnsubscribe = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (newsletter.status === 'unsubscribed') return
    setUnsubLoading(true)
    try {
      await onUnsubscribe(newsletter)
    } finally {
      setUnsubLoading(false)
    }
  }

  const isUnsubscribed = newsletter.status === 'unsubscribed'
  const isPending = newsletter.status === 'pending'

  return (
    <div
      onClick={() => onSelect(newsletter)}
      className={cn(
        'group relative bg-white rounded-2xl border transition-all duration-150 cursor-pointer',
        'hover:shadow-md hover:border-violet-200',
        isSelected
          ? 'border-violet-400 shadow-md ring-1 ring-violet-400'
          : 'border-slate-200 shadow-sm',
        isUnsubscribed && 'opacity-60'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-base',
              isUnsubscribed
                ? 'bg-slate-100 text-slate-400'
                : 'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700'
            )}
          >
            {initial}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 truncate">{newsletter.name}</h3>
              {isUnsubscribed && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-200">
                  ✓ Abgemeldet
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-200">
                  ⏳ Ausstehend
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 truncate mt-0.5">{newsletter.email}</p>

            {/* Metadata row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {newsletter.emailCount} E-Mails
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeAgo(newsletter.lastReceived)}
              </span>
              <span>·</span>
              <span
                className={cn(
                  'inline-flex px-1.5 py-0.5 rounded-md text-xs font-medium ring-1',
                  risk.className
                )}
              >
                {risk.label}
              </span>
            </div>

            {/* Confidence bar */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', getScoreColor(newsletter.confidenceScore))}
                  style={{ width: `${newsletter.confidenceScore}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 w-7 text-right">
                {newsletter.confidenceScore}%
              </span>
            </div>
          </div>

          {/* Unsubscribe button */}
          <div className="flex-shrink-0 ml-2">
            {isUnsubscribed ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <button
                onClick={handleUnsubscribe}
                disabled={unsubLoading || isPending}
                title="Abmelden"
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                  newsletter.unsubscribeMethod === 'unknown'
                    ? 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                    : 'bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white',
                  (unsubLoading || isPending) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {unsubLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border accent for selected */}
      {isSelected && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full" />
      )}
    </div>
  )
}
