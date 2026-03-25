import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils/formatters'
import { validateUrl } from '@/lib/utils/url-validator'

// Crée une organisation + business pour un nouveau client, et invite son utilisateur
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Vérifie que l'appelant est superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const {
    orgName,
    businessName,
    clientEmail,
    fullName,
    googlePlaceId,
    websiteUrl,
    instagramUsername,
    facebookPageId,
    metaAccessToken,
    lat,
    lng,
    instagramBusinessId,
    plan,
  } = await request.json()

  if (!orgName || !businessName) {
    return NextResponse.json({ error: 'orgName et businessName requis' }, { status: 400 })
  }

  if (websiteUrl) {
    const urlCheck = validateUrl(websiteUrl)
    if (!urlCheck.valid) return NextResponse.json({ error: urlCheck.error }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Crée l'organisation
  const { data: org, error: orgError } = await adminClient
    .from('organizations')
    .insert({
      name: orgName,
      slug: slugify(orgName),
      plan: plan === 'premium' ? 'premium' : 'standard',
      meta_access_token: metaAccessToken ?? null,
    })
    .select()
    .single()

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 })
  }

  // Crée le business principal
  const { data: business, error: bizError } = await adminClient
    .from('businesses')
    .insert({
      organization_id: org.id,
      name: businessName,
      google_place_id: googlePlaceId ?? null,
      website_url: websiteUrl ?? null,
      instagram_username: instagramUsername ?? null,
      facebook_page_id: facebookPageId ?? null,
      instagram_business_id: instagramBusinessId ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      is_competitor: false,
    })
    .select()
    .single()

  if (bizError) {
    return NextResponse.json({ error: bizError.message }, { status: 500 })
  }

  // Invite le client par email (optionnel)
  let invitedUser = null
  let inviteError = null

  if (clientEmail) {
    const profileFullName = fullName?.trim() || orgName

    const { data: invite, error: err } = await adminClient.auth.admin.inviteUserByEmail(
      clientEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: { full_name: profileFullName },
      }
    )

    if (err) {
      inviteError = err.message
    } else {
      invitedUser = invite.user

      // Lie l'utilisateur invité à l'organisation avec le rôle member
      if (invitedUser) {
        await adminClient
          .from('profiles')
          .upsert({
            id: invitedUser.id,
            organization_id: org.id,
            role: 'member',
            full_name: profileFullName,
          })
      }
    }
  }

  return NextResponse.json({
    organization: org,
    business,
    ...(clientEmail && {
      invite: inviteError
        ? { ok: false, error: inviteError }
        : { ok: true, email: clientEmail },
    }),
  })
}
