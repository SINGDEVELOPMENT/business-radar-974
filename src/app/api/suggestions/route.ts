import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// ── GET — fetch suggestions for the user's org ─────────────────────────────
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ suggestions: [] })

  const admin = createAdminClient()
  const { data: suggestions, error } = await admin
    .from('content_suggestions')
    .select('*')
    .eq('organization_id', orgId)
    .order('generated_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('GET /api/suggestions error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ suggestions: suggestions ?? [] })
}

// ── PATCH — update suggestion status ──────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ error: 'Aucune organisation associée' }, { status: 400 })

  let body: { id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { id, status } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id et status sont requis' }, { status: 400 })
  }

  const validStatuses = ['pending', 'used', 'dismissed']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}` }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify the suggestion belongs to the org before updating
  const { data: existing, error: fetchError } = await admin
    .from('content_suggestions')
    .select('id, organization_id')
    .eq('id', id)
    .eq('organization_id', orgId)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Suggestion introuvable' }, { status: 404 })
  }

  const { data: updated, error: updateError } = await admin
    .from('content_suggestions')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ suggestion: updated })
}
