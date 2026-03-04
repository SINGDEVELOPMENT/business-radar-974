'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Trash2, Loader2, Star, ChevronDown, ChevronUp } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  google_place_id: string | null
  website_url: string | null
  google_rating: number | null
  google_reviews_count: number | null
}

interface Props {
  orgId: string
  competitors: Competitor[]
}

export default function AdminCompetitorsManager({ orgId, competitors: initial }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [googlePlaceId, setGooglePlaceId] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/competitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, name, googlePlaceId, websiteUrl }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Erreur inconnue')
      return
    }

    setItems((prev) => [...prev, data.competitor])
    setName('')
    setGooglePlaceId('')
    setWebsiteUrl('')
    setShowForm(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch('/api/admin/competitor', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setItems((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full text-left"
      >
        <Users className="w-3.5 h-3.5" />
        <span>{items.length} concurrent{items.length !== 1 ? 's' : ''} personnalisé{items.length !== 1 ? 's' : ''}</span>
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {items.length > 0 && (
            <div className="space-y-1.5">
              {items.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{c.name}</p>
                    {c.google_rating != null && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        {c.google_rating.toFixed(1)} ({c.google_reviews_count ?? 0})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="ml-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {deletingId === c.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 px-1">{error}</p>
          )}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter un concurrent
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du concurrent *"
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
              <input
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="Google Place ID (optionnel)"
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="Site web (optionnel)"
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
