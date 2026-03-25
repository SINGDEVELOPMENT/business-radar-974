import { Card } from '@/components/ui/card'
import {
  Star, TrendingUp, TrendingDown, Minus,
  Globe, Clock, Gauge, ExternalLink, Camera,
} from 'lucide-react'
import type { Competitor } from '@/components/dashboard/CompetitorsPageClient'

interface CompetitorCardProps {
  comp: Competitor
  ownRating: number | null
  isPremium: boolean
}

export default function CompetitorCard({ comp, ownRating, isPremium }: CompetitorCardProps) {
  const delta = ownRating != null && comp.google_rating != null ? ownRating - comp.google_rating : null

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{comp.name}</p>
          {comp.website_url && (
            <a href={comp.website_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline mt-0.5">
              <Globe className="w-3 h-3" />
              {comp.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
          {comp.opening_hours && (
            <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3" />
              {comp.opening_hours}
            </p>
          )}
        </div>
        {delta != null && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold shrink-0 px-2 py-1 rounded-full ${
            delta > 0 ? 'bg-green-50 text-green-700' : delta < 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
          }`}>
            {delta > 0 ? <TrendingDown className="w-3 h-3" /> : delta < 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {delta > 0 ? `+${delta.toFixed(2)} en votre faveur` : delta < 0 ? `${delta.toFixed(2)} à combler` : 'Égalité'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Note Google</span>
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {comp.google_rating != null ? comp.google_rating.toFixed(1) : '--'}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            {comp.google_reviews_count != null ? `${comp.google_reviews_count.toLocaleString('fr-FR')} avis` : 'Aucun avis'}
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Score SEO</span>
          </div>
          <p className={`text-2xl font-bold ${comp.seo_score == null ? 'text-gray-300' : comp.seo_score >= 70 ? 'text-emerald-600' : comp.seo_score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
            {comp.seo_score ?? '--'}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500">{comp.seo_score == null ? 'En attente' : 'sur 100'}</p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Vitesse site</span>
          </div>
          <p className={`text-2xl font-bold ${comp.load_time_ms == null ? 'text-gray-300' : comp.load_time_ms < 2000 ? 'text-emerald-600' : comp.load_time_ms < 5000 ? 'text-orange-500' : 'text-red-500'}`}>
            {comp.load_time_ms != null ? `${(comp.load_time_ms / 1000).toFixed(1)}s` : '--'}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-500">
            {comp.load_time_ms == null ? 'En attente' : comp.load_time_ms < 2000 ? 'Rapide' : comp.load_time_ms < 5000 ? 'Moyen' : 'Lent'}
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
          <div className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Photos Google</span>
          </div>
          <p className="text-2xl font-bold text-gray-700 dark:text-white">
            {comp.google_photos_count ?? '--'}
          </p>
          <p className="text-xs text-gray-400">
            {comp.google_reviews_count != null ? `${comp.google_reviews_count} avis` : 'Google Business'}
          </p>
        </div>
      </div>

      {isPremium && (
        <div className="border-t border-gray-100 dark:border-slate-700 pt-3 mt-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Analyse Premium</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-brand/5 dark:bg-brand/10">
              <span className="text-[10px] text-gray-500">Réponses avis</span>
              {comp.review_response_rate != null ? (
                <span className={`text-sm font-bold ${comp.review_response_rate >= 50 ? 'text-emerald-600' : comp.review_response_rate >= 20 ? 'text-orange-500' : 'text-red-500'}`}>
                  {comp.review_response_rate.toFixed(0)}%
                </span>
              ) : <span className="text-sm font-bold text-gray-300">--</span>}
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-brand/5 dark:bg-brand/10">
              <span className="text-[10px] text-gray-500">Avis 30j</span>
              {comp.recent_reviews_count != null ? (
                <span className="text-sm font-bold text-gray-700 dark:text-white">{comp.recent_reviews_count}</span>
              ) : <span className="text-sm font-bold text-gray-300">--</span>}
            </div>
            <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-brand/5 dark:bg-brand/10">
              <span className="text-[10px] text-gray-500">PageSpeed</span>
              {comp.competitor_seo_score != null ? (
                <span className={`text-sm font-bold ${comp.competitor_seo_score >= 70 ? 'text-emerald-600' : comp.competitor_seo_score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                  {comp.competitor_seo_score}
                </span>
              ) : <span className="text-sm font-bold text-gray-300">--</span>}
            </div>
          </div>
        </div>
      )}

      {!comp.google_rating && comp.seo_score == null && (
        <p className="text-xs text-gray-400 text-center">Données collectées lors du prochain cron hebdomadaire</p>
      )}
    </Card>
  )
}
