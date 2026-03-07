import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id
  if (!orgId) return new Response('Organisation introuvable', { status: 400 })

  const [{ data: org }, { data: business }] = await Promise.all([
    admin.from('organizations').select('name').eq('id', orgId).single(),
    admin.from('businesses').select('id, name, google_rating, google_reviews_count, website_url')
      .eq('organization_id', orgId).eq('is_competitor', false).limit(1).single(),
  ])

  const wb = XLSX.utils.book_new()

  // ── Feuille 0 : Vue d'ensemble ──
  if (business) {
    const [{ data: reviews }, { data: seo }, { data: competitors }, { data: lastReport }] = await Promise.all([
      admin.from('reviews').select('rating').eq('business_id', business.id),
      admin.from('seo_snapshots').select('lighthouse_score, accessibility_score, seo_audit_score, load_time_ms')
        .eq('business_id', business.id).order('collected_at', { ascending: false }).limit(1).single(),
      admin.from('businesses').select('name, google_rating').eq('organization_id', orgId).eq('is_competitor', true),
      admin.from('ai_reports').select('summary, generated_at').eq('organization_id', orgId)
        .order('generated_at', { ascending: false }).limit(1).single(),
    ])

    const avgRating = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length).toFixed(2)
      : 'N/A'
    const fiveStars = reviews ? reviews.filter(r => r.rating === 5).length : 0
    const lowStars = reviews ? reviews.filter(r => r.rating <= 2).length : 0

    const overviewRows = [
      { 'Indicateur': 'Établissement', 'Valeur': business.name },
      { 'Indicateur': 'Note Google actuelle', 'Valeur': business.google_rating ?? 'N/A' },
      { 'Indicateur': 'Nombre total d\'avis', 'Valeur': business.google_reviews_count ?? reviews?.length ?? 0 },
      { 'Indicateur': 'Note moyenne (historique)', 'Valeur': avgRating },
      { 'Indicateur': 'Avis 5 étoiles', 'Valeur': fiveStars },
      { 'Indicateur': 'Avis ≤ 2 étoiles', 'Valeur': lowStars },
      { 'Indicateur': '' , 'Valeur': '' },
      { 'Indicateur': 'Score Performance SEO', 'Valeur': seo?.lighthouse_score ?? 'N/A' },
      { 'Indicateur': 'Score Accessibilité', 'Valeur': seo?.accessibility_score ?? 'N/A' },
      { 'Indicateur': 'Score SEO (audit)', 'Valeur': seo?.seo_audit_score ?? 'N/A' },
      { 'Indicateur': 'Temps de chargement (ms)', 'Valeur': seo?.load_time_ms ?? 'N/A' },
      { 'Indicateur': '' , 'Valeur': '' },
      { 'Indicateur': 'Nombre de concurrents suivis', 'Valeur': competitors?.length ?? 0 },
      ...(competitors ?? []).map(c => ({ 'Indicateur': `Concurrent : ${c.name}`, 'Valeur': `${c.google_rating ?? 'N/A'}/5` })),
      { 'Indicateur': '' , 'Valeur': '' },
      { 'Indicateur': 'Dernier rapport IA', 'Valeur': lastReport?.generated_at ? new Date(lastReport.generated_at).toLocaleDateString('fr-FR') : 'Aucun' },
      { 'Indicateur': 'Synthèse IA', 'Valeur': lastReport?.summary ?? '' },
      { 'Indicateur': '' , 'Valeur': '' },
      { 'Indicateur': 'Export généré le', 'Valeur': new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) },
    ]

    const ws0 = XLSX.utils.json_to_sheet(overviewRows)
    ws0['!cols'] = [{ wch: 35 }, { wch: 60 }]
    XLSX.utils.book_append_sheet(wb, ws0, 'Vue d\'ensemble')
  }

  // ── Feuille 1 : Avis clients ──
  if (business) {
    const { data: reviews } = await admin
      .from('reviews')
      .select('author_name, rating, text, published_at, source, collected_at')
      .eq('business_id', business.id)
      .order('published_at', { ascending: false })
      .limit(500)

    const reviewRows = (reviews ?? []).map(r => ({
      'Auteur': r.author_name ?? '',
      'Note': r.rating,
      'Étoiles': '★'.repeat(r.rating ?? 0) + '☆'.repeat(5 - (r.rating ?? 0)),
      'Commentaire': r.text ?? '',
      'Date publication': r.published_at ? new Date(r.published_at).toLocaleDateString('fr-FR') : '',
      'Source': r.source ?? 'google',
      'Collecté le': r.collected_at ? new Date(r.collected_at).toLocaleDateString('fr-FR') : '',
    }))

    const ws1 = XLSX.utils.json_to_sheet(reviewRows)
    ws1['!cols'] = [{ wch: 22 }, { wch: 8 }, { wch: 12 }, { wch: 60 }, { wch: 16 }, { wch: 12 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Avis clients')
  }

  // ── Feuille 2 : Historique SEO ──
  if (business) {
    const { data: seo } = await admin
      .from('seo_snapshots')
      .select('collected_at, lighthouse_score, accessibility_score, seo_audit_score, best_practices_score, load_time_ms, has_ssl, mobile_friendly, page_size_kb, h1_count, h2_count, h3_count, word_count, has_schema, has_og_tags, has_sitemap, has_robots_txt, images_without_alt, total_images, internal_links_count, external_links_count')
      .eq('business_id', business.id)
      .order('collected_at', { ascending: false })
      .limit(90)

    const seoRows = (seo ?? []).map(s => ({
      'Date': s.collected_at ? new Date(s.collected_at).toLocaleDateString('fr-FR') : '',
      'Score Performance': s.lighthouse_score ?? '',
      'Score Accessibilité': s.accessibility_score ?? '',
      'Score SEO': s.seo_audit_score ?? '',
      'Bonnes pratiques': s.best_practices_score ?? '',
      'Temps chargement (ms)': s.load_time_ms ?? '',
      'SSL': s.has_ssl ? 'Oui' : 'Non',
      'Mobile Friendly': s.mobile_friendly ? 'Oui' : 'Non',
      'Taille page (KB)': s.page_size_kb ?? '',
      'H1': s.h1_count ?? '',
      'H2': s.h2_count ?? '',
      'H3': s.h3_count ?? '',
      'Mots': s.word_count ?? '',
      'Schema markup': s.has_schema ? 'Oui' : 'Non',
      'Open Graph': s.has_og_tags ? 'Oui' : 'Non',
      'Sitemap': s.has_sitemap ? 'Oui' : 'Non',
      'Robots.txt': s.has_robots_txt ? 'Oui' : 'Non',
      'Images sans alt': s.images_without_alt ?? '',
      'Total images': s.total_images ?? '',
      'Liens internes': s.internal_links_count ?? '',
      'Liens externes': s.external_links_count ?? '',
    }))

    const ws2 = XLSX.utils.json_to_sheet(seoRows)
    ws2['!cols'] = Array(21).fill({ wch: 18 })
    XLSX.utils.book_append_sheet(wb, ws2, 'Audit SEO')
  }

  // ── Feuille 3 : Posts réseaux sociaux ──
  if (business) {
    const { data: posts } = await admin
      .from('social_posts')
      .select('platform, content, likes, comments, shares, published_at, collected_at')
      .eq('business_id', business.id)
      .order('published_at', { ascending: false })
      .limit(200)

    if ((posts ?? []).length > 0) {
      const postRows = (posts ?? []).map(p => ({
        'Plateforme': p.platform,
        'Contenu': (p.content ?? '').slice(0, 200),
        'Likes': p.likes ?? 0,
        'Commentaires': p.comments ?? 0,
        'Partages': p.shares ?? 0,
        'Engagement total': (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
        'Date publication': p.published_at ? new Date(p.published_at).toLocaleDateString('fr-FR') : '',
        'Collecté le': p.collected_at ? new Date(p.collected_at).toLocaleDateString('fr-FR') : '',
      }))

      const ws_social = XLSX.utils.json_to_sheet(postRows)
      ws_social['!cols'] = [{ wch: 14 }, { wch: 50 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 14 }]
      XLSX.utils.book_append_sheet(wb, ws_social, 'Réseaux sociaux')
    }
  }

  // ── Feuille 4 : Concurrents ──
  const { data: competitors } = await admin
    .from('businesses')
    .select('name, google_rating, google_reviews_count, website_url, created_at')
    .eq('organization_id', orgId)
    .eq('is_competitor', true)
    .order('google_rating', { ascending: false })

  if ((competitors ?? []).length > 0) {
    const compRows = (competitors ?? []).map(c => ({
      'Nom': c.name,
      'Note Google': c.google_rating ?? '',
      'Nb avis': c.google_reviews_count ?? '',
      'Site web': c.website_url ?? '',
      'Ajouté le': c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '',
    }))

    const ws3 = XLSX.utils.json_to_sheet(compRows)
    ws3['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Concurrents')
  }

  // ── Feuille 5 : Rapports IA ──
  const { data: reports } = await admin
    .from('ai_reports')
    .select('report_type, summary, generated_at, content')
    .eq('organization_id', orgId)
    .order('generated_at', { ascending: false })
    .limit(12)

  if ((reports ?? []).length > 0) {
    const reportRows = (reports ?? []).map(r => {
      const content = r.content as { score_global?: number; strengths?: string[]; weaknesses?: string[] } | null
      return {
        'Type': r.report_type === 'monthly' ? 'Mensuel' : r.report_type === 'weekly' ? 'Hebdomadaire' : 'Alerte',
        'Date': r.generated_at ? new Date(r.generated_at).toLocaleDateString('fr-FR') : '',
        'Synthèse': r.summary ?? '',
        'Score global': content?.score_global ?? '',
        'Points forts': content?.strengths?.join(' | ') ?? '',
        'Axes d\'amélioration': content?.weaknesses?.join(' | ') ?? '',
      }
    })

    const ws5 = XLSX.utils.json_to_sheet(reportRows)
    ws5['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 60 }, { wch: 14 }, { wch: 50 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(wb, ws5, 'Rapports IA')
  }

  const orgName = org?.name ?? 'export'
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `business-radar-${orgName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.xlsx`

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
