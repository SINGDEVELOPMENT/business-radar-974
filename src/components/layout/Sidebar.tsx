'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Star,
  Share2,
  Users,
  Search,
  Brain,
  Settings,
  LogOut,
  Radar,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { href: '/dashboard/reviews', label: 'Avis Google', icon: Star },
  { href: '/dashboard/social', label: 'Réseaux Sociaux', icon: Share2 },
  { href: '/dashboard/competitors', label: 'Concurrents', icon: Users },
  { href: '/dashboard/seo', label: 'SEO', icon: Search },
  { href: '/dashboard/reports', label: 'Rapports AI', icon: Brain },
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
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-900">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Radar className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm leading-tight">Business Radar</span>
          <span className="text-slate-500 text-xs leading-tight">974</span>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-blue-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 py-4 space-y-1">
        <Separator className="bg-slate-800 mb-3" />
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            pathname === '/dashboard/settings'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Paramètres
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
