import { createAdminClient } from '@/lib/supabase/admin'

interface GraphPost {
  id: string
  message?: string
  created_time: string
  likes?: { summary: { total_count: number } }
  comments?: { summary: { total_count: number } }
  shares?: { count: number }
}

export async function collectFacebookPosts(businessId: string, pageId: string, accessToken: string) {
  const url = new URL(`https://graph.facebook.com/v19.0/${pageId}/posts`)
  url.searchParams.set('fields', 'id,message,created_time,likes.summary(true),comments.summary(true),shares')
  url.searchParams.set('limit', '25')
  url.searchParams.set('access_token', accessToken)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Meta Graph API error: ${res.status}`)

  const data = await res.json()
  const posts: GraphPost[] = data.data ?? []

  const supabase = createAdminClient()

  const rows = posts.map((p) => ({
    business_id: businessId,
    platform: 'facebook' as const,
    post_id: p.id,
    content: p.message ?? null,
    likes: p.likes?.summary?.total_count ?? 0,
    comments: p.comments?.summary?.total_count ?? 0,
    shares: p.shares?.count ?? 0,
    published_at: p.created_time,
  }))

  if (rows.length === 0) return { inserted: 0 }

  const { error } = await supabase.from('social_posts').upsert(rows, {
    onConflict: 'business_id,post_id',
    ignoreDuplicates: true,
  })

  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return { inserted: rows.length }
}
