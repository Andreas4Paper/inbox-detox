export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Unbekannt'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Gerade eben'
  if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`
  if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std.`
  if (seconds < 604800) return `vor ${Math.floor(seconds / 86400)} Tagen`
  if (seconds < 2592000) return `vor ${Math.floor(seconds / 604800)} Wochen`
  return `vor ${Math.floor(seconds / 2592000)} Monaten`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getHealthLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Sehr sauber', color: 'text-emerald-600' }
  if (score >= 60) return { label: 'Gut', color: 'text-green-600' }
  if (score >= 40) return { label: 'Mittel', color: 'text-yellow-600' }
  if (score >= 20) return { label: 'Unordentlich', color: 'text-orange-600' }
  return { label: 'Überlastet', color: 'text-red-600' }
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-violet-600'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-slate-400'
}

export function getRiskBadge(risk: 'low' | 'medium' | 'high'): {
  label: string
  className: string
} {
  switch (risk) {
    case 'low':
      return { label: 'Sicher', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
    case 'medium':
      return { label: 'Mittel', className: 'bg-amber-50 text-amber-700 ring-amber-200' }
    case 'high':
      return { label: 'Unsicher', className: 'bg-red-50 text-red-700 ring-red-200' }
  }
}
