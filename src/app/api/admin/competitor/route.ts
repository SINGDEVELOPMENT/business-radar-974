import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orgId, name, googlePlaceId, websiteUrl } = await request.json()
  if (!orgId || !name?.trim()) {
    return NextResponse.json({ error: 'orgId et nom requis' }, { status: 400 })
  }

  // Si Place ID fourni → vérifier si déjà présent
  if (googlePlaceId) {
    const { data: existing } = await admin
      .from('businesses')
      .select('id')
      .eq('organization_id', orgId)
      .eq('google_place_id', googlePlaceId)
      .eq('is_competitor', true)
      .maybeSingle()

    if (existing) {
      const { data: updated, error: updateErr } = await admin
        .from('businesses')
        .update({ custom_competitor: true, name: name.trim(), website_url: websiteUrl || null })
        .eq('id', existing.id)
        .select()
        .single()
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  
      return NextResponse.json({ ok: true, competitor: updated })
    }
  }

  const { data, error } = await admin
    .from('businesses')
    .insert({
      organization_id: orgId,
      name: name.trim(),
      google_place_id: googlePlaceId || null,
      website_url: websiteUrl || null,
      is_competitor: true,
      custom_competitor: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/dashboard/competitors')
  return NextResponse.json({ ok: true, competitor: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  const { error } = await admin
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('is_competitor', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/dashboard/competitors')
  return NextResponse.json({ ok: true })
}
