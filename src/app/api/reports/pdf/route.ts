import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PDFDocument from 'pdfkit'
import type { AiReportContent, AiRecommendation } from '@/types'

export const dynamic = 'force-dynamic'

const BLUE = '#2563eb'
const GRAY = '#6b7280'
const DARK = '#111827'
const GREEN = '#16a34a'
const RED = '#dc2626'
const AMBER = '#d97706'
const PAGE_WIDTH = 595 - 100 // A4 width - margins
const BOTTOM_MARGIN = 750   // y threshold avant nouvelle page

function addPageBreakIfNeeded(doc: PDFKit.PDFDocument) {
  if (doc.y > BOTTOM_MARGIN) {
    doc.addPage()
    doc.moveDown(0.5)
  }
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string, color: string) {
  addPageBreakIfNeeded(doc)
  doc.fontSize(13).fillColor(color).text(title)
  doc.moveDown(0.3)
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
  if (!orgId) return NextResponse.json({ error: 'Organisation introuvable' }, { status: 400 })

  const [{ data: org }, { data: report }, { data: business }] = await Promise.all([
    admin.from('organizations').select('name').eq('id', orgId).single(),
    admin.from('ai_reports').select('*').eq('organization_id', orgId)
      .order('generated_at', { ascending: false }).limit(1).single(),
    admin.from('businesses').select('id, name, google_rating, google_reviews_count, website_url')
      .eq('organization_id', orgId).eq('is_competitor', false).limit(1).single(),
  ])

  if (!report) return NextResponse.json({ error: 'Aucun rapport disponible' }, { status: 404 })

  // Récupère les dernières données SEO et concurrents pour enrichir le PDF
  const [{ data: lastSeo }, { data: competitors }, { data: reviews }] = await Promise.all([
    business
      ? admin.from('seo_snapshots').select('lighthouse_score, accessibility_score, seo_audit_score, load_time_ms, has_ssl, mobile_friendly')
          .eq('business_id', business.id).order('collected_at', { ascending: false }).limit(1).single()
      : Promise.resolve({ data: null }),
    admin.from('businesses').select('name, google_rating, google_reviews_count').eq('organization_id', orgId)
      .eq('is_competitor', true).order('google_rating', { ascending: false }),
    business
      ? admin.from('reviews').select('rating').eq('business_id', business.id)
      : Promise.resolve({ data: null }),
  ])

  const content = report.content as AiReportContent
  const orgName = org?.name ?? 'Mon établissement'
  const reportDate = new Date(report.generated_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Statistiques rapides
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : null

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    let pageNumber = 1

    // Numérotation de page sur chaque nouvelle page
    doc.on('pageAdded', () => {
      pageNumber++
      const y = doc.page.height - 40
      doc
        .fontSize(8)
        .fillColor(GRAY)
        .text(`Business Radar 974  •  Page ${pageNumber}`, 50, y, { align: 'center', width: PAGE_WIDTH })
    })

    // ── En-tête ──
    doc.fontSize(22).fillColor(BLUE).text('Business Radar 974', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(14).fillColor(DARK).text(orgName, { align: 'center' })
    doc.moveDown(0.2)
    doc.fontSize(10).fillColor(GRAY).text(`Rapport du ${reportDate}`, { align: 'center' })
    doc.moveDown(1)

    // Ligne séparatrice
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke()
    doc.moveDown(1)

    // ── Score global ──
    if (content.score_global != null) {
      const scoreColor = content.score_global >= 75 ? GREEN : content.score_global >= 50 ? AMBER : RED
      doc.fontSize(11).fillColor(GRAY).text('Score global', { continued: false })
      doc.fontSize(28).fillColor(scoreColor).text(`${content.score_global}/100`)
      doc.moveDown(1)
    }

    // ── Statistiques business ──
    addSectionTitle(doc, 'Chiffres clés', DARK)
    const stats: [string, string][] = []
    if (business?.google_rating) stats.push(['Note Google', `${business.google_rating}/5`])
    if (business?.google_reviews_count) stats.push(['Nombre d\'avis', `${business.google_reviews_count}`])
    if (avgRating) stats.push(['Note moyenne historique', `${avgRating}/5`])
    if (lastSeo?.lighthouse_score != null) stats.push(['Score performance SEO', `${lastSeo.lighthouse_score}/100`])
    if (lastSeo?.load_time_ms != null) stats.push(['Temps de chargement', `${lastSeo.load_time_ms} ms`])
    if (lastSeo?.has_ssl != null) stats.push(['SSL', lastSeo.has_ssl ? 'Oui' : 'Non'])
    if (lastSeo?.mobile_friendly != null) stats.push(['Mobile Friendly', lastSeo.mobile_friendly ? 'Oui' : 'Non'])
    if (competitors && competitors.length > 0) stats.push(['Concurrents suivis', `${competitors.length}`])

    for (const [label, value] of stats) {
      addPageBreakIfNeeded(doc)
      doc.fontSize(10).fillColor(GRAY).text(`${label} :`, { continued: true })
      doc.fillColor(DARK).text(`  ${value}`)
    }
    doc.moveDown(1)

    // ── Résumé ──
    addSectionTitle(doc, 'Synthèse', BLUE)
    doc.fontSize(10).fillColor(DARK).text(content.summary, { align: 'justify', width: PAGE_WIDTH })
    doc.moveDown(1)

    // ── Forces ──
    addSectionTitle(doc, 'Points forts', GREEN)
    for (const s of content.strengths) {
      addPageBreakIfNeeded(doc)
      doc.fontSize(10).fillColor(DARK).text(`• ${s}`, { width: PAGE_WIDTH })
    }
    doc.moveDown(1)

    // ── Faiblesses ──
    addSectionTitle(doc, "Axes d'amélioration", RED)
    for (const w of content.weaknesses) {
      addPageBreakIfNeeded(doc)
      doc.fontSize(10).fillColor(DARK).text(`• ${w}`, { width: PAGE_WIDTH })
    }
    doc.moveDown(1)

    // ── Recommandations ──
    addSectionTitle(doc, 'Recommandations prioritaires', BLUE)
    content.recommendations.forEach((rec: AiRecommendation, i: number) => {
      addPageBreakIfNeeded(doc)
      const prioColor = rec.priority === 'haute' ? RED : rec.priority === 'moyenne' ? AMBER : GRAY
      doc.fontSize(10).fillColor(prioColor).text(`${i + 1}. [${rec.priority.toUpperCase()}]`, { continued: true })
      doc.fillColor(DARK).text(` ${rec.action}`, { width: PAGE_WIDTH })
      if (rec.impact) {
        doc.fontSize(9).fillColor(GRAY).text(`   Impact : ${rec.impact}`, { width: PAGE_WIDTH })
      }
      doc.moveDown(0.4)
    })
    doc.moveDown(0.6)

    // ── Concurrents ──
    if ((competitors ?? []).length > 0) {
      addSectionTitle(doc, 'Comparaison concurrents', BLUE)
      for (const c of competitors ?? []) {
        addPageBreakIfNeeded(doc)
        const rating = c.google_rating ?? '?'
        const reviews = c.google_reviews_count ? ` (${c.google_reviews_count} avis)` : ''
        doc.fontSize(10).fillColor(DARK).text(`• ${c.name} : ${rating}/5${reviews}`, { width: PAGE_WIDTH })
      }
      doc.moveDown(0.5)
    }

    // ── Analyse concurrentielle AI ──
    if (content.competitor_analysis) {
      addSectionTitle(doc, 'Analyse concurrentielle', BLUE)
      doc.fontSize(10).fillColor(DARK).text(content.competitor_analysis, { align: 'justify', width: PAGE_WIDTH })
      doc.moveDown(1)
    }

    // ── Footer première page ──
    const footerY = doc.page.height - 40
    doc.moveTo(50, footerY - 10).lineTo(545, footerY - 10).strokeColor('#e5e7eb').lineWidth(1).stroke()
    doc.fontSize(8).fillColor(GRAY).text(
      `Score global : ${content.score_global ?? '--'}/100  •  Généré par Business Radar 974  •  ${reportDate}  •  Page 1`,
      50, footerY, { align: 'center', width: PAGE_WIDTH }
    )

    doc.end()
  })

  const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const dateStr = new Date(report.generated_at).toISOString().slice(0, 10)

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport-${orgSlug}-${dateStr}.pdf"`,
    },
  })
}
