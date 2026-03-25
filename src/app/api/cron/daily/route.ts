import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 300 // Vercel Pro : jusqu'à 300s (PageSpeed = 30-40s par site)
import { createAdminClient } from '@/lib/supabase/admin'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'
import { collectSeoAudit } from '@/lib/collectors/seo-audit'
import { collectFacebookPosts } from '@/lib/collectors/facebook'
import { collectInstagramPosts } from '@/lib/collectors/instagram'
import { refreshCustomCompetitors, collectCompetitorSeo } from '@/lib/collectors/competitors'
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
    .not('is_competitor', 'is', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // ── Collecte quotidienne — tous les businesses EN PARALLÈLE ───────────────
  const results = await Promise.all(
    (businesses ?? []).map(async (business) => {
      const org = business.organizations as unknown as { meta_access_token: string | null } | null
      const metaToken = org?.meta_access_token ?? null
      const result: Record<string, unknown> = { businessId: business.id, name: business.name }

      // Tous les collectors tournent en parallèle pour chaque business
      await Promise.all([
        // Google Reviews
        business.google_place_id
          ? collectGoogleReviews(business.id, business.google_place_id)
              .then(r => { result.reviews = r })
              .catch(e => { result.reviewsError = e instanceof Error ? e.message : 'unknown' })
          : Promise.resolve(),

        // Audit SEO + PageSpeed
        business.website_url
          ? collectSeoAudit(business.id, business.website_url)
              .then(s => { result.seo = { statusCode: s.status_code, loadTime: s.load_time_ms } })
              .catch(e => { result.seoError = e instanceof Error ? e.message : 'unknown' })
          : Promise.resolve(),

        // Facebook posts (consentement RGPD requis)
        (business.facebook_page_id && metaToken && business.social_consent_given)
          ? collectFacebookPosts(business.id, business.facebook_page_id, metaToken)
              .then(r => { result.facebook = r })
              .catch(e => { result.facebookError = e instanceof Error ? e.message : 'unknown' })
          : Promise.resolve(),

        // Instagram posts (consentement RGPD requis)
        (business.instagram_business_id && metaToken && business.social_consent_given)
          ? collectInstagramPosts(business.id, business.instagram_business_id, metaToken)
              .then(r => { result.instagram = r })
              .catch(e => { result.instagramError = e instanceof Error ? e.message : 'unknown' })
          : Promise.resolve(),
      ])

      return result
    })
  )

  // ── Rapports AI hebdomadaires pour les clients Premium ────────────────────
  const weeklyReports: Record<string, unknown>[] = []
  let customCompetitorsRefresh = null

  if (isWeeklyDay) {
    // Rapports AI (séquentiel — appels Claude, rarement plus de 1-2 orgs)
    const { data: premiumOrgs } = await supabase
      .from('organizations')
      .select('id, api_key_claude')
      .eq('plan', 'premium')

    for (const org of premiumOrgs ?? []) {
      try {
        const { data: biz } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('organization_id', org.id)
          .eq('is_competitor', false)
          .limit(1)
          .single()

        if (!biz) continue

        const [reviewsRes, postsRes, seoRes, competitorsRes] = await Promise.all([
          supabase.from('reviews').select('rating, text, published_at, author_name, source').eq('business_id', biz.id).order('published_at', { ascending: false }).limit(100),
          supabase.from('social_posts').select('content, likes, comments, shares').eq('business_id', biz.id).order('published_at', { ascending: false }).limit(50),
          supabase.from('seo_snapshots').select('lighthouse_score, has_ssl, meta_description, mobile_friendly, load_time_ms, h1_count').eq('business_id', biz.id).order('collected_at', { ascending: false }).limit(1),
          supabase.from('businesses').select('name, google_rating, google_reviews_count').eq('organization_id', org.id).eq('is_competitor', true).not('google_rating', 'is', null).limit(10),
        ])

        const reviewList = reviewsRes.data ?? []
        const postList = postsRes.data ?? []
        const seo = seoRes.data?.[0]

        const avgRating = reviewList.length > 0
          ? reviewList.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewList.length
          : 0
        const totalEngagement = postList.reduce((s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0)
        const avgEngagement = postList.length > 0 ? Math.round(totalEngagement / postList.length) : 0

        const seoIssues: string[] = []
        if (seo) {
          if (!seo.has_ssl) seoIssues.push('Pas de HTTPS')
          if (!seo.meta_description) seoIssues.push('Meta description manquante')
          if (!seo.mobile_friendly) seoIssues.push('Non optimisé mobile')
          if (seo.load_time_ms && seo.load_time_ms > 3000) seoIssues.push('Temps de chargement élevé')
          if (seo.h1_count === 0) seoIssues.push('Balise H1 manquante')
        }

        const businessData: BusinessData = {
          businessName: biz.name,
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviewList.length,
          ratingTrend: 'stable',
          negativeReviews: reviewList.filter(r => r.rating <= 2).map(r => ({
            id: '', business_id: biz.id, rating: r.rating,
            author_name: r.author_name ?? undefined, text: r.text ?? undefined,
            published_at: r.published_at ?? undefined,
            source: (r.source ?? 'google') as 'google' | 'tripadvisor' | 'facebook',
            collected_at: '',
          })),
          postsCount: postList.length,
          avgEngagement,
          bestPost: `Engagement total : ${totalEngagement} interactions`,
          competitors: (competitorsRes.data ?? []).map(c => ({ name: c.name, rating: c.google_rating ?? 0, reviews: c.google_reviews_count ?? 0 })),
          seoScore: seo?.lighthouse_score ?? 0,
          seoIssues,
        }

        await analyzeMonthly(org.id, businessData, org.api_key_claude ?? undefined)
        weeklyReports.push({ orgId: org.id, bizName: biz.name, ok: true })
      } catch (e) {
        weeklyReports.push({ orgId: org.id, error: e instanceof Error ? e.message : 'unknown' })
      }
    }

    // Concurrents custom : refresh Google + récupération de tous les concurrents avec site
    const [refreshResult, { data: customWithSite }, { data: allWithSite }] = await Promise.all([
      refreshCustomCompetitors().catch(e => ({ error: e instanceof Error ? e.message : 'unknown' })),
      supabase
        .from('businesses')
        .select('id, website_url')
        .eq('is_competitor', true)
        .eq('custom_competitor', true)
        .not('website_url', 'is', null),
      supabase
        .from('businesses')
        .select('id, website_url')
        .eq('is_competitor', true)
        .not('website_url', 'is', null),
    ])
    customCompetitorsRefresh = refreshResult

    // Audit SEO complet (custom uniquement) + PageSpeed léger (tous concurrents) — EN PARALLÈLE
    await Promise.all([
      // Audit complet Lighthouse pour les concurrents custom
      ...(customWithSite ?? [])
        .filter(comp => comp.website_url)
        .map(comp => collectSeoAudit(comp.id, comp.website_url!).catch(() => {})),
      // Score PageSpeed léger pour tous les concurrents avec un site (alimente competitor_seo_score)
      ...(allWithSite ?? [])
        .filter(comp => comp.website_url)
        .map(comp => collectCompetitorSeo(comp.id, comp.website_url!).catch(() => {})),
    ])
  }

  // Log detailed results for debugging, return only summary
  const errorsCount = results.filter(r =>
    r.reviewsError || r.seoError || r.facebookError || r.instagramError
  ).length
  const weeklyErrors = weeklyReports.filter(r => r.error).length

  console.error('[CRON daily] Detailed results:', JSON.stringify({ results, customCompetitorsRefresh, weeklyReports }))

  return NextResponse.json({
    status: 'completed',
    runAt: new Date().toISOString(),
    weeklyRun: isWeeklyDay,
    processed: results.length,
    errorsCount: errorsCount + weeklyErrors,
  })
}
