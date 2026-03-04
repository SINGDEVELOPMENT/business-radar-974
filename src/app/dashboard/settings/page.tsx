import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import RgpdConsentCard from '@/components/dashboard/RgpdConsentCard'
import ChangePasswordCard from '@/components/dashboard/ChangePasswordCard'
import ManualCollectCard from '@/components/dashboard/ManualCollectCard'
import {
  Settings,
  Building2,
  Globe,
  Key,
  MapPin,
  Facebook,
  Instagram,
} from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: org } = orgId
    ? await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()
    : { data: null }

  const { data: businesses } = orgId
    ? await supabase
        .from('businesses')
        .select('id, name, google_place_id, facebook_page_id, instagram_username, website_url, social_consent_given, social_consent_date')
        .eq('organization_id', orgId)
        .eq('is_competitor', false)
        .order('name')
    : { data: [] }

  const businessList = businesses ?? []
  const mainBiz = businessList[0] ?? null

  // Dernier audit SEO
  const { data: lastSeo } = mainBiz
    ? await supabase
        .from('seo_snapshots')
        .select('collected_at')
        .eq('business_id', mainBiz.id)
        .order('collected_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  // Dernier rapport AI
  const { data: lastReport } = orgId
    ? await supabase
        .from('ai_reports')
        .select('generated_at')
        .eq('organization_id', orgId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  // Calcul de nextAllowedAt depuis last_manual_collect_at
  const lastManualAt = (org as { last_manual_collect_at?: string | null } | null)?.last_manual_collect_at ?? null
  const nextAllowedAt = lastManualAt
    ? new Date(new Date(lastManualAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
    : null

  return (
    <div className="space-y-6">
      <Header title="Paramètres" subtitle="Configuration de votre organisation et de vos business" />

      {/* Organisation */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Organisation</h3>
        </div>
        {org ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Nom</span>
                <span className="font-medium text-gray-900">{org.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Slug</span>
                <span className="font-mono text-xs text-gray-600">{org.slug}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Plan</span>
                <Badge variant="secondary">{org.plan ?? 'standard'}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Clé API Claude</span>
                <Badge variant={org.api_key_claude ? 'success' : 'outline'}>
                  {org.api_key_claude ? 'Configurée' : 'Non configurée'}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucune organisation associée à votre compte.</p>
        )}
      </Card>

      {/* Profil utilisateur */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Profil</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Nom</span>
              <span className="font-medium text-gray-900">{profile?.full_name ?? '--'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Rôle</span>
              <Badge variant="secondary" className="capitalize">{profile?.role ?? 'member'}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Collecte manuelle */}
      <ManualCollectCard
        lastSeoDate={lastSeo?.collected_at ?? null}
        lastReportDate={lastReport?.generated_at ?? null}
        nextAllowedAt={nextAllowedAt}
      />

      {/* Changer le mot de passe */}
      <ChangePasswordCard />

      {/* Consentement RGPD */}
      {businessList.length > 0 && (
        <RgpdConsentCard businesses={businessList.map((b) => ({
          id: b.id,
          name: b.name,
          facebook_page_id: b.facebook_page_id ?? null,
          instagram_username: b.instagram_username ?? null,
          social_consent_given: b.social_consent_given ?? false,
          social_consent_date: b.social_consent_date ?? null,
        }))} />
      )}

      {/* Business surveillés */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Business surveillés</h3>
        </div>
        {businessList.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucun business configuré. Contactez votre administrateur pour la configuration initiale.
          </p>
        ) : (
          <div className="space-y-3">
            {businessList.map((biz) => (
              <div key={biz.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
                <div className="space-y-1.5">
                  <p className="font-medium text-sm text-gray-900">{biz.name}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    {biz.google_place_id && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Google Places
                      </span>
                    )}
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
                    {biz.website_url && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" /> {biz.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
