import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Look up user's organization
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 })

  const { businessId, placeId } = await request.json()
  if (!businessId || !placeId) {
    return NextResponse.json({ error: 'businessId et placeId requis' }, { status: 400 })
  }

  // Verify business belongs to user's org
  const { data: business } = await supabase.from('businesses').select('id').eq('id', businessId).eq('organization_id', profile.organization_id).single()
  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const result = await collectGoogleReviews(businessId, placeId)

    // Create alerts for negative reviews on premium orgs
    await createNegativeReviewAlerts(businessId, profile.organization_id, result)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function createNegativeReviewAlerts(
  businessId: string,
  organizationId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collectResult: any
) {
  try {
    const admin = createAdminClient()

    // Only create alerts for premium organizations
    const { data: org } = await admin
      .from('organizations')
      .select('plan')
      .eq('id', organizationId)
      .single()

    if (!org || org.plan !== 'premium') return

    // collectResult may contain inserted reviews — fall back to querying recent ones
    // We look for reviews with rating <= 2 inserted in the last 5 minutes (fresh collection)
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: negativeReviews } = await admin
      .from('reviews')
      .select('id, rating, text, author_name, collected_at')
      .eq('business_id', businessId)
      .lte('rating', 2)
      .gte('collected_at', since)

    if (!negativeReviews || negativeReviews.length === 0) return

    const alertsToInsert = negativeReviews.map((review) => ({
      organization_id: organizationId,
      business_id: businessId,
      type: 'negative_review' as const,
      title: `Avis négatif ${review.rating}\u2605 \u2014 ${review.author_name || 'Anonyme'}`,
      message: review.text ? review.text.slice(0, 200) : null,
      severity: review.rating === 1 ? 'high' : 'medium',
      is_read: false,
    }))

    await admin.from('alerts').insert(alertsToInsert)
  } catch (err) {
    // Do not throw — alert creation is non-critical
    console.error('[alerts] Failed to create negative review alerts:', err)
  }
}
