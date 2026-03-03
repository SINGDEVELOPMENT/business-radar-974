import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeMonthly } from '@/lib/ai/analyze'
import { BusinessData } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { organizationId, data }: { organizationId: string; data: BusinessData } =
    await request.json()

  if (!organizationId || !data) {
    return NextResponse.json({ error: 'organizationId et data requis' }, { status: 400 })
  }

  // Récupère la clé API Claude du client si elle existe
  const { data: org } = await supabase
    .from('organizations')
    .select('api_key_claude')
    .eq('id', organizationId)
    .single()

  try {
    const report = await analyzeMonthly(organizationId, data, org?.api_key_claude ?? undefined)
    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
