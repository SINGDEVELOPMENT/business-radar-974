import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import { Card } from '@/components/ui/card'
import { Star, MessageSquare, TrendingUp, Activity, Lock, Brain } from 'lucide-react'
import Link from 'next/link'
import { DEMO_BUSINESS, DEMO_REVIEWS, DEMO_SOCIAL_POSTS, DEMO_SEO_LATEST } from '@/lib/demo-data'

export default function DemoPage() {
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
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-xl">
            <Lock className="w-7 h-7 text-blue-400" />
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Disponible en Premium</p>
            <Link href="/demo-premium" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors">
              <Brain className="w-3.5 h-3.5" />Voir la démo Premium
            </Link>
          </div>
          <div className="pointer-events-none select-none opacity-25">
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-emerald-600">74</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                    {[1,2].map(j => <div key={j} className="h-2 bg-gray-100 rounded w-full" />)}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
