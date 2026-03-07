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
    businessName,
    googlePlaceId,
    websiteUrl,
    facebookPageId,
    instagramUsername,
    instagramBusinessId,
    metaAccessToken,
    lat,
    lng,
    orgId,
    orgName,
    apiKeyClaude,
    plan,
    fullName,
    clientUserId,
  } = await request.json()

  if (!businessId) return NextResponse.json({ error: 'businessId requis' }, { status: 400 })

  const adminClient = createAdminClient()

  // Mise à jour du business
  const bizUpdate: Record<string, unknown> = {
    google_place_id: googlePlaceId || null,
    website_url: websiteUrl || null,
    facebook_page_id: facebookPageId || null,
    instagram_username: instagramUsername || null,
    instagram_business_id: instagramBusinessId || null,
    lat: lat ? parseFloat(lat) : null,
    lng: lng ? parseFloat(lng) : null,
  }
  if (businessName?.trim()) bizUpdate.name = businessName.trim()

  const { error: bizError } = await adminClient.from('businesses').update(bizUpdate).eq('id', businessId)
  if (bizError) return NextResponse.json({ error: bizError.message }, { status: 500 })

  // Mise à jour de l'organisation
  if (orgId) {
    const orgUpdate: Record<string, string | null> = {}
    if (metaAccessToken !== undefined) orgUpdate.meta_access_token = metaAccessToken || null
    if (apiKeyClaude !== undefined) orgUpdate.api_key_claude = apiKeyClaude || null
    if (plan === 'premium' || plan === 'standard') orgUpdate.plan = plan
    if (orgName?.trim()) orgUpdate.name = orgName.trim()

    if (Object.keys(orgUpdate).length > 0) {
      await adminClient.from('organizations').update(orgUpdate).eq('id', orgId)
    }
  }

  // Mise à jour du profil client (nom complet)
  if (clientUserId && fullName !== undefined) {
    await adminClient.from('profiles').update({ full_name: fullName.trim() || null }).eq('id', clientUserId)
  }

  return NextResponse.json({ ok: true })
}
