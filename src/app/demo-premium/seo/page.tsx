import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import SeoHistoryChart from '@/components/dashboard/SeoHistoryChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock, ShieldCheck, Gauge, AlertTriangle, CheckCircle2,
  Zap, Eye, Search, Smartphone, Activity, FileCode, Code2,
} from 'lucide-react'
import { computeSeoIssues } from '@/lib/utils/seo'
import { cn } from '@/lib/utils'
import { DEMO_SEO_LATEST, DEMO_SEO_CHART } from '@/lib/demo-data'

function cwvStatus(metric: 'lcp' | 'fcp' | 'cls' | 'tbt' | 'si', value: number): 'good' | 'needs-improvement' | 'poor' {
  if (metric === 'lcp') return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
  if (metric === 'fcp') return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
  if (metric === 'cls') return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
  if (metric === 'tbt') return value <= 200 ? 'good' : value <= 600 ? 'needs-improvement' : 'poor'
  return value <= 3400 ? 'good' : value <= 5800 ? 'needs-improvement' : 'poor'
}
function statusColor(s: 'good' | 'needs-improvement' | 'poor') {
  return s === 'good' ? 'text-emerald-600' : s === 'needs-improvement' ? 'text-orange-500' : 'text-red-500'
}
function statusBg(s: 'good' | 'needs-improvement' | 'poor') {
  return s === 'good' ? 'bg-emerald-50' : s === 'needs-improvement' ? 'bg-orange-50' : 'bg-red-50'
}
function statusBadge(s: 'good' | 'needs-improvement' | 'poor'): 'success' | 'warning' | 'destructive' {
  return s === 'good' ? 'success' : s === 'needs-improvement' ? 'warning' : 'destructive'
}
function statusLabel(s: 'good' | 'needs-improvement' | 'poor') {
  return s === 'good' ? 'Bon' : s === 'needs-improvement' ? 'À améliorer' : 'Mauvais'
}

export default function DemoPremiumSeoPage() {
  const score = DEMO_SEO_LATEST.lighthouse_score
  const issues = computeSeoIssues(DEMO_SEO_LATEST as Parameters<typeof computeSeoIssues>[0])

  return (
    <div className="space-y-6">
      <Header title="SEO — Premium" subtitle="Analyse complète avec données on-page et structurées" />

      {/* 4 Scores catégories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard label="Performance" score={score} icon={Gauge} />
        <ScoreCard label="Accessibilité" score={DEMO_SEO_LATEST.accessibility_score} icon={Eye} />
        <ScoreCard label="SEO" score={DEMO_SEO_LATEST.seo_audit_score} icon={Search} />
        <ScoreCard label="Bonnes pratiques" score={DEMO_SEO_LATEST.best_practices_score} icon={CheckCircle2} />
      </div>

      {/* Core Web Vitals */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400" />
          Core Web Vitals
          <span className="ml-auto text-xs text-gray-400 font-normal">Seuils Google</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <CwvCard label="LCP" value={`${(DEMO_SEO_LATEST.lcp_ms / 1000).toFixed(1)}s`} status={cwvStatus('lcp', DEMO_SEO_LATEST.lcp_ms)} hint="Largest Contentful Paint" />
          <CwvCard label="FCP" value={`${(DEMO_SEO_LATEST.fcp_ms / 1000).toFixed(1)}s`} status={cwvStatus('fcp', DEMO_SEO_LATEST.fcp_ms)} hint="First Contentful Paint" />
          <CwvCard label="CLS" value={DEMO_SEO_LATEST.cls_score.toFixed(3)} status={cwvStatus('cls', DEMO_SEO_LATEST.cls_score)} hint="Cumulative Layout Shift" />
          <CwvCard label="TBT" value={`${DEMO_SEO_LATEST.tbt_ms} ms`} status={cwvStatus('tbt', DEMO_SEO_LATEST.tbt_ms)} hint="Total Blocking Time" />
          <CwvCard label="Speed Index" value={`${(DEMO_SEO_LATEST.speed_index_ms / 1000).toFixed(1)}s`} status={cwvStatus('si', DEMO_SEO_LATEST.speed_index_ms)} hint="Vitesse d'affichage" />
        </div>
      </Card>

      {/* KPIs techniques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <KpiCard title="Temps de chargement" value={`${DEMO_SEO_LATEST.load_time_ms} ms`} icon={Clock} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <KpiCard title="SSL / HTTPS" value="Actif" icon={ShieldCheck} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <KpiCard title="Mobile Friendly" value="Oui" icon={Smartphone} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
      </div>

      <SeoHistoryChart data={DEMO_SEO_CHART} />

      {/* On-page SEO + Données structurées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-gray-400" />Analyse on-page
          </h3>
          <div className="space-y-3">
            <OnPageRow label="Structure titres"
              value={`H1: ${DEMO_SEO_LATEST.h1_count}  ·  H2: ${DEMO_SEO_LATEST.h2_count}  ·  H3: ${DEMO_SEO_LATEST.h3_count}`}
              status={DEMO_SEO_LATEST.h1_count === 1 ? 'good' : 'warn'}
            />
            <OnPageRow label="Canonical URL"
              value={DEMO_SEO_LATEST.canonical_url}
              status="good"
              mono
            />
            <OnPageRow label="Open Graph"
              value="Présent (og:title, og:description, og:image)"
              status="good"
            />
            <OnPageRow label="og:title"
              value={DEMO_SEO_LATEST.og_title}
              status="good"
            />
            <OnPageRow label="Balise title"
              value={`${DEMO_SEO_LATEST.title} (${DEMO_SEO_LATEST.title_length} car.)`}
              status="good"
            />
            <OnPageRow label="Meta description"
              value={`${DEMO_SEO_LATEST.meta_description.slice(0, 80)}… (${DEMO_SEO_LATEST.meta_description_length} car.)`}
              status="good"
            />
            <OnPageRow label="Nombre de mots"
              value={`${DEMO_SEO_LATEST.word_count} mots`}
              status="good"
            />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-gray-400" />Données structurées &amp; crawl
          </h3>
          <div className="space-y-3">
            <OnPageRow label="Schema markup (JSON-LD)"
              value="Absent — opportunité rich snippets !"
              status="warn"
            />
            <OnPageRow label="Sitemap XML" value="Présent" status="good" />
            <OnPageRow label="Robots.txt" value="Présent" status="good" />
            <OnPageRow label="Images"
              value={`${DEMO_SEO_LATEST.total_images} images · ${DEMO_SEO_LATEST.images_without_alt} sans alt`}
              status="warn"
            />
            <OnPageRow label="Liens"
              value={`${DEMO_SEO_LATEST.internal_links_count} internes · ${DEMO_SEO_LATEST.external_links_count} externes`}
              status="neutral"
            />
            <OnPageRow label="Status HTTP" value="200" status="good" />
            <OnPageRow label="Taille de la page" value={`${DEMO_SEO_LATEST.page_size_kb} KB`} status="good" />
          </div>
        </Card>
      </div>

      {/* Problèmes détectés */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gray-400" />
          Problèmes détectés
          {issues.length > 0 && <Badge variant="destructive" className="ml-auto">{issues.length}</Badge>}
        </h3>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />Aucun problème détecté — excellent !
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {issues.map(issue => (
              <div key={issue.key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <span className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${issue.priority === 'haute' ? 'bg-red-500' : issue.priority === 'moyenne' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{issue.label}</span>
                    <Badge variant={issue.priority === 'haute' ? 'destructive' : issue.priority === 'moyenne' ? 'warning' : 'secondary'} className="text-[10px]">{issue.priority}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{issue.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Opportunités */}
      <Card className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Opportunités d&apos;optimisation
          <Badge variant="warning" className="ml-auto">{DEMO_SEO_LATEST.opportunities.length} améliorations possibles</Badge>
        </h3>
        <div className="space-y-2">
          {DEMO_SEO_LATEST.opportunities.map(opp => (
            <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opp.displayValue}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${100 - opp.score}%` }} />
                </div>
                <span className="text-xs font-semibold text-amber-600">{opp.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        <Activity className="w-3 h-3" />Dernier audit : 3 mars 2026
      </p>
    </div>
  )
}

function ScoreCard({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const color = score >= 90 ? 'text-emerald-600' : score >= 50 ? 'text-orange-500' : 'text-red-500'
  const variant = score >= 90 ? 'success' as const : score >= 50 ? 'warning' as const : 'destructive' as const
  return (
    <Card className="p-4 flex flex-col items-center gap-1 text-center">
      <Icon className="w-4 h-4 text-gray-400 mb-1" />
      <p className={cn('text-3xl font-extrabold', color)}>{score}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <Badge variant={variant} className="text-[10px] px-1.5 mt-0.5">{score >= 90 ? 'Excellent' : score >= 50 ? 'Moyen' : 'Faible'}</Badge>
    </Card>
  )
}

function CwvCard({ label, value, status, hint }: { label: string; value: string; status: 'good' | 'needs-improvement' | 'poor'; hint: string }) {
  return (
    <div className={cn('rounded-xl p-3 flex flex-col gap-1', statusBg(status))}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-600">{label}</span>
        <Badge variant={statusBadge(status)} className="text-[9px] px-1 py-0">{statusLabel(status)}</Badge>
      </div>
      <p className={cn('text-xl font-bold', statusColor(status))}>{value}</p>
      <p className="text-[10px] text-gray-400">{hint}</p>
    </div>
  )
}

function OnPageRow({ label, value, status, mono = false }: { label: string; value: string; status: 'good' | 'warn' | 'bad' | 'neutral'; mono?: boolean }) {
  const icon = status === 'good'
    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
    : status === 'bad'
    ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
    : status === 'warn'
    ? <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
    : <span className="w-3.5 h-3.5 shrink-0 mt-0.5" />
  return (
    <div className="flex items-start gap-2 text-sm">
      {icon}
      <span className="text-gray-500 shrink-0 min-w-[120px]">{label}</span>
      <span className={cn(
        'text-right flex-1 min-w-0 truncate',
        mono && 'font-mono text-xs',
        status === 'bad' && 'text-red-500',
        status === 'warn' && 'text-orange-500',
        status === 'good' && 'text-gray-900',
        status === 'neutral' && 'text-gray-600',
      )}>{value}</span>
    </div>
  )
}
