import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { collectGoogleReviews } from '@/lib/collectors/google-reviews'
import { collectSeoAudit } from '@/lib/collectors/seo-audit'

export const dynamic = 'force-dynamic'

const COOLDOWN_HOURS = 24

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  // Vérifier le délai de 24h
  const { data: org } = await admin
    .from('organizations')
    .select('last_manual_collect_at')
    .eq('id', orgId)
    .single()

  if (org?.last_manual_collect_at) {
    const lastAt = new Date(org.last_manual_collect_at)
    const nextAllowedAt = new Date(lastAt.getTime() + COOLDOWN_HOURS * 60 * 60 * 1000)
    if (new Date() < nextAllowedAt) {
      return NextResponse.json(
        { error: 'Collecte déjà effectuée', nextAllowedAt: nextAllowedAt.toISOString() },
        { status: 429 }
      )
    }
  }

  // Récupérer le business principal
  const { data: business } = await admin
    .from('businesses')
    .select('id, google_place_id, website_url, social_consent_given')
    .eq('organization_id', orgId)
    .eq('is_competitor', false)
    .single()

  if (!business) return NextResponse.json({ error: 'Business introuvable' }, { status: 400 })

  // Marquer la collecte comme lancée
  const now = new Date().toISOString()
  await admin
    .from('organizations')
    .update({ last_manual_collect_at: now })
    .eq('id', orgId)

  // Lancer les collectes en parallèle
  const tasks: Promise<unknown>[] = []

  if (business.google_place_id) {
    tasks.push(
      collectGoogleReviews(business.id, business.google_place_id).catch((e) =>
        console.error('[manual collect] google reviews:', e)
      )
    )
  }

  if (business.website_url) {
    tasks.push(
      collectSeoAudit(business.id, business.website_url).catch((e) =>
        console.error('[manual collect] seo audit:', e)
      )
    )
  }

  await Promise.all(tasks)

  const nextAllowedAt = new Date(new Date(now).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000)

  return NextResponse.json({ ok: true, nextAllowedAt: nextAllowedAt.toISOString() })
}
