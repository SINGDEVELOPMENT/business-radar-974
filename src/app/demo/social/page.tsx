import Header from '@/components/layout/Header'
import KpiCard from '@/components/dashboard/KpiCard'
import SocialEngagementChart from '@/components/dashboard/SocialEngagementChart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Share2, Heart, MessageCircle, Repeat2, ThumbsUp, Trophy, BarChart2,
} from 'lucide-react'
import { DEMO_SOCIAL_POSTS, DEMO_SOCIAL_CHART } from '@/lib/demo-data'

export default function DemoSocialPage() {
  const fbPosts = DEMO_SOCIAL_POSTS.filter(p => p.platform === 'facebook')
  const igPosts = DEMO_SOCIAL_POSTS.filter(p => p.platform === 'instagram')

  const platformStats = (list: typeof DEMO_SOCIAL_POSTS) => {
    const likes = list.reduce((s, p) => s + p.likes, 0)
    const comments = list.reduce((s, p) => s + p.comments, 0)
    const shares = list.reduce((s, p) => s + p.shares, 0)
    return { posts: list.length, likes, comments, shares, avg: list.length ? Math.round((likes + comments + shares) / list.length) : 0 }
  }

  const fb = platformStats(fbPosts)
  const ig = platformStats(igPosts)

  const totalEngagement = DEMO_SOCIAL_POSTS.reduce((s, p) => s + p.likes + p.comments + p.shares, 0)
  const avgEngagement = Math.round(totalEngagement / DEMO_SOCIAL_POSTS.length)
  const bestPost = [...DEMO_SOCIAL_POSTS].sort((a, b) =>
    (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)
  )[0]

  return (
    <div className="space-y-6">
      <Header title="Réseaux Sociaux" subtitle="Performance Facebook et Instagram" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Posts collectés" value={DEMO_SOCIAL_POSTS.length} icon={Share2} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <KpiCard title="Engagement total" value={totalEngagement.toLocaleString('fr-FR')} icon={Heart} iconColor="text-red-500" iconBg="bg-red-50" />
        <KpiCard title="Moy. engagement/post" value={avgEngagement} icon={BarChart2} iconColor="text-orange-500" iconBg="bg-orange-50" />
        <KpiCard
          title="Meilleur post"
          value={(bestPost.likes + bestPost.comments + bestPost.shares).toLocaleString('fr-FR')}
          icon={Trophy}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

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

      <SocialEngagementChart data={DEMO_SOCIAL_CHART} />

      <Card className="p-5 border-amber-200 bg-amber-50/30">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Meilleur post
        </h3>
        <div className="flex items-start gap-3">
          <Badge className={bestPost.platform === 'facebook' ? 'bg-blue-600 shrink-0' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shrink-0'}>
            {bestPost.platform === 'facebook' ? 'Facebook' : 'Instagram'}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 line-clamp-3">{bestPost.content}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {bestPost.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {bestPost.comments}</span>
              <span className="flex items-center gap-1"><Repeat2 className="w-3 h-3" /> {bestPost.shares}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function PlatformStat({ label, dotClass, stats, showShares = false }: {
  label: string; dotClass: string
  stats: { posts: number; likes: number; comments: number; shares: number; avg: number }
  showShares?: boolean
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-3 h-3 rounded-full ${dotClass}`} />
        <span className="font-medium text-sm text-gray-900">{label}</span>
        <Badge variant="secondary" className="ml-auto">{stats.posts} posts</Badge>
      </div>
      <div className="space-y-2 pl-5">
        {[
          { label: 'Likes', value: stats.likes.toLocaleString('fr-FR') },
          { label: 'Commentaires', value: stats.comments.toLocaleString('fr-FR') },
          ...(showShares ? [{ label: 'Partages', value: stats.shares.toLocaleString('fr-FR') }] : []),
          { label: 'Moy. engagement/post', value: stats.avg.toLocaleString('fr-FR'), bold: true },
        ].map(({ label: l, value, bold }) => (
          <div key={l} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{l}</span>
            <span className={bold ? 'font-semibold text-gray-900' : 'text-gray-700'}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
