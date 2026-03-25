import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectCompetitorSeo } from '@/lib/collectors/competitors'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Look up user's organization
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 403 })

  const { businessId, websiteUrl } = await request.json()
  if (!businessId || !websiteUrl) {
    return NextResponse.json({ error: 'businessId et websiteUrl requis' }, { status: 400 })
  }

  // Verify business belongs to user's org
  const { data: business } = await supabase.from('businesses').select('id').eq('id', businessId).eq('organization_id', profile.organization_id).single()
  if (!business) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await collectCompetitorSeo(businessId, websiteUrl)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
