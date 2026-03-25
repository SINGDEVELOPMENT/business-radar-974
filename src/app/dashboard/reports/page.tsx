import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import GenerateReportButton from '@/components/dashboard/GenerateReportButton'
import OldReportCard from '@/components/dashboard/OldReportCard'
import ReportsOldSection from '@/components/dashboard/ReportsOldSection'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain, Calendar, CheckCircle2, XCircle, ArrowRight, Users,
  TrendingUp, FileDown, Lock, Sparkles,
} from 'lucide-react'
import type { AiReportContent, AiRecommendation } from '@/types'
import { redirect } from 'next/navigation'
import ScoreCircle from '@/components/ui/ScoreCircle'
import ReportTypeBadge from '@/components/ui/ReportTypeBadge'

const MANUAL_LIMIT = 5

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id

  // Query 1 : plan seul (toujours disponible, même sans migration 007)
  const { data: orgPlan } = orgId
    ? await supabase.from('organizations').select('plan').eq('id', orgId).single()
    : { data: null }

  const isPremium = orgPlan?.plan === 'premium'

  // Query 2 : compteur mensuel (requiert migration 007 — fallback si colonnes absentes)
  const now = new Date()
  let usedThisMonth = 0
  let remaining = MANUAL_LIMIT

  if (isPremium && orgId) {
    const { data: orgCounter } = await supabase
      .from('organizations')
      .select('manual_reports_this_month, manual_reports_reset_at')
      .eq('id', orgId)
      .single()

    if (orgCounter) {
      const resetAt = orgCounter.manual_reports_reset_at ? new Date(orgCounter.manual_reports_reset_at) : null
      const needsReset = !resetAt ||
        now.getFullYear() > resetAt.getFullYear() ||
        (now.getFullYear() === resetAt.getFullYear() && now.getMonth() > resetAt.getMonth())
      usedThisMonth = needsReset ? 0 : (orgCounter.manual_reports_this_month ?? 0)
      remaining = Math.max(0, MANUAL_LIMIT - usedThisMonth)
    }
  }

  const { data: reports } = orgId
    ? await supabase
        .from('ai_reports')
        .select('id, report_type, content, summary, generated_at')
        .eq('organization_id', orgId)
        .order('generated_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const reportsList = reports ?? []
  const latest = reportsList[0] ?? null
  const latestContent = latest?.content as AiReportContent | null

  // Grace period : compte standard mais rapports récents (< 30j) = ancien premium
  const GRACE_DAYS = 30
  const latestDate = latest ? new Date(latest.generated_at) : null
  const daysSince = latestDate
    ? Math.floor((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const gracePeriodEnd = latestDate
    ? new Date(latestDate.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000)
    : null
  const isInGracePeriod = !isPremium && reportsList.length > 0 && daysSince !== null && daysSince < GRACE_DAYS

  return (
    <div className="space-y-6">
      <Header title="Rapports AI" subtitle="Analyses et recommandations générées par Claude" />

      {/* ── Gate standard (sans grace period) ── */}
      {!isPremium && !isInGracePeriod && (
        <Card className="p-6 border-brand/20 bg-gradient-to-br from-brand/5 to-accent/5 dark:from-brand/10 dark:to-accent/10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Fonctionnalité Premium</h3>
                <Badge className="bg-brand">Premium</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                La génération de rapports AI est réservée aux abonnés Premium. Passez au plan Premium pour accéder à :
              </p>
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" /> 1 rapport AI automatique chaque semaine</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" /> 5 rapports manuels par mois</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" /> Jusqu'à 5 concurrents surveillés (vs 2 en standard)</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">Contactez votre administrateur pour passer en Premium.</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Grace period : ancien premium récemment rétrogradé ── */}
      {isInGracePeriod && gracePeriodEnd && (
        <Card className="p-5 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500 shrink-0">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Abonnement Premium expiré</h3>
                <Badge className="bg-amber-500">Accès limité</Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">
                Votre abonnement Premium a expiré. Vos rapports AI sont consultables jusqu'au{' '}
                <span className="font-semibold">
                  {gracePeriodEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>{' '}
                puis seront masqués. Téléchargez-les avant cette date.
              </p>
              <a
                href="/api/reports/pdf"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <FileDown className="w-4 h-4" /> Télécharger mes rapports en PDF
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* ── Barre actions (premium uniquement) ── */}
      {isPremium && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant={remaining > 0 ? 'secondary' : 'destructive'} className="text-xs">
              {usedThisMonth}/{MANUAL_LIMIT} rapports manuels ce mois
            </Badge>
            {remaining > 0 && (
              <span className="text-xs text-gray-500">{remaining} restant{remaining > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {reportsList.length > 0 && (
              <a href="/api/reports/pdf"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <FileDown className="w-4 h-4" />
                Télécharger PDF
              </a>
            )}
            <GenerateReportButton remaining={remaining} />
          </div>
        </div>
      )}

      {/* ── Contenu rapports ── */}
      {reportsList.length === 0 ? (
        <EmptyState icon={Brain} title="Aucun rapport AI généré"
          description={isPremium ? 'Cliquez sur « Générer un nouveau rapport » pour lancer votre première analyse.' : 'Les rapports seront générés automatiquement chaque semaine dès votre passage en Premium.'}
        />
      ) : !isPremium && !isInGracePeriod ? null : (
        <div className="space-y-6">
          <div id={`report-${latest.id}`} className="space-y-2 scroll-mt-20">
            <div className="flex items-center gap-2">
              <ReportTypeBadge type={latest.report_type} />
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(latest.generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {latestContent && (
              <div className="space-y-4">
                <Card className="p-5">
                  <div className="flex items-start gap-5">
                    <ScoreCircle score={latestContent.score_global} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-brand" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Synthèse</h3>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{latestContent.summary}</p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">Points forts</h3>
                    </div>
                    <ul className="space-y-2">
                      {latestContent.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>{s}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">Axes d&apos;amélioration</h3>
                    </div>
                    <ul className="space-y-2">
                      {latestContent.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>{w}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    Recommandations prioritaires
                  </h3>
                  <div className="space-y-3">
                    {latestContent.recommendations.map((rec, i) => (
                      <RecommendationRow key={i} rec={rec} index={i + 1} />
                    ))}
                  </div>
                </Card>

                {latestContent.competitor_analysis && (
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">Analyse concurrentielle</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{latestContent.competitor_analysis}</p>
                  </Card>
                )}
              </div>
            )}
          </div>

          {reportsList.length > 1 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide">Rapports précédents</h2>
              <ReportsOldSection
                reports={reportsList.slice(1).map(r => ({
                  ...r,
                  content: r.content as AiReportContent | null,
                }))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RecommendationRow({ rec, index }: { rec: AiRecommendation; index: number }) {
  const priorityColor = rec.priority === 'haute' ? 'bg-red-50 border-red-200' : rec.priority === 'moyenne' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
  const priorityBadge = rec.priority === 'haute' ? 'destructive' as const : rec.priority === 'moyenne' ? 'warning' as const : 'secondary' as const
  return (
    <div className={`rounded-lg border p-3.5 ${priorityColor}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-bold text-gray-400 w-4">{index}.</span>
        <Badge variant={priorityBadge} className="text-[10px] px-1.5 py-0">{rec.priority}</Badge>
        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
        <p className="text-sm font-medium text-gray-900 flex-1">{rec.action}</p>
      </div>
      {rec.impact && <p className="text-sm text-gray-600 pl-6"><span className="font-medium text-gray-700">Impact :</span> {rec.impact}</p>}
    </div>
  )
}
