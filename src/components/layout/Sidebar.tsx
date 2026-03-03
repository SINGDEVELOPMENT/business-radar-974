'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: '◎' },
  { href: '/dashboard/reviews', label: 'Avis Google', icon: '★' },
  { href: '/dashboard/social', label: 'Réseaux Sociaux', icon: '◈' },
  { href: '/dashboard/competitors', label: 'Concurrents', icon: '◉' },
  { href: '/dashboard/seo', label: 'SEO', icon: '◇' },
  { href: '/dashboard/reports', label: 'Rapports AI', icon: '✦' },
]

const bottomItems = [
  { href: '/dashboard/settings', label: 'Paramètres', icon: '⚙' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
          R
        </div>
        <span className="text-white font-semibold text-sm">Business Radar 974</span>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
        >
          <span className="text-base">→</span>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
