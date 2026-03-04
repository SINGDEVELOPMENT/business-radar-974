import * as cheerio from 'cheerio'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeSeoScore } from '@/lib/utils/seo'

const OPPORTUNITY_KEYS = [
  'render-blocking-resources',
  'unused-css-rules',
  'unused-javascript',
  'uses-optimized-images',
  'uses-webp-images',
  'offscreen-images',
  'uses-text-compression',
  'uses-responsive-images',
]

export async function collectSeoAudit(businessId: string, websiteUrl: string) {
  const start = Date.now()

  let statusCode = 0
  let html = ''

  try {
    const res = await fetch(websiteUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'BusinessRadar974/1.0' },
    })
    statusCode = res.status
    html = await res.text()
  } catch {
    statusCode = 0
  }

  const loadTimeMs = Date.now() - start
  const hasSSL = websiteUrl.startsWith('https://')
  const pageSizeKb = html ? Math.round(Buffer.byteLength(html, 'utf8') / 1024) : null

  let title = ''
  let metaDescription = ''
  let h1Count = 0

  let mobileFriendly: boolean | null = null

  if (html) {
    const $ = cheerio.load(html)
    title = $('title').first().text().trim()
    metaDescription = $('meta[name="description"]').attr('content') ?? ''
    h1Count = $('h1').length
    // Mobile friendly depuis la balise viewport (fallback si PageSpeed indisponible)
    const viewport = $('meta[name="viewport"]').attr('content') ?? ''
    mobileFriendly = viewport.includes('width=device-width')
  }

  const partial = {
    has_ssl: hasSSL,
    status_code: statusCode,
    load_time_ms: loadTimeMs,
    title: title || null,
    meta_description: metaDescription || null,
    h1_count: h1Count,
  }

  const seoScore = computeSeoScore(partial)

  // ── PageSpeed Insights API — rapport complet ─────────────────────────────
  let lighthouseScore = seoScore

  // Core Web Vitals
  let fcpMs: number | null = null
  let lcpMs: number | null = null
  let clsScore: number | null = null
  let tbtMs: number | null = null
  let speedIndexMs: number | null = null

  // Scores catégories
  let accessibilityScore: number | null = null
  let seoAuditScore: number | null = null
  let bestPracticesScore: number | null = null

  // Opportunités d'optimisation
  let opportunities: { id: string; title: string; displayValue: string; score: number }[] = []

  // PageSpeed Insights — fonctionne sans clé API (25k req/jour gratuit)
  if (statusCode > 0) {
    try {
      const psUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
      psUrl.searchParams.set('url', websiteUrl)
      psUrl.searchParams.set('strategy', 'mobile')
      // Clé optionnelle — augmente les quotas mais n'est pas obligatoire
      const psKey = process.env.PAGESPEED_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY
      if (psKey) psUrl.searchParams.set('key', psKey)
      ;['performance', 'accessibility', 'best-practices', 'seo'].forEach(cat =>
        psUrl.searchParams.append('category', cat)
      )

      const psRes = await fetch(psUrl.toString(), { signal: AbortSignal.timeout(30000) })
      if (psRes.ok) {
        const psData = await psRes.json()
        const audits = psData?.lighthouseResult?.audits
        const categories = psData?.lighthouseResult?.categories

        // Score performance (Lighthouse)
        if (categories?.performance?.score != null) {
          lighthouseScore = Math.round(categories.performance.score * 100)
        }

        // Autres scores catégories
        if (categories?.accessibility?.score != null) {
          accessibilityScore = Math.round(categories.accessibility.score * 100)
        }
        if (categories?.seo?.score != null) {
          seoAuditScore = Math.round(categories.seo.score * 100)
        }
        if (categories?.['best-practices']?.score != null) {
          bestPracticesScore = Math.round(categories['best-practices'].score * 100)
        }

        // Core Web Vitals
        if (audits?.['first-contentful-paint']?.numericValue != null) {
          fcpMs = Math.round(audits['first-contentful-paint'].numericValue)
        }
        if (audits?.['largest-contentful-paint']?.numericValue != null) {
          lcpMs = Math.round(audits['largest-contentful-paint'].numericValue)
        }
        if (audits?.['cumulative-layout-shift']?.numericValue != null) {
          clsScore = audits['cumulative-layout-shift'].numericValue
        }
        if (audits?.['total-blocking-time']?.numericValue != null) {
          tbtMs = Math.round(audits['total-blocking-time'].numericValue)
        }
        if (audits?.['speed-index']?.numericValue != null) {
          speedIndexMs = Math.round(audits['speed-index'].numericValue)
        }

        // Mobile friendly
        mobileFriendly = audits?.['viewport']?.score === 1

        // Opportunités
        if (audits) {
          opportunities = OPPORTUNITY_KEYS
            .filter(key => audits[key]?.score != null && (audits[key].score as number) < 1)
            .map(key => ({
              id: key,
              title: (audits[key].title ?? key) as string,
              displayValue: (audits[key].displayValue ?? '') as string,
              score: Math.round(((audits[key].score as number) ?? 0) * 100),
            }))
        }
      }
    } catch (err) {
      console.error('[seo-audit] PageSpeed error:', err)
    }
  }

  const snapshot = {
    business_id: businessId,
    url: websiteUrl,
    ...partial,
    page_size_kb: pageSizeKb,
    mobile_friendly: mobileFriendly,
    lighthouse_score: lighthouseScore,
    fcp_ms: fcpMs,
    lcp_ms: lcpMs,
    cls_score: clsScore,
    tbt_ms: tbtMs,
    speed_index_ms: speedIndexMs,
    accessibility_score: accessibilityScore,
    seo_audit_score: seoAuditScore,
    best_practices_score: bestPracticesScore,
    opportunities: opportunities.length > 0 ? opportunities : null,
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('seo_snapshots').insert(snapshot)
  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return snapshot
}
