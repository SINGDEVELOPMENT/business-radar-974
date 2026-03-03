import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectCompetitors } from '@/lib/collectors/competitors'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, lat, lng, type, radius } = await request.json()
  if (!organizationId || !lat || !lng || !type) {
    return NextResponse.json({ error: 'organizationId, lat, lng et type requis' }, { status: 400 })
  }

  try {
    const result = await collectCompetitors(organizationId, lat, lng, type, radius)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
