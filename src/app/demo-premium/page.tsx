'use client'

import { useState, useMemo } from 'react'
import KpiCard from '@/components/dashboard/KpiCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, TrendingUp, Activity, Brain, Calendar, ArrowRight, Lightbulb, FileDown, Bell, AlertTriangle, Facebook, Instagram, Clock } from 'lucide-react'
import Link from 'next/link'
import { DEMO_BUSINESS, DEMO_REVIEWS, DEMO_SOCIAL_POSTS, DEMO_SEO_LATEST, DEMO_OLD_REPORTS, DEMO_ALERTS, DEMO_SUGGESTIONS } from '@/lib/demo-data'
import type { AiRecommendation } from '@/types'
import ScoreCircle from '@/components/ui/ScoreCircle'

const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export default function DemoPremiumPage() {
  const avgRating = DEMO_BUSINESS.googleRating
  const reviewsThisMonth = DEMO_REVIEWS.filter(r => r.published_at >= '2026-02-01').length
  const totalEngagement = DEMO_SOCIAL_POSTS.reduce((s, p) => s + p.likes + p.comments + p.shares, 0)

  const [filterYear, setFilterYear] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')

  const { years, months } = useMemo(() => {
    const yearsSet = new Set<string>()
    const monthsSet = new Set<string>()
    for (const r of DEMO_OLD_REPORTS) {
      const d = new Date(r.generated_at)
      yearsSet.add(String(d.getFullYear()))
      monthsSet.add(String(d.getMonth()))
    }
    return {
      years: Array.from(yearsSet).sort((a, b) => Number(b) - Number(a)),
      months: Array.from(monthsSet).sort((a, b) => Number(a) - Number(b)),
    }
  }, [])

  const filtered = useMemo(() => {
    return DEMO_OLD_REPORTS.filter(r => {
      const d = new Date(r.generated_at)
      if (filterYear !== 'all' && String(d.getFullYear()) !== filterYear) return false
      if (filterMonth !== 'all' && String(d.getMonth()) !== filterMonth) return false
      return true
    })
  }, [filterYear, filterMonth])

  return (
    <div className="space-y-6">
      <div className="flex flex-col min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Vue d&apos;ensemble</h1>
        <p className="text-xs md:text-sm text-gray-500">Tableau de bord — {DEMO_BUSINESS.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Note Google"
          value={`${avgRating.toFixed(1)}/5`}
          subtitle={`sur ${DEMO_BUSINESS.googleReviewsCount} avis`}
          trend={{ value: +0.2, label: 'vs mois préc.' }}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
        <KpiCard
          title="Avis ce mois"
          value={reviewsThisMonth}
          subtitle="février 2026"
          icon={MessageSquare}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Engagement social"
          value={totalEngagement.toLocaleString('fr-FR')}
          subtitle="cumul FB + IG"
          trend={{ value: +287, label: 'vs mois préc.' }}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="Score SEO"
          value={`${DEMO_SEO_LATEST.lighthouse_score}/100`}
          subtitle="dernière analyse"
          trend={{ value: +7, label: 'vs 30j' }}
          icon={Activity}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Section Alertes — prévisualisation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alertes récentes
          </h2>
          <Link href="/demo-premium/alerts" className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {DEMO_ALERTS.filter(a => !a.is_read).slice(0, 2).map(alert => {
            const severityBar = alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
            const severityBadge = alert.severity === 'high'
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
            const severityLabel = alert.severity === 'high' ? 'Haute' : 'Moyenne'
            return (
              <Card key={alert.id} className="p-0 overflow-hidden">
                <div className="flex">
                  <div className={`w-1 shrink-0 ${severityBar}`} />
                  <div className="flex-1 px-4 py-3 min-w-0 flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</p>
                        <Badge className={`ml-auto text-[10px] px-1.5 py-0 border ${severityBadge} hover:${severityBadge}`}>{severityLabel}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{alert.message}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
        {DEMO_ALERTS.filter(a => !a.is_read).length > 2 && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            +{DEMO_ALERTS.filter(a => !a.is_read).length - 2} autre{DEMO_ALERTS.filter(a => !a.is_read).length - 2 > 1 ? 's' : ''} alerte{DEMO_ALERTS.filter(a => !a.is_read).length - 2 > 1 ? 's' : ''} —{' '}
            <Link href="/demo-premium/alerts" className="text-blue-500 hover:text-blue-400">voir tout</Link>
          </p>
        )}
      </div>

      {/* Section Suggestions IA — prévisualisation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions de contenu
          </h2>
          <Link href="/demo-premium/suggestions" className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DEMO_SUGGESTIONS.filter(s => s.status === 'pending').slice(0, 2).map(s => {
            const isFb = s.platform === 'facebook'
            return (
              <Card key={s.id} className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {isFb
                    ? <Badge className="gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-50 text-[11px]"><Facebook className="w-3 h-3" />Facebook</Badge>
                    : <Badge className="gap-1 bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800 hover:bg-pink-50 text-[11px]"><Instagram className="w-3 h-3" />Instagram</Badge>
                  }
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />{s.best_time}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{s.suggested_text}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Section Rapports AI avec filtres */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Dernière analyse AI
        </h2>

        <div className="space-y-4">
          {/* Filtres */}
          {DEMO_OLD_REPORTS.length > 1 && (
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

          {/* Cartes rapports */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">Aucun rapport pour cette période</p>
            )}
            {filtered.map((report, idx) => {
              const content = report.content
              const score = content?.score_global
              const recs = (content?.recommendations ?? []) as AiRecommendation[]
              const isLatest = DEMO_OLD_REPORTS[0]?.id === report.id
              return (
                <Card key={report.id} className="p-5">
                  <div className="flex items-start gap-4">
                    {score != null && <ScoreCircle score={score} size="sm" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Analyse AI {isLatest && <span className="text-xs font-normal text-blue-500 ml-1">• Dernière</span>}
                          </span>
                          <Badge variant={report.report_type === 'monthly' ? 'default' : 'secondary'} className="text-[10px]">
                            {report.report_type === 'monthly' ? 'Mensuel' : 'Hebdomadaire'}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {report.summary && (
                        <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-3">{report.summary}</p>
                      )}

                      {recs.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommandations</p>
                          </div>
                          <div className="space-y-1">
                            {recs.slice(0, 3).map((rec, i) => {
                              const c = rec.priority === 'haute' ? 'text-red-500' : rec.priority === 'moyenne' ? 'text-amber-500' : 'text-gray-400'
                              return (
                                <div key={i} className="flex items-start gap-2 pl-1">
                                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                                  <span className={`text-[10px] font-bold uppercase shrink-0 mt-0.5 ${c}`}>{rec.priority}</span>
                                  <p className="text-xs text-gray-700 dark:text-slate-300">{rec.action}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-slate-800">
                        <Link
                          href="/demo-premium/reports"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Voir le rapport complet <ArrowRight className="w-3 h-3" />
                        </Link>
                        {isLatest && (
                          <a
                            href="#"
                            onClick={e => e.preventDefault()}
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
      </div>
    </div>
  )
}
