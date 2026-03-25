'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Star, Search, Users, X, Lock, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import type { Alert } from '@/types'

function TypeIcon({ type }: { type: Alert['type'] }) {
  if (type === 'negative_review') return <Star className="w-3.5 h-3.5 text-red-400" />
  if (type === 'seo_drop') return <Search className="w-3.5 h-3.5 text-amber-400" />
  return <Users className="w-3.5 h-3.5 text-blue-400" />
}

function typeIconBg(type: Alert['type']): string {
  if (type === 'negative_review') return 'bg-red-50 dark:bg-red-950/30'
  if (type === 'seo_drop') return 'bg-amber-50 dark:bg-amber-950/30'
  return 'bg-blue-50 dark:bg-blue-950/30'
}

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

interface NotificationBellProps {
  isPremium?: boolean
}

export default function NotificationBell({ isPremium = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [markingAll, setMarkingAll] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchUnread = useCallback(async () => {
    if (!isPremium) return
    try {
      const res = await fetch('/api/alerts?unread=true', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      // Keep only last 5 for dropdown
      setAlerts((data.alerts ?? []).slice(0, 5))
    } catch {
      // Non-critical — silently ignore
    }
  }, [isPremium])

  useEffect(() => { fetchUnread() }, [fetchUnread])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function markAllRead() {
    const ids = alerts.map(a => a.id)
    if (ids.length === 0) return
    setMarkingAll(true)
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      setAlerts([])
    } catch {
      // Non-critical
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = alerts.length

  // Non-premium: show locked bell
  if (!isPremium) {
    return (
      <div className="relative">
        <button
          disabled
          title="Alertes — fonctionnalité Premium"
          className="relative p-2 rounded-lg text-gray-300 dark:text-slate-600 cursor-not-allowed"
          aria-label="Alertes (Premium uniquement)"
        >
          <Bell className="w-[18px] h-[18px]" />
          <Lock className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-gray-400 dark:text-slate-500" />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-gray-400 dark:text-slate-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        aria-label="Alertes"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Alertes
              {unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {unreadCount}
                </span>
              )}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell className="w-6 h-6 text-gray-300 dark:text-slate-600 mb-2" />
                <p className="text-sm text-gray-400 dark:text-slate-400">Aucune alerte non lue</p>
              </div>
            ) : (
              alerts.map(alert => (
                <Link
                  key={alert.id}
                  href="/dashboard/alerts"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors bg-blue-50/40 dark:bg-blue-950/10"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${typeIconBg(alert.type)}`}>
                    <TypeIcon type={alert.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{alert.title}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    </div>
                    {alert.message && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">{alert.message}</p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                      {relativeTime(alert.created_at)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <Link
              href="/dashboard/alerts"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-brand-light hover:underline"
            >
              Voir toutes les alertes
            </Link>
            {alerts.length > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout lire
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
