import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { businessId, consent } = await request.json() as { businessId: string; consent: boolean }
  if (!businessId || typeof consent !== 'boolean') {
    return NextResponse.json({ error: 'businessId et consent requis' }, { status: 400 })
  }

  // Vérifier que le business appartient bien à l'organisation de l'utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('businesses')
    .update({
      social_consent_given: consent,
      social_consent_date: new Date().toISOString(),
    })
    .eq('id', businessId)
    .eq('organization_id', profile?.organization_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, consent, updatedAt: new Date().toISOString() })
}
