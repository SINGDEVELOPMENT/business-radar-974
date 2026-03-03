import * as cheerio from 'cheerio'
import { createAdminClient } from '@/lib/supabase/admin'

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

  let title = ''
  let metaDescription = ''
  let h1Count = 0

  if (html) {
    const $ = cheerio.load(html)
    title = $('title').first().text().trim()
    metaDescription = $('meta[name="description"]').attr('content') ?? ''
    h1Count = $('h1').length
  }

  const snapshot = {
    business_id: businessId,
    url: websiteUrl,
    status_code: statusCode,
    load_time_ms: loadTimeMs,
    title: title || null,
    meta_description: metaDescription || null,
    h1_count: h1Count,
    has_ssl: hasSSL,
    mobile_friendly: null, // à enrichir avec PageSpeed API (V2)
    lighthouse_score: null,
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('seo_snapshots').insert(snapshot)
  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return snapshot
}
