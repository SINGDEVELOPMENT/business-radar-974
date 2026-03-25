'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Search, Users, Bell, CheckCheck, Check } from 'lucide-react'
import type { Alert } from '@/types'

type FilterTab = 'all' | 'unread' | 'negative_review' | 'seo_drop' | 'competitor_change'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'unread', label: 'Non lues' },
  { key: 'negative_review', label: 'Avis négatifs' },
  { key: 'seo_drop', label: 'SEO' },
  { key: 'competitor_change', label: 'Concurrents' },
]

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function severityBorder(severity: Alert['severity']): string {
  if (severity === 'high') return 'border-l-4 border-l-red-500'
  if (severity === 'medium') return 'border-l-4 border-l-amber-400'
  return 'border-l-4 border-l-blue-500'
}

function severityBadgeVariant(severity: Alert['severity']): 'destructive' | 'warning' | 'secondary' {
  if (severity === 'high') return 'destructive'
  if (severity === 'medium') return 'warning'
  return 'secondary'
}

function severityLabel(severity: Alert['severity']): string {
  if (severity === 'high') return 'Critique'
  if (severity === 'medium') return 'Moyen'
  return 'Faible'
}

function TypeIcon({ type }: { type: Alert['type'] }) {
  if (type === 'negative_review') return <Star className="w-4 h-4 text-red-400" />
  if (type === 'seo_drop') return <Search className="w-4 h-4 text-amber-400" />
  return <Users className="w-4 h-4 text-blue-400" />
}

function typeIconBg(type: Alert['type']): string {
  if (type === 'negative_review') return 'bg-red-500/10'
  if (type === 'seo_drop') return 'bg-amber-500/10'
  return 'bg-blue-500/10'
}

export default function AlertsPageClient() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set())

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts', { cache: 'no-store' })
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      setAlerts(data.alerts ?? [])
    } catch {
      toast.error('Impossible de charger les alertes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  async function markAsRead(ids: string[]) {
    setMarkingIds(prev => new Set([...prev, ...ids]))
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error()
      setAlerts(prev => prev.map(a => ids.includes(a.id) ? { ...a, is_read: true } : a))
      toast.success(ids.length === 1 ? 'Alerte marquée comme lue' : `${ids.length} alertes marquées comme lues`)
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setMarkingIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
    }
  }

  async function markAllRead() {
    const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id)
    if (unreadIds.length === 0) return
    await markAsRead(unreadIds)
  }

  const filtered = alerts.filter(a => {
    if (activeTab === 'unread') return !a.is_read
    if (activeTab === 'all') return true
    return a.type === activeTab
  })

  const unreadCount = alerts.filter(a => !a.is_read).length

  return (
    <div className="space-y-5">
      {/* Tabs + bulk action */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center">
          <Bell className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="font-medium text-gray-900 dark:text-white">Aucune alerte</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {activeTab === 'unread'
              ? 'Toutes vos alertes ont été lues.'
              : 'Aucune alerte dans cette catégorie pour le moment.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => (
            <Card
              key={alert.id}
              className={`p-4 ${severityBorder(alert.severity)} ${
                !alert.is_read ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
              } transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${typeIconBg(alert.type)}`}>
                  <TypeIcon type={alert.type} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                      {alert.title}
                    </span>
                    {!alert.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                    <Badge variant={severityBadgeVariant(alert.severity)} className="text-[10px] px-1.5 py-0">
                      {severityLabel(alert.severity)}
                    </Badge>
                  </div>
                  {alert.message && (
                    <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2 mb-1">
                      {alert.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-slate-500">
                    {relativeTime(alert.created_at)}
                  </p>
                </div>

                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead([alert.id])}
                    disabled={markingIds.has(alert.id)}
                    title="Marquer comme lu"
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
