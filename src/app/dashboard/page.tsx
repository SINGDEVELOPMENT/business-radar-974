import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import AiInsightCard from '@/components/dashboard/AiInsightCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  MessageSquare,
  TrendingUp,
  Activity,
  Building2,
  Briefcase,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user!.id)
    .single()

  const isSuperAdmin = profile?.role === 'superadmin'
  const orgId = profile?.organization_id

  // ── Vue Superadmin ────────────────────────────────────────────────────────
  if (isSuperAdmin && !orgId) {
    const adminClient = createAdminClient()

    const [orgsRes, bizRes, reviewsRes] = await Promise.all([
      adminClient.from('organizations').select('id', { count: 'exact', head: true }),
      adminClient.from('businesses').select('id', { count: 'exact', head: true }).eq('is_competitor', false),
      adminClient.from('reviews').select('id', { count: 'exact', head: true }),
    ])

    const { data: recentOrgs } = await adminClient
      .from('organizations')
      .select('id, name, slug, plan, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    return (
      <div className="space-y-6">
        <Header title="Vue d'ensemble" subtitle="Tableau de bord superadmin" />

        {/* Banner superadmin */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">Mode superadmin</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Tu vois ici le résumé global de la plateforme. Les clients voient uniquement leurs propres données.
            </p>
          </div>
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0"
          >
            Gérer les clients <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Clients actifs"
            value={orgsRes.count ?? 0}
            subtitle="organisations"
            icon={Building2}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <KpiCard
            title="Business surveillés"
            value={bizRes.count ?? 0}
            subtitle="hors concurrents"
            icon={Briefcase}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <KpiCard
            title="Avis collectés"
            value={(reviewsRes.count ?? 0).toLocaleString('fr-FR')}
            subtitle="toutes organisations"
            icon={MessageSquare}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
          />
        </div>

        {/* Derniers clients */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Clients récents
            </h3>
            <Link href="/dashboard/admin" className="text-xs text-blue-600 hover:underline">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-2">
            {(recentOrgs ?? []).map((org) => (
              <div key={org.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-900">{org.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{org.plan ?? 'standard'}</Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(org.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
            {(recentOrgs ?? []).length === 0 && (
              <p className="text-sm text-gray-400">Aucun client. <Link href="/dashboard/admin" className="text-blue-600 hover:underline">Créer le premier →</Link></p>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // ── Vue Client (organisation normale) ────────────────────────────────────
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
          .select('lighthouse_score, business_id, businesses!inner(organization_id, is_competitor)')
          .eq('businesses.organization_id', orgId)
          .eq('businesses.is_competitor', false)
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
