import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import CompetitorChart, {
  type CompetitorPoint,
} from '@/components/dashboard/CompetitorChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  MapPin,
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

  // Concurrents
  const { data: competitors } = orgId
    ? await supabase
        .from('businesses')
        .select('id, name, google_rating, google_reviews_count, category, website_url')
        .eq('organization_id', orgId)
        .eq('is_competitor', true)
        .order('google_rating', { ascending: false })
    : { data: [] }

  const competitorList = competitors ?? []

  // ── KPI ────────────────────────────────────────────────────────────────
  const ratingsWithValue = competitorList.filter((c) => c.google_rating != null)
  const bestCompetitor = ratingsWithValue[0] ?? null
  const avgCompetitorRating =
    ratingsWithValue.length > 0
      ? ratingsWithValue.reduce((s, c) => s + (c.google_rating ?? 0), 0) /
        ratingsWithValue.length
      : null

  // Avantage client vs moyenne concurrents
  let positionDelta: number | null = null
  if (clientRating != null && avgCompetitorRating != null) {
    positionDelta = clientRating - avgCompetitorRating
  }

  // ── Données graphique ──────────────────────────────────────────────────
  const clientName =
    (ownBusinesses ?? []).map((b) => b.name)[0] ?? 'Mon établissement'

  const chartData: CompetitorPoint[] = []

  if (clientRating != null) {
    chartData.push({
      name: clientName,
      rating: Math.round(clientRating * 10) / 10,
      reviews: ownReviewList.length,
      isClient: true,
    })
  }

  for (const c of competitorList) {
    if (c.google_rating == null) continue
    chartData.push({
      name: c.name,
      rating: c.google_rating,
      reviews: c.google_reviews_count ?? 0,
      isClient: false,
    })
  }

  return (
    <div className="space-y-6">
      <Header
        title="Concurrents"
        subtitle="Surveillance et comparaison avec vos concurrents locaux"
      />

      {competitorList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun concurrent détecté"
          description="La surveillance des concurrents locaux sera disponible prochainement. La collecte est effectuée automatiquement chaque semaine."
        />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Concurrents détectés"
              value={competitorList.length}
              icon={Users}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
            />
            <KpiCard
              title="Votre note (avis)"
              value={clientRating != null ? clientRating.toFixed(1) : '--'}
              icon={Star}
              iconColor="text-amber-500"
              iconBg="bg-amber-50"
            />
            <KpiCard
              title="Moy. concurrents"
              value={
                avgCompetitorRating != null ? avgCompetitorRating.toFixed(1) : '--'
              }
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
                positionDelta == null
                  ? Minus
                  : positionDelta >= 0
                  ? TrendingUp
                  : TrendingDown
              }
              iconColor={
                positionDelta == null
                  ? 'text-gray-400'
                  : positionDelta >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
              }
              iconBg={
                positionDelta == null
                  ? 'bg-gray-100'
                  : positionDelta >= 0
                  ? 'bg-green-50'
                  : 'bg-red-50'
              }
            />
          </div>

          {/* Graphique comparatif */}
          {chartData.length > 0 && <CompetitorChart data={chartData} />}

          {/* Meilleur concurrent */}
          {bestCompetitor && (
            <Card className="p-5 border-orange-200 bg-orange-50/30">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Leader du marché
              </h3>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{bestCompetitor.name}</p>
                  {bestCompetitor.category && (
                    <p className="text-xs text-gray-500 capitalize mt-0.5">
                      {bestCompetitor.category}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {bestCompetitor.google_rating?.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    {bestCompetitor.google_reviews_count?.toLocaleString('fr-FR') ?? '--'} avis
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Tableau comparatif */}
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">
                Tableau comparatif — {competitorList.length} concurrent
                {competitorList.length > 1 ? 's' : ''}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Établissement</th>
                    <th className="px-5 py-3 text-left font-medium">Catégorie</th>
                    <th className="px-5 py-3 text-center font-medium">Note</th>
                    <th className="px-5 py-3 text-center font-medium">Avis</th>
                    <th className="px-5 py-3 text-center font-medium">vs vous</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {competitorList.map((comp, i) => {
                    const delta =
                      clientRating != null && comp.google_rating != null
                        ? clientRating - comp.google_rating
                        : null
                    return (
                      <tr
                        key={comp.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-300 font-bold w-4">
                              {i + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{comp.name}</p>
                              {comp.website_url && (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Globe className="w-3 h-3" />
                                  {comp.website_url
                                    .replace(/https?:\/\//, '')
                                    .replace(/\/$/, '')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {comp.category ? (
                            <Badge
                              variant="secondary"
                              className="capitalize text-xs font-normal"
                            >
                              <MapPin className="w-3 h-3 mr-1" />
                              {comp.category}
                            </Badge>
                          ) : (
                            <span className="text-gray-300">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {comp.google_rating != null ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-gray-900">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              {comp.google_rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-300">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center text-gray-600">
                          {comp.google_reviews_count?.toLocaleString('fr-FR') ?? '--'}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {delta != null ? (
                            <span
                              className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                                delta > 0
                                  ? 'text-green-600'
                                  : delta < 0
                                  ? 'text-red-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              {delta > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : delta < 0 ? (
                                <TrendingDown className="w-3 h-3" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              {delta >= 0 ? '+' : ''}
                              {delta.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-300">--</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
