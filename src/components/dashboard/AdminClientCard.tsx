'use client'

import { useState } from 'react'
import { MapPin, Globe, Facebook, Instagram, Star, BarChart2, MessageSquare, FileText, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdminEditPanel from '@/components/dashboard/AdminEditPanel'
import type { OrgWithData, BusinessWithMeta } from '@/types/admin'

interface Props {
  org: OrgWithData
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

interface KpiMiniProps {
  icon: React.ReactNode
  label: string
  value: string
}

function KpiMini({ icon, label, value }: KpiMiniProps) {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/60">
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-slate-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

export default function AdminClientCard({ org }: Props) {
  const [panelOpen, setPanelOpen] = useState(false)

  const mainBiz: BusinessWithMeta | undefined = org.businesses.find((b) => !b.is_competitor)
  const customCompetitors = org.businesses.filter((b) => b.is_competitor && b.custom_competitor)
  const competitorCount = customCompetitors.length

  const googleRating = mainBiz?.google_rating
  const reviewsCount = mainBiz?.google_reviews_count
  const seoScore = mainBiz?.seo_snapshots?.[0]?.lighthouse_score ?? null
  const lastReport = org.ai_reports?.[0]?.generated_at ?? null

  const isPremium = org.plan === 'premium'

  return (
    <>
      <Card className="flex flex-col p-0 overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight flex-1 min-w-0 truncate">
              {org.name}
            </p>
            <Badge
              variant="secondary"
              className={`shrink-0 text-xs font-medium ${
                isPremium
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              }`}
            >
              {isPremium ? '✦ Premium' : 'Standard'}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Créé le {formatDate(org.created_at)}
          </p>
        </div>

        {/* KPIs 2x2 */}
        <div className="px-4 py-3 grid grid-cols-2 gap-2">
          <KpiMini
            icon={<Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
            label="Note Google"
            value={googleRating != null ? `★ ${googleRating.toFixed(1)}` : '—'}
          />
          <KpiMini
            icon={<MessageSquare className="w-3 h-3" />}
            label="Avis"
            value={reviewsCount != null ? `${reviewsCount.toLocaleString('fr-FR')} avis` : '—'}
          />
          <KpiMini
            icon={<BarChart2 className="w-3 h-3" />}
            label="Score SEO"
            value={seoScore != null ? `${seoScore}/100` : '—'}
          />
          <KpiMini
            icon={<FileText className="w-3 h-3" />}
            label="Dernier rapport"
            value={lastReport ? formatDate(lastReport) : 'Aucun'}
          />
        </div>

        {/* Business info */}
        {mainBiz && (
          <div className="px-4 pb-2 space-y-1.5">
            <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{mainBiz.name}</p>
            <div className="flex flex-wrap gap-2">
              {mainBiz.google_place_id && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <MapPin className="w-3 h-3" /> Google
                </span>
              )}
              {mainBiz.website_url && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                  <Globe className="w-3 h-3" />
                  {mainBiz.website_url.replace(/https?:\/\//, '').replace(/\/$/, '').slice(0, 20)}
                </span>
              )}
              {mainBiz.facebook_page_id && (
                <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <Facebook className="w-3 h-3" /> Facebook
                </span>
              )}
              {mainBiz.instagram_username && (
                <span className="flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400">
                  <Instagram className="w-3 h-3" /> @{mainBiz.instagram_username}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Competitors count */}
        <div className="px-4 pb-3">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
            <Users className="w-3 h-3" />
            {competitorCount} concurrent{competitorCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 mt-auto">
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="w-full py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Modifier
          </button>
        </div>
      </Card>

      {panelOpen && mainBiz && (
        <AdminEditPanel
          org={org}
          mainBiz={mainBiz}
          competitors={customCompetitors}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </>
  )
}
