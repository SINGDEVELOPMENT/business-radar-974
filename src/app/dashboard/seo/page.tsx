import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import SeoHistoryChart from '@/components/dashboard/SeoHistoryChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Activity,
  Clock,
  ShieldCheck,
  FileText,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Code2,
} from 'lucide-react'
import { computeSeoIssues, seoScoreColor, seoScoreLabel } from '@/lib/utils/seo'
import { cn } from '@/lib/utils'

export default async function SeoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  // Derniers 30 snapshots pour le graphique et le tableau
  const { data: snapshots } = orgId
    ? await supabase
        .from('seo_snapshots')
        .select('*, businesses!inner(name, organization_id)')
        .eq('businesses.organization_id', orgId)
        .order('collected_at', { ascending: false })
        .limit(30)
    : { data: [] }

  const latest = snapshots?.[0] ?? null

  // Données pour le graphique (ordre chronologique)
  const chartData = [...(snapshots ?? [])]
    .reverse()
    .filter((s) => s.lighthouse_score != null)
    .map((s) => ({
      date: new Date(s.collected_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      }),
      score: s.lighthouse_score as number,
    }))

  const issues = latest ? computeSeoIssues(latest as Parameters<typeof computeSeoIssues>[0]) : []
  const score = latest?.lighthouse_score ?? null

  return (
    <div className="space-y-6">
      <Header title="SEO" subtitle="Audit et performance de votre site web" />

      {!latest ? (
        <EmptyState
          icon={Search}
          title="Aucun audit SEO disponible"
          description="Renseignez l'URL de votre site web dans les paramètres pour lancer l'audit SEO automatique."
        />
      ) : (
        <>
          {/* Score + KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Score SEO — colonne large */}
            <Card className="p-5 flex flex-col items-center justify-center gap-1 lg:col-span-1">
              <div className={cn('text-5xl font-extrabold', score !== null ? seoScoreColor(score) : 'text-gray-400')}>
                {score ?? '--'}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Score SEO / 100
              </div>
              {score !== null && (
                <Badge
                  variant={score >= 80 ? 'success' : score >= 50 ? 'warning' : 'destructive'}
                  className="mt-1"
                >
                  {seoScoreLabel(score)}
                </Badge>
              )}
              {latest.collected_at && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {new Date(latest.collected_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </Card>

            {/* KPI cards */}
            <KpiCard
              title="Temps de chargement"
              value={latest.load_time_ms != null ? `${latest.load_time_ms} ms` : '--'}
              icon={Clock}
              iconColor={
                latest.load_time_ms == null
                  ? 'text-gray-400'
                  : latest.load_time_ms < 2000
                  ? 'text-emerald-600'
                  : latest.load_time_ms < 5000
                  ? 'text-orange-500'
                  : 'text-red-500'
              }
              iconBg={
                latest.load_time_ms == null
                  ? 'bg-gray-50'
                  : latest.load_time_ms < 2000
                  ? 'bg-emerald-50'
                  : latest.load_time_ms < 5000
                  ? 'bg-orange-50'
                  : 'bg-red-50'
              }
            />
            <KpiCard
              title="SSL / HTTPS"
              value={latest.has_ssl ? 'Actif' : 'Inactif'}
              icon={ShieldCheck}
              iconColor={latest.has_ssl ? 'text-emerald-600' : 'text-red-500'}
              iconBg={latest.has_ssl ? 'bg-emerald-50' : 'bg-red-50'}
            />
            <KpiCard
              title="Status HTTP"
              value={latest.status_code ?? '--'}
              icon={Gauge}
              iconColor={latest.status_code === 200 ? 'text-emerald-600' : 'text-red-500'}
              iconBg={latest.status_code === 200 ? 'bg-emerald-50' : 'bg-red-50'}
            />
          </div>

          {/* Graphique historique */}
          <SeoHistoryChart data={chartData} />

          {/* Détails techniques + Problèmes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Détails */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Détails techniques
              </h3>
              <div className="space-y-3">
                <Detail label="URL analysée" value={latest.url ?? '--'} mono />
                <Detail
                  label="Balise title"
                  value={latest.title ?? 'Non définie'}
                  missing={!latest.title}
                />
                <Detail
                  label="Meta description"
                  value={latest.meta_description ?? 'Non définie'}
                  missing={!latest.meta_description}
                />
                <Detail
                  label="Balises H1"
                  value={String(latest.h1_count ?? 0)}
                  warning={!latest.h1_count || latest.h1_count !== 1}
                />
                {(latest as { page_size_kb?: number | null }).page_size_kb != null && (
                  <Detail
                    label="Taille de la page"
                    value={`${(latest as { page_size_kb: number }).page_size_kb} KB`}
                  />
                )}
              </div>
            </Card>

            {/* Problèmes & recommandations */}
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                Problèmes détectés
                {issues.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {issues.length}
                  </Badge>
                )}
              </h3>

              {issues.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Aucun problème détecté — excellent !
                </div>
              ) : (
                <ul className="space-y-3">
                  {issues.map((issue) => (
                    <li key={issue.key} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {issue.priority === 'haute' ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-1" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mt-1" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {issue.label}
                          </span>
                          <Badge
                            variant={issue.priority === 'haute' ? 'destructive' : 'warning'}
                          >
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{issue.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Code source hint */}
          <Card className="p-4 bg-gray-50 border-dashed">
            <div className="flex items-start gap-3">
              <Code2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-600">
                  Lancer un nouvel audit manuellement
                </p>
                <code className="text-xs text-gray-500 mt-0.5 block font-mono">
                  POST /api/collect/seo {'{'} businessId, websiteUrl {'}'}
                </code>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

// ── Composant utilitaire local ──────────────────────────────────────────────

function Detail({
  label,
  value,
  mono = false,
  missing = false,
  warning = false,
}: {
  label: string
  value: string
  mono?: boolean
  missing?: boolean
  warning?: boolean
}) {
  return (
    <div className="flex items-start justify-between text-sm gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span
        className={cn(
          'text-right max-w-[55%] truncate',
          mono && 'font-mono text-xs',
          missing && 'text-red-500 italic',
          warning && !missing && 'text-orange-500',
          !missing && !warning && 'text-gray-900',
        )}
      >
        {value}
      </span>
    </div>
  )
}
