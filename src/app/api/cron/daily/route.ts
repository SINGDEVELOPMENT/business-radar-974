import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'
import { collectSeoAudit } from '@/lib/collectors/seo-audit'
import { collectFacebookPosts } from '@/lib/collectors/facebook'
import { collectInstagramPosts } from '@/lib/collectors/instagram'
import { refreshCustomCompetitors } from '@/lib/collectors/competitors'
import { analyzeMonthly } from '@/lib/ai/analyze'
import type { BusinessData } from '@/types'

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

  // ── Rapports AI hebdomadaires pour les clients Premium ─────────────────
  const weeklyReports: Record<string, unknown>[] = []
  if (isWeeklyDay) {
    const { data: premiumOrgs } = await supabase
      .from('organizations')
      .select('id, api_key_claude')
      .eq('plan', 'premium')

    for (const org of premiumOrgs ?? []) {
      try {
        // Business principal de l'org
        const { data: biz } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('organization_id', org.id)
          .eq('is_competitor', false)
          .limit(1)
          .single()

        if (!biz) continue

        const { data: reviews } = await supabase.from('reviews').select('rating, text, published_at, author_name, source').eq('business_id', biz.id).order('published_at', { ascending: false }).limit(100)
        const reviewList = reviews ?? []
        const avgRating = reviewList.length > 0 ? reviewList.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewList.length : 0
        const { data: posts } = await supabase.from('social_posts').select('content, likes, comments, shares').eq('business_id', biz.id).order('published_at', { ascending: false }).limit(50)
        const postList = posts ?? []
        const totalEngagement = postList.reduce((s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0)
        const avgEngagement = postList.length > 0 ? Math.round(totalEngagement / postList.length) : 0
        const { data: seoRows } = await supabase.from('seo_snapshots').select('lighthouse_score, has_ssl, meta_description, mobile_friendly, load_time_ms, h1_count').eq('business_id', biz.id).order('collected_at', { ascending: false }).limit(1)
        const seo = seoRows?.[0]
        const seoIssues: string[] = []
        if (seo) {
          if (!seo.has_ssl) seoIssues.push('Pas de HTTPS')
          if (!seo.meta_description) seoIssues.push('Meta description manquante')
          if (!seo.mobile_friendly) seoIssues.push('Non optimisé mobile')
          if (seo.load_time_ms && seo.load_time_ms > 3000) seoIssues.push(`Temps de chargement élevé`)
          if (seo.h1_count === 0) seoIssues.push('Balise H1 manquante')
        }
        const { data: competitors } = await supabase.from('businesses').select('name, google_rating, google_reviews_count').eq('organization_id', org.id).eq('is_competitor', true).not('google_rating', 'is', null).limit(10)

        const businessData: BusinessData = {
          businessName: biz.name,
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviewList.length,
          ratingTrend: 'stable',
          negativeReviews: reviewList.filter(r => r.rating <= 2).map(r => ({ id: '', business_id: biz.id, rating: r.rating, author_name: r.author_name ?? undefined, text: r.text ?? undefined, published_at: r.published_at ?? undefined, source: (r.source ?? 'google') as 'google' | 'tripadvisor' | 'facebook', collected_at: '' })),
          postsCount: postList.length,
          avgEngagement,
          bestPost: `Engagement total : ${totalEngagement} interactions`,
          competitors: (competitors ?? []).map(c => ({ name: c.name, rating: c.google_rating ?? 0, reviews: c.google_reviews_count ?? 0 })),
          seoScore: seo?.lighthouse_score ?? 0,
          seoIssues,
        }

        await analyzeMonthly(org.id, businessData, org.api_key_claude ?? undefined)
        weeklyReports.push({ orgId: org.id, bizName: biz.name, ok: true })
      } catch (e) {
        weeklyReports.push({ orgId: org.id, error: e instanceof Error ? e.message : 'unknown' })
      }
    }
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
    weeklyReports,
  })
}
