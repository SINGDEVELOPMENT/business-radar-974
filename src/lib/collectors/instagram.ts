import { createAdminClient } from '@/lib/supabase/admin'

interface IgMedia {
  id: string
  caption?: string
  timestamp: string
  like_count?: number
  comments_count?: number
}

export async function collectInstagramPosts(businessId: string, igUserId: string, accessToken: string) {
  const url = new URL(`https://graph.facebook.com/v19.0/${igUserId}/media`)
  url.searchParams.set('fields', 'id,caption,timestamp,like_count,comments_count')
  url.searchParams.set('limit', '25')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Meta Graph API (Instagram) error: ${res.status}`)

  const data = await res.json()
  const media: IgMedia[] = data.data ?? []

  const supabase = createAdminClient()

  const rows = media.map((m) => ({
    business_id: businessId,
    platform: 'instagram' as const,
    post_id: m.id,
    content: m.caption ?? null,
    likes: m.like_count ?? 0,
    comments: m.comments_count ?? 0,
    shares: 0,
    published_at: m.timestamp,
  }))

  if (rows.length === 0) return { inserted: 0 }

  const { error } = await supabase.from('social_posts').upsert(rows, {
    onConflict: 'business_id,post_id',
    ignoreDuplicates: true,
  })

  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return { inserted: rows.length }
}
