import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import AdminTriggerButton from '@/components/dashboard/AdminTriggerButton'
import AdminPageClient from '@/components/dashboard/AdminPageClient'
import type { OrgWithData, BusinessWithMeta } from '@/types/admin'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const adminClient = createAdminClient()

  const { data: orgs } = await adminClient
    .from('organizations')
    .select(`
      id, name, slug, plan, created_at, api_key_claude, meta_access_token,
      businesses(
        id, name, google_place_id, website_url, facebook_page_id,
        instagram_username, instagram_business_id, lat, lng,
        is_competitor, custom_competitor, google_rating, google_reviews_count,
        seo_snapshots(lighthouse_score, collected_at)
      ),
      ai_reports(generated_at)
    `)
    .order('created_at', { ascending: false })

  // Normalize data: keep only latest seo_snapshot and ai_report per org
  const orgList: OrgWithData[] = (orgs ?? []).map((org) => {
    const rawBusinesses = (org.businesses ?? []) as unknown as (BusinessWithMeta & {
      seo_snapshots: { lighthouse_score: number | null; collected_at: string }[]
    })[]

    const businesses: BusinessWithMeta[] = rawBusinesses.map((b) => {
      const snapshots = [...(b.seo_snapshots ?? [])].sort(
        (a, z) => new Date(z.collected_at).getTime() - new Date(a.collected_at).getTime()
      )
      return {
        id: b.id,
        name: b.name,
        google_place_id: b.google_place_id,
        website_url: b.website_url,
        facebook_page_id: b.facebook_page_id,
        instagram_username: b.instagram_username,
        instagram_business_id: b.instagram_business_id,
        lat: b.lat,
        lng: b.lng,
        is_competitor: b.is_competitor,
        custom_competitor: b.custom_competitor,
        google_rating: b.google_rating,
        google_reviews_count: b.google_reviews_count,
        seo_snapshots: snapshots.slice(0, 1).map((s) => ({ lighthouse_score: s.lighthouse_score })),
      }
    })

    const rawReports = (org.ai_reports ?? []) as { generated_at: string }[]
    const sortedReports = [...rawReports].sort(
      (a, z) => new Date(z.generated_at).getTime() - new Date(a.generated_at).getTime()
    )

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      created_at: org.created_at,
      api_key_claude: (org as { api_key_claude: string | null }).api_key_claude,
      meta_access_token: (org as { meta_access_token: string | null }).meta_access_token,
      businesses,
      ai_reports: sortedReports.slice(0, 1),
    }
  })

  return (
    <div className="space-y-6">
      <Header title="Administration" subtitle="Onboarding et gestion des clients" />
      <div className="flex justify-end">
        <AdminTriggerButton />
      </div>
      <AdminPageClient orgs={orgList} />
    </div>
  )
}
