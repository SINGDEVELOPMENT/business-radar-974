import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import ProfileEditCard from '@/components/dashboard/ProfileEditCard'
import OrgEditCard from '@/components/dashboard/OrgEditCard'
import RgpdConsentCard from '@/components/dashboard/RgpdConsentCard'
import BusinessSettingsSection from '@/components/dashboard/BusinessSettingsSection'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id

  const { data: org } = orgId
    ? await supabase
        .from('organizations')
        .select('id, name, slug, plan, avatar_url')
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

  return (
    <div className="space-y-6">
      <Header title="Paramètres" subtitle="Gérez votre profil, votre organisation et vos business" />

      {/* Profil + Organisation — côte à côte sur grands écrans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ProfileEditCard
          fullName={profile?.full_name ?? null}
          email={user?.email ?? ''}
        />

        {org && (
          <OrgEditCard
            orgName={org.name}
            orgPlan={org.plan ?? 'standard'}
            avatarUrl={(org as { avatar_url?: string | null }).avatar_url ?? null}
          />
        )}
      </div>

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
      <BusinessSettingsSection
        initialBusinesses={businessList.map(b => ({
          id: b.id,
          name: b.name,
          google_place_id: b.google_place_id ?? null,
          facebook_page_id: b.facebook_page_id ?? null,
          instagram_username: b.instagram_username ?? null,
          website_url: b.website_url ?? null,
        }))}
      />
    </div>
  )
}
