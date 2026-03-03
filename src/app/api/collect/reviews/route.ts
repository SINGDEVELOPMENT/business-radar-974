import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, placeId } = await request.json()
  if (!businessId || !placeId) {
    return NextResponse.json({ error: 'businessId et placeId requis' }, { status: 400 })
  }

  try {
    const result = await collectGoogleReviews(businessId, placeId)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
