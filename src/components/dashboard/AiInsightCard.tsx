import { AiRecommendation } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Lightbulb, ArrowRight } from 'lucide-react'

interface AiInsightCardProps {
  summary?: string
  recommendations?: AiRecommendation[]
  scoreGlobal?: number
  generatedAt?: string
}

export default function AiInsightCard({
  summary,
  recommendations,
  scoreGlobal,
  generatedAt,
}: AiInsightCardProps) {
  if (!summary) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-gray-100 mb-3">
            <Brain className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Aucun rapport AI disponible</p>
          <p className="text-xs text-gray-400 mt-1">Le premier rapport sera généré automatiquement</p>
        </div>
      </Card>
    )
  }

  const priorityVariant = (p: string) =>
    p === 'haute' ? 'destructive' as const :
    p === 'moyenne' ? 'warning' as const :
    'secondary' as const

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Analyse AI</h3>
        </div>
        <div className="flex items-center gap-2">
          {scoreGlobal !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-blue-600">{scoreGlobal}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          )}
          {generatedAt && (
            <span className="text-xs text-gray-400">
              {new Date(generatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{summary}</p>

      {recommendations && recommendations.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Recommandations
            </p>
          </div>
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 pl-1">
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant={priorityVariant(rec.priority)} className="text-[10px] px-1.5 py-0">
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700">{rec.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
