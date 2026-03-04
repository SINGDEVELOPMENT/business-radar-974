import Header from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Brain, Calendar, CheckCircle2, XCircle, ArrowRight, Users,
  TrendingUp, TrendingDown, Minus, FileDown, Sparkles,
} from 'lucide-react'
import { DEMO_REPORT, DEMO_REPORTS_USED, DEMO_REPORTS_LIMIT } from '@/lib/demo-data'

export default function DemoPremiumReportsPage() {
  const { score_global, summary, strengths, weaknesses, recommendations, competitor_analysis, generated_at, previous_score } = DEMO_REPORT
  const remaining = DEMO_REPORTS_LIMIT - DEMO_REPORTS_USED

  return (
    <div className="space-y-6">
      <Header title="Rapports AI" subtitle="Analyses et recommandations générées par Claude" />

      {/* Barre actions premium */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {DEMO_REPORTS_USED}/{DEMO_REPORTS_LIMIT} rapports manuels ce mois
          </Badge>
          <span className="text-xs text-gray-500">{remaining} restant{remaining > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileDown className="w-4 h-4" />Télécharger PDF
          </a>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            <Brain className="w-4 h-4" />
            Générer un rapport
          </button>
        </div>
      </div>

      {/* Rapport */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge>Hebdomadaire</Badge>
          <Badge variant="secondary" className="gap-1"><Sparkles className="w-3 h-3" />Auto</Badge>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-5">
              <ScoreCircle score={score_global} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Synthèse</h3>
                  {previous_score && (
                    <span className="ml-auto text-xs font-semibold text-emerald-600">
                      ▲ +{score_global - previous_score} pts vs rapport précédent
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h3 className="font-semibold text-gray-900 text-sm">Points forts</h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-400" />
                <h3 className="font-semibold text-gray-900 text-sm">Axes d&apos;amélioration</h3>
              </div>
              <ul className="space-y-2">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>{w}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />Recommandations prioritaires
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => {
                const priorityColor = rec.priority === 'haute' ? 'bg-red-50 border-red-200' : rec.priority === 'moyenne' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
                const priorityBadge = rec.priority === 'haute' ? 'destructive' as const : rec.priority === 'moyenne' ? 'warning' as const : 'secondary' as const
                return (
                  <div key={i} className={`rounded-lg border p-3.5 ${priorityColor}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                      <Badge variant={priorityBadge} className="text-[10px] px-1.5 py-0">{rec.priority}</Badge>
                      <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                      <p className="text-sm font-medium text-gray-900 flex-1">{rec.action}</p>
                    </div>
                    <p className="text-xs text-gray-500 pl-6"><span className="font-medium text-gray-600">Impact :</span> {rec.impact}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Analyse concurrentielle</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{competitor_analysis}</p>
          </Card>
        </div>
      </div>

      {/* Historique */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Rapports précédents</h2>
        {[
          { label: 'Hebdomadaire', date: '24 févr. 2026', score: 69, type: 'weekly' },
          { label: 'Hebdomadaire', date: '17 févr. 2026', score: 66, type: 'weekly' },
          { label: 'Hebdomadaire', date: '10 févr. 2026', score: 64, type: 'weekly' },
        ].map((r, i) => (
          <Card key={i} className="p-4 mb-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{r.label}</Badge>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{r.date}
                </span>
              </div>
              <span className="text-sm font-bold text-blue-600">{r.score}/100</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  const TrendIcon = score >= 60 ? TrendingUp : score >= 40 ? Minus : TrendingDown
  return (
    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 shrink-0" style={{ borderColor: color }}>
      <span className="text-xl font-bold" style={{ color }}>{score}</span>
      <TrendIcon className="w-4 h-4" style={{ color }} />
    </div>
  )
}
