import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import AiInsightCard from '@/components/dashboard/AiInsightCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Récupère le profil + org
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
    : 'N/A'

  const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0)

  const reportContent = latestReport?.content as {
    score_global?: number
    recommendations?: Array<{ priority: string; action: string; impact: string }>
  } | null

  return (
    <div className="space-y-6">
      <Header title="Vue d'ensemble" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Note Google"
          value={avgRating}
          subtitle={`sur ${reviews.length} avis`}
          icon="★"
        />
        <KpiCard
          title="Avis collectés"
          value={reviews.length}
          icon="💬"
        />
        <KpiCard
          title="Engagement social"
          value={totalEngagement}
          subtitle="likes + commentaires + partages"
          icon="◈"
        />
        <KpiCard
          title="Score SEO"
          value={latestSeo?.lighthouse_score ? `${latestSeo.lighthouse_score}/100` : 'N/A'}
          icon="◇"
        />
      </div>

      {/* Rapport AI */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Dernière analyse AI
        </h2>
        <AiInsightCard
          summary={latestReport?.summary ?? undefined}
          recommendations={reportContent?.recommendations as Array<{ priority: 'haute' | 'moyenne' | 'basse'; action: string; impact: string }> | undefined}
          scoreGlobal={reportContent?.score_global}
          generatedAt={latestReport?.generated_at ?? undefined}
        />
      </div>
    </div>
  )
}
