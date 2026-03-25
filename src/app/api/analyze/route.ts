import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeMonthly } from '@/lib/ai/analyze'
import type { BusinessData } from '@/types'

const MANUAL_LIMIT = 5

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── 1. Organisation + plan ─────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 400 })

  const { data: org } = await supabase
    .from('organizations')
    .select('plan, api_key_claude, manual_reports_this_month, manual_reports_reset_at')
    .eq('id', orgId)
    .single()

  // ── 2. Vérification plan Premium ───────────────────────────────────────
  if (org?.plan !== 'premium') {
    return NextResponse.json({
      error: 'La génération de rapports AI est réservée au plan Premium.',
      upgrade: true,
    }, { status: 403 })
  }

  // ── 3. Compteur mensuel (pré-vérification — l'incrément atomique est post-génération) ──
  const now = new Date()
  const resetAt = org.manual_reports_reset_at ? new Date(org.manual_reports_reset_at) : null
  const needsReset = !resetAt ||
    now.getFullYear() > resetAt.getFullYear() ||
    (now.getFullYear() === resetAt.getFullYear() && now.getMonth() > resetAt.getMonth())

  const usedThisMonth = needsReset ? 0 : (org.manual_reports_this_month ?? 0)

  if (usedThisMonth >= MANUAL_LIMIT) {
    return NextResponse.json({
      error: `Limite de ${MANUAL_LIMIT} rapports manuels par mois atteinte. Réinitialisé le 1er du mois prochain.`,
      limitReached: true,
      used: usedThisMonth,
      limit: MANUAL_LIMIT,
    }, { status: 429 })
  }

  // ── 4. Business principal ──────────────────────────────────────────────
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('organization_id', orgId)
    .eq('is_competitor', false)
    .limit(1)

  const business = businesses?.[0]
  if (!business) return NextResponse.json({ error: 'Aucun business configuré' }, { status: 400 })

  // ── 5. Collecte des données ────────────────────────────────────────────
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, text, published_at, author_name, source')
    .eq('business_id', business.id)
    .order('published_at', { ascending: false })
    .limit(100)

  const reviewList = reviews ?? []
  const totalReviews = reviewList.length
  const avgRating = totalReviews > 0
    ? reviewList.reduce((s, r) => s + (r.rating ?? 0), 0) / totalReviews
    : 0

  const d30 = new Date(now.getTime() - 30 * 86400_000)
  const d60 = new Date(now.getTime() - 60 * 86400_000)
  const recent = reviewList.filter(r => r.published_at && new Date(r.published_at) >= d30)
  const previous = reviewList.filter(r =>
    r.published_at && new Date(r.published_at) >= d60 && new Date(r.published_at) < d30
  )
  const recentAvg = recent.length > 0 ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : avgRating
  const prevAvg = previous.length > 0 ? previous.reduce((s, r) => s + r.rating, 0) / previous.length : avgRating
  const delta = recentAvg - prevAvg
  const ratingTrend = delta > 0.2 ? `en hausse (+${delta.toFixed(1)} sur 30j)` : delta < -0.2 ? `en baisse (${delta.toFixed(1)} sur 30j)` : 'stable'
  const negativeReviews = reviewList.filter(r => r.rating <= 2)

  const { data: posts } = await supabase
    .from('social_posts')
    .select('content, likes, comments, shares')
    .eq('business_id', business.id)
    .order('published_at', { ascending: false })
    .limit(50)

  const postList = posts ?? []
  const postsCount = postList.length
  const totalEngagement = postList.reduce((s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0), 0)
  const avgEngagement = postsCount > 0 ? Math.round(totalEngagement / postsCount) : 0
  const bestPostRow = [...postList].sort((a, b) =>
    (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0) - ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0))
  )[0]
  const bestPostEng = bestPostRow ? (bestPostRow.likes ?? 0) + (bestPostRow.comments ?? 0) + (bestPostRow.shares ?? 0) : 0
  const bestPost = bestPostRow?.content
    ? `"${bestPostRow.content.slice(0, 120)}" (${bestPostEng} interactions)`
    : `Meilleur engagement : ${bestPostEng} interactions`

  const { data: competitorRows } = await supabase
    .from('businesses')
    .select('name, google_rating, google_reviews_count')
    .eq('organization_id', orgId)
    .eq('is_competitor', true)
    .not('google_rating', 'is', null)
    .order('google_rating', { ascending: false })
    .limit(10)

  const competitors = (competitorRows ?? []).map(c => ({
    name: c.name,
    rating: c.google_rating ?? 0,
    reviews: c.google_reviews_count ?? 0,
  }))

  const { data: seoRows } = await supabase
    .from('seo_snapshots')
    .select('lighthouse_score, has_ssl, meta_description, mobile_friendly, load_time_ms, h1_count, has_schema, schema_types, has_og_tags, canonical_url, has_sitemap, h2_count, h3_count, images_without_alt, total_images, word_count, internal_links_count, external_links_count')
    .eq('business_id', business.id)
    .order('collected_at', { ascending: false })
    .limit(1)

  const seo = seoRows?.[0]
  const seoScore = seo?.lighthouse_score ?? 0
  const seoIssues: string[] = []
  if (seo) {
    if (!seo.has_ssl) seoIssues.push('Pas de HTTPS')
    if (!seo.meta_description) seoIssues.push('Meta description manquante')
    if (!seo.mobile_friendly) seoIssues.push('Non optimisé mobile')
    if (seo.load_time_ms && seo.load_time_ms > 3000) seoIssues.push(`Temps de chargement élevé (${(seo.load_time_ms / 1000).toFixed(1)}s)`)
    if (seo.h1_count === 0) seoIssues.push('Balise H1 manquante')
    if (!seo.has_schema) seoIssues.push('Aucune donnée structurée (schema)')
    if (!seo.has_og_tags) seoIssues.push('Balises Open Graph absentes')
    if (!seo.canonical_url) seoIssues.push('Canonical URL absente')
    if (seo.has_sitemap === false) seoIssues.push('Sitemap XML manquant')
    if (seo.images_without_alt && seo.images_without_alt > 0) seoIssues.push(`${seo.images_without_alt} image(s) sans attribut alt`)
  }

  const businessData: BusinessData = {
    businessName: business.name,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
    ratingTrend,
    negativeReviews: negativeReviews.map(r => ({
      id: '', business_id: business.id,
      author_name: r.author_name ?? undefined,
      rating: r.rating, text: r.text ?? undefined,
      published_at: r.published_at ?? undefined,
      source: (r.source ?? 'google') as 'google' | 'tripadvisor' | 'facebook',
      collected_at: '',
    })),
    postsCount, avgEngagement, bestPost, competitors, seoScore, seoIssues,
    seoDetails: seo ? {
      hasSchema: seo.has_schema,
      schemaTypes: seo.schema_types as string[] | null,
      hasOgTags: seo.has_og_tags,
      canonicalUrl: seo.canonical_url,
      hasSitemap: seo.has_sitemap,
      h1Count: seo.h1_count,
      h2Count: seo.h2_count,
      h3Count: seo.h3_count,
      imagesWithoutAlt: seo.images_without_alt,
      totalImages: seo.total_images,
      wordCount: seo.word_count,
      internalLinksCount: seo.internal_links_count,
      externalLinksCount: seo.external_links_count,
    } : undefined,
  }

  // ── 6. Générer le rapport ──────────────────────────────────────────────
  try {
    const report = await analyzeMonthly(orgId, businessData, org?.api_key_claude ?? undefined)

    // Incrémenter atomiquement le compteur mensuel (RPC Supabase)
    const { data: newCount, error: counterError } = await supabase
      .rpc('increment_report_counter', {
        org_id: orgId,
        max_limit: MANUAL_LIMIT,
        current_month_start: now.toISOString(),
      })
    if (counterError || newCount == null) {
      // Le rapport a été généré mais le compteur n'a pas pu être incrémenté — log seulement
      console.error('Failed to increment report counter:', counterError?.message ?? 'limit reached post-generation')
    }

    return NextResponse.json({ ...report, _meta: { used: newCount ?? usedThisMonth + 1, limit: MANUAL_LIMIT } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
