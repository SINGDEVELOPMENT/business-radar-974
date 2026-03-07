'use client'

import { useState, useMemo } from 'react'
import OldReportCard from '@/components/dashboard/OldReportCard'
import type { AiReportContent } from '@/types'

interface Report {
  id: string
  report_type: string
  generated_at: string
  summary?: string | null
  content?: AiReportContent | null
}

const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function ReportsOldSection({ reports }: { reports: Report[] }) {
  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')

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

  return (
    <div className="space-y-3">
      {/* Filtres */}
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

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">Aucun rapport pour cette période</p>
      )}

      {filtered.map(report => (
        <OldReportCard key={report.id} report={report} />
      ))}
    </div>
  )
}
