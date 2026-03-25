'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Globe, MapPin, Facebook, Instagram, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Business {
  id: string
  name: string
  google_place_id?: string | null
  facebook_page_id?: string | null
  instagram_username?: string | null
  website_url?: string | null
}

interface Props {
  business: Business
  onDelete: (id: string) => void
  onUpdate: (id: string, data: Partial<Business>) => void
}

export default function BusinessSettingsCard({ business, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: business.name,
    website_url: business.website_url ?? '',
    google_place_id: business.google_place_id ?? '',
    facebook_page_id: business.facebook_page_id ?? '',
    instagram_username: business.instagram_username ?? '',
  })

  async function handleSave() {
    setError('')
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setLoading(true)

    const res = await fetch(`/api/settings/business/${business.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (!res.ok) { setError((await res.json()).error); toast.error('Erreur lors de la mise à jour'); return }

    onUpdate(business.id, form)
    setEditing(false)
    toast.success('Business mis à jour')
  }

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/settings/business/${business.id}`, { method: 'DELETE' })
    setLoading(false)
    if (!res.ok) { setError((await res.json()).error); toast.error('Erreur lors de la suppression'); return }
    toast.success('Business supprimé')
    onDelete(business.id)
  }

  const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <Card className="p-4">
      {!editing ? (
        /* Mode lecture */
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1.5">{business.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
              {business.google_place_id && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-400" /> Google Places</span>
              )}
              {business.facebook_page_id && (
                <span className="flex items-center gap-1"><Facebook className="w-3 h-3 text-blue-500" /> Facebook</span>
              )}
              {business.instagram_username && (
                <span className="flex items-center gap-1"><Instagram className="w-3 h-3 text-pink-500" /> @{business.instagram_username}</span>
              )}
              {business.website_url && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-emerald-500" />
                  {business.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Mode édition */
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Modifier le business</span>
            <button onClick={() => { setEditing(false); setError('') }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Site web</label>
              <input value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))} placeholder="https://…" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Google Place ID</label>
              <input value={form.google_place_id} onChange={e => setForm(p => ({ ...p, google_place_id: e.target.value }))} placeholder="ChIJ…" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Page Facebook ID</label>
              <input value={form.facebook_page_id} onChange={e => setForm(p => ({ ...p, facebook_page_id: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Instagram @username</label>
              <input value={form.instagram_username} onChange={e => setForm(p => ({ ...p, instagram_username: e.target.value }))} placeholder="sans le @" className={inputClass} />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-300">
              Supprimer <strong>{business.name}</strong> ? Cette action supprimera aussi tous les avis, posts et données SEO associés.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" /> {loading ? 'Suppression…' : 'Confirmer la suppression'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-500 hover:text-gray-700">Annuler</button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      )}
    </Card>
  )
}
