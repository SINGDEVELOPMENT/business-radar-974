import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import DashboardReportsSection from '@/components/dashboard/DashboardReportsSection'
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
  Lock,
  Brain,
  Sparkles,
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

  // Plan du client (pour gating premium)
  const { data: orgInfo } = orgId
    ? await supabase.from('organizations').select('plan').eq('id', orgId).single()
    : { data: null }
  const isPremium = orgInfo?.plan === 'premium'

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
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#6C5CE7]/8 border border-[#6C5CE7]/20">
          <ShieldCheck className="w-5 h-5 text-[#6C5CE7] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#6C5CE7]">Mode superadmin</p>
            <p className="text-xs text-[#6C5CE7] mt-0.5">
              Tu vois ici le résumé global de la plateforme. Les clients voient uniquement leurs propres données.
            </p>
          </div>
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-1 text-xs font-medium text-[#6C5CE7] hover:text-[#9B8FF2] shrink-0"
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
            iconColor="text-[#6C5CE7]"
            iconBg="bg-[#6C5CE7]/10"
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
            <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
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
                  <span className="text-xs text-gray-500">
                    {new Date(org.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
            {(recentOrgs ?? []).length === 0 && (
              <p className="text-sm text-gray-600">Aucun client. <Link href="/dashboard/admin" className="text-blue-600 hover:underline">Créer le premier →</Link></p>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // ── Vue Client (organisation normale) ────────────────────────────────────
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()

  const [businessRes, reviewsRes, postsRes, seoRes, reportRes, reviewsPrevRes, postsPrevRes, seoOldRes, reportPrevRes] = await Promise.all([
    // Note Google globale (depuis businesses)
    orgId
      ? supabase
          .from('businesses')
          .select('google_rating, google_reviews_count')
          .eq('organization_id', orgId)
          .eq('is_competitor', false)
          .not('google_rating', 'is', null)
          .order('google_rating', { ascending: false })
          .limit(1)
          .single()
      : Promise.resolve({ data: null }),
    // Avis mois en cours (pour le compteur)
    orgId
      ? supabase
          .from('reviews')
          .select('rating, business_id, published_at, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
          .gte('published_at', startOfMonth)
      : Promise.resolve({ data: [] }),
    // Social mois en cours
    orgId
      ? supabase
          .from('social_posts')
          .select('likes, comments, shares, published_at, business_id, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
          .gte('published_at', startOfMonth)
      : Promise.resolve({ data: [] }),
    // SEO actuel
    orgId
      ? supabase
          .from('seo_snapshots')
          .select('lighthouse_score, collected_at, business_id, businesses!inner(organization_id, is_competitor)')
          .eq('businesses.organization_id', orgId)
          .eq('businesses.is_competitor', false)
          .order('collected_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),
    // Tous les rapports (pour affichage + filtre)
    orgId
      ? supabase
          .from('ai_reports')
          .select('id, summary, recommendations, content, generated_at, report_type')
          .eq('organization_id', orgId)
          .order('generated_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),
    // Avis mois précédent (pour delta)
    orgId
      ? supabase
          .from('reviews')
          .select('rating, published_at, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
          .gte('published_at', startOfPrevMonth)
          .lt('published_at', startOfMonth)
      : Promise.resolve({ data: [] }),
    // Social mois précédent
    orgId
      ? supabase
          .from('social_posts')
          .select('likes, comments, shares, published_at, businesses!inner(organization_id)')
          .eq('businesses.organization_id', orgId)
          .gte('published_at', startOfPrevMonth)
          .lt('published_at', startOfMonth)
      : Promise.resolve({ data: [] }),
    // SEO il y a ~30 jours
    orgId
      ? supabase
          .from('seo_snapshots')
          .select('lighthouse_score, collected_at, businesses!inner(organization_id, is_competitor)')
          .eq('businesses.organization_id', orgId)
          .eq('businesses.is_competitor', false)
          .gte('collected_at', sixtyDaysAgo)
          .lte('collected_at', thirtyDaysAgo)
          .order('collected_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),
    // (placeholder — delta calculé depuis allReports)
    Promise.resolve({ data: [] }),
  ])

  const googleRating = businessRes.data?.google_rating ?? null
  const googleReviewsCount = businessRes.data?.google_reviews_count ?? null
  const reviews = reviewsRes.data ?? []
  const posts = postsRes.data ?? []
  const latestSeo = seoRes.data?.[0] ?? null
  const allReports = (reportRes.data ?? []) as Array<{ id: string; summary?: string | null; content?: { score_global?: number; recommendations?: Array<{ priority: 'haute' | 'moyenne' | 'basse'; action: string; impact: string }> } | null; generated_at: string; report_type: string }>
  const latestReport = allReports[0] ?? null
  const reviewsPrev = reviewsPrevRes.data ?? []
  const postsPrev = postsPrevRes.data ?? []
  const seoOld = seoOldRes.data?.[0] ?? null
  const reportPrev = allReports[1] ?? null

  const avgRatingPrev = reviewsPrev.length
    ? reviewsPrev.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewsPrev.length
    : null

  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    0
  )
  const totalEngagementPrev = postsPrev.reduce(
    (sum, p) => sum + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    0
  )

  const reportContent = latestReport?.content as {
    score_global?: number
    recommendations?: Array<{ priority: string; action: string; impact: string }>
  } | null
  const reportPrevContent = reportPrev?.content as { score_global?: number } | null

  // Calcul des deltas
  const engagementDelta = postsPrev.length > 0 || posts.length > 0
    ? totalEngagement - totalEngagementPrev
    : null
  const seoDelta = latestSeo?.lighthouse_score != null && seoOld?.lighthouse_score != null
    ? latestSeo.lighthouse_score - seoOld.lighthouse_score
    : null
  const reportDelta = reportContent?.score_global != null && reportPrevContent?.score_global != null
    ? reportContent.score_global - reportPrevContent.score_global
    : null

  return (
    <div className="space-y-6">
      <Header title="Vue d'ensemble" subtitle="Tableau de bord de votre activité" />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Note Google"
          value={googleRating !== null ? `${Number(googleRating).toFixed(1)}/5` : '--'}
          subtitle={googleReviewsCount !== null ? `sur ${googleReviewsCount.toLocaleString('fr-FR')} avis` : 'Aucune donnée'}
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
        <KpiCard
          title="Avis collectés"
          value={reviews.length}
          subtitle="ce mois"
          icon={MessageSquare}
          iconColor="text-[#6C5CE7]"
          iconBg="bg-[#6C5CE7]/10"
        />
        <KpiCard
          title="Engagement social"
          value={totalEngagement.toLocaleString('fr-FR')}
          subtitle="ce mois"
          trend={engagementDelta !== null ? { value: engagementDelta, label: 'vs mois préc.' } : undefined}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <KpiCard
          title="Score SEO"
          value={latestSeo?.lighthouse_score ? `${latestSeo.lighthouse_score}/100` : '--'}
          subtitle="dernière analyse"
          trend={seoDelta !== null ? { value: seoDelta, label: 'vs 30j' } : undefined}
          icon={Activity}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Rapports AI */}
      <div>
        <h2 className="text-base font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide mb-3">
          Analyses AI
        </h2>
        {isPremium ? (
          <DashboardReportsSection reports={allReports} />
        ) : (
          <div className="relative">
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm rounded-xl">
              <Lock className="w-7 h-7 text-[#9B8FF2]" />
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Disponible en Premium</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9B8FF2]" />
                Contactez votre administrateur pour passer en Premium.
              </p>
            </div>
            <div className="pointer-events-none select-none opacity-25">
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
