'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CompetitorFormProps {
  onAdd: (name: string, googlePlaceId: string, websiteUrl: string) => Promise<boolean>
  onCancel: () => void
}

export default function CompetitorForm({ onAdd, onCancel }: CompetitorFormProps) {
  const [name, setName] = useState('')
  const [googlePlaceId, setGooglePlaceId] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')

    const success = await onAdd(name, googlePlaceId, websiteUrl)

    setAdding(false)

    if (success) {
      toast.success('Concurrent ajouté')
    } else {
      toast.error("Erreur lors de l'ajout")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
      {error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
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
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1">
          Site web <span className="font-normal text-gray-400">(optionnel — pour le score SEO)</span>
        </label>
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
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Ajouter
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
