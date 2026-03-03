import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquareText } from 'lucide-react'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: reviews } = orgId
    ? await supabase
        .from('reviews')
        .select('*, businesses!inner(name, organization_id)')
        .eq('businesses.organization_id', orgId)
        .order('collected_at', { ascending: false })
        .limit(50)
    : { data: [] }

  const reviewsList = reviews ?? []

  return (
    <div className="space-y-6">
      <Header title="Avis Google" subtitle="Suivi et analyse de vos avis clients" />

      {reviewsList.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Aucun avis collecté"
          description="Configurez votre Google Place ID dans les paramètres pour commencer la collecte automatique des avis."
        />
      ) : (
        <div className="space-y-3">
          {reviewsList.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {review.author_name ?? 'Anonyme'}
                    </span>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {review.rating}/5
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {review.source}
                    </Badge>
                  </div>
                  {review.text && (
                    <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
                  )}
                  {review.published_at && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(review.published_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <MessageSquareText className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
