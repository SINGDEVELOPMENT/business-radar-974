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

  const snapshot = {
    business_id: businessId,
    url: websiteUrl,
    ...partial,
    page_size_kb: pageSizeKb,
    mobile_friendly: null, // enrichi avec PageSpeed API en V2
    lighthouse_score: seoScore,
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('seo_snapshots').insert(snapshot)
  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return snapshot
}
