'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Star, Share2, Users, Search, Brain,
  Sparkles, Menu, X,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/demo-premium', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/demo-premium/reviews', label: 'Avis Google', icon: Star },
  { href: '/demo-premium/social', label: 'Réseaux Sociaux', icon: Share2 },
  { href: '/demo-premium/competitors', label: 'Concurrents', icon: Users },
  { href: '/demo-premium/seo', label: 'SEO', icon: Search },
  { href: '/demo-premium/reports', label: 'Rapports AI', icon: Brain },
]

export default function DemoPremiumLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 flex-col w-64 bg-slate-900">
        <div className="flex items-center gap-3 px-5 h-16">
          <img src="/logo.svg" alt="Axora" className="w-8 h-8 shrink-0" />
          <span className="text-white font-bold text-lg leading-tight tracking-tight">Axora</span>
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-white">PREMIUM</span>
        </div>
        <Separator className="bg-slate-800" />
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/demo-premium' ? pathname === '/demo-premium' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 space-y-2">
          <Separator className="bg-slate-800 mb-3" />
          <div className="flex items-center gap-2 px-3">
            <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400" />
            <Link href="/login" className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all">
              Se connecter →
            </Link>
          </div>
        </div>
      </aside>

      {/* FAB mobile */}
      <div className="fixed bottom-6 right-4 z-50 md:hidden flex flex-col items-center gap-2">
        <ThemeToggle className="w-11 h-11 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 !p-0" />
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/40 transition-transform duration-200"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Drawer mobile */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-900 transition-transform duration-300 md:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 px-5 h-16">
          <img src="/logo.svg" alt="Axora" className="w-8 h-8 shrink-0" />
          <span className="text-white font-bold text-lg leading-tight tracking-tight">Axora</span>
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-white">PREMIUM</span>
        </div>
        <Separator className="bg-slate-800" />
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/demo-premium' ? pathname === '/demo-premium' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="px-6 py-4">
          <Link href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300">Se connecter →</Link>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 md:ml-64 min-w-0 flex flex-col min-h-screen">
        {/* Bannière démo premium — compacte sur mobile */}
        <div className="sticky top-0 z-30 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-800">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate min-w-0">
            MODE DÉMO PREMIUM
            <span className="hidden sm:inline font-normal"> — Données fictives. Abonnement Premium activé.</span>
          </p>
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <Link href="/demo" className="text-xs text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap">
              ← Standard
            </Link>
            <Link href="/login" className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline hover:no-underline whitespace-nowrap">
              Mon dashboard →
            </Link>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
