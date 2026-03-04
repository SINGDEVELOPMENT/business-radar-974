import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'
import { collectSeoAudit } from '@/lib/collectors/seo-audit'
import { collectFacebookPosts } from '@/lib/collectors/facebook'
import { collectInstagramPosts } from '@/lib/collectors/instagram'
import { refreshCustomCompetitors } from '@/lib/collectors/competitors'

// Protégé par le secret partagé avec Vercel Cron (header Authorization: Bearer <CRON_SECRET>)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Dimanche (0) ou trigger forcé → collecte hebdomadaire des concurrents
  const forceWeekly = request.headers.get('x-force-weekly') === 'true'
  const isWeeklyDay = new Date().getDay() === 0 || forceWeekly

  // Récupère tous les businesses principaux avec le token Meta de leur organisation
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id, name, organization_id,
      google_place_id, website_url,
      facebook_page_id, instagram_business_id,
      social_consent_given,
      organizations(meta_access_token)
    `)
    .eq('is_competitor', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = []

  for (const business of businesses ?? []) {
    const org = business.organizations as unknown as { meta_access_token: string | null } | null
    const metaToken = org?.meta_access_token ?? null

    const result: Record<string, unknown> = { businessId: business.id, name: business.name }

    // Google Reviews (quotidien)
    if (business.google_place_id) {
      try {
        result.reviews = await collectGoogleReviews(business.id, business.google_place_id)
      } catch (e) {
        result.reviewsError = e instanceof Error ? e.message : 'unknown'
      }
    }

    // Audit SEO (quotidien)
    if (business.website_url) {
      try {
        const s = await collectSeoAudit(business.id, business.website_url)
        result.seo = { statusCode: s.status_code, loadTime: s.load_time_ms }
      } catch (e) {
        result.seoError = e instanceof Error ? e.message : 'unknown'
      }
    }

    // Facebook posts (quotidien) — consentement RGPD requis
    if (business.facebook_page_id && metaToken && business.social_consent_given) {
      try {
        result.facebook = await collectFacebookPosts(business.id, business.facebook_page_id, metaToken)
      } catch (e) {
        result.facebookError = e instanceof Error ? e.message : 'unknown'
      }
    }

    // Instagram posts (quotidien) — consentement RGPD requis
    if (business.instagram_business_id && metaToken && business.social_consent_given) {
      try {
        result.instagram = await collectInstagramPosts(business.id, business.instagram_business_id, metaToken)
      } catch (e) {
        result.instagramError = e instanceof Error ? e.message : 'unknown'
      }
    }

    results.push(result)
  }

  // Rafraîchir les concurrents custom — hebdomadaire
  let customCompetitorsRefresh = null
  if (isWeeklyDay) {
    // Rafraîchit notes/avis Google via Place Details API
    try {
      customCompetitorsRefresh = await refreshCustomCompetitors()
    } catch (e) {
      customCompetitorsRefresh = { error: e instanceof Error ? e.message : 'unknown' }
    }

    // Audit SEO pour les concurrents avec un site web
    const { data: competitorsWithSite } = await supabase
      .from('businesses')
      .select('id, website_url')
      .eq('is_competitor', true)
      .eq('custom_competitor', true)
      .not('website_url', 'is', null)

    for (const comp of competitorsWithSite ?? []) {
      if (!comp.website_url) continue
      try {
        await collectSeoAudit(comp.id, comp.website_url)
      } catch {
        // Ne pas bloquer le reste
      }
    }
  }

  return NextResponse.json({
    ok: true,
    runAt: new Date().toISOString(),
    weeklyRun: isWeeklyDay,
    processed: results.length,
    results,
    customCompetitorsRefresh,
  })
}
