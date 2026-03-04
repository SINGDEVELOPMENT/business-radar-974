'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquareText, ExternalLink } from 'lucide-react'

interface Review {
  id: string
  author_name: string | null
  rating: number | null
  text: string | null
  published_at: string | null
  source: string | null
}

interface Props {
  reviews: Review[]
}

const STARS = [1, 2, 3, 4, 5]

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 4
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : rating === 3
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-700 border-red-200'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${color}`}>
      <Star className="w-3 h-3 fill-current" />
      {rating}/5
    </span>
  )
}

export default function ReviewsFilterList({ reviews }: Props) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  const filtered = activeFilter === null
    ? reviews
    : reviews.filter((r) => r.rating === activeFilter)

  return (
    <div className="space-y-4">
      {/* Boutons filtre */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            activeFilter === null
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-blue-400'
          }`}
        >
          Tous ({reviews.length})
        </button>
        {STARS.map((s) => {
          const count = reviews.filter((r) => r.rating === s).length
          return (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                activeFilter === s
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-amber-400'
              }`}
            >
              {'★'.repeat(s)} ({count})
            </button>
          )
        })}
      </div>

      {/* Liste filtrée */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Aucun avis pour ce filtre.</p>
        )}
        {filtered.slice(0, 50).map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {review.author_name ?? 'Anonyme'}
                  </span>
                  {review.rating != null && <RatingBadge rating={review.rating} />}
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {review.source}
                  </Badge>
                </div>
                {review.text && (
                  <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">{review.text}</p>
                )}
                {review.published_at && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(review.published_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                {/* Bouton "Répondre sur Google" pour les avis ≤ 3 */}
                {review.rating != null && review.rating <= 3 && (
                  <a
                    href="https://business.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-500 hover:text-blue-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Répondre sur Google
                  </a>
                )}
              </div>
              <MessageSquareText className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
