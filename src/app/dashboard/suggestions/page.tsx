import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Sparkles } from 'lucide-react'
import SuggestionsPageClient from '@/components/dashboard/SuggestionsPageClient'

export default async function SuggestionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id

  const { data: org } = orgId
    ? await supabase
        .from('organizations')
        .select('plan')
        .eq('id', orgId)
        .single()
    : { data: null }

  const isPremium = org?.plan === 'premium'

  return (
    <div className="space-y-6">
      <Header
        title="Suggestions de contenu"
        subtitle="Idées de posts générées par l'IA pour vos réseaux sociaux"
      />

      {!isPremium ? (
        <Card className="p-6 border-brand/20 bg-gradient-to-br from-brand/5 to-accent/5 dark:from-brand/10 dark:to-accent/10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-brand shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Fonctionnalité Premium</h3>
                <Badge className="bg-brand">Premium</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                Les suggestions de contenu AI sont réservées aux abonnés Premium. Passez au plan Premium pour accéder à :
              </p>
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" />
                  5 suggestions de posts Facebook et Instagram générées par Claude
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" />
                  Contenu adapté au marché réunionnais (culture créole, événements locaux)
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-light shrink-0" />
                  Créneaux de publication optimisés et hashtags pertinents
                </li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Contactez votre administrateur pour passer en Premium.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <SuggestionsPageClient />
      )}
    </div>
  )
}
