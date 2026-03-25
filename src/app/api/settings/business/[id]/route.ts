import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateUrl } from '@/lib/utils/url-validator'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  const orgId = profile?.organization_id ?? null
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  const { id } = await params
  const body = await request.json()
  const allowed = ['name', 'website_url', 'google_place_id', 'facebook_page_id', 'instagram_username']
  const updates: Record<string, string | null> = {}

  for (const key of allowed) {
    if (body[key] !== undefined) {
      updates[key] = body[key]?.trim() || null
    }
  }

  if (updates.website_url) {
    const urlCheck = validateUrl(updates.website_url)
    if (!urlCheck.valid) return NextResponse.json({ error: urlCheck.error }, { status: 400 })
  }

  const { error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', id)
    .eq('organization_id', orgId)
    .eq('is_competitor', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  const orgId = profile?.organization_id ?? null
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  const { id } = await params

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)
    .eq('is_competitor', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
