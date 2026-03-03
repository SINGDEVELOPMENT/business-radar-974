import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectFacebookPosts } from '@/lib/collectors/facebook'
import { collectInstagramPosts } from '@/lib/collectors/instagram'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, platform, pageId, accessToken } = await request.json()
  if (!businessId || !platform || !pageId || !accessToken) {
    return NextResponse.json({ error: 'businessId, platform, pageId et accessToken requis' }, { status: 400 })
  }

  try {
    const result =
      platform === 'facebook'
        ? await collectFacebookPosts(businessId, pageId, accessToken)
        : await collectInstagramPosts(businessId, pageId, accessToken)

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
