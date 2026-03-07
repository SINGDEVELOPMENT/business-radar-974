'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CompetitorChart, { type CompetitorPoint } from '@/components/dashboard/CompetitorChart'
import KpiCard from '@/components/dashboard/KpiCard'
import {
  Users, Star, TrendingUp, TrendingDown, Minus,
  Globe, Clock, Gauge, ExternalLink, Plus, Trash2, Loader2,
} from 'lucide-react'

// ── Skeleton components (mirrors loading.tsx) ──────────────────────────────

function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}

function SkeletonCompetitorRow() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800 animate-pulse">
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3.5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-3">
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 ml-3 shrink-0" />
    </div>
  )
}

function SkeletonCompetitorCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-44 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-6 w-28 bg-gray-100 dark:bg-gray-800 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          'bg-amber-50 dark:bg-amber-500/10',
          'bg-blue-50 dark:bg-blue-500/10',
          'bg-purple-50 dark:bg-purple-500/10',
          'bg-gray-50 dark:bg-slate-800',
        ].map((cls, i) => (
          <div key={i} className={`flex flex-col gap-1 p-3 rounded-xl ${cls}`}>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CompetitorsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-1">
        <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-60 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="space-y-2 mb-4">
          <SkeletonCompetitorRow />
          <SkeletonCompetitorRow />
        </div>
        <div className="h-4 w-52 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="animate-pulse h-3.5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCompetitorCard />
          <SkeletonCompetitorCard />
        </div>
      </div>
    </div>
  )
}

interface Competitor {
  id: string
  name: string
  google_place_id: string | null
  google_rating: number | null
  google_reviews_count: number | null
  website_url: string | null
  seo_score: number | null
  load_time_ms: number | null
}

interface ApiData {
  competitors: Competitor[]
  ownRating: number | null
  ownReviewCount: number
  clientName: string
  freeLimit: number
}

export default function CompetitorsPageClient() {
  const [data, setData] = useState<ApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Formulaire ajout
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [googlePlaceId, setGooglePlaceId] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/competitors', { cache: 'no-store' })
      const json = await res.json()
      if (res.ok) {
        setData(json)
      } else {
        setFetchError(`Erreur ${res.status}: ${json.error ?? 'inconnue'}`)
        console.error('[CompetitorsPageClient] API error:', json)
      }
    } catch (err) {
      setFetchError('Erreur réseau')
      console.error('[CompetitorsPageClient] Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setAddError('')

    const res = await fetch('/api/settings/competitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, googlePlaceId, websiteUrl }),
    })

    const json = await res.json()
    setAdding(false)

    if (!res.ok) {
      setAddError(json.upgrade
        ? `Limite de ${data?.freeLimit ?? 2} concurrents gratuits atteinte. Contactez votre administrateur.`
        : (json.error ?? 'Erreur inconnue'))
      return
    }

    setName('')
    setGooglePlaceId('')
    setWebsiteUrl('')
    setShowForm(false)
    await fetchData()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch('/api/settings/competitor', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null)
    await fetchData()
  }

  if (loading) {
    return <CompetitorsSkeleton />
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Concurrents</h1>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Erreur de chargement</p>
          <p className="text-xs text-red-500 mt-1">{fetchError}</p>
        </div>
      </div>
    )
  }

  const competitors = data?.competitors ?? []
  const ownRating = data?.ownRating ?? null
  const ownReviewCount = data?.ownReviewCount ?? 0
  const clientName = data?.clientName ?? 'Mon établissement'
  const freeLimit = data?.freeLimit ?? 2
  const usedSlots = competitors.length
  const remaining = freeLimit - usedSlots

  const ratingsWithValue = competitors.filter((c) => c.google_rating != null)
  const avgCompetitorRating = ratingsWithValue.length > 0
    ? ratingsWithValue.reduce((s, c) => s + (c.google_rating ?? 0), 0) / ratingsWithValue.length
    : null

  const positionDelta = ownRating != null && avgCompetitorRating != null
    ? ownRating - avgCompetitorRating
    : null

  const chartData: CompetitorPoint[] = []
  if (ownRating != null) {
    chartData.push({ name: clientName, rating: Math.round(ownRating * 10) / 10, reviews: ownReviewCount, isClient: true })
  }
  for (const c of competitors) {
    if (c.google_rating == null) continue
    chartData.push({ name: c.name, rating: c.google_rating, reviews: c.google_reviews_count ?? 0, isClient: false })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Concurrents</h1>
        <p className="text-sm text-gray-500 mt-0.5">Surveillez et comparez vos concurrents</p>
      </div>

      {/* ── Gestion des concurrents ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Concurrents surveillés</h3>
          </div>
          <span className="text-xs text-gray-400">{usedSlots}/{freeLimit} utilisés</span>
        </div>

        {competitors.length === 0 ? (
          <p className="text-sm text-gray-400 mb-4">
            Ajoutez des concurrents à surveiller. Leurs avis Google et scores SEO seront collectés automatiquement.
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {competitors.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-0.5">
                    {c.google_rating != null && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {c.google_rating.toFixed(1)} ({c.google_reviews_count ?? 0} avis)
                      </span>
                    )}
                    {c.seo_score != null && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Gauge className="w-3 h-3 text-blue-500" />
                        SEO {c.seo_score}
                      </span>
                    )}
                    {c.website_url && (
                      <a href={c.website_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                        <Globe className="w-3 h-3" />Site
                      </a>
                    )}
                    {!c.google_rating && c.seo_score == null && !c.website_url && (
                      <span className="text-xs text-gray-400">Collecte en attente…</span>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                  className="ml-3 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
                  {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {addError && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 rounded-lg mb-3">
            {addError}
          </p>
        )}

        {remaining > 0 && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter un concurrent ({remaining} emplacement{remaining > 1 ? 's' : ''} disponible{remaining > 1 ? 's' : ''})
          </button>
        )}

        {remaining === 0 && !showForm && (
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {freeLimit >= 5
              ? `Limite de ${freeLimit} concurrents (plan Premium) atteinte.`
              : `Limite de ${freeLimit} concurrents (plan Standard) atteinte. Contactez votre administrateur pour passer en Premium et surveiller jusqu'à 5 concurrents.`}
          </p>
        )}

        {showForm && (
          <form onSubmit={handleAdd} className="space-y-3 mt-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Nom du concurrent *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Restaurant Le Lagon"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                Google Place ID <span className="font-normal text-gray-400">(recommandé — pour collecter les avis)</span>
              </label>
              <input type="text" value={googlePlaceId} onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="ChIJxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
                Site web <span className="font-normal text-gray-400">(optionnel — pour le score SEO)</span>
              </label>
              <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://concurrent.re"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={adding}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Ajouter
              </button>
              <button type="button" onClick={() => { setShowForm(false); setAddError('') }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors">
                Annuler
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* ── Stats (seulement si concurrents) ── */}
      {competitors.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Concurrents surveillés" value={competitors.length} icon={Users} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
            <KpiCard title="Votre note" value={ownRating != null ? ownRating.toFixed(1) : '--'} icon={Star} iconColor="text-amber-500" iconBg="bg-amber-50" />
            <KpiCard title="Moy. concurrents" value={avgCompetitorRating != null ? avgCompetitorRating.toFixed(1) : '--'} icon={Star} iconColor="text-gray-400" iconBg="bg-gray-100" />
            <KpiCard
              title="Votre avantage"
              value={positionDelta != null ? `${positionDelta >= 0 ? '+' : ''}${positionDelta.toFixed(2)}` : '--'}
              icon={positionDelta == null ? Minus : positionDelta >= 0 ? TrendingUp : TrendingDown}
              iconColor={positionDelta == null ? 'text-gray-400' : positionDelta >= 0 ? 'text-green-500' : 'text-red-500'}
              iconBg={positionDelta == null ? 'bg-gray-100' : positionDelta >= 0 ? 'bg-green-50' : 'bg-red-50'}
            />
          </div>

          {chartData.length > 1 && <CompetitorChart data={chartData} />}

          {/* Cartes détaillées par concurrent */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Fiche par concurrent</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {competitors.map((comp) => {
                const delta = ownRating != null && comp.google_rating != null ? ownRating - comp.google_rating : null
                return (
                  <Card key={comp.id} className="p-5 space-y-4">
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
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">Total avis</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-700 dark:text-white">
                          {comp.google_reviews_count != null ? comp.google_reviews_count.toLocaleString('fr-FR') : '--'}
                        </p>
                        <p className="text-xs text-gray-400">{comp.google_place_id ? 'Google Places' : 'Non lié'}</p>
                      </div>
                    </div>

                    {!comp.google_rating && comp.seo_score == null && (
                      <p className="text-xs text-gray-400 text-center">Données collectées lors du prochain cron hebdomadaire</p>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

        </>
      )}
    </div>
  )
}
