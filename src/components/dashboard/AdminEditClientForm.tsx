'use client'

import { useState } from 'react'
import { Pencil, X, Check, Loader2 } from 'lucide-react'

interface Business {
  id: string
  name: string
  google_place_id: string | null
  website_url: string | null
  facebook_page_id: string | null
  instagram_username: string | null
  instagram_business_id: string | null
  lat: number | null
  lng: number | null
}

interface Props {
  orgId: string
  orgPlan: string | null
  orgApiKeyClaude: string | null
  orgMetaToken: string | null
  business: Business
}

export default function AdminEditClientForm({ orgId, orgPlan, orgApiKeyClaude, orgMetaToken, business }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    plan: (orgPlan === 'premium' ? 'premium' : 'standard') as 'standard' | 'premium',
    googlePlaceId: business.google_place_id ?? '',
    websiteUrl: business.website_url ?? '',
    facebookPageId: business.facebook_page_id ?? '',
    instagramUsername: business.instagram_username ?? '',
    instagramBusinessId: business.instagram_business_id ?? '',
    metaAccessToken: orgMetaToken ?? '',
    apiKeyClaude: orgApiKeyClaude ?? '',
    lat: business.lat?.toString() ?? '',
    lng: business.lng?.toString() ?? '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const res = await fetch('/api/admin/client', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: business.id,
        orgId,
        ...form,
      }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur inconnue')
    } else {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false) }, 1200)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-blue-500/10"
      >
        <Pencil className="w-3 h-3" /> Modifier
      </button>
    )
  }

  return (
    <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{business.name}</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Plan */}
        <div className="space-y-1 pb-2 border-b border-gray-200 dark:border-slate-700">
          <label className="block text-xs font-medium text-gray-600 dark:text-slate-400">Plan</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, plan: 'standard' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                form.plan === 'standard'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, plan: 'premium' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                form.plan === 'premium'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-500'
              }`}
            >
              ✦ Premium
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditField label="Google Place ID" value={form.googlePlaceId} onChange={set('googlePlaceId')} placeholder="ChIJxxx..." />
          <EditField label="URL Site web" value={form.websiteUrl} onChange={set('websiteUrl')} placeholder="https://..." />
          <EditField label="Facebook Page ID" value={form.facebookPageId} onChange={set('facebookPageId')} placeholder="123456789" />
          <EditField label="Instagram @username" value={form.instagramUsername} onChange={set('instagramUsername')} placeholder="monbusiness" />
          <div className="space-y-1 sm:col-span-2">
            <EditField label="Instagram Business ID" value={form.instagramBusinessId} onChange={set('instagramBusinessId')} placeholder="ID numérique" />
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Dans Meta Graph API Explorer, appelez{' '}
              <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded text-gray-600 dark:text-slate-300">GET /&#123;page-id&#125;?fields=instagram_business_account</code>{' '}
              avec un token valide.{' '}
              <a
                href="https://developers.facebook.com/tools/explorer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Ouvrir Graph API Explorer →
              </a>
            </p>
          </div>
          <EditField label="Meta Access Token" value={form.metaAccessToken} onChange={set('metaAccessToken')} placeholder="EAAxxxxxxx" />
          <EditField label="Latitude" value={form.lat} onChange={set('lat')} placeholder="-21.115" />
          <EditField label="Longitude" value={form.lng} onChange={set('lng')} placeholder="55.536" />
          <EditField label="Clé API Claude (optionnel)" value={form.apiKeyClaude} onChange={set('apiKeyClaude')} placeholder="sk-ant-..." />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#6C5CE7] hover:bg-[#9B8FF2] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <Check className="w-3.5 h-3.5" /> : null}
          {success ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  )
}

function EditField({ label, value, onChange, placeholder }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600 dark:text-slate-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7]"
      />
    </div>
  )
}
