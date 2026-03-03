import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Activity,
  Clock,
  ShieldCheck,
  Smartphone,
  FileText,
  Gauge,
} from 'lucide-react'

export default async function SeoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: snapshots } = orgId
    ? await supabase
        .from('seo_snapshots')
        .select('*, businesses!inner(name, organization_id)')
        .eq('businesses.organization_id', orgId)
        .order('collected_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const latest = snapshots?.[0] ?? null

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Score Lighthouse"
              value={latest.lighthouse_score ? `${latest.lighthouse_score}/100` : '--'}
              icon={Gauge}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
            />
            <KpiCard
              title="Temps de chargement"
              value={latest.load_time_ms ? `${latest.load_time_ms}ms` : '--'}
              icon={Clock}
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />
            <KpiCard
              title="SSL"
              value={latest.has_ssl ? 'Actif' : 'Inactif'}
              icon={ShieldCheck}
              iconColor={latest.has_ssl ? 'text-emerald-600' : 'text-red-500'}
              iconBg={latest.has_ssl ? 'bg-emerald-50' : 'bg-red-50'}
            />
            <KpiCard
              title="Mobile friendly"
              value={latest.mobile_friendly ? 'Oui' : 'Non'}
              icon={Smartphone}
              iconColor={latest.mobile_friendly ? 'text-emerald-600' : 'text-red-500'}
              iconBg={latest.mobile_friendly ? 'bg-emerald-50' : 'bg-red-50'}
            />
          </div>

          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Détails de l&apos;audit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">URL analysée</span>
                  <span className="text-gray-900 font-mono text-xs truncate max-w-[200px]">
                    {latest.url ?? '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status HTTP</span>
                  <Badge variant={latest.status_code === 200 ? 'success' : 'destructive'}>
                    {latest.status_code ?? '--'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Balises H1</span>
                  <span className="text-gray-900">{latest.h1_count ?? '--'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Titre</span>
                  <span className="text-gray-900 truncate max-w-[200px]">
                    {latest.title ?? '--'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Meta description</span>
                  <p className="text-gray-700 text-xs mt-1 line-clamp-2">
                    {latest.meta_description ?? 'Non définie'}
                  </p>
                </div>
              </div>
            </div>
            {latest.collected_at && (
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Dernière analyse : {new Date(latest.collected_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
