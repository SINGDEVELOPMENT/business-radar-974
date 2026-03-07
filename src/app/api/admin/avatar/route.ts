import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const BUCKET = 'org-avatars'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const orgId = formData.get('orgId') as string | null

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  if (!orgId) return NextResponse.json({ error: 'orgId manquant' }, { status: 400 })
  if (file.size > 500_000) return NextResponse.json({ error: 'Fichier trop volumineux (max 500 Ko)' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const bytes = await file.arrayBuffer()
  const path = `${orgId}.${ext}`

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path)

  await admin.from('organizations').update({ avatar_url: publicUrl }).eq('id', orgId)

  return NextResponse.json({ ok: true, url: publicUrl })
}
