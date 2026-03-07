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

  // ── Parsing HTML (inspiré claude-seo) ─────────────────────────────────────
  let title = ''
  let metaDescription = ''
  let h1Count = 0
  let mobileFriendly: boolean | null = null
  let canonicalUrl: string | null = null
  let hasOgTags = false
  let ogTitle: string | null = null
  let ogDescription: string | null = null
  let ogImage: string | null = null
  let h2Count = 0
  let h3Count = 0
  let imagesWithoutAlt = 0
  let totalImages = 0
  let internalLinksCount = 0
  let externalLinksCount = 0
  let wordCount = 0
  let hasSchema = false
  let schemaTypes: string[] = []

  if (html) {
    const $ = cheerio.load(html)

    // Basiques
    title = $('title').first().text().trim()
    metaDescription = $('meta[name="description"]').attr('content') ?? ''
    h1Count = $('h1').length
    const viewport = $('meta[name="viewport"]').attr('content') ?? ''
    mobileFriendly = viewport.includes('width=device-width')

    // Canonical
    canonicalUrl = $('link[rel="canonical"]').attr('href') ?? null

    // Open Graph tags
    ogTitle = $('meta[property="og:title"]').attr('content') ?? null
    ogDescription = $('meta[property="og:description"]').attr('content') ?? null
    ogImage = $('meta[property="og:image"]').attr('content') ?? null
    hasOgTags = !!(ogTitle || ogDescription || ogImage)

    // Structure des titres
    h2Count = $('h2').length
    h3Count = $('h3').length

    // Images
    const images = $('img')
    totalImages = images.length
    images.each((_, el) => {
      const alt = $(el).attr('alt')
      if (!alt || alt.trim() === '') imagesWithoutAlt++
    })

    // Liens internes / externes
    const urlDomain = (() => {
      try { return new URL(websiteUrl).hostname } catch { return '' }
    })()
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return
      try {
        const linkDomain = new URL(href, websiteUrl).hostname
        if (linkDomain === urlDomain) internalLinksCount++
        else externalLinksCount++
      } catch {
        if (href.startsWith('/')) internalLinksCount++
      }
    })

    // Word count (texte visible uniquement)
    $('script, style, nav, footer, header').remove()
    const visibleText = $.root().text().replace(/\s+/g, ' ').trim()
    wordCount = visibleText.split(/\s+/).filter(w => w.length > 0).length

    // JSON-LD Schema markup
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() ?? '{}')
        const schemas = Array.isArray(json) ? json : [json]
        schemas.forEach(s => {
          const type = s['@type']
          if (type) {
            const types = Array.isArray(type) ? type : [type]
            schemaTypes.push(...types)
          }
        })
      } catch { /* JSON invalide, ignorer */ }
    })
    hasSchema = schemaTypes.length > 0
    // Dédupliquer
    schemaTypes = [...new Set(schemaTypes)]
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

  // ── PageSpeed Insights API ────────────────────────────────────────────────
  let lighthouseScore = seoScore
  let fcpMs: number | null = null
  let lcpMs: number | null = null
  let clsScore: number | null = null
  let tbtMs: number | null = null
  let speedIndexMs: number | null = null
  let accessibilityScore: number | null = null
  let seoAuditScore: number | null = null
  let bestPracticesScore: number | null = null
  let opportunities: { id: string; title: string; displayValue: string; score: number }[] = []

  if (statusCode > 0) {
    try {
      const psUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
      psUrl.searchParams.set('url', websiteUrl)
      psUrl.searchParams.set('strategy', 'mobile')
      const psKey = process.env.PAGESPEED_API_KEY
      if (psKey) psUrl.searchParams.set('key', psKey)
      ;['performance', 'accessibility', 'best-practices', 'seo'].forEach(cat =>
        psUrl.searchParams.append('category', cat)
      )

      const psRes = await fetch(psUrl.toString(), { signal: AbortSignal.timeout(40000) })
      if (!psRes.ok) {
        const errText = await psRes.text().catch(() => '')
        console.error('[seo-audit] PageSpeed HTTP error:', psRes.status, errText.slice(0, 300))
      } else {
        const psData = await psRes.json()
        const audits = psData?.lighthouseResult?.audits
        const categories = psData?.lighthouseResult?.categories

        if (categories?.performance?.score != null)
          lighthouseScore = Math.round(categories.performance.score * 100)
        if (categories?.accessibility?.score != null)
          accessibilityScore = Math.round(categories.accessibility.score * 100)
        if (categories?.seo?.score != null)
          seoAuditScore = Math.round(categories.seo.score * 100)
        if (categories?.['best-practices']?.score != null)
          bestPracticesScore = Math.round(categories['best-practices'].score * 100)

        if (audits?.['first-contentful-paint']?.numericValue != null)
          fcpMs = Math.round(audits['first-contentful-paint'].numericValue)
        if (audits?.['largest-contentful-paint']?.numericValue != null)
          lcpMs = Math.round(audits['largest-contentful-paint'].numericValue)
        if (audits?.['cumulative-layout-shift']?.numericValue != null)
          clsScore = audits['cumulative-layout-shift'].numericValue
        if (audits?.['total-blocking-time']?.numericValue != null)
          tbtMs = Math.round(audits['total-blocking-time'].numericValue)
        if (audits?.['speed-index']?.numericValue != null)
          speedIndexMs = Math.round(audits['speed-index'].numericValue)

        mobileFriendly = audits?.['viewport']?.score === 1

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

  // ── Robots.txt et sitemap ─────────────────────────────────────────────────
  let hasRobotsTxt: boolean | null = null
  let hasSitemap: boolean | null = null

  try {
    const baseUrl = (() => {
      try { const u = new URL(websiteUrl); return `${u.protocol}//${u.hostname}` } catch { return websiteUrl }
    })()

    const [robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(`${baseUrl}/robots.txt`, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'BusinessRadar974/1.0' } }),
      fetch(`${baseUrl}/sitemap.xml`, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'BusinessRadar974/1.0' } }),
    ])

    if (robotsRes.status === 'fulfilled') {
      hasRobotsTxt = robotsRes.value.ok && robotsRes.value.status === 200
    }
    if (sitemapRes.status === 'fulfilled') {
      hasSitemap = sitemapRes.value.ok && sitemapRes.value.status === 200
    }
  } catch { /* ignorer */ }

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
    // Nouvelles colonnes on-page
    canonical_url: canonicalUrl,
    has_og_tags: hasOgTags,
    og_title: ogTitle,
    og_description: ogDescription,
    og_image: ogImage,
    h2_count: h2Count,
    h3_count: h3Count,
    images_without_alt: imagesWithoutAlt,
    total_images: totalImages,
    internal_links_count: internalLinksCount,
    external_links_count: externalLinksCount,
    word_count: wordCount,
    has_sitemap: hasSitemap,
    has_robots_txt: hasRobotsTxt,
    has_schema: hasSchema,
    schema_types: schemaTypes.length > 0 ? schemaTypes : null,
    title_length: title ? title.length : null,
    meta_description_length: metaDescription ? metaDescription.length : null,
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('seo_snapshots').insert(snapshot)
  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return snapshot
}
