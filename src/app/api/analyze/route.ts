import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeMonthly } from '@/lib/ai/analyze'
import type { BusinessData } from '@/types'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── 1. Organisation du user ────────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) {
    return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 400 })
  }

  // ── 2. Business principal (non-concurrent) ─────────────────────────────
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('organization_id', orgId)
    .eq('is_competitor', false)
    .limit(1)

  const business = businesses?.[0]
  if (!business) {
    return NextResponse.json({ error: 'Aucun business configuré' }, { status: 400 })
  }

  // ── 3. Avis Google ─────────────────────────────────────────────────────
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, text, published_at, author_name, source')
    .eq('business_id', business.id)
    .order('published_at', { ascending: false })
    .limit(100)

  const reviewList = reviews ?? []
  const totalReviews = reviewList.length
  const avgRating =
    totalReviews > 0
      ? reviewList.reduce((s, r) => s + (r.rating ?? 0), 0) / totalReviews
      : 0

  // Tendance : compare les 30 derniers jours vs les 30 précédents
  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * 86400_000)
  const d60 = new Date(now.getTime() - 60 * 86400_000)
  const recent = reviewList.filter((r) => r.published_at && new Date(r.published_at) >= d30)
  const previous = reviewList.filter(
    (r) =>
      r.published_at &&
      new Date(r.published_at) >= d60 &&
      new Date(r.published_at) < d30,
  )
  const recentAvg =
    recent.length > 0 ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : avgRating
  const prevAvg =
    previous.length > 0
      ? previous.reduce((s, r) => s + r.rating, 0) / previous.length
      : avgRating
  const delta = recentAvg - prevAvg
  const ratingTrend =
    delta > 0.2
      ? `en hausse (+${delta.toFixed(1)} sur 30j)`
      : delta < -0.2
      ? `en baisse (${delta.toFixed(1)} sur 30j)`
      : 'stable'

  const negativeReviews = reviewList.filter((r) => r.rating <= 2)

  // ── 4. Réseaux sociaux ─────────────────────────────────────────────────
  const { data: posts } = await supabase
    .from('social_posts')
    .select('content, likes, comments, shares')
    .eq('business_id', business.id)
    .order('published_at', { ascending: false })
    .limit(50)

  const postList = posts ?? []
  const postsCount = postList.length
  const totalEngagement = postList.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    0,
  )
  const avgEngagement = postsCount > 0 ? Math.round(totalEngagement / postsCount) : 0
  const bestPostRow = [...postList].sort(
    (a, b) =>
      (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0) -
      ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)),
  )[0]
  const bestPostEng = bestPostRow
    ? (bestPostRow.likes ?? 0) + (bestPostRow.comments ?? 0) + (bestPostRow.shares ?? 0)
    : 0
  const bestPost = bestPostRow?.content
    ? `"${bestPostRow.content.slice(0, 120)}" (${bestPostEng} interactions)`
    : `Meilleur engagement : ${bestPostEng} interactions`

  // ── 5. Concurrents ─────────────────────────────────────────────────────
  const { data: competitorRows } = await supabase
    .from('businesses')
    .select('name, google_rating, google_reviews_count')
    .eq('organization_id', orgId)
    .eq('is_competitor', true)
    .not('google_rating', 'is', null)
    .order('google_rating', { ascending: false })
    .limit(10)

  const competitors = (competitorRows ?? []).map((c) => ({
    name: c.name,
    rating: c.google_rating ?? 0,
    reviews: c.google_reviews_count ?? 0,
  }))

  // ── 6. SEO ─────────────────────────────────────────────────────────────
  const { data: seoRows } = await supabase
    .from('seo_snapshots')
    .select(
      'lighthouse_score, has_ssl, meta_description, mobile_friendly, load_time_ms, h1_count',
    )
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
    if (seo.load_time_ms && seo.load_time_ms > 3000)
      seoIssues.push(`Temps de chargement élevé (${(seo.load_time_ms / 1000).toFixed(1)}s)`)
    if (seo.h1_count === 0) seoIssues.push('Balise H1 manquante')
  }

  // ── 7. Payload BusinessData ────────────────────────────────────────────
  const businessData: BusinessData = {
    businessName: business.name,
    avgRating: Math.round(avgRating * 10) / 10,
    totalReviews,
    ratingTrend,
    negativeReviews: negativeReviews.map((r) => ({
      id: '',
      business_id: business.id,
      author_name: r.author_name ?? undefined,
      rating: r.rating,
      text: r.text ?? undefined,
      published_at: r.published_at ?? undefined,
      source: (r.source ?? 'google') as 'google' | 'tripadvisor' | 'facebook',
      collected_at: '',
    })),
    postsCount,
    avgEngagement,
    bestPost,
    competitors,
    seoScore,
    seoIssues,
  }

  // ── 8. Clé API Claude du client ────────────────────────────────────────
  const { data: org } = await supabase
    .from('organizations')
    .select('api_key_claude')
    .eq('id', orgId)
    .single()

  try {
    const report = await analyzeMonthly(orgId, businessData, org?.api_key_claude ?? undefined)
    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
