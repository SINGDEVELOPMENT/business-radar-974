import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import SeoHistoryChart from '@/components/dashboard/SeoHistoryChart'
import ScoreCard from '@/components/dashboard/seo/ScoreCard'
import CwvCard from '@/components/dashboard/seo/CwvCard'
import OnPageRow from '@/components/dashboard/seo/OnPageRow'
import { cwvStatus } from '@/components/dashboard/seo/cwv-utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search, Activity, Clock, ShieldCheck, Gauge,
  AlertTriangle, CheckCircle2, Zap, Eye, Smartphone,
  Code2, FileCode, Lock, Monitor,
} from 'lucide-react'
import { computeSeoIssues } from '@/lib/utils/seo'
import { cn } from '@/lib/utils'
import { redirect } from 'next/navigation'
import type { SeoSnapshot } from '@/types'

export default async function SeoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id

  const { data: orgData } = orgId
    ? await supabase.from('organizations').select('plan').eq('id', orgId).single()
    : { data: null }
  const isPremium = orgData?.plan === 'premium'

  let snapshotList: SeoSnapshot[] = []
  if (orgId) {
    const { data: biz } = await supabase.from('businesses').select('id').eq('organization_id', orgId).eq('is_competitor', false).limit(1).single()
    if (biz) {
      const { data: snaps } = await supabase.from('seo_snapshots').select('url, status_code, load_time_ms, title, meta_description, h1_count, has_ssl, mobile_friendly, lighthouse_score, page_size_kb, collected_at, fcp_ms, lcp_ms, cls_score, tbt_ms, speed_index_ms, accessibility_score, seo_audit_score, best_practices_score, opportunities, canonical_url, has_og_tags, og_title, og_description, og_image, h2_count, h3_count, images_without_alt, total_images, internal_links_count, external_links_count, word_count, has_sitemap, has_robots_txt, has_schema, schema_types, title_length, meta_description_length, mobile_performance_score, desktop_performance_score').eq('business_id', biz.id).order('collected_at', { ascending: false }).limit(30)
      snapshotList = (snaps ?? []) as SeoSnapshot[]
    }
  }

  const latest = snapshotList[0] ?? null

  const chartData = [...snapshotList]
    .reverse()
    .filter(s => s.lighthouse_score != null)
    .map(s => ({
      date: new Date(s.collected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      score: s.lighthouse_score as number,
    }))

  const issues = latest ? computeSeoIssues(latest as Parameters<typeof computeSeoIssues>[0]) : []
  const score = latest?.lighthouse_score ?? null

  return (
    <div className="space-y-6">
      <Header title="SEO" subtitle="Audit et performance de votre site web" />

      {!latest ? (
        <EmptyState icon={Search} title="Aucun audit SEO disponible"
          description="Renseignez l'URL de votre site web dans les paramètres pour lancer l'audit SEO automatique." />
      ) : (
        <>
          {/* ── 4 Scores catégories ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard label="Performance" score={score} icon={Gauge} />
            <ScoreCard label="Accessibilité" score={latest.accessibility_score ?? null} icon={Eye} />
            <ScoreCard label="SEO" score={latest.seo_audit_score ?? null} icon={Search} />
            <ScoreCard label="Bonnes pratiques" score={latest.best_practices_score ?? null} icon={CheckCircle2} />
          </div>

          {/* ── Mobile vs Desktop ── */}
          {(latest.mobile_performance_score != null || latest.desktop_performance_score != null) && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                  (latest.mobile_performance_score ?? 0) >= 90 ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                  (latest.mobile_performance_score ?? 0) >= 50 ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-red-50 dark:bg-red-500/10'
                }`}>
                  <Smartphone className={`w-5 h-5 ${
                    (latest.mobile_performance_score ?? 0) >= 90 ? 'text-emerald-600' :
                    (latest.mobile_performance_score ?? 0) >= 50 ? 'text-orange-500' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wide">Mobile</p>
                  <p className={`text-3xl font-bold ${
                    (latest.mobile_performance_score ?? 0) >= 90 ? 'text-emerald-600' :
                    (latest.mobile_performance_score ?? 0) >= 50 ? 'text-orange-500' : 'text-red-500'
                  }`}>{latest.mobile_performance_score ?? '--'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Score PageSpeed</p>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                  (latest.desktop_performance_score ?? 0) >= 90 ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                  (latest.desktop_performance_score ?? 0) >= 50 ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-red-50 dark:bg-red-500/10'
                }`}>
                  <Monitor className={`w-5 h-5 ${
                    (latest.desktop_performance_score ?? 0) >= 90 ? 'text-emerald-600' :
                    (latest.desktop_performance_score ?? 0) >= 50 ? 'text-orange-500' : 'text-red-500'
                  }`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wide">Desktop</p>
                  <p className={`text-3xl font-bold ${
                    (latest.desktop_performance_score ?? 0) >= 90 ? 'text-emerald-600' :
                    (latest.desktop_performance_score ?? 0) >= 50 ? 'text-orange-500' : 'text-red-500'
                  }`}>{latest.desktop_performance_score ?? '--'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Score PageSpeed</p>
                </div>
              </Card>
            </div>
          )}

          {/* ── Core Web Vitals ── */}
          {(latest.lcp_ms != null || latest.fcp_ms != null || latest.cls_score != null || latest.tbt_ms != null) && (
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-400" />
                Core Web Vitals
                <span className="ml-auto text-xs text-gray-500 font-normal">Seuils Google</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {latest.lcp_ms != null && <CwvCard label="LCP" value={`${(latest.lcp_ms / 1000).toFixed(1)}s`} status={cwvStatus('lcp', latest.lcp_ms)} hint="Largest Contentful Paint" />}
                {latest.fcp_ms != null && <CwvCard label="FCP" value={`${(latest.fcp_ms / 1000).toFixed(1)}s`} status={cwvStatus('fcp', latest.fcp_ms)} hint="First Contentful Paint" />}
                {latest.cls_score != null && <CwvCard label="CLS" value={latest.cls_score.toFixed(3)} status={cwvStatus('cls', latest.cls_score)} hint="Cumulative Layout Shift" />}
                {latest.tbt_ms != null && <CwvCard label="TBT" value={`${latest.tbt_ms} ms`} status={cwvStatus('tbt', latest.tbt_ms)} hint="Total Blocking Time" />}
                {latest.speed_index_ms != null && <CwvCard label="Speed Index" value={`${(latest.speed_index_ms / 1000).toFixed(1)}s`} status={cwvStatus('si', latest.speed_index_ms)} hint="Vitesse d'affichage" />}
              </div>
            </Card>
          )}

          {/* ── KPIs techniques ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <KpiCard title="Temps de chargement" value={latest.load_time_ms != null ? `${latest.load_time_ms} ms` : '--'}
              icon={Clock}
              iconColor={latest.load_time_ms == null ? 'text-gray-400' : latest.load_time_ms < 2000 ? 'text-emerald-600' : latest.load_time_ms < 5000 ? 'text-orange-500' : 'text-red-500'}
              iconBg={latest.load_time_ms == null ? 'bg-gray-50' : latest.load_time_ms < 2000 ? 'bg-emerald-50' : latest.load_time_ms < 5000 ? 'bg-orange-50' : 'bg-red-50'}
            />
            <KpiCard title="SSL / HTTPS" value={latest.has_ssl ? 'Actif' : 'Inactif'} icon={ShieldCheck}
              iconColor={latest.has_ssl ? 'text-emerald-600' : 'text-red-500'}
              iconBg={latest.has_ssl ? 'bg-emerald-50' : 'bg-red-50'}
            />
            <KpiCard title="Mobile Friendly" value={latest.mobile_friendly === true ? 'Oui' : latest.mobile_friendly === false ? 'Non' : '--'}
              icon={Smartphone}
              iconColor={latest.mobile_friendly === true ? 'text-emerald-600' : latest.mobile_friendly === false ? 'text-red-500' : 'text-gray-400'}
              iconBg={latest.mobile_friendly === true ? 'bg-emerald-50' : latest.mobile_friendly === false ? 'bg-red-50' : 'bg-gray-50'}
            />
          </div>

          {/* ── Vérifications techniques de base (Standard) ── */}
          {(latest.has_sitemap != null || latest.has_robots_txt != null || latest.has_schema != null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {latest.has_sitemap != null && (
                <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center ${
                  latest.has_sitemap ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-orange-50 dark:bg-orange-500/10'
                }`}>
                  {latest.has_sitemap
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                  <span className="text-xs font-semibold text-gray-700 dark:text-white">Sitemap XML</span>
                  <span className={`text-xs ${latest.has_sitemap ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {latest.has_sitemap ? 'Présent' : 'Absent'}
                  </span>
                </div>
              )}
              {latest.has_robots_txt != null && (
                <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center ${
                  latest.has_robots_txt ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-orange-50 dark:bg-orange-500/10'
                }`}>
                  {latest.has_robots_txt
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                  <span className="text-xs font-semibold text-gray-700 dark:text-white">Robots.txt</span>
                  <span className={`text-xs ${latest.has_robots_txt ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {latest.has_robots_txt ? 'Présent' : 'Absent'}
                  </span>
                </div>
              )}
              {latest.has_schema != null && (
                <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center ${
                  latest.has_schema ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-orange-50 dark:bg-orange-500/10'
                }`}>
                  {latest.has_schema
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                  <span className="text-xs font-semibold text-gray-700 dark:text-white">Schema.org</span>
                  <span className={`text-xs ${latest.has_schema ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {latest.has_schema ? 'Présent' : 'Absent'}
                  </span>
                </div>
              )}
              {latest.total_images != null && (
                <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-center ${
                  (latest.images_without_alt ?? 0) === 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-orange-50 dark:bg-orange-500/10'
                }`}>
                  {(latest.images_without_alt ?? 0) === 0
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                  <span className="text-xs font-semibold text-gray-700 dark:text-white">Balises alt</span>
                  <span className={`text-xs ${(latest.images_without_alt ?? 0) === 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {(latest.images_without_alt ?? 0) === 0 ? `${latest.total_images} OK` : `${latest.images_without_alt} manquantes`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Graphique historique ── */}
          <SeoHistoryChart data={chartData} />

          {/* ── On-page SEO + Données structurées (Premium only) ── */}
          {isPremium ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Analyse on-page */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-gray-400" />
                  Analyse on-page
                </h3>
                <div className="space-y-3">
                  <OnPageRow label="Structure titres"
                    value={`H1: ${latest.h1_count ?? 0}  ·  H2: ${latest.h2_count ?? 0}  ·  H3: ${latest.h3_count ?? 0}`}
                    status={latest.h1_count === 1 ? 'good' : 'warn'}
                  />
                  <OnPageRow label="Canonical URL"
                    value={latest.canonical_url ?? 'Absente'}
                    status={latest.canonical_url ? 'good' : 'warn'}
                    mono
                  />
                  <OnPageRow label="Open Graph"
                    value={latest.has_og_tags ? 'Présent (og:title, og:description, og:image)' : 'Absent'}
                    status={latest.has_og_tags ? 'good' : 'warn'}
                  />
                  {latest.og_title && (
                    <OnPageRow label="og:title" value={latest.og_title} status="good" />
                  )}
                  <OnPageRow label="Balise title"
                    value={latest.title ? `${latest.title} (${latest.title_length ?? latest.title.length} car.)` : 'Absente'}
                    status={!latest.title ? 'bad' : (latest.title_length ?? 0) >= 30 && (latest.title_length ?? 0) <= 60 ? 'good' : 'warn'}
                  />
                  <OnPageRow label="Meta description"
                    value={latest.meta_description
                      ? `${latest.meta_description.slice(0, 80)}${(latest.meta_description.length > 80) ? '…' : ''} (${latest.meta_description_length ?? latest.meta_description.length} car.)`
                      : 'Absente'}
                    status={!latest.meta_description ? 'bad' : (latest.meta_description_length ?? 0) >= 120 && (latest.meta_description_length ?? 0) <= 160 ? 'good' : 'warn'}
                  />
                  {latest.word_count != null && (
                    <OnPageRow label="Nombre de mots"
                      value={`${latest.word_count} mots`}
                      status={latest.word_count >= 300 ? 'good' : 'warn'}
                    />
                  )}
                </div>
              </Card>

              {/* Données structurées + crawl */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-gray-400" />
                  Données structurées & crawl
                </h3>
                <div className="space-y-3">
                  <OnPageRow label="Schema markup (JSON-LD)"
                    value={latest.has_schema
                      ? `Présent${latest.schema_types && latest.schema_types.length > 0 ? ` — ${(latest.schema_types as string[]).join(', ')}` : ''}`
                      : 'Absent — opportunité rich snippets !'}
                    status={latest.has_schema ? 'good' : 'warn'}
                  />
                  {latest.has_schema && latest.schema_types && (latest.schema_types as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-4">
                      {(latest.schema_types as string[]).map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                  <OnPageRow label="Sitemap XML"
                    value={latest.has_sitemap === true ? 'Présent' : latest.has_sitemap === false ? 'Absent' : 'Non vérifié'}
                    status={latest.has_sitemap === true ? 'good' : latest.has_sitemap === false ? 'warn' : 'neutral'}
                  />
                  <OnPageRow label="Robots.txt"
                    value={latest.has_robots_txt === true ? 'Présent' : latest.has_robots_txt === false ? 'Absent' : 'Non vérifié'}
                    status={latest.has_robots_txt === true ? 'good' : latest.has_robots_txt === false ? 'warn' : 'neutral'}
                  />
                  {latest.total_images != null && (
                    <OnPageRow label="Images"
                      value={`${latest.total_images} image${latest.total_images > 1 ? 's' : ''} · ${latest.images_without_alt ?? 0} sans alt`}
                      status={(latest.images_without_alt ?? 0) === 0 ? 'good' : 'warn'}
                    />
                  )}
                  {(latest.internal_links_count != null || latest.external_links_count != null) && (
                    <OnPageRow label="Liens"
                      value={`${latest.internal_links_count ?? 0} internes · ${latest.external_links_count ?? 0} externes`}
                      status="neutral"
                    />
                  )}
                  <OnPageRow label="Status HTTP" value={String(latest.status_code ?? '--')} status={latest.status_code === 200 ? 'good' : 'bad'} />
                  {latest.page_size_kb != null && (
                    <OnPageRow label="Taille de la page" value={`${latest.page_size_kb} KB`}
                      status={latest.page_size_kb > 2000 ? 'warn' : 'good'}
                    />
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-sm rounded-xl border border-brand/20 dark:border-brand/30">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20">
                  <Lock className="w-6 h-6 text-brand" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">Analyse on-page & données structurées</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Disponible avec le plan Premium</p>
                </div>
                <a href="/#pricing" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand-light text-white text-xs font-semibold rounded-lg transition-colors">
                  ✦ Passer au Premium
                </a>
              </div>
              <div className="pointer-events-none select-none opacity-20 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* cartes fantômes */}
                <div className="rounded-xl border border-gray-200 p-5 space-y-3 bg-white">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
                </div>
                <div className="rounded-xl border border-gray-200 p-5 space-y-3 bg-white">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
                </div>
              </div>
            </div>
          )}

          {/* ── Problèmes détectés ── */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              Problèmes détectés
              {issues.length > 0 && <Badge variant="destructive" className="ml-auto">{issues.length}</Badge>}
            </h3>
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Aucun problème détecté — excellent !
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {issues.map(issue => (
                  <div key={issue.key} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <span className={`inline-block w-2 h-2 rounded-full mt-1.5 shrink-0 ${issue.priority === 'haute' ? 'bg-red-500' : issue.priority === 'moyenne' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{issue.label}</span>
                        <Badge variant={issue.priority === 'haute' ? 'destructive' : issue.priority === 'moyenne' ? 'warning' : 'secondary'} className="text-[10px]">{issue.priority}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{issue.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── Opportunités d'optimisation ── */}
          {latest.opportunities && (latest.opportunities as { id: string; title: string; displayValue: string; score: number }[]).length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Opportunités d&apos;optimisation
                <Badge variant="warning" className="ml-auto">
                  {(latest.opportunities as { id: string }[]).length} amélioration{(latest.opportunities as { id: string }[]).length > 1 ? 's' : ''} possible{(latest.opportunities as { id: string }[]).length > 1 ? 's' : ''}
                </Badge>
              </h3>
              <div className="space-y-2">
                {(latest.opportunities as { id: string; title: string; displayValue: string; score: number }[]).map(opp => (
                  <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{opp.title}</p>
                      {opp.displayValue && (
                        <p className="text-sm text-gray-600 mt-0.5">{opp.displayValue}</p>
                      )}
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
          )}

          {/* Dernière info */}
          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <Activity className="w-3 h-3" />
            Dernier audit : {new Date(latest.collected_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </>
      )}
    </div>
  )
}
