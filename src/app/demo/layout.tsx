import Link from 'next/link'
import {
  LayoutDashboard, Star, Share2, Users, Search, Brain, Settings,
  Radar, FlaskConical,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/demo', label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: '/demo/reviews', label: 'Avis Google', icon: Star },
  { href: '/demo/social', label: 'Réseaux Sociaux', icon: Share2 },
  { href: '/demo/competitors', label: 'Concurrents', icon: Users },
  { href: '/demo/seo', label: 'SEO', icon: Search },
  { href: '/demo/reports', label: 'Rapports AI', icon: Brain },
]

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar demo fixe */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 flex-col w-64 bg-slate-900">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Radar className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm leading-tight">Business Radar</span>
            <span className="text-slate-500 text-xs leading-tight">974</span>
          </div>
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-amber-900">
            DÉMO
          </span>
        </div>

        <Separator className="bg-slate-800" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </p>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-150"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bas */}
        <div className="px-3 py-4 space-y-2">
          <Separator className="bg-slate-800 mb-3" />
          <div className="flex items-center gap-2 px-3">
            <ThemeToggle className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-700 text-slate-400" />
            <Link
              href="/login"
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
            >
              Se connecter →
            </Link>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 md:ml-64 min-w-0 flex flex-col min-h-screen">
        {/* Bandeau démo */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-2 bg-amber-50 border-b border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
          <FlaskConical className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 flex-1">
            <span className="font-bold">MODE DÉMO STANDARD</span> — Données fictives. Établissement : &quot;Le Barachois&quot; (exemple).
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/demo-premium" className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline hover:no-underline">
              Voir Premium →
            </Link>
            <Link href="/login" className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline hover:no-underline">
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
