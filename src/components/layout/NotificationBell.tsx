'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Brain, Star, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { AppNotification } from '@/app/api/notifications/route'

const LS_KEY = 'notifications_last_seen'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLastSeen(localStorage.getItem(LS_KEY))
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
      .catch(() => {})
  }, [])

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen(v => !v)
    if (!open) {
      const now = new Date().toISOString()
      localStorage.setItem(LS_KEY, now)
      setLastSeen(now)
    }
  }

  const unreadCount = items.filter(
    item => !lastSeen || new Date(item.date) > new Date(lastSeen)
  ).length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        aria-label="Notifications"
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
          {/* Header panel */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <Bell className="w-6 h-6 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Aucune notification cette semaine</p>
              </div>
            ) : (
              items.map(item => {
                const isUnread = !lastSeen || new Date(item.date) > new Date(lastSeen)
                const Icon = item.type === 'new_report' ? Brain : Star
                const iconColor = item.type === 'new_report' ? 'text-blue-500' : 'text-red-400'
                const iconBg = item.type === 'new_report' ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-red-50 dark:bg-red-950/30'
                const href = item.type === 'new_report' ? '/dashboard/reports' : '/dashboard/reviews'

                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${isUnread ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''}`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${iconBg}`}>
                      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-300 shrink-0 mt-1" />
                  </Link>
                )
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-800">
              <p className="text-[10px] text-gray-400 text-center">Notifications des 7 derniers jours</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
