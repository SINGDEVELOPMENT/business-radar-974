import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Star, Globe } from 'lucide-react'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: competitors } = orgId
    ? await supabase
        .from('businesses')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_competitor', true)
        .order('name')
    : { data: [] }

  // Get review stats for each competitor
  const competitorList = competitors ?? []
  const competitorIds = competitorList.map((c) => c.id)

  const { data: reviewStats } = competitorIds.length > 0
    ? await supabase
        .from('reviews')
        .select('business_id, rating')
        .in('business_id', competitorIds)
    : { data: [] }

  const statsMap = new Map<string, { count: number; sum: number }>()
  for (const r of reviewStats ?? []) {
    const curr = statsMap.get(r.business_id) ?? { count: 0, sum: 0 }
    curr.count++
    curr.sum += r.rating ?? 0
    statsMap.set(r.business_id, curr)
  }

  return (
    <div className="space-y-6">
      <Header title="Concurrents" subtitle="Surveillance de vos concurrents locaux" />

      {competitorList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun concurrent surveillé"
          description="Ajoutez des concurrents via les paramètres ou le panel admin pour comparer vos performances."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitorList.map((comp) => {
            const stats = statsMap.get(comp.id)
            const avgRating = stats ? (stats.sum / stats.count).toFixed(1) : '--'
            return (
              <Card key={comp.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{comp.name}</h3>
                    {comp.website_url && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" />
                        {comp.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">Concurrent</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-gray-900">{avgRating}</span>
                    <span className="text-xs text-gray-400">/5</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {stats?.count ?? 0} avis
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
