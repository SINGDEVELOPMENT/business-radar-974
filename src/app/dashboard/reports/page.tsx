import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import AiInsightCard from '@/components/dashboard/AiInsightCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Calendar } from 'lucide-react'
import { AiRecommendation } from '@/types'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: reports } = orgId
    ? await supabase
        .from('ai_reports')
        .select('*')
        .eq('organization_id', orgId)
        .order('generated_at', { ascending: false })
        .limit(10)
    : { data: [] }

  const reportsList = reports ?? []

  return (
    <div className="space-y-6">
      <Header title="Rapports AI" subtitle="Analyses et recommandations générées par l'intelligence artificielle" />

      {reportsList.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Aucun rapport AI généré"
          description="Le premier rapport sera généré automatiquement dès que suffisamment de données auront été collectées."
        />
      ) : (
        <div className="space-y-4">
          {reportsList.map((report) => {
            const content = report.content as {
              score_global?: number
              recommendations?: AiRecommendation[]
            } | null

            return (
              <div key={report.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      report.report_type === 'monthly' ? 'default' :
                      report.report_type === 'weekly' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {report.report_type === 'monthly' ? 'Mensuel' :
                     report.report_type === 'weekly' ? 'Hebdomadaire' :
                     'Alerte'}
                  </Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.generated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <AiInsightCard
                  summary={report.summary ?? undefined}
                  recommendations={content?.recommendations}
                  scoreGlobal={content?.score_global}
                  generatedAt={report.generated_at}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
