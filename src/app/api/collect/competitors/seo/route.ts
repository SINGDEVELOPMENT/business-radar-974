import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectCompetitorSeo } from '@/lib/collectors/competitors'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, websiteUrl } = await request.json()
  if (!businessId || !websiteUrl) {
    return NextResponse.json({ error: 'businessId et websiteUrl requis' }, { status: 400 })
  }

  try {
    await collectCompetitorSeo(businessId, websiteUrl)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
