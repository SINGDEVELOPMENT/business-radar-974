'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users, Plus, Trash2, Loader2, Star, ExternalLink } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  google_place_id: string | null
  website_url: string | null
  google_rating: number | null
  google_reviews_count: number | null
}

interface Props {
  competitors: Competitor[]
  usedSlots: number
  freeLimit: number
}

export default function CustomCompetitorsCard({ competitors: initial, usedSlots, freeLimit }: Props) {
  const [competitors, setCompetitors] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [googlePlaceId, setGooglePlaceId] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const remaining = freeLimit - usedSlots

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/settings/competitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, googlePlaceId, websiteUrl }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (data.upgrade) {
        setError(`Limite de ${freeLimit} concurrents gratuits atteinte. Contactez votre administrateur pour en ajouter davantage.`)
      } else {
        setError(data.error ?? 'Erreur inconnue')
      }
      return
    }

    setCompetitors((prev) => [...prev, data.competitor])
    setName('')
    setGooglePlaceId('')
    setWebsiteUrl('')
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch('/api/settings/competitor', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setCompetitors((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Concurrents à surveiller</h3>
        </div>
        <span className="text-xs text-gray-400">
          {usedSlots}/{freeLimit} gratuits utilisés
        </span>
      </div>

      {competitors.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">
          Ajoutez des concurrents précis à surveiller. Leurs avis Google et notes seront collectés automatiquement.
        </p>
      ) : (
        <div className="space-y-2 mb-4">
          {competitors.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {c.google_rating && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {c.google_rating.toFixed(1)} ({c.google_reviews_count ?? 0} avis)
                    </span>
                  )}
                  {c.website_url && (
                    <a
                      href={c.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Site
                    </a>
                  )}
                  {!c.google_rating && !c.website_url && (
                    <span className="text-xs text-gray-400">Collecte en attente…</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="ml-3 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {deletingId === c.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 rounded-lg mb-3">
          {error}
        </p>
      )}

      {remaining > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un concurrent ({remaining} emplacement{remaining > 1 ? 's' : ''} gratuit{remaining > 1 ? 's' : ''})
        </button>
      )}

      {remaining === 0 && competitors.length === 0 && (
        <p className="text-xs text-gray-400">
          Limite atteinte. Contactez votre administrateur pour débloquer des emplacements supplémentaires.
        </p>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-3 mt-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Nom du concurrent *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Restaurant Le Lagon"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
              Google Place ID <span className="font-normal text-gray-400">(recommandé — pour collecter les avis)</span>
            </label>
            <input
              type="text"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              placeholder="ChIJxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Trouvez-le sur maps.google.com → clic droit sur l'établissement → copier les coordonnées, puis cherchez le Place ID sur developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">Site web <span className="font-normal text-gray-400">(optionnel)</span></label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://concurrent.re"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}
