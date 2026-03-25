'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Calendar, CheckCircle2, XCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { AiReportContent, AiRecommendation } from '@/types'
import ReportTypeBadge from '@/components/ui/ReportTypeBadge'

interface OldReportCardProps {
  report: {
    id: string
    report_type: string
    generated_at: string
    summary?: string | null
    content?: AiReportContent | null
  }
}

function RecommendationRow({ rec, index }: { rec: AiRecommendation; index: number }) {
  const colorClass = rec.priority === 'haute'
    ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
    : rec.priority === 'moyenne'
    ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
    : 'bg-gray-50 border-gray-200 dark:bg-slate-800 dark:border-slate-700'
  const badgeColor = rec.priority === 'haute' ? 'text-red-500' : rec.priority === 'moyenne' ? 'text-amber-500' : 'text-gray-400'
  return (
    <div className={`rounded-lg border p-3 ${colorClass}`}>
      <div className="flex items-start gap-2 mb-1">
        <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{index}.</span>
        <span className={`text-[10px] font-bold uppercase shrink-0 mt-0.5 ${badgeColor}`}>{rec.priority}</span>
        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">{rec.action}</p>
      </div>
      {rec.impact && (
        <p className="text-xs text-gray-500 pl-6">
          <span className="font-medium text-gray-600 dark:text-slate-400">Impact :</span> {rec.impact}
        </p>
      )}
    </div>
  )
}

export default function OldReportCard({ report }: OldReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const c = report.content

  // Auto-expand + scroll si l'URL contient l'ancre de ce rapport
  useEffect(() => {
    if (window.location.hash === `#report-${report.id}`) {
      setExpanded(true)
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [report.id])

  return (
    <Card ref={cardRef} id={`report-${report.id}`} className="p-4 scroll-mt-20">
      {/* En-tête toujours visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <ReportTypeBadge type={report.report_type} />
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(report.generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        {c?.score_global != null && (
          <span className="text-sm font-bold text-blue-600 shrink-0">{c.score_global}/100</span>
        )}
      </div>

      {/* Résumé */}
      {report.summary && (
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-2">{report.summary}</p>
      )}

      {/* Bouton expand */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1.5 mt-3 text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
      >
        {expanded ? (
          <><ChevronUp className="w-3.5 h-3.5" /> Fermer</>
        ) : (
          <><ChevronDown className="w-3.5 h-3.5" /> Lire le rapport</>
        )}
      </button>

      {/* Contenu complet (dépliable) */}
      {expanded && c && (
        <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-slate-800 pt-4">
          {/* Points forts + axes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.strengths?.length > 0 && (
              <div className="rounded-lg border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">Points forts</span>
                </div>
                <ul className="space-y-1.5">
                  {c.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-slate-300">
                      <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.weaknesses?.length > 0 && (
              <div className="rounded-lg border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">Axes d&apos;amélioration</span>
                </div>
                <ul className="space-y-1.5">
                  {c.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-slate-300">
                      <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommandations */}
          {c.recommendations?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Recommandations</span>
              </div>
              <div className="space-y-2">
                {c.recommendations.map((rec, i) => (
                  <RecommendationRow key={i} rec={rec} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Analyse concurrentielle */}
          {c.competitor_analysis && (
            <div className="rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">Analyse concurrentielle</p>
              <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{c.competitor_analysis}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
