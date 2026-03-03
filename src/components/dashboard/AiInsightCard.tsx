import { AiRecommendation } from '@/types'

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
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-gray-400">Aucun rapport AI disponible. Générez votre premier rapport.</p>
      </div>
    )
  }

  const priorityColor = (p: string) =>
    p === 'haute' ? 'bg-red-100 text-red-700' :
    p === 'moyenne' ? 'bg-orange-100 text-orange-700' :
    'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Analyse AI</h3>
        <div className="flex items-center gap-2">
          {scoreGlobal !== undefined && (
            <span className="text-sm font-bold text-blue-600">{scoreGlobal}/100</span>
          )}
          {generatedAt && (
            <span className="text-xs text-gray-400">
              {new Date(generatedAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>

      {recommendations && recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Recommandations
          </p>
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityColor(rec.priority)}`}>
                {rec.priority}
              </span>
              <p className="text-sm text-gray-700">{rec.action}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
