import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const {
    businessId,
    googlePlaceId,
    websiteUrl,
    facebookPageId,
    instagramUsername,
    instagramBusinessId,
    metaAccessToken,
    lat,
    lng,
    orgId,
    apiKeyClaude,
  } = await request.json()

  if (!businessId) return NextResponse.json({ error: 'businessId requis' }, { status: 400 })

  const adminClient = createAdminClient()

  const { error: bizError } = await adminClient
    .from('businesses')
    .update({
      google_place_id: googlePlaceId || null,
      website_url: websiteUrl || null,
      facebook_page_id: facebookPageId || null,
      instagram_username: instagramUsername || null,
      instagram_business_id: instagramBusinessId || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
    })
    .eq('id', businessId)

  if (bizError) return NextResponse.json({ error: bizError.message }, { status: 500 })

  if (orgId) {
    const orgUpdate: Record<string, string | null> = {}
    if (metaAccessToken !== undefined) orgUpdate.meta_access_token = metaAccessToken || null
    if (apiKeyClaude !== undefined) orgUpdate.api_key_claude = apiKeyClaude || null

    if (Object.keys(orgUpdate).length > 0) {
      await adminClient.from('organizations').update(orgUpdate).eq('id', orgId)
    }
  }

  return NextResponse.json({ ok: true })
}
