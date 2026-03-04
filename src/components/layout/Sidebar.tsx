'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
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
  ShieldCheck,
  Menu,
  X,
  Bell,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/dashboard/reviews', label: 'Avis Google', icon: Star },
  { href: '/dashboard/social', label: 'Réseaux Sociaux', icon: Share2 },
  { href: '/dashboard/competitors', label: 'Concurrents', icon: Users },
  { href: '/dashboard/seo', label: 'SEO', icon: Search },
  { href: '/dashboard/reports', label: 'Rapports AI', icon: Brain },
]

interface SidebarProps {
  isSuperAdmin?: boolean
}

export default function Sidebar({ isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function navLink(href: string, label: string, Icon: React.ElementType) {
    const isActive =
      href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-blue-600/20 text-blue-400'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-blue-400')} />
        {label}
      </Link>
    )
  }

  return (
    <>
      {/* FAB mobile — bas droite — Bell + ThemeToggle + Menu */}
      <div className="fixed bottom-6 right-4 z-50 md:hidden flex flex-col items-center gap-2">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-lg border border-gray-200 dark:border-slate-700"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <ThemeToggle className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 !p-0" />

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/40 transition-transform duration-200"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-900 transition-transform duration-300',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Radar className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm leading-tight">Business Radar</span>
            <span className="text-slate-500 text-xs leading-tight">974</span>
          </div>
        </div>

        <Separator className="bg-slate-800" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </p>
          {navItems.map((item) => navLink(item.href, item.label, item.icon))}

          {isSuperAdmin && (
            <>
              <Separator className="bg-slate-800 my-3" />
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </p>
              {navLink('/dashboard/admin', 'Clients', ShieldCheck)}
            </>
          )}
        </nav>

        {/* Bas de sidebar */}
        <div className="px-3 py-4 space-y-1">
          <Separator className="bg-slate-800 mb-3" />
          {navLink('/dashboard/settings', 'Paramètres', Settings)}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
