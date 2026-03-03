import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import ReviewsChart from '@/components/dashboard/ReviewsChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquareText, ThumbsUp, ThumbsDown, Activity } from 'lucide-react'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: reviews } = orgId
    ? await supabase
        .from('reviews')
        .select('*, businesses!inner(name, organization_id)')
        .eq('businesses.organization_id', orgId)
        .order('published_at', { ascending: false })
        .limit(200)
    : { data: [] }

  const reviewsList = reviews ?? []

  // ── Aggregate KPI stats ──────────────────────────────────────────────────
  const totalReviews = reviewsList.length

  const avgRating =
    totalReviews > 0
      ? reviewsList.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalReviews
      : 0

  // Reviews in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentReviews = reviewsList.filter(
    (r) => r.published_at && new Date(r.published_at) >= thirtyDaysAgo,
  )
  const recentCount = recentReviews.length

  // Trend: compare avg of last 30 days vs previous 30 days
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const prevPeriod = reviewsList.filter(
    (r) =>
      r.published_at &&
      new Date(r.published_at) >= sixtyDaysAgo &&
      new Date(r.published_at) < thirtyDaysAgo,
  )
  const recentAvg =
    recentCount > 0
      ? recentReviews.reduce((s, r) => s + (r.rating ?? 0), 0) / recentCount
      : null
  const prevAvg =
    prevPeriod.length > 0
      ? prevPeriod.reduce((s, r) => s + (r.rating ?? 0), 0) / prevPeriod.length
      : null
  const trend: 'up' | 'down' | 'neutral' =
    recentAvg !== null && prevAvg !== null
      ? recentAvg > prevAvg
        ? 'up'
        : recentAvg < prevAvg
          ? 'down'
          : 'neutral'
      : 'neutral'

  // Positive (≥4) vs negative (≤2)
  const positiveCount = reviewsList.filter((r) => (r.rating ?? 0) >= 4).length
  const negativeCount = reviewsList.filter((r) => (r.rating ?? 0) <= 2).length

  // ── Monthly chart data (last 12 months) ─────────────────────────────────
  const monthMap = new Map<string, { label: string; sum: number; count: number }>()
  for (const review of reviewsList) {
    if (!review.published_at || !review.rating) continue
    const date = new Date(review.published_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    const existing = monthMap.get(key)
    if (existing) {
      existing.sum += review.rating
      existing.count++
    } else {
      monthMap.set(key, { label, sum: review.rating, count: 1 })
    }
  }
  const chartData = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, v]) => ({
      month: v.label,
      avgRating: Math.round((v.sum / v.count) * 10) / 10,
      count: v.count,
    }))

  // ── Display list: first 50 ───────────────────────────────────────────────
  const displayedReviews = reviewsList.slice(0, 50)

  return (
    <div className="space-y-6">
      <Header title="Avis Google" subtitle="Suivi et analyse de vos avis clients" />

      {totalReviews === 0 ? (
        <EmptyState
          icon={Star}
          title="Aucun avis collecté"
          description="Configurez votre Google Place ID dans les paramètres pour commencer la collecte automatique des avis."
        />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Note moyenne"
              value={`${avgRating.toFixed(1)} / 5`}
              icon={Star}
              iconColor="text-amber-500"
              iconBg="bg-amber-50"
              trend={trend}
              trendLabel={
                recentAvg !== null && prevAvg !== null
                  ? `${recentAvg > prevAvg ? '+' : ''}${(recentAvg - prevAvg).toFixed(1)} vs mois préc.`
                  : undefined
              }
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

          {/* Recharts rating evolution */}
          {chartData.length > 1 && <ReviewsChart data={chartData} />}

          {/* Recent activity badge */}
          {recentCount > 0 && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{recentCount} avis</span>{' '}
                reçus ces 30 derniers jours
              </span>
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-3">
            {displayedReviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">
                        {review.author_name ?? 'Anonyme'}
                      </span>
                      <RatingBadge rating={review.rating ?? 0} />
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {review.source}
                      </Badge>
                    </div>
                    {review.text && (
                      <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
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
                  </div>
                  <MessageSquareText className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 4
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : rating === 3
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-700 border-red-200'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${color}`}
    >
      <Star className="w-3 h-3 fill-current" />
      {rating}/5
    </span>
  )
}
