import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Récupérer l'org du user via admin client (bypass RLS profiles)
  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ competitors: [], ownRating: null, ownReviewCount: 0 })

  // Nos établissements (avec note Google globale)
  const { data: ownBusinesses } = await admin
    .from('businesses')
    .select('id, name, google_rating, google_reviews_count')
    .eq('organization_id', orgId)
    .eq('is_competitor', false)

  const ownBusiness = (ownBusinesses ?? [])[0] ?? null
  const ownRating = ownBusiness?.google_rating ?? null
  const ownReviewCount = ownBusiness?.google_reviews_count ?? 0

  // Concurrents
  const { data: competitors, error: competitorsError } = await admin
    .from('businesses')
    .select('id, name, google_rating, google_reviews_count, website_url, google_place_id, opening_hours, google_photos_count, review_response_rate, recent_reviews_count, competitor_seo_score, competitor_lcp_ms')
    .eq('organization_id', orgId)
    .eq('is_competitor', true)
    .order('google_rating', { ascending: false })

  if (competitorsError) {
    console.error('[GET /api/competitors] DB error:', competitorsError)
    return NextResponse.json({ error: competitorsError.message, _debug: { orgId } }, { status: 500 })
  }

  const competitorList = competitors ?? []

  // SEO snapshots pour les concurrents
  const competitorIds = competitorList.map((c) => c.id)
  const seoMap: Record<string, { score: number | null; loadTime: number | null }> = {}

  if (competitorIds.length > 0) {
    const { data: snapshots } = await admin
      .from('seo_snapshots')
      .select('business_id, lighthouse_score, load_time_ms, collected_at')
      .in('business_id', competitorIds)
      .order('collected_at', { ascending: false })

    for (const snap of snapshots ?? []) {
      if (snap.business_id && !(snap.business_id in seoMap)) {
        seoMap[snap.business_id] = {
          score: snap.lighthouse_score ?? null,
          loadTime: snap.load_time_ms ?? null,
        }
      }
    }
  }

  const enriched = competitorList.map((c) => ({
    id: c.id,
    name: c.name,
    google_place_id: c.google_place_id ?? null,
    google_rating: c.google_rating ?? null,
    google_reviews_count: c.google_reviews_count ?? null,
    website_url: c.website_url ?? null,
    seo_score: seoMap[c.id]?.score ?? null,
    load_time_ms: seoMap[c.id]?.loadTime ?? null,
    opening_hours: c.opening_hours ?? null,
    google_photos_count: c.google_photos_count ?? 0,
    // Premium
    review_response_rate: c.review_response_rate ?? null,
    recent_reviews_count: c.recent_reviews_count ?? null,
    competitor_seo_score: c.competitor_seo_score ?? null,
    competitor_lcp_ms: c.competitor_lcp_ms ?? null,
  }))

  const clientName = ownBusiness?.name ?? 'Mon établissement'

  // Limite basée sur le plan
  const { data: orgData } = await admin
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single()
  const freeLimit = orgData?.plan === 'premium' ? 5 : 2

  return NextResponse.json({
    competitors: enriched,
    ownRating,
    ownReviewCount,
    clientName,
    freeLimit,
    isPremium: freeLimit >= 5,
  })
}
