import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils/formatters'

// Crée une organisation + business pour un nouveau client
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
    googlePlaceId,
    websiteUrl,
    instagramUsername,
    facebookPageId,
  } = await request.json()

  if (!orgName || !businessName) {
    return NextResponse.json({ error: 'orgName et businessName requis' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Crée l'organisation
  const { data: org, error: orgError } = await adminClient
    .from('organizations')
    .insert({ name: orgName, slug: slugify(orgName) })
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
      is_competitor: false,
    })
    .select()
    .single()

  if (bizError) {
    return NextResponse.json({ error: bizError.message }, { status: 500 })
  }

  return NextResponse.json({ organization: org, business })
}
