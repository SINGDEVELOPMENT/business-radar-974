import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import CompetitorChart, {
  type CompetitorPoint,
} from '@/components/dashboard/CompetitorChart'
import CompetitorsManager from '@/components/dashboard/CompetitorsManager'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Clock,
  Gauge,
  ExternalLink,
} from 'lucide-react'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  // Nos établissements (non-concurrents)
  const { data: ownBusinesses } = orgId
    ? await supabase
        .from('businesses')
        .select('id, name')
        .eq('organization_id', orgId)
        .eq('is_competitor', false)
    : { data: [] }

  const ownIds = (ownBusinesses ?? []).map((b) => b.id)

  // Note moyenne client calculée depuis les avis
  const { data: ownReviews } = ownIds.length > 0
    ? await supabase
        .from('reviews')
        .select('rating')
        .in('business_id', ownIds)
    : { data: [] }

  const ownReviewList = ownReviews ?? []
  const clientRating =
    ownReviewList.length > 0
      ? ownReviewList.reduce((s, r) => s + (r.rating ?? 0), 0) / ownReviewList.length
      : null

  // Concurrents custom
  const { data: competitors, count: competitorCount } = orgId
    ? await supabase
        .from('businesses')
        .select('id, name, google_rating, google_reviews_count, category, website_url, google_place_id', { count: 'exact' })
        .eq('organization_id', orgId)
        .eq('is_competitor', true)
        .eq('custom_competitor', true)
        .order('google_rating', { ascending: false, nullsFirst: false })
    : { data: [], count: 0 }

  const competitorList = competitors ?? []

  // Derniers scores SEO + vitesse pour chaque concurrent avec un site
  const competitorIds = competitorList.map((c) => c.id)
  const seoMap: Record<string, { score: number | null; loadTime: number | null }> = {}

  if (competitorIds.length > 0) {
    const { data: snapshots } = await supabase
      .from('seo_snapshots')
      .select('business_id, lighthouse_score, load_time_ms, collected_at')
      .in('business_id', competitorIds)
      .order('collected_at', { ascending: false })

    for (const snap of snapshots ?? []) {
      if (snap.business_id && !(snap.business_id in seoMap)) {
        seoMap[snap.business_id] = {
          score: snap.lighthouse_score ?? null,
          loadTime: snap.load_time_ms ?? null,
        }
      }
    }
  }

  // Enrichir avec SEO
  const enrichedCompetitors = competitorList.map((c) => ({
    id: c.id,
    name: c.name,
    google_place_id: c.google_place_id ?? null,
    google_rating: c.google_rating ?? null,
    google_reviews_count: c.google_reviews_count ?? null,
    category: c.category ?? null,
    website_url: c.website_url ?? null,
    seo_score: seoMap[c.id]?.score ?? null,
    load_time_ms: seoMap[c.id]?.loadTime ?? null,
  }))

  // ── KPI ────────────────────────────────────────────────────────────────
  const ratingsWithValue = enrichedCompetitors.filter((c) => c.google_rating != null)
  const avgCompetitorRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((s, c) => s + (c.google_rating ?? 0), 0) / ratingsWithValue.length
      : null

  let positionDelta: number | null = null
  if (clientRating != null && avgCompetitorRating != null) {
    positionDelta = clientRating - avgCompetitorRating
  }

  // ── Graphique ──────────────────────────────────────────────────────────
  const clientName = (ownBusinesses ?? []).map((b) => b.name)[0] ?? 'Mon établissement'
  const chartData: CompetitorPoint[] = []
  if (clientRating != null) {
    chartData.push({
      name: clientName,
      rating: Math.round(clientRating * 10) / 10,
      reviews: ownReviewList.length,
      isClient: true,
    })
  }
  for (const c of enrichedCompetitors) {
    if (c.google_rating == null) continue
    chartData.push({
      name: c.name,
      rating: c.google_rating,
      reviews: c.google_reviews_count ?? 0,
      isClient: false,
    })
  }

  const usedSlots = competitorCount ?? 0

  return (
    <div className="space-y-6">
      <Header
        title="Concurrents"
        subtitle="Surveillez et comparez vos concurrents"
      />

      {/* Gestion des concurrents */}
      {orgId && (
        <CompetitorsManager
          competitors={enrichedCompetitors}
          usedSlots={usedSlots}
          freeLimit={2}
        />
      )}

      {/* Stats — uniquement si des concurrents existent */}
      {enrichedCompetitors.length > 0 && (
        <>
          {/* KPI comparaison */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Concurrents surveillés"
              value={enrichedCompetitors.length}
              icon={Users}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
            />
            <KpiCard
              title="Votre note"
              value={clientRating != null ? clientRating.toFixed(1) : '--'}
              icon={Star}
              iconColor="text-amber-500"
              iconBg="bg-amber-50"
            />
            <KpiCard
              title="Moy. concurrents"
              value={avgCompetitorRating != null ? avgCompetitorRating.toFixed(1) : '--'}
              icon={Star}
              iconColor="text-gray-400"
              iconBg="bg-gray-100"
            />
            <KpiCard
              title="Votre avantage"
              value={
                positionDelta != null
                  ? `${positionDelta >= 0 ? '+' : ''}${positionDelta.toFixed(2)}`
                  : '--'
              }
              icon={
                positionDelta == null ? Minus : positionDelta >= 0 ? TrendingUp : TrendingDown
              }
              iconColor={
                positionDelta == null ? 'text-gray-400' : positionDelta >= 0 ? 'text-green-500' : 'text-red-500'
              }
              iconBg={
                positionDelta == null ? 'bg-gray-100' : positionDelta >= 0 ? 'bg-green-50' : 'bg-red-50'
              }
            />
          </div>

          {/* Cartes individuelles par concurrent */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Fiche par concurrent
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrichedCompetitors.map((comp) => {
                const delta =
                  clientRating != null && comp.google_rating != null
                    ? clientRating - comp.google_rating
                    : null

                return (
                  <Card key={comp.id} className="p-5 space-y-4">
                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{comp.name}</p>
                        {comp.website_url && (
                          <a
                            href={comp.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-0.5"
                          >
                            <Globe className="w-3 h-3" />
                            {comp.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      {delta != null && (
                        <span
                          className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 px-2 py-1 rounded-full ${
                            delta > 0
                              ? 'bg-green-50 text-green-700'
                              : delta < 0
                              ? 'bg-red-50 text-red-600'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {delta > 0 ? <TrendingDown className="w-3 h-3" /> : delta < 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {delta > 0 ? `+${delta.toFixed(2)} en votre faveur` : delta < 0 ? `${delta.toFixed(2)} à combler` : 'Égalité'}
                        </span>
                      )}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Note Google */}
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Note Google</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                          {comp.google_rating != null ? comp.google_rating.toFixed(1) : '--'}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                          {comp.google_reviews_count != null
                            ? `${comp.google_reviews_count.toLocaleString('fr-FR')} avis`
                            : 'Aucun avis'}
                        </p>
                      </div>

                      {/* Score SEO */}
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Score SEO</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          comp.seo_score == null
                            ? 'text-gray-300'
                            : comp.seo_score >= 70
                            ? 'text-emerald-600'
                            : comp.seo_score >= 40
                            ? 'text-orange-500'
                            : 'text-red-500'
                        }`}>
                          {comp.seo_score ?? '--'}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">
                          {comp.seo_score == null ? 'En attente' : 'sur 100'}
                        </p>
                      </div>

                      {/* Vitesse */}
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Vitesse site</span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          comp.load_time_ms == null
                            ? 'text-gray-300'
                            : comp.load_time_ms < 2000
                            ? 'text-emerald-600'
                            : comp.load_time_ms < 5000
                            ? 'text-orange-500'
                            : 'text-red-500'
                        }`}>
                          {comp.load_time_ms != null ? `${(comp.load_time_ms / 1000).toFixed(1)}s` : '--'}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-500">
                          {comp.load_time_ms == null
                            ? 'En attente'
                            : comp.load_time_ms < 2000
                            ? 'Rapide'
                            : comp.load_time_ms < 5000
                            ? 'Moyen'
                            : 'Lent'}
                        </p>
                      </div>

                      {/* Avis */}
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Total avis</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-700 dark:text-white">
                          {comp.google_reviews_count != null
                            ? comp.google_reviews_count.toLocaleString('fr-FR')
                            : '--'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {comp.google_place_id ? 'Google Places' : 'Non lié'}
                        </p>
                      </div>
                    </div>

                    {/* Badge statut collecte */}
                    {!comp.google_rating && !comp.seo_score && (
                      <p className="text-xs text-gray-400 text-center">
                        Données collectées lors du prochain cron hebdomadaire
                      </p>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Graphique comparatif */}
          {chartData.length > 1 && <CompetitorChart data={chartData} />}
        </>
      )}
    </div>
  )
}
