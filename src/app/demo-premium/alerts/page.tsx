'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingDown, Users, Bell, BellOff, AlertTriangle, Info } from 'lucide-react'
import { DEMO_ALERTS } from '@/lib/demo-data'

type AlertType = 'negative_review' | 'seo_drop' | 'competitor_change'
type Severity = 'high' | 'medium' | 'low'
type FilterTab = 'all' | 'unread' | AlertType

function typeIcon(type: AlertType) {
  if (type === 'negative_review') return Star
  if (type === 'seo_drop') return TrendingDown
  return Users
}

function typeLabel(type: AlertType): string {
  if (type === 'negative_review') return 'Avis négatif'
  if (type === 'seo_drop') return 'Baisse SEO'
  return 'Concurrent'
}

function severityConfig(severity: Severity) {
  if (severity === 'high') {
    return {
      bar: 'bg-red-500',
      badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
      icon: 'text-red-500',
      label: 'Haute',
    }
  }
  if (severity === 'medium') {
    return {
      bar: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      icon: 'text-amber-500',
      label: 'Moyenne',
    }
  }
  return {
    bar: 'bg-slate-400',
    badge: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    icon: 'text-slate-400',
    label: 'Basse',
  }
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return "À l'instant"
  if (h < 24) return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  return `Il y a ${d}j`
}

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'unread', label: 'Non lues' },
  { id: 'negative_review', label: 'Avis' },
  { id: 'seo_drop', label: 'SEO' },
  { id: 'competitor_change', label: 'Concurrents' },
]

export default function DemoPremiumAlertsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const unreadCount = DEMO_ALERTS.filter(a => !a.is_read).length

  const filtered = DEMO_ALERTS.filter(a => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !a.is_read
    return a.type === activeTab
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Alertes</h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">Notifications et alertes prioritaires</p>
      </div>

      {/* Unread count banner */}
      {unreadCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {unreadCount} alerte{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''} — action recommandée
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {FILTER_TABS.map(tab => {
          const count = tab.id === 'all'
            ? DEMO_ALERTS.length
            : tab.id === 'unread'
              ? unreadCount
              : DEMO_ALERTS.filter(a => a.type === tab.id).length
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-slate-500">Aucune alerte pour ce filtre</p>
          </div>
        )}
        {filtered.map(alert => {
          const sev = severityConfig(alert.severity as Severity)
          const Icon = typeIcon(alert.type as AlertType)
          return (
            <Card key={alert.id} className="p-0 overflow-hidden">
              <div className="flex">
                {/* Severity bar */}
                <div className={`w-1 shrink-0 ${sev.bar}`} />

                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`mt-0.5 shrink-0 ${sev.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {!alert.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-label="Non lu" />
                          )}
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {alert.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                          <Badge className={`text-[10px] px-1.5 py-0 border ${sev.badge} hover:${sev.badge}`}>
                            {sev.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500 dark:text-slate-400">
                            {typeLabel(alert.type as AlertType)}
                          </Badge>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Bell className="w-3 h-3" />
                          {relativeTime(alert.created_at)}
                        </span>
                        {!alert.is_read && (
                          <span className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Action requise
                          </span>
                        )}
                        {alert.is_read && (
                          <span className="text-xs text-gray-400 dark:text-slate-500">Lu</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
