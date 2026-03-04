import * as cheerio from 'cheerio'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeSeoScore } from '@/lib/utils/seo'

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

  if (html) {
    const $ = cheerio.load(html)
    title = $('title').first().text().trim()
    metaDescription = $('meta[name="description"]').attr('content') ?? ''
    h1Count = $('h1').length
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

  // PageSpeed Insights API (gratuit, vrai score Lighthouse)
  let lighthouseScore = seoScore
  let mobileFriendly: boolean | null = null
  const psKey = process.env.GOOGLE_PLACES_API_KEY
  if (psKey && statusCode > 0) {
    try {
      const psUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
      psUrl.searchParams.set('url', websiteUrl)
      psUrl.searchParams.set('strategy', 'mobile')
      psUrl.searchParams.set('key', psKey)
      const psRes = await fetch(psUrl.toString(), { signal: AbortSignal.timeout(15000) })
      if (psRes.ok) {
        const psData = await psRes.json()
        const lhScore = psData?.lighthouseResult?.categories?.performance?.score
        if (lhScore != null) lighthouseScore = Math.round(lhScore * 100)
        mobileFriendly = psData?.lighthouseResult?.audits?.['viewport']?.score === 1
      }
    } catch {
      // PageSpeed timeout ou erreur — on garde le score calculé localement
    }
  }

  const snapshot = {
    business_id: businessId,
    url: websiteUrl,
    ...partial,
    page_size_kb: pageSizeKb,
    mobile_friendly: mobileFriendly,
    lighthouse_score: lighthouseScore,
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('seo_snapshots').insert(snapshot)
  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return snapshot
}
