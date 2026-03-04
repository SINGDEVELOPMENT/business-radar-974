import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import AiInsightCard from '@/components/dashboard/AiInsightCard'
import { Star, MessageSquare, TrendingUp, Activity } from 'lucide-react'
import { DEMO_BUSINESS, DEMO_REVIEWS, DEMO_SOCIAL_POSTS, DEMO_SEO_LATEST, DEMO_REPORT } from '@/lib/demo-data'
import type { AiRecommendation } from '@/types'

export default function DemoPremiumPage() {
  const avgRating = DEMO_BUSINESS.googleRating
  const reviewsThisMonth = DEMO_REVIEWS.filter(r => r.published_at >= '2026-02-01').length
  const totalEngagement = DEMO_SOCIAL_POSTS.reduce((s, p) => s + p.likes + p.comments + p.shares, 0)

  return (
    <div className="space-y-6">
      <Header title="Vue d'ensemble" subtitle={`Tableau de bord — ${DEMO_BUSINESS.name}`} />

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

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Dernière analyse AI
        </h2>
        <AiInsightCard
          summary={DEMO_REPORT.summary}
          recommendations={DEMO_REPORT.recommendations as AiRecommendation[]}
          scoreGlobal={DEMO_REPORT.score_global}
          generatedAt={DEMO_REPORT.generated_at}
        />
      </div>
    </div>
  )
}
