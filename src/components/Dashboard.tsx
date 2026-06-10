'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { NewsletterSender, AnalysisResult, FilterType, SortType } from '@/types'
import { HealthScore } from './HealthScore'
import { NewsletterCard } from './NewsletterCard'
import { NewsletterDetail } from './NewsletterDetail'
import { cn } from '@/lib/utils'

interface ProgressState {
  processed: number
  total: number
  status: 'idle' | 'loading' | 'complete' | 'error'
  message: string
}

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'high-confidence', label: 'Hohe Konfidenz' },
  { id: 'many-emails', label: 'Viele E-Mails' },
  { id: 'recent', label: 'Kürzlich' },
]

const SORTS: { id: SortType; label: string }[] = [
  { id: 'confidence', label: 'Konfidenz' },
  { id: 'count', label: 'Anzahl' },
  { id: 'recent', label: 'Datum' },
  { id: 'name', label: 'Name' },
]

function applyFilter(newsletters: NewsletterSender[], filter: FilterType): NewsletterSender[] {
  switch (filter) {
    case 'high-confidence':
      return newsletters.filter((n) => n.confidenceScore >= 70)
    case 'many-emails':
      return newsletters.filter((n) => n.emailCount >= 5)
    case 'recent': {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
      return newsletters.filter((n) => new Date(n.lastReceived).getTime() > cutoff)
    }
    default:
      return newsletters
  }
}

function applySort(newsletters: NewsletterSender[], sort: SortType): NewsletterSender[] {
  const copy = [...newsletters]
  switch (sort) {
    case 'confidence':
      return copy.sort((a, b) => b.confidenceScore - a.confidenceScore)
    case 'count':
      return copy.sort((a, b) => b.emailCount - a.emailCount)
    case 'recent':
      return copy.sort(
        (a, b) => new Date(b.lastReceived).getTime() - new Date(a.lastReceived).getTime()
      )
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
  }
}

export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [newsletters, setNewsletters] = useState<NewsletterSender[]>([])
  const [progress, setProgress] = useState<ProgressState>({
    processed: 0,
    total: 0,
    status: 'idle',
    message: '',
  })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('confidence')
  const [selected, setSelected] = useState<NewsletterSender | null>(null)
  const [maxEmails, setMaxEmails] = useState(500)
  const [batchUnsubLoading, setBatchUnsubLoading] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  const runAnalysis = useCallback(async (emailCount = maxEmails) => {
    abortRef.current?.()
    let aborted = false
    abortRef.current = () => { aborted = true }

    setProgress({ processed: 0, total: emailCount, status: 'loading', message: 'Verbinde mit Gmail…' })
    setResult(null)
    setSelected(null)

    try {
      const response = await fetch(`/api/emails/analyze?maxEmails=${emailCount}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!aborted) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const dataLine = part.split('\n').find((l) => l.startsWith('data: '))
          if (!dataLine) continue
          try {
            const data = JSON.parse(dataLine.slice(6))
            if (data.type === 'status') {
              setProgress((p) => ({ ...p, message: data.message }))
            } else if (data.type === 'progress') {
              setProgress((p) => ({
                ...p,
                processed: data.processed,
                total: data.total,
                message: `Analysiere E-Mails… ${data.processed}/${data.total}`,
              }))
            } else if (data.type === 'complete') {
              if (!aborted) {
                const r: AnalysisResult = data.result
                setResult(r)
                setNewsletters(r.newsletters)
                setProgress({ processed: data.total, total: data.total, status: 'complete', message: '' })
              }
            } else if (data.type === 'error') {
              throw new Error(data.message)
            }
          } catch (parseErr) {
            // skip malformed SSE events
          }
        }
      }
    } catch (err) {
      if (!aborted) {
        setProgress((p) => ({
          ...p,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unbekannter Fehler',
        }))
      }
    }
  }, [maxEmails])

  useEffect(() => {
    runAnalysis()
    return () => { abortRef.current?.() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnsubscribe = useCallback(async (newsletter: NewsletterSender) => {
    if (newsletter.status === 'unsubscribed') return

    setNewsletters((prev) =>
      prev.map((n) => (n.id === newsletter.id ? { ...n, status: 'pending' } : n))
    )

    try {
      if (newsletter.unsubscribeMethod === 'unknown') {
        if (newsletter.domain) {
          window.open(`https://${newsletter.domain}`, '_blank', 'noopener,noreferrer')
          setNewsletters((prev) =>
            prev.map((n) => (n.id === newsletter.id ? { ...n, status: 'subscribed' } : n))
          )
        }
        return
      }

      const res = await fetch('/api/emails/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: newsletter.unsubscribeMethod,
          url: newsletter.unsubscribeUrl,
          email: newsletter.unsubscribeEmail,
          senderName: newsletter.name,
        }),
      })

      const data = await res.json()
      const success = res.ok && data.success

      setNewsletters((prev) =>
        prev.map((n) =>
          n.id === newsletter.id ? { ...n, status: success ? 'unsubscribed' : 'subscribed' } : n
        )
      )

      if (selected?.id === newsletter.id && success) {
        setSelected((prev) => prev ? { ...prev, status: 'unsubscribed' } : null)
      }
    } catch {
      setNewsletters((prev) =>
        prev.map((n) => (n.id === newsletter.id ? { ...n, status: 'subscribed' } : n))
      )
    }
  }, [selected])

  const handleBatchUnsubscribe = async () => {
    const toUnsub = filtered.filter(
      (n) => n.status === 'subscribed' && n.riskLevel === 'low'
    )
    if (toUnsub.length === 0) return
    setBatchUnsubLoading(true)
    for (const n of toUnsub) {
      await handleUnsubscribe(n)
      await new Promise((r) => setTimeout(r, 300))
    }
    setBatchUnsubLoading(false)
  }

  // Derive display list
  let filtered = applyFilter(newsletters, filter)
  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.email.toLowerCase().includes(q) ||
        n.domain.toLowerCase().includes(q)
    )
  }
  filtered = applySort(filtered, sort)

  const unsubscribedCount = newsletters.filter((n) => n.status === 'unsubscribed').length
  const healthScore = result
    ? Math.max(
        0,
        result.healthScore + Math.round((unsubscribedCount / Math.max(newsletters.length, 1)) * 15)
      )
    : 0

  const isLoading = progress.status === 'loading'
  const isDone = progress.status === 'complete'
  const isError = progress.status === 'error'
  const progressPct =
    progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0

  return (
    <div className="min-h-full">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">E-Mails werden analysiert</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">{progress.message}</p>
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {progress.processed} / {progress.total} E-Mails
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Analyse fehlgeschlagen</h2>
          <p className="text-slate-500 mb-6">{progress.message}</p>
          <button
            onClick={() => runAnalysis()}
            className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Main content */}
      {(isDone || newsletters.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Health score */}
          {result && (
            <HealthScore
              score={Math.min(healthScore, 100)}
              totalNewsletters={newsletters.length}
              totalAnalyzed={result.totalAnalyzed}
              unsubscribed={unsubscribedCount}
            />
          )}

          {/* Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Newsletter suchen…"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>Sortierung: {s.label}</option>
                ))}
              </select>

              {/* Batch action */}
              <button
                onClick={handleBatchUnsubscribe}
                disabled={batchUnsubLoading || filtered.filter(n => n.status === 'subscribed' && n.riskLevel === 'low').length === 0}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {batchUnsubLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Abmelden…
                  </span>
                ) : (
                  'Alle sicheren abmelden'
                )}
              </button>
            </div>

            {/* Filter chips */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    filter === f.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {f.label}
                </button>
              ))}
              <span className="ml-auto text-xs text-slate-400 self-center">
                {filtered.length} von {newsletters.length}
              </span>
            </div>
          </div>

          {/* Main grid: list + detail */}
          <div className="grid lg:grid-cols-5 gap-6 items-start">
            {/* Newsletter list */}
            <div className={cn('space-y-3', selected ? 'lg:col-span-3' : 'lg:col-span-5')}>
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="font-medium text-slate-600">Keine Newsletter gefunden</p>
                  <p className="text-sm mt-1">
                    {search ? 'Versuche einen anderen Suchbegriff.' : 'Dein Postfach ist sauber!'}
                  </p>
                </div>
              ) : (
                filtered.map((n) => (
                  <NewsletterCard
                    key={n.id}
                    newsletter={n}
                    onUnsubscribe={handleUnsubscribe}
                    onSelect={setSelected}
                    isSelected={selected?.id === n.id}
                  />
                ))
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="lg:col-span-2 lg:sticky lg:top-20">
                <NewsletterDetail
                  newsletter={newsletters.find((n) => n.id === selected.id) ?? selected}
                  onUnsubscribe={handleUnsubscribe}
                  onClose={() => setSelected(null)}
                />
              </div>
            )}
          </div>

          {/* Re-analyze with different count */}
          <div className="flex items-center justify-center gap-4 py-4 text-sm text-slate-500">
            <span>Mehr analysieren:</span>
            {[500, 1000, 2000].map((count) => (
              <button
                key={count}
                onClick={() => { setMaxEmails(count); runAnalysis(count) }}
                className={cn(
                  'px-3 py-1 rounded-lg transition-colors',
                  maxEmails === count && isDone
                    ? 'bg-violet-100 text-violet-700 font-medium'
                    : 'hover:bg-slate-100 text-slate-600'
                )}
              >
                {count} E-Mails
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
