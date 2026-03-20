import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import CompetitorChart from '@/components/dashboard/CompetitorChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, Star, TrendingUp, TrendingDown, Minus,
  Globe, Clock, Gauge, ExternalLink, ImageIcon, MessageSquare,
} from 'lucide-react'
import { DEMO_COMPETITORS_PREMIUM } from '@/lib/demo-data'

export default function DemoPremiumCompetitorsPage() {
  const client = DEMO_COMPETITORS_PREMIUM.find(c => c.isClient)!
  const competitors = DEMO_COMPETITORS_PREMIUM.filter(c => !c.isClient)

  const chartData = DEMO_COMPETITORS_PREMIUM.filter(c => c.rating != null).map(c => ({
    name: c.name, rating: c.rating, reviews: c.reviews, isClient: c.isClient,
  }))

  const ratedCompetitors = competitors.filter(c => c.rating != null)
  const avgCompetitorRating = ratedCompetitors.length > 0
    ? ratedCompetitors.reduce((s, c) => s + c.rating, 0) / ratedCompetitors.length
    : 0
  const positionDelta = client.rating - avgCompetitorRating

  return (
    <div className="space-y-6">
      <Header title="Concurrents" subtitle="Comparaison avec vos concurrents locaux" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Concurrents surveillés" value={competitors.length} subtitle="5 / 5 (Premium)" icon={Users} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <KpiCard title="Votre note" value={client.rating.toFixed(1)} subtitle={`${client.reviews} avis`} icon={Star} iconColor="text-amber-500" iconBg="bg-amber-50" />
        <KpiCard title="Moy. concurrents" value={avgCompetitorRating.toFixed(1)} icon={Star} iconColor="text-gray-400" iconBg="bg-gray-100" />
        <KpiCard
          title="Votre avantage"
          value={`${positionDelta >= 0 ? '+' : ''}${positionDelta.toFixed(2)}`}
          icon={positionDelta >= 0 ? TrendingUp : TrendingDown}
          iconColor={positionDelta >= 0 ? 'text-green-500' : 'text-red-500'}
          iconBg={positionDelta >= 0 ? 'bg-green-50' : 'bg-red-50'}
        />
      </div>

      <CompetitorChart data={chartData} />

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fiche par concurrent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {competitors.map(comp => {
            const delta = comp.rating != null ? client.rating - comp.rating : null
            return (
              <Card key={comp.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{comp.name}</p>
                    {comp.opening_hours && (
                      <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        {comp.opening_hours}
                      </p>
                    )}
                    {comp.website_url && (
                      <a href={comp.website_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-0.5">
                        <Globe className="w-3 h-3" />
                        {comp.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  {delta != null && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 px-2 py-1 rounded-full ${delta > 0 ? 'bg-green-50 text-green-700' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {delta > 0 ? <TrendingDown className="w-3 h-3" /> : delta < 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {delta > 0 ? `+${delta.toFixed(2)} en votre faveur` : delta < 0 ? `${Math.abs(delta).toFixed(2)} à combler` : 'Égalité'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                    <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /><span className="text-xs font-medium text-amber-700">Note Google</span></div>
                    <p className="text-2xl font-bold text-amber-700">{comp.rating?.toFixed(1) ?? '--'}</p>
                    <p className="text-xs text-amber-600">/5</p>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <div className="flex items-center gap-1.5"><Gauge className="w-4 h-4 text-blue-500" /><span className="text-xs font-medium text-blue-700">Score SEO</span></div>
                    <p className={`text-2xl font-bold ${comp.seo_score == null ? 'text-gray-300' : comp.seo_score >= 70 ? 'text-emerald-600' : comp.seo_score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                      {comp.seo_score ?? '--'}
                    </p>
                    <p className="text-xs text-blue-600">{comp.seo_score == null ? 'En attente' : 'sur 100'}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-500" /><span className="text-xs font-medium text-purple-700">Vitesse site</span></div>
                    <p className={`text-2xl font-bold ${comp.load_time_ms == null ? 'text-gray-300' : comp.load_time_ms < 2000 ? 'text-emerald-600' : comp.load_time_ms < 5000 ? 'text-orange-500' : 'text-red-500'}`}>
                      {comp.load_time_ms != null ? `${(comp.load_time_ms / 1000).toFixed(1)}s` : '--'}
                    </p>
                    <p className="text-xs text-purple-600">{comp.load_time_ms == null ? 'En attente' : comp.load_time_ms < 2000 ? 'Rapide' : comp.load_time_ms < 5000 ? 'Moyen' : 'Lent'}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
                    <div className="flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-gray-400" /><span className="text-xs font-medium text-gray-500">Photos Google</span></div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-white">{comp.google_photos_count ?? '--'}</p>
                    <p className="text-xs text-gray-400">photos</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400">{comp.reviews != null ? `${comp.reviews} avis Google` : 'Aucun avis'}</p>

                {/* Section Analyse Premium — non-client uniquement */}
                <div className="border-t border-gray-100 dark:border-slate-700 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Analyse Premium</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* % réponses aux avis */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Réponses avis :</span>
                      {comp.review_response_rate != null ? (
                        <Badge variant="outline" className={`text-xs font-semibold border-0 ${
                          comp.review_response_rate >= 50
                            ? 'bg-emerald-50 text-emerald-700'
                            : comp.review_response_rate >= 20
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {comp.review_response_rate}%
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </div>

                    {/* Avis récents 30j */}
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">30j :</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-white">
                        {comp.recent_reviews_count != null ? `${comp.recent_reviews_count} avis` : '--'}
                      </span>
                    </div>

                    {/* Score PageSpeed concurrent */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">PageSpeed :</span>
                      {comp.competitor_seo_score != null ? (
                        <span className={`text-xs font-bold ${
                          comp.competitor_seo_score >= 70
                            ? 'text-emerald-600'
                            : comp.competitor_seo_score >= 40
                            ? 'text-orange-500'
                            : 'text-red-500'
                        }`}>
                          {comp.competitor_seo_score}/100
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">{competitors.length} / 5 concurrents (Premium)</p>
    </div>
  )
}
