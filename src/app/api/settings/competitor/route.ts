import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUrl } from '@/lib/utils/url-validator'

// Limite dynamique selon le plan — récupérée depuis la DB

export async function POST(request: NextRequest) {
  // Auth via cookie (lecture seule du JWT)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  // Limite selon le plan
  const { data: orgData } = await supabase.from('organizations').select('plan').eq('id', orgId).single()
  const FREE_LIMIT = orgData?.plan === 'premium' ? 5 : 2

  const { name, googlePlaceId, websiteUrl } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  if (websiteUrl) {
    const urlCheck = validateUrl(websiteUrl)
    if (!urlCheck.valid) return NextResponse.json({ error: urlCheck.error }, { status: 400 })
  }

  // Si Place ID fourni → vérifier si déjà présent
  if (googlePlaceId) {
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('organization_id', orgId)
      .eq('google_place_id', googlePlaceId)
      .eq('is_competitor', true)
      .maybeSingle()

    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from('businesses')
        .update({ custom_competitor: true, name: name.trim(), website_url: websiteUrl || null })
        .eq('id', existing.id)
        .select()
        .single()
      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

      return NextResponse.json({ ok: true, competitor: updated })
    }
  }

  // Vérifier la limite
  const { count } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('is_competitor', true)

  if ((count ?? 0) >= FREE_LIMIT) {
    return NextResponse.json(
      { error: 'Limite atteinte', upgrade: true, limit: FREE_LIMIT },
      { status: 403 }
    )
  }

  const { data, error } = await supabase
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


  return NextResponse.json({ ok: true, competitor: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })

  // Supprimer uniquement si appartient à l'org du user
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)
    .eq('is_competitor', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })


  return NextResponse.json({ ok: true })
}
