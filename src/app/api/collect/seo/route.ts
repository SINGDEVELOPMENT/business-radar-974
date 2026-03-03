import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectSeoAudit } from '@/lib/collectors/seo-audit'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, websiteUrl } = await request.json()
  if (!businessId || !websiteUrl) {
    return NextResponse.json({ error: 'businessId et websiteUrl requis' }, { status: 400 })
  }

  try {
    const result = await collectSeoAudit(businessId, websiteUrl)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
