import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Share2, Heart, MessageCircle, Repeat2, ThumbsUp } from 'lucide-react'

export default async function SocialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user!.id)
    .single()

  const orgId = profile?.organization_id

  const { data: posts } = orgId
    ? await supabase
        .from('social_posts')
        .select('*, businesses!inner(name, organization_id)')
        .eq('businesses.organization_id', orgId)
        .order('published_at', { ascending: false })
        .limit(30)
    : { data: [] }

  const postsList = posts ?? []
  const totalLikes = postsList.reduce((s, p) => s + (p.likes ?? 0), 0)
  const totalComments = postsList.reduce((s, p) => s + (p.comments ?? 0), 0)
  const totalShares = postsList.reduce((s, p) => s + (p.shares ?? 0), 0)

  return (
    <div className="space-y-6">
      <Header title="Réseaux Sociaux" subtitle="Performance Facebook et Instagram" />

      {postsList.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="Aucun post collecté"
          description="Connectez vos pages Facebook et Instagram dans les paramètres pour suivre votre engagement."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              title="Total likes"
              value={totalLikes.toLocaleString('fr-FR')}
              icon={Heart}
              iconColor="text-red-500"
              iconBg="bg-red-50"
            />
            <KpiCard
              title="Commentaires"
              value={totalComments.toLocaleString('fr-FR')}
              icon={MessageCircle}
              iconColor="text-blue-500"
              iconBg="bg-blue-50"
            />
            <KpiCard
              title="Partages"
              value={totalShares.toLocaleString('fr-FR')}
              icon={Repeat2}
              iconColor="text-green-500"
              iconBg="bg-green-50"
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Posts récents
            </h2>
            {postsList.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant={post.platform === 'facebook' ? 'default' : 'secondary'}
                        className={post.platform === 'facebook' ? 'bg-blue-600' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'}
                      >
                        {post.platform === 'facebook' ? 'Facebook' : 'Instagram'}
                      </Badge>
                    </div>
                    {post.content && (
                      <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="w-3 h-3" /> {post.shares}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
