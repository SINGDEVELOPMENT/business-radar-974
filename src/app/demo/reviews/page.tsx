import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import ReviewsChart from '@/components/dashboard/ReviewsChart'
import ReviewsFilterList from '@/components/dashboard/ReviewsFilterList'
import { Star, MessageSquareText, ThumbsUp, ThumbsDown, Activity } from 'lucide-react'
import { DEMO_REVIEWS, DEMO_REVIEWS_CHART } from '@/lib/demo-data'

export default function DemoReviewsPage() {
  const totalReviews = DEMO_REVIEWS.length
  const avgRating = DEMO_REVIEWS.reduce((s, r) => s + r.rating, 0) / totalReviews
  const positiveCount = DEMO_REVIEWS.filter(r => r.rating >= 4).length
  const negativeCount = DEMO_REVIEWS.filter(r => r.rating <= 2).length
  const recentCount = DEMO_REVIEWS.filter(r => r.published_at >= '2026-02-01').length

  return (
    <div className="space-y-6">
      <Header title="Avis Google" subtitle="Suivi et analyse de vos avis clients" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Note moyenne"
          value={`${avgRating.toFixed(1)} / 5`}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          trend={{ value: +0.2, label: 'vs mois préc.' }}
        />
        <KpiCard
          title="Total avis"
          value={totalReviews}
          subtitle="Toutes périodes"
          icon={MessageSquareText}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Avis positifs"
          value={positiveCount}
          subtitle={`${Math.round((positiveCount / totalReviews) * 100)} % ≥ 4★`}
          icon={ThumbsUp}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="Avis négatifs"
          value={negativeCount}
          subtitle={`${Math.round((negativeCount / totalReviews) * 100)} % ≤ 2★`}
          icon={ThumbsDown}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
      </div>

      <ReviewsChart data={DEMO_REVIEWS_CHART} />

      {recentCount > 0 && (
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{recentCount} avis</span>{' '}
            reçus ces 30 derniers jours
          </span>
        </div>
      )}

      <ReviewsFilterList reviews={DEMO_REVIEWS} />
    </div>
  )
}
