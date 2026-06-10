'use client'

import { getHealthLabel } from '@/lib/utils'

interface HealthScoreProps {
  score: number
  totalNewsletters: number
  totalAnalyzed: number
  unsubscribed: number
}

export function HealthScore({
  score,
  totalNewsletters,
  totalAnalyzed,
  unsubscribed,
}: HealthScoreProps) {
  const { label, color } = getHealthLabel(score)

  const arcRadius = 54
  const arcCircumference = Math.PI * arcRadius
  const arcOffset = arcCircumference - (score / 100) * arcCircumference

  const scoreColor =
    score >= 80
      ? '#10b981'
      : score >= 60
      ? '#22c55e'
      : score >= 40
      ? '#f59e0b'
      : '#ef4444'

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Arc gauge */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="72" viewBox="0 0 128 72">
            {/* Background arc */}
            <path
              d="M 12 64 A 52 52 0 0 1 116 64"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Score arc */}
            <path
              d="M 12 64 A 52 52 0 0 1 116 64"
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${arcCircumference}`}
              strokeDashoffset={`${arcOffset}`}
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-center">
            <div className="text-3xl font-extrabold text-slate-900">{score}</div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <h2 className="text-xl font-bold text-slate-900">Inbox Health Score</h2>
          </div>
          <p className={`text-lg font-semibold mb-3 ${color}`}>{label}</p>

          <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-slate-600">
                <strong className="text-slate-900">{totalNewsletters}</strong> Newsletter erkannt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">
                <strong className="text-slate-900">{unsubscribed}</strong> abgemeldet
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-slate-600">
                <strong className="text-slate-900">{totalAnalyzed}</strong> E-Mails analysiert
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
