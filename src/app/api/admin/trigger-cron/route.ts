import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60 // Vercel Pro : attend la réponse du CRON complet

// Déclenche le CRON manuellement — superadmin uniquement
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const cronUrl = `${appUrl}/api/cron/daily`

  try {
    const cronRes = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'x-force-weekly': 'true',
      },
      signal: AbortSignal.timeout(58000),
    })
    const cronData = await cronRes.json().catch(() => ({}))
    return NextResponse.json({ ok: true, cron: cronData })
  } catch (err) {
    console.error('[trigger-cron] fetch error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
