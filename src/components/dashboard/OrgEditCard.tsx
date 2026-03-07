'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Pencil, Check, X, Upload, ImageIcon } from 'lucide-react'

interface Props {
  orgName: string
  orgPlan: string
  avatarUrl?: string | null
}

export default function OrgEditCard({ orgName, orgPlan, avatarUrl }: Props) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(orgName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl ?? null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function saveName() {
    setError('')
    if (!name.trim()) { setError('Le nom ne peut pas être vide'); return }
    setLoading(true)
    const res = await fetch('/api/settings/org', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setLoading(false)
    if (!res.ok) { setError((await res.json()).error); return }
    setSuccess(true)
    setEditing(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')

    // Prévisualisation locale
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploadLoading(true)
    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/settings/avatar', { method: 'POST', body: fd })
    setUploadLoading(false)

    if (!res.ok) {
      const { error: err } = await res.json()
      setUploadError(err)
      setAvatarPreview(avatarUrl ?? null)
      return
    }
    const { url } = await res.json()
    setAvatarPreview(url)
  }

  const planLabel = orgPlan === 'premium' ? 'Premium' : 'Standard'
  const planVariant = orgPlan === 'premium' ? 'default' as const : 'secondary' as const

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Organisation</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-colors group relative"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
            )}
            {uploadLoading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-500"
          >
            <Upload className="w-3 h-3" />
            {avatarPreview ? 'Changer' : 'Ajouter logo'}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleAvatarChange} />
          <p className="text-[10px] text-gray-400 text-center leading-tight max-w-[80px]">
            PNG · JPG · SVG<br />512×512 px<br />max 500 Ko
          </p>
          {uploadError && <p className="text-[10px] text-red-500 text-center max-w-[80px]">{uploadError}</p>}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Nom organisation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Nom de l&apos;organisation</span>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-500">
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={saveName} disabled={loading} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-500">
                    <Check className="w-3.5 h-3.5" /> {loading ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                  <button onClick={() => { setEditing(false); setName(orgName) }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" /> Annuler
                  </button>
                </div>
              )}
            </div>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-600">Organisation mise à jour.</p>}
          </div>

          {/* Plan (read-only) */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-slate-400">Plan</span>
            <Badge variant={planVariant} className="text-xs">{planLabel}</Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
