import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import EmptyState from '@/components/dashboard/EmptyState'
import KpiCard from '@/components/dashboard/KpiCard'
import SocialEngagementChart, {
  type EngagementPoint,
} from '@/components/dashboard/SocialEngagementChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Share2,
  Heart,
  MessageCircle,
  Repeat2,
  ThumbsUp,
  Trophy,
  BarChart2,
} from 'lucide-react'

export default async function SocialPage() {
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

  const { data: posts } = orgId
    ? await supabase
        .from('social_posts')
        .select('*, businesses!inner(name, organization_id)')
        .eq('businesses.organization_id', orgId)
        .order('published_at', { ascending: false })
        .limit(60)
    : { data: [] }

  const postsList = posts ?? []

  // ── Métriques globales ──────────────────────────────────────────────────
  const totalPosts = postsList.length
  const totalEngagement = postsList.reduce(
    (s, p) => s + (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0),
    0,
  )
  const avgEngagement = totalPosts > 0 ? Math.round(totalEngagement / totalPosts) : 0

  const bestPost = [...postsList].sort(
    (a, b) =>
      (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0) -
      ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)),
  )[0] ?? null

  // ── Métriques par plateforme ────────────────────────────────────────────
  const fbPosts = postsList.filter((p) => p.platform === 'facebook')
  const igPosts = postsList.filter((p) => p.platform === 'instagram')

  const platformStats = (list: typeof postsList) => {
    if (list.length === 0) return { posts: 0, likes: 0, comments: 0, shares: 0, avg: 0 }
    const likes = list.reduce((s, p) => s + (p.likes ?? 0), 0)
    const comments = list.reduce((s, p) => s + (p.comments ?? 0), 0)
    const shares = list.reduce((s, p) => s + (p.shares ?? 0), 0)
    const avg = Math.round((likes + comments + shares) / list.length)
    return { posts: list.length, likes, comments, shares, avg }
  }

  const fb = platformStats(fbPosts)
  const ig = platformStats(igPosts)

  // ── Données graphique (engagement par jour, ordre chronologique) ─────────
  const byDate = new Map<string, EngagementPoint>()

  for (const post of [...postsList].reverse()) {
    if (!post.published_at) continue
    const dateKey = new Date(post.published_at).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
    const existing = byDate.get(dateKey) ?? { date: dateKey, facebook: 0, instagram: 0 }
    const eng = (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0)
    if (post.platform === 'facebook') existing.facebook += eng
    else existing.instagram += eng
    byDate.set(dateKey, existing)
  }

  const chartData = Array.from(byDate.values())

  // ── Top 5 posts ─────────────────────────────────────────────────────────
  const topPosts = [...postsList]
    .sort(
      (a, b) =>
        (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0) -
        ((a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0)),
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <Header title="Réseaux Sociaux" subtitle="Performance Facebook et Instagram" />

      {postsList.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="Aucun post collecté"
          description="Les données Facebook et Instagram apparaîtront ici une fois l'accès Meta configuré par votre administrateur."
        />
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Posts collectés"
              value={totalPosts}
              icon={Share2}
              iconColor="text-[#6C5CE7]"
              iconBg="bg-[#6C5CE7]/10"
            />
            <KpiCard
              title="Engagement total"
              value={totalEngagement.toLocaleString('fr-FR')}
              icon={Heart}
              iconColor="text-red-500"
              iconBg="bg-red-50"
            />
            <KpiCard
              title="Moy. engagement/post"
              value={avgEngagement.toLocaleString('fr-FR')}
              icon={BarChart2}
              iconColor="text-[#00CEC9]"
              iconBg="bg-[#00CEC9]/10"
            />
            <KpiCard
              title="Meilleur post"
              value={
                bestPost
                  ? (
                      (bestPost.likes ?? 0) +
                      (bestPost.comments ?? 0) +
                      (bestPost.shares ?? 0)
                    ).toLocaleString('fr-FR')
                  : '--'
              }
              icon={Trophy}
              iconColor="text-amber-500"
              iconBg="bg-amber-50"
            />
          </div>

          {/* Facebook vs Instagram */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              Comparatif Facebook vs Instagram
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PlatformStat label="Facebook" dotClass="bg-blue-600" stats={fb} showShares />
              <PlatformStat label="Instagram" dotClass="bg-purple-500" stats={ig} />
            </div>
          </Card>

          {/* Graphique engagement */}
          <SocialEngagementChart data={chartData} />

          {/* Meilleur post */}
          {bestPost && (
            <Card className="p-5 border-amber-200 bg-amber-50/30">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Meilleur post
              </h3>
              <div className="flex items-start gap-3">
                <Badge
                  variant={bestPost.platform === 'facebook' ? 'default' : 'secondary'}
                  className={
                    bestPost.platform === 'facebook'
                      ? 'bg-blue-600 shrink-0'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shrink-0'
                  }
                >
                  {bestPost.platform === 'facebook' ? 'Facebook' : 'Instagram'}
                </Badge>
                <div className="flex-1 min-w-0">
                  {bestPost.content ? (
                    <p className="text-sm text-gray-700 line-clamp-3">{bestPost.content}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Contenu non disponible</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> {bestPost.likes ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {bestPost.comments ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="w-3 h-3" /> {bestPost.shares ?? 0}
                    </span>
                    {bestPost.published_at && (
                      <span className="text-gray-400 ml-auto">
                        {new Date(bestPost.published_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Top 5 posts */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-600 uppercase tracking-wide">
              Top posts
            </h2>
            {topPosts.map((post, i) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg font-bold text-gray-200 w-6 shrink-0 select-none">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge
                        variant={post.platform === 'facebook' ? 'default' : 'secondary'}
                        className={
                          post.platform === 'facebook'
                            ? 'bg-blue-600'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0'
                        }
                      >
                        {post.platform === 'facebook' ? 'Facebook' : 'Instagram'}
                      </Badge>
                      {post.published_at && (
                        <span className="text-xs text-gray-400">
                          {new Date(post.published_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    {post.content && (
                      <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {post.likes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {post.comments ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="w-3 h-3" /> {post.shares ?? 0}
                      </span>
                      <span className="font-semibold text-gray-600 ml-auto">
                        {(
                          (post.likes ?? 0) +
                          (post.comments ?? 0) +
                          (post.shares ?? 0)
                        ).toLocaleString('fr-FR')}{' '}
                        eng.
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

// ── Composant local : stats d'une plateforme ────────────────────────────────

function PlatformStat({
  label,
  dotClass,
  stats,
  showShares = false,
}: {
  label: string
  dotClass: string
  stats: { posts: number; likes: number; comments: number; shares: number; avg: number }
  showShares?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-3 h-3 rounded-full ${dotClass}`} />
        <span className="font-medium text-sm text-gray-900">{label}</span>
        <Badge variant="secondary" className="ml-auto">
          {stats.posts} posts
        </Badge>
      </div>
      <div className="space-y-2 pl-5">
        <StatRow label="Likes" value={stats.likes.toLocaleString('fr-FR')} />
        <StatRow label="Commentaires" value={stats.comments.toLocaleString('fr-FR')} />
        {showShares && <StatRow label="Partages" value={stats.shares.toLocaleString('fr-FR')} />}
        <StatRow label="Moy. engagement/post" value={stats.avg.toLocaleString('fr-FR')} bold />
      </div>
    </div>
  )
}

function StatRow({
  label,
  value,
  bold = false,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-semibold text-gray-900' : 'text-gray-700'}>{value}</span>
    </div>
  )
}
