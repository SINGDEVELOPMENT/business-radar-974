'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Facebook, Instagram, AlertTriangle } from 'lucide-react'

interface Business {
  id: string
  name: string
  facebook_page_id: string | null
  instagram_username: string | null
  social_consent_given: boolean
  social_consent_date: string | null
}

export default function RgpdConsentCard({ businesses }: { businesses: Business[] }) {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(businesses.map((b) => [b.id, b.social_consent_given]))
  )
  const [loading, setLoading] = useState<string | null>(null)

  const socialBusinesses = businesses.filter(
    (b) => b.facebook_page_id || b.instagram_username
  )

  async function toggle(businessId: string, current: boolean) {
    setLoading(businessId)
    try {
      const res = await fetch('/api/settings/consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, consent: !current }),
      })
      if (res.ok) setStates((s) => ({ ...s, [businessId]: !current }))
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold text-gray-900">Consentement RGPD — Réseaux Sociaux</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Conformément au RGPD, la collecte automatique de vos données Facebook et Instagram
        nécessite votre consentement explicite. Vous pouvez le retirer à tout moment.
        Les données déjà collectées seront conservées jusqu'à votre demande de suppression.
      </p>

      {socialBusinesses.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <AlertTriangle className="w-4 h-4" />
          Aucun business n&apos;a de compte Facebook ou Instagram configuré.
        </div>
      ) : (
        <div className="space-y-3">
          {socialBusinesses.map((biz) => {
            const given = states[biz.id] ?? false
            const isLoading = loading === biz.id
            return (
              <div
                key={biz.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{biz.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    {biz.facebook_page_id && (
                      <span className="flex items-center gap-1">
                        <Facebook className="w-3 h-3" /> Facebook
                      </span>
                    )}
                    {biz.instagram_username && (
                      <span className="flex items-center gap-1">
                        <Instagram className="w-3 h-3" /> @{biz.instagram_username}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={given ? 'success' : 'outline'} className="text-xs hidden sm:flex">
                    {given ? 'Consenti' : 'Non consenti'}
                  </Badge>
                  <button
                    onClick={() => toggle(biz.id, given)}
                    disabled={isLoading}
                    aria-label={given ? 'Révoquer le consentement' : 'Donner le consentement'}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                      given ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        given ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-gray-400">
        Base légale : Consentement (Art. 6.1.a RGPD) · Données collectées : posts publics, likes, commentaires, partages.
      </p>
    </Card>
  )
}
