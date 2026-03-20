'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  const [recentReports, setRecentReports] = useState(0)

  useEffect(() => {
    // Si on est sur la page rapports, marquer comme vu et effacer le badge
    if (pathname.startsWith('/dashboard/reports')) {
      localStorage.setItem('reports_last_seen', new Date().toISOString())
      setRecentReports(0)
      return
    }

    const lastSeen = localStorage.getItem('reports_last_seen')
      ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const supabase = createClient()
    supabase
      .from('ai_reports')
      .select('id', { count: 'exact', head: true })
      .gte('generated_at', lastSeen)
      .then(({ count }) => { setRecentReports(count ?? 0) })
  }, [pathname])

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
            ? 'bg-[#6C5CE7]/20 text-[#9B8FF2]'
            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
        )}
      >
        <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-[#9B8FF2]')} />
        <span className="flex-1">{label}</span>
        {href === '/dashboard/reports' && recentReports > 0 && (
          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
            {recentReports}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* FAB mobile — bas droite — Bell + ThemeToggle + Menu */}
      <div className="fixed bottom-6 right-4 z-50 md:hidden flex flex-col items-center gap-2">
        <button
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-white/[0.06] text-gray-600 dark:text-slate-300 shadow-lg border border-gray-200 dark:border-slate-700"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        <ThemeToggle className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-white/[0.06] shadow-lg border border-gray-200 dark:border-slate-700 !p-0" />

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/40 transition-transform duration-200"
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
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#1A1A2E] transition-transform duration-300',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16">
          <img src="/logo-white.svg" alt="Axora Data" className="h-7 w-auto" />
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {isSuperAdmin ? (
            <>
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Administration
              </p>
              {navLink('/dashboard/admin', 'Clients', ShieldCheck)}
            </>
          ) : (
            <>
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Navigation
              </p>
              {navItems.map((item) => navLink(item.href, item.label, item.icon))}
            </>
          )}
        </nav>

        {/* Bas de sidebar */}
        <div className="px-3 py-4 space-y-1">
          <Separator className="bg-white/[0.06] mb-3" />
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
