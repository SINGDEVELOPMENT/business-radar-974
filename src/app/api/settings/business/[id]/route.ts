import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getOrgId(userId: string) {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', userId)
    .single()
  return profile?.organization_id ?? null
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orgId = await getOrgId(user.id)
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

  const admin = createAdminClient()
  const { error } = await admin
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

  const orgId = await getOrgId(user.id)
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  const { id } = await params
  const admin = createAdminClient()

  const { error } = await admin
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('organization_id', orgId)
    .eq('is_competitor', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
