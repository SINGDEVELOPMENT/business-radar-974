import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'
import { collectSeoAudit } from '@/lib/collectors/seo-audit'

// Protégé par un secret partagé avec Vercel Cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Récupère tous les businesses non-concurrents
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, google_place_id, website_url, name')
    .eq('is_competitor', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []

  for (const business of businesses ?? []) {
    const result: Record<string, unknown> = { businessId: business.id, name: business.name }

    // Collecte Google Reviews
    if (business.google_place_id) {
      try {
        const r = await collectGoogleReviews(business.id, business.google_place_id)
        result.reviews = r
      } catch (e) {
        result.reviewsError = e instanceof Error ? e.message : 'unknown'
      }
    }

    // Audit SEO
    if (business.website_url) {
      try {
        const s = await collectSeoAudit(business.id, business.website_url)
        result.seo = { statusCode: s.status_code, loadTime: s.load_time_ms }
      } catch (e) {
        result.seoError = e instanceof Error ? e.message : 'unknown'
      }
    }

    results.push(result)
  }

  return NextResponse.json({ ok: true, processed: results.length, results })
}
