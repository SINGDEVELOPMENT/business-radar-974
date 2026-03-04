import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PDFDocument from 'pdfkit'
import type { AiReportContent, AiRecommendation } from '@/types'

export const dynamic = 'force-dynamic'

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

  const { data: org } = await admin
    .from('organizations')
    .select('name')
    .eq('id', orgId)
    .single()

  const { data: report } = await admin
    .from('ai_reports')
    .select('*')
    .eq('organization_id', orgId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  if (!report) return NextResponse.json({ error: 'Aucun rapport disponible' }, { status: 404 })

  const content = report.content as AiReportContent
  const orgName = org?.name ?? 'Mon établissement'
  const reportDate = new Date(report.generated_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const BLUE = '#2563eb'
    const GRAY = '#6b7280'
    const DARK = '#111827'
    const GREEN = '#16a34a'
    const RED = '#dc2626'
    const AMBER = '#d97706'
    const pageWidth = 595 - 100 // A4 width - margins

    // ── En-tête ──
    doc.fontSize(22).fillColor(BLUE).text('Business Radar 974', { align: 'center' })
    doc.moveDown(0.3)
    doc.fontSize(14).fillColor(DARK).text(orgName, { align: 'center' })
    doc.moveDown(0.2)
    doc.fontSize(10).fillColor(GRAY).text(reportDate, { align: 'center' })
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

    // ── Résumé ──
    doc.fontSize(13).fillColor(BLUE).text('Synthèse')
    doc.moveDown(0.3)
    doc.fontSize(10).fillColor(DARK).text(content.summary, { align: 'justify', width: pageWidth })
    doc.moveDown(1)

    // ── Forces ──
    doc.fontSize(13).fillColor(GREEN).text('Points forts')
    doc.moveDown(0.3)
    for (const s of content.strengths) {
      doc.fontSize(10).fillColor(DARK).text(`• ${s}`, { width: pageWidth })
    }
    doc.moveDown(1)

    // ── Faiblesses ──
    doc.fontSize(13).fillColor(RED).text("Axes d'amélioration")
    doc.moveDown(0.3)
    for (const w of content.weaknesses) {
      doc.fontSize(10).fillColor(DARK).text(`• ${w}`, { width: pageWidth })
    }
    doc.moveDown(1)

    // ── Recommandations ──
    doc.fontSize(13).fillColor(BLUE).text('Recommandations prioritaires')
    doc.moveDown(0.4)
    content.recommendations.forEach((rec: AiRecommendation, i: number) => {
      const prioColor = rec.priority === 'haute' ? RED : rec.priority === 'moyenne' ? AMBER : GRAY
      doc.fontSize(10).fillColor(prioColor).text(`${i + 1}. [${rec.priority.toUpperCase()}]`, { continued: true })
      doc.fillColor(DARK).text(` ${rec.action}`, { width: pageWidth })
      if (rec.impact) {
        doc.fontSize(9).fillColor(GRAY).text(`   Impact : ${rec.impact}`, { width: pageWidth })
      }
      doc.moveDown(0.4)
    })
    doc.moveDown(0.6)

    // ── Analyse concurrentielle ──
    if (content.competitor_analysis) {
      doc.fontSize(13).fillColor(BLUE).text('Analyse concurrentielle')
      doc.moveDown(0.3)
      doc.fontSize(10).fillColor(DARK).text(content.competitor_analysis, { align: 'justify', width: pageWidth })
      doc.moveDown(1)
    }

    // ── Footer ──
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').lineWidth(1).stroke()
    doc.moveDown(0.5)
    doc.fontSize(9).fillColor(GRAY).text(
      `Score global : ${content.score_global ?? '--'}/100  •  Généré par Business Radar 974  •  ${reportDate}`,
      { align: 'center' }
    )

    doc.end()
  })

  return new Response(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport-${orgName.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
    },
  })
}
