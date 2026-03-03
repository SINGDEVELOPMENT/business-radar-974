import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import AiInsightCard from '@/components/dashboard/AiInsightCard'
import { Star, MessageSquare, TrendingUp, Activity } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  // Données en parallèle
  const [reviewsRes, postsRes, seoRes, reportRes] = await Promise.all([
    orgId
      ? supabase
          .from('reviews')
          .select('rating, business_id, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
      : Promise.resolve({ data: [] }),
    orgId
      ? supabase
          .from('social_posts')
          .select('likes, comments, shares, business_id, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
      : Promise.resolve({ data: [] }),
    orgId
      ? supabase
          .from('seo_snapshots')
          .select('lighthouse_score, business_id, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
          .order('collected_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),
    orgId
      ? supabase
          .from('ai_reports')
          .select('summary, recommendations, content, generated_at')
          .eq('organization_id', orgId)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const reviews = reviewsRes.data ?? []
  const posts = postsRes.data ?? []
  const latestSeo = seoRes.data?.[0] ?? null
  const latestReport = reportRes.data ?? null

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : '--'

  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    0
  )

  const reportContent = latestReport?.content as {
    score_global?: number
    recommendations?: Array<{ priority: string; action: string; impact: string }>
  } | null

  return (
    <div className="space-y-6">
      <Header title="Vue d'ensemble" subtitle="Tableau de bord de votre activité" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Note Google"
          value={`${avgRating}/5`}
          subtitle={reviews.length > 0 ? `sur ${reviews.length} avis` : 'Aucun avis'}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
        <KpiCard
          title="Avis collectés"
          value={reviews.length}
          subtitle="tous les avis"
          icon={MessageSquare}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KpiCard
          title="Engagement social"
          value={totalEngagement.toLocaleString('fr-FR')}
          subtitle="likes + commentaires + partages"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="Score SEO"
          value={latestSeo?.lighthouse_score ? `${latestSeo.lighthouse_score}/100` : '--'}
          subtitle="dernière analyse"
          icon={Activity}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Rapport AI */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Dernière analyse AI
        </h2>
        <AiInsightCard
          summary={latestReport?.summary ?? undefined}
          recommendations={
            reportContent?.recommendations as
              | Array<{ priority: 'haute' | 'moyenne' | 'basse'; action: string; impact: string }>
              | undefined
          }
          scoreGlobal={reportContent?.score_global}
          generatedAt={latestReport?.generated_at ?? undefined}
        />
      </div>
    </div>
  )
}
