'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Brain, Calendar, FileDown, ArrowRight, Lightbulb } from 'lucide-react'
import type { AiRecommendation } from '@/types'
import ScoreCircle from '@/components/ui/ScoreCircle'
import ReportTypeBadge from '@/components/ui/ReportTypeBadge'

interface Report {
  id: string
  summary?: string | null
  content?: {
    score_global?: number
    recommendations?: AiRecommendation[]
  } | null
  generated_at: string
  report_type: string
}

interface Props {
  reports: Report[]
}

export default function DashboardReportsSection({ reports }: Props) {
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')

  // Extraire les années et mois disponibles
  const { years, months } = useMemo(() => {
    const yearsSet = new Set<string>()
    const monthsSet = new Set<string>()
    for (const r of reports) {
      const d = new Date(r.generated_at)
      yearsSet.add(String(d.getFullYear()))
      monthsSet.add(String(d.getMonth()))
    }
    return {
      years: Array.from(yearsSet).sort((a, b) => Number(b) - Number(a)),
      months: Array.from(monthsSet).sort((a, b) => Number(a) - Number(b)),
    }
  }, [reports])

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const d = new Date(r.generated_at)
      if (filterYear !== 'all' && String(d.getFullYear()) !== filterYear) return false
      if (filterMonth !== 'all' && String(d.getMonth()) !== filterMonth) return false
      return true
    })
  }, [reports, filterYear, filterMonth])

  const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  if (reports.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-slate-800 mb-3">
            <Brain className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Aucun rapport AI disponible</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Le premier rapport sera généré automatiquement</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres — visibles uniquement si plusieurs rapports */}
      {reports.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterYear}
            onChange={e => { setFilterYear(e.target.value); setFilterMonth('all') }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          >
            <option value="all">Toutes les années</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
          >
            <option value="all">Tous les mois</option>
            {months.map(m => <option key={m} value={m}>{MONTH_LABELS[Number(m)]}</option>)}
          </select>

          {(filterYear !== 'all' || filterMonth !== 'all') && (
            <button
              onClick={() => { setFilterYear('all'); setFilterMonth('all') }}
              className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              Réinitialiser
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto">
            {filtered.length} rapport{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Liste des rapports */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Aucun rapport pour cette période</p>
        )}

        {filtered.map((report, idx) => {
          const content = report.content
          const score = content?.score_global
          const recs = content?.recommendations ?? []
          const isLatest = reports[0]?.id === report.id

          return (
            <Card key={report.id} className="p-5">
              <div className="flex items-start gap-4">
                {score != null && <ScoreCircle score={score} size="sm" />}

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Analyse AI {isLatest && <span className="text-xs font-normal text-blue-500 ml-1">• Dernière</span>}
                      </span>
                      <ReportTypeBadge type={report.report_type} />
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Résumé */}
                  {report.summary && (
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-3">
                      {report.summary}
                    </p>
                  )}

                  {/* Top recommandations (3 max) */}
                  {recs.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Recommandations
                        </p>
                      </div>
                      <div className="space-y-1">
                        {recs.slice(0, 3).map((rec, i) => {
                          const badgeColor = rec.priority === 'haute' ? 'text-red-500' : rec.priority === 'moyenne' ? 'text-amber-500' : 'text-gray-400'
                          return (
                            <div key={i} className="flex items-start gap-2 pl-1">
                              <ArrowRight className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                              <span className={`text-[10px] font-bold uppercase shrink-0 mt-0.5 ${badgeColor}`}>{rec.priority}</span>
                              <p className="text-xs text-gray-700 dark:text-slate-300">{rec.action}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-slate-800">
                    <Link
                      href={`/dashboard/reports#report-${report.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Voir le rapport complet <ArrowRight className="w-3 h-3" />
                    </Link>

                    {isLatest && (
                      <a
                        href="/api/reports/pdf"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-medium rounded-lg transition-colors"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Télécharger PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
