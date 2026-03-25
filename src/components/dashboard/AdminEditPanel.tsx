'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Settings, Users } from 'lucide-react'
import type { OrgWithData, BusinessWithMeta } from '@/types/admin'

// ─── Inline EditClientForm logic ────────────────────────────────────────────

import { Check, Loader2, Upload, ImageIcon } from 'lucide-react'
import { useRef } from 'react'

function EditField({
  label,
  value,
  onChange,
  placeholder,
}: {
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
        className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
      />
    </div>
  )
}

interface EditFormProps {
  orgId: string
  orgName: string
  orgPlan: string | null
  orgApiKeyClaude: string | null
  orgMetaToken: string | null
  orgAvatarUrl: string | null
  clientFullName: string | null
  clientUserId: string | null
  business: BusinessWithMeta
}

function InlineEditClientForm({ orgId, orgName, orgPlan, orgApiKeyClaude, orgMetaToken, orgAvatarUrl, clientFullName, clientUserId, business }: EditFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [avatarPreview, setAvatarPreview] = useState<string | null>(orgAvatarUrl)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    fullName: clientFullName ?? '',
    orgName: orgName ?? '',
    businessName: business.name ?? '',
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

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploadLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('orgId', orgId)
    const res = await fetch('/api/admin/avatar', { method: 'POST', body: fd })
    setUploadLoading(false)
    if (!res.ok) {
      const { error: err } = await res.json()
      setUploadError(err)
      setAvatarPreview(orgAvatarUrl)
    }
  }

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
      body: JSON.stringify({ businessId: business.id, orgId, clientUserId, ...form }),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur inconnue')
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Identité client */}
      <div className="pb-4 border-b border-gray-100 dark:border-slate-800 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Identité</p>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative shrink-0"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-5 h-5 text-gray-300" />
            )}
            {uploadLoading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-500">
              <Upload className="w-3 h-3" /> {avatarPreview ? 'Changer le logo' : 'Ajouter un logo'}
            </button>
            <p className="text-[10px] text-gray-400 mt-0.5">PNG · JPG · SVG — max 500 Ko</p>
            {uploadError && <p className="text-[10px] text-red-500">{uploadError}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <EditField label="Nom complet du gérant" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Marie Dupont" />
          <EditField label="Nom de l'organisation" value={form.orgName} onChange={e => setForm(p => ({ ...p, orgName: e.target.value }))} placeholder="SARL Le Lagon" />
          <div className="sm:col-span-2">
            <EditField label="Nom du business (Google / réseaux)" value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} placeholder="Restaurant Le Lagon Bleu" />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="space-y-1.5 pb-4 border-b border-gray-100 dark:border-slate-800">
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
            <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded text-gray-600 dark:text-slate-300">
              GET /&#123;page-id&#125;?fields=instagram_business_account
            </code>{' '}
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
        className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-light disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : success ? <Check className="w-3.5 h-3.5" /> : null}
        {success ? 'Sauvegardé !' : 'Sauvegarder'}
      </button>
    </form>
  )
}

// ─── Inline CompetitorsManager logic ────────────────────────────────────────

import { Plus, Trash2, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CompetitorItem {
  id: string
  name: string
  google_place_id: string | null
  website_url: string | null
  google_rating: number | null
  google_reviews_count: number | null
}

interface CompetitorsProps {
  orgId: string
  competitors: CompetitorItem[]
}

function InlineCompetitorsManager({ orgId, competitors: initial }: CompetitorsProps) {
  const router = useRouter()
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
    <div className="space-y-3">
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{c.name}</p>
                {c.google_rating != null && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    {c.google_rating.toFixed(1)} ({c.google_reviews_count ?? 0} avis)
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="ml-3 text-gray-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {deletingId === c.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-slate-500">Aucun concurrent configuré.</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un concurrent
        </button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du concurrent *"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="text"
            value={googlePlaceId}
            onChange={(e) => setGooglePlaceId(e.target.value)}
            placeholder="Google Place ID (optionnel)"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="Site web (optionnel)"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="px-3 py-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// ─── AdminEditPanel ──────────────────────────────────────────────────────────

interface PanelProps {
  org: OrgWithData
  mainBiz: BusinessWithMeta
  competitors: BusinessWithMeta[]
  onClose: () => void
}


type SubTab = 'info' | 'competitors'

export default function AdminEditPanel({ org, mainBiz, competitors, onClose }: PanelProps) {
  const [subTab, setSubTab] = useState<SubTab>('info')

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const competitorItems: CompetitorItem[] = competitors.map((c) => ({
    id: c.id,
    name: c.name,
    google_place_id: c.google_place_id,
    website_url: c.website_url,
    google_rating: c.google_rating,
    google_reviews_count: c.google_reviews_count,
  }))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-gray-200 dark:border-slate-700">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{org.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{mainBiz.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 shrink-0 p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="px-5 pt-3 pb-0 shrink-0">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800/60 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setSubTab('info')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                subTab === 'info'
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Informations
            </button>
            <button
              type="button"
              onClick={() => setSubTab('competitors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                subTab === 'competitors'
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Concurrents{' '}
              <span className="ml-0.5 text-xs font-normal text-gray-400 dark:text-slate-500">
                ({competitorItems.length})
              </span>
            </button>
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {subTab === 'info' ? (
            <InlineEditClientForm
              orgId={org.id}
              orgName={org.name}
              orgPlan={org.plan}
              orgApiKeyClaude={org.api_key_claude}
              orgMetaToken={org.meta_access_token}
              orgAvatarUrl={org.avatar_url}
              clientFullName={org.client_full_name}
              clientUserId={org.client_user_id}
              business={mainBiz}
            />
          ) : (
            <InlineCompetitorsManager orgId={org.id} competitors={competitorItems} />
          )}
        </div>
      </div>
    </>
  )
}
