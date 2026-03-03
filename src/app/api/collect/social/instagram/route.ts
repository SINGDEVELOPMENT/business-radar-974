import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectInstagramPosts } from '@/lib/collectors/instagram'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, igUserId, accessToken } = await request.json()
  if (!businessId || !igUserId || !accessToken) {
    return NextResponse.json(
      { error: 'businessId, igUserId et accessToken requis' },
      { status: 400 },
    )
  }

  try {
    const result = await collectInstagramPosts(businessId, igUserId, accessToken)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
