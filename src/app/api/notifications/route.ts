import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export interface AppNotification {
  id: string
  type: 'negative_review' | 'new_report' | 'new_competitor'
  title: string
  message: string
  date: string
}

export async function GET() {
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
  if (!orgId) return NextResponse.json({ items: [] })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Récupérer le business principal de l'org
  const { data: business } = await admin
    .from('businesses')
    .select('id, name')
    .eq('organization_id', orgId)
    .eq('is_competitor', false)
    .limit(1)
    .single()

  const [reviewsRes, reportsRes] = await Promise.all([
    // Avis négatifs récents (note <= 2)
    business
      ? admin
          .from('reviews')
          .select('id, author_name, rating, published_at')
          .eq('business_id', business.id)
          .lte('rating', 2)
          .gte('published_at', sevenDaysAgo)
          .order('published_at', { ascending: false })
      : Promise.resolve({ data: [] }),

    // Nouveaux rapports AI
    admin
      .from('ai_reports')
      .select('id, report_type, generated_at, summary')
      .eq('organization_id', orgId)
      .gte('generated_at', sevenDaysAgo)
      .order('generated_at', { ascending: false }),
  ])

  const items: AppNotification[] = []

  // Rapports AI
  for (const report of reportsRes.data ?? []) {
    const label = report.report_type === 'monthly' ? 'mensuel' : report.report_type === 'weekly' ? 'hebdomadaire' : "d'alerte"
    items.push({
      id: `report-${report.id}`,
      type: 'new_report',
      title: `Nouveau rapport ${label}`,
      message: report.summary
        ? report.summary.slice(0, 100) + (report.summary.length > 100 ? '…' : '')
        : 'Votre analyse AI est prête.',
      date: report.generated_at,
    })
  }

  // Avis négatifs
  for (const review of reviewsRes.data ?? []) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)
    items.push({
      id: `review-${review.id}`,
      type: 'negative_review',
      title: 'Avis négatif reçu',
      message: `${review.author_name ?? 'Anonyme'} — ${stars} (${review.rating}/5)`,
      date: review.published_at ?? new Date().toISOString(),
    })
  }

  // Trier par date décroissante
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({ items })
}
