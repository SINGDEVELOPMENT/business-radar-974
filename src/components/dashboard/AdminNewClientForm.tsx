'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, ChevronDown, ChevronUp, Check } from 'lucide-react'

interface FormData {
  orgName: string
  businessName: string
  clientEmail: string
  googlePlaceId: string
  websiteUrl: string
  facebookPageId: string
  instagramUsername: string
  instagramBusinessId: string
  metaAccessToken: string
  lat: string
  lng: string
}

const initialForm: FormData = {
  orgName: '',
  businessName: '',
  clientEmail: '',
  googlePlaceId: '',
  websiteUrl: '',
  facebookPageId: '',
  instagramUsername: '',
  instagramBusinessId: '',
  metaAccessToken: '',
  lat: '',
  lng: '',
}

export default function AdminNewClientForm() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [invitationSent, setInvitationSent] = useState(false)
  const [open, setOpen] = useState(true)

  function set(key: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: form.orgName,
          businessName: form.businessName,
          clientEmail: form.clientEmail || undefined,
          googlePlaceId: form.googlePlaceId || undefined,
          websiteUrl: form.websiteUrl || undefined,
          facebookPageId: form.facebookPageId || undefined,
          instagramUsername: form.instagramUsername || undefined,
          instagramBusinessId: form.instagramBusinessId || undefined,
          metaAccessToken: form.metaAccessToken || undefined,
          lat: form.lat ? parseFloat(form.lat) : undefined,
          lng: form.lng ? parseFloat(form.lng) : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? 'Erreur inconnue' })
      } else {
        let inviteMsg = ''
        if (form.clientEmail) {
          if (data.invite?.ok) {
            inviteMsg = ' Invitation envoyée par email.'
          } else {
            inviteMsg = ` (Erreur invite : ${data.invite?.error ?? 'inconnu'})`
          }
        }
        setInvitationSent(!!data.invite?.ok)
        setResult({ ok: data.invite?.ok !== false, message: `Client "${data.organization.name}" créé.${inviteMsg}` })
        setForm(initialForm)
      }
    } catch {
      setResult({ ok: false, message: 'Erreur réseau' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Nouveau client</h3>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Identité */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Identité
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Nom de l'organisation *"
                value={form.orgName}
                onChange={set('orgName')}
                placeholder="Ex : Resto Le Lagon"
                required
              />
              <Field
                label="Nom du business *"
                value={form.businessName}
                onChange={set('businessName')}
                placeholder="Ex : Restaurant Le Lagon"
                required
              />
              <Field
                label="Email du client (invitation)"
                value={form.clientEmail}
                onChange={set('clientEmail')}
                placeholder="client@example.com"
                type="email"
              />
            </div>
          </fieldset>

          {/* Sources de données */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Sources de données
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Google Place ID"
                value={form.googlePlaceId}
                onChange={set('googlePlaceId')}
                placeholder="ChIJxxxxxxxxxxxxxxx"
              />
              <Field
                label="URL du site web"
                value={form.websiteUrl}
                onChange={set('websiteUrl')}
                placeholder="https://monsite.re"
                type="url"
              />
              <Field
                label="Facebook Page ID"
                value={form.facebookPageId}
                onChange={set('facebookPageId')}
                placeholder="123456789"
              />
              <Field
                label="Instagram @username"
                value={form.instagramUsername}
                onChange={set('instagramUsername')}
                placeholder="monrestaurant"
              />
              <div className="space-y-1 md:col-span-2">
                <Field
                  label="Instagram Business ID"
                  value={form.instagramBusinessId}
                  onChange={set('instagramBusinessId')}
                  placeholder="ID numérique (Graph API)"
                />
                <p className="text-xs text-gray-400">
                  Pour trouver l&apos;Instagram Business ID : dans Meta Graph API Explorer, appelez{' '}
                  <code className="bg-gray-100 px-1 rounded text-gray-600">GET /&#123;page-id&#125;?fields=instagram_business_account</code>{' '}
                  avec un token valide. L&apos;id retourné est l&apos;Instagram Business ID.{' '}
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
              <Field
                label="Meta Access Token"
                value={form.metaAccessToken}
                onChange={set('metaAccessToken')}
                placeholder="EAAxxxxxxx..."
              />
            </div>
          </fieldset>

          {/* Localisation */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Localisation <span className="normal-case font-normal text-gray-300">(recherche de concurrents)</span>
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Latitude"
                value={form.lat}
                onChange={set('lat')}
                placeholder="-21.1151"
              />
              <Field
                label="Longitude"
                value={form.lng}
                onChange={set('lng')}
                placeholder="55.5364"
              />
            </div>
          </fieldset>

          {result && (
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg text-sm ${
                  result.ok
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {result.message}
              </div>
              {invitationSent && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  <Check className="w-3 h-3" /> Invitation envoyée
                </span>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Création en cours...' : 'Créer le client'}
          </Button>
        </form>
      )}
    </Card>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  type?: string
}

function Field({ label, value, onChange, placeholder, required, type = 'text' }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-gray-300"
      />
    </div>
  )
}
