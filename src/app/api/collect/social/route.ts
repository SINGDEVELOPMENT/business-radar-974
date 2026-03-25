import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectFacebookPosts } from '@/lib/collectors/facebook'
import { collectInstagramPosts } from '@/lib/collectors/instagram'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Look up user's organization
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 })

  const { businessId, platform, pageId } = await request.json()
  if (!businessId || !platform || !pageId) {
    return NextResponse.json({ error: 'businessId, platform et pageId requis' }, { status: 400 })
  }

  // Verify business belongs to user's org
  const { data: business } = await supabase.from('businesses').select('id').eq('id', businessId).eq('organization_id', profile.organization_id).single()
  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Look up Meta access token from organization
  const { data: org } = await supabase.from('organizations').select('meta_access_token').eq('id', profile.organization_id).single()
  if (!org?.meta_access_token) return NextResponse.json({ error: 'Meta access token not configured' }, { status: 400 })
  const accessToken = org.meta_access_token

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
