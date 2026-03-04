import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import GenerateReportButton from '@/components/dashboard/GenerateReportButton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { AiReportContent, AiRecommendation } from '@/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: reports } = orgId
    ? await supabase
        .from('ai_reports')
        .select('*')
        .eq('organization_id', orgId)
        .order('generated_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const reportsList = reports ?? []
  const latest = reportsList[0] ?? null
  const latestContent = latest?.content as AiReportContent | null

  return (
    <div className="space-y-6">
      <Header title="Rapports AI" subtitle="Analyses et recommandations générées par Claude" />
      <div className="flex justify-end">
        <GenerateReportButton />
      </div>

      {reportsList.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Aucun rapport AI généré"
          description="Cliquez sur « Générer un nouveau rapport » pour lancer votre première analyse."
        />
      ) : (
        <div className="space-y-6">
          {/* Rapport le plus récent : affichage complet */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ReportTypeBadge type={latest.report_type} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(latest.generated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            {latestContent && (
              <div className="space-y-4">
                {/* Score global + résumé */}
                <Card className="p-5">
                  <div className="flex items-start gap-5">
                    <ScoreCircle score={latestContent.score_global} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Synthèse</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {latestContent.summary}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Points forts / Faiblesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <h3 className="font-semibold text-gray-900 text-sm">Points forts</h3>
                    </div>
                    <ul className="space-y-2">
                      {latestContent.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Axes d&apos;amélioration
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {latestContent.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Recommandations */}
                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    Recommandations prioritaires
                  </h3>
                  <div className="space-y-3">
                    {latestContent.recommendations.map((rec, i) => (
                      <RecommendationRow key={i} rec={rec} index={i + 1} />
                    ))}
                  </div>
                </Card>

                {/* Analyse concurrentielle */}
                {latestContent.competitor_analysis && (
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-900 text-sm">
                        Analyse concurrentielle
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {latestContent.competitor_analysis}
                    </p>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Rapports précédents : liste compacte */}
          {reportsList.length > 1 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Rapports précédents
              </h2>
              <div className="space-y-2">
                {reportsList.slice(1).map((report) => {
                  const c = report.content as AiReportContent | null
                  return (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ReportTypeBadge type={report.report_type} />
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.generated_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        {c?.score_global != null && (
                          <span className="text-sm font-bold text-blue-600 shrink-0">
                            {c.score_global}/100
                          </span>
                        )}
                      </div>
                      {report.summary && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {report.summary}
                        </p>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReportTypeBadge({ type }: { type: string }) {
  const label =
    type === 'monthly' ? 'Mensuel' : type === 'weekly' ? 'Hebdomadaire' : 'Alerte'
  const variant =
    type === 'monthly'
      ? ('default' as const)
      : type === 'weekly'
      ? ('secondary' as const)
      : ('destructive' as const)
  return <Badge variant={variant}>{label}</Badge>
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const TrendIcon = score >= 60 ? TrendingUp : score >= 40 ? Minus : TrendingDown
  return (
    <div
      className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 shrink-0"
      style={{ borderColor: color }}
    >
      <span className="text-xl font-bold" style={{ color }}>
        {score}
      </span>
      <TrendIcon className="w-4 h-4" style={{ color }} />
    </div>
  )
}

function RecommendationRow({ rec, index }: { rec: AiRecommendation; index: number }) {
  const priorityColor =
    rec.priority === 'haute'
      ? 'bg-red-50 border-red-200'
      : rec.priority === 'moyenne'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-gray-50 border-gray-200'

  const priorityBadge =
    rec.priority === 'haute'
      ? ('destructive' as const)
      : rec.priority === 'moyenne'
      ? ('warning' as const)
      : ('secondary' as const)

  return (
    <div className={`rounded-lg border p-3.5 ${priorityColor}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-bold text-gray-400 w-4">{index}.</span>
        <Badge variant={priorityBadge} className="text-[10px] px-1.5 py-0">
          {rec.priority}
        </Badge>
        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
        <p className="text-sm font-medium text-gray-900 flex-1">{rec.action}</p>
      </div>
      {rec.impact && (
        <p className="text-xs text-gray-500 pl-6">
          <span className="font-medium text-gray-600">Impact :</span> {rec.impact}
        </p>
      )}
    </div>
  )
}
