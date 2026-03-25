'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  Star, Share2, Users, Search, Brain, LayoutDashboard, Lightbulb,
  ArrowRight, CheckCircle2, X, Zap, BarChart2, Globe, Menu, EyeOff, Clock, ListX,
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CookieBanner from './CookieBanner'
import { T, type Lang } from '@/lib/landing/translations'
import { SHOW_SOCIAL_PROOF } from '@/config/features'

// ─── Animated counter hook ──────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, trigger: boolean): number {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start: number | null = null
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [trigger, target, duration])
  return count
}

// ─── Dashboard Mockup ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { Icon: LayoutDashboard, label: 'Vue d\'ensemble', active: true },
  { Icon: Star,            label: 'Avis Google',     active: false },
  { Icon: Share2,          label: 'Réseaux Sociaux', active: false },
  { Icon: Users,           label: 'Concurrents',     active: false },
  { Icon: Search,          label: 'SEO',             active: false },
  { Icon: Brain,           label: 'Rapports AI',     active: false },
]

const KPIS = [
  { label: 'Note Google',   value: '4.7 / 5',   sub: '124 avis',      color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/[0.1]',   border: 'border-amber-100 dark:border-amber-500/[0.1]', pulse: true },
  { label: 'Avis ce mois',  value: '18',         sub: '+6 vs préc.',   color: 'text-brand',  bg: 'bg-brand/[0.08] dark:bg-brand/[0.1]', border: 'border-brand/20 dark:border-brand/20', pulse: false },
  { label: 'Engagement',    value: '1 240',      sub: '+12 % vs préc.', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/[0.1]', border: 'border-emerald-100 dark:border-emerald-500/[0.1]', pulse: false },
  { label: 'Score SEO',     value: '87 / 100',  sub: '+5 pts',        color: 'text-brand', bg: 'bg-brand/[0.1] dark:bg-brand/[0.1]',  border: 'border-brand/[0.1] dark:border-brand/[0.1]', pulse: false },
]

const REVIEWS = [
  { stars: 5, text: 'Service excellent, très professionnel.', author: 'Marie L.' },
  { stars: 4, text: 'Bonne expérience, je recommande vivement.', author: 'Thomas R.' },
]

function DashboardMockup({ mockupT }: { mockupT: { title: string; body: string } }) {
  return (
    <div className="relative w-full select-none">
      {/* Glow dark mode */}
      <div className="absolute inset-[-15%] rounded-full pointer-events-none opacity-0 dark:opacity-100"
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)' }} />

      <div className="relative rounded-2xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#0b1628]/95 shadow-xl dark:shadow-black/60 overflow-hidden">

        {/* Titlebar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-3 h-5 rounded-md bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
            <span className="text-[10px] text-gray-400 dark:text-slate-500">axora-data.vercel.app/dashboard</span>
          </div>
        </div>

        {/* Layout sidebar + contenu */}
        <div className="flex min-h-0">

          {/* Sidebar */}
          <aside className="w-32 flex-none bg-[#1A1A2E] flex flex-col p-2 gap-0.5">
            <div className="flex items-center gap-1.5 px-2 py-2 mb-1.5">
              <img src="/favicon.svg" alt="" className="w-5 h-5 flex-none" />
            </div>
            {NAV_ITEMS.map(({ Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${active ? 'bg-brand/20' : ''}`}>
                <Icon className={`w-3 h-3 flex-none ${active ? 'text-brand-light' : 'text-slate-600'}`} />
                <span className={`text-[8px] truncate ${active ? 'text-brand-light font-medium' : 'text-slate-600'}`}>{label}</span>
              </div>
            ))}
          </aside>

          {/* Main */}
          <div className="flex-1 p-3 space-y-2.5 min-w-0 overflow-hidden">

            {/* Badge rapport IA — clignote */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/[0.08] dark:bg-brand/[0.1] border border-brand/20 dark:border-brand/30 w-fit"
              style={{ animation: 'badge-blink 3s ease-in-out infinite' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" style={{ animation: 'badge-blink 3s ease-in-out infinite' }} />
              <span className="text-[8px] text-brand dark:text-brand-light font-semibold">Nouveau rapport IA disponible</span>
            </div>

            {/* KPI grid 2×2 */}
            <div className="grid grid-cols-2 gap-1.5">
              {KPIS.map((k) => (
                <div key={k.label} className={`${k.bg} border ${k.border} rounded-lg p-2 ${k.pulse ? 'mockup-pulse' : ''}`}>
                  <p className="text-[8px] text-gray-500 dark:text-slate-500 mb-1 truncate">{k.label}</p>
                  <p className={`text-xs font-bold leading-none ${k.color}`}>{k.value}</p>
                  <p className="text-[8px] text-emerald-500 mt-1">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Barre de progression SEO */}
            <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] rounded-lg p-2">
              <div className="flex justify-between mb-1">
                <span className="text-[8px] text-gray-500 dark:text-slate-500">Score SEO global</span>
                <span className="text-[8px] font-bold text-brand dark:text-brand-light">87%</span>
              </div>
              <div className="h-1 rounded-full bg-gray-200 dark:bg-white/[0.08] overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: '87%', animation: 'progress-fill 1.8s ease-out forwards' }} />
              </div>
            </div>

            {/* Avis Google */}
            <div>
              <p className="text-[8px] font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-wider mb-1.5">Avis Google récents</p>
              <div className="space-y-1.5">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] rounded-lg p-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="flex gap-0.5">
                        {[0,1,2,3,4].map((s) => (
                          <div key={s} className={`w-1.5 h-1.5 rounded-sm ${s < r.stars ? 'bg-amber-400' : 'bg-gray-200 dark:bg-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-[8px] text-gray-400 dark:text-slate-600">{r.author}</span>
                    </div>
                    <p className="text-[9px] text-gray-600 dark:text-slate-400 truncate leading-snug">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapport IA */}
            <div className="flex items-start gap-2 bg-brand/[0.06] dark:bg-brand/[0.08] border border-brand/20 dark:border-brand/20 rounded-lg p-2">
              <div className="w-5 h-5 rounded-md bg-brand/10 dark:bg-brand/20 border border-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-3 h-3 text-brand dark:text-brand-light" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-brand dark:text-brand-light font-semibold mb-0.5">{mockupT.title}</p>
                <p className="text-[9px] text-gray-600 dark:text-slate-400 leading-snug line-clamp-2">{mockupT.body}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stars component ────────────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('fr')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const t = T[lang]

  // Sticky header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Stats counter trigger via IntersectionObserver
  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  // Scroll reveal — re-run on lang change because keys change → DOM elements remount
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target) } }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach((el) => observer.observe(el))
    })
    return () => { cancelAnimationFrame(id); observer.disconnect() }
  }, [lang])

  const count100 = useCountUp(100, 1200, statsVisible)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const formData = new FormData(e.target as HTMLFormElement)
    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? 'VOTRE_CLE_WEB3FORMS')
    formData.append('subject', `Nouvelle demande Axora Data — ${formData.get('plan')} — ${formData.get('entreprise')}`)
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
    const data = await res.json()
    setLoading(false)
    if (data.success) setSuccess(true)
    else setError("Erreur lors de l'envoi. Réessayez ou contactez-nous directement.")
  }

  const inputCls = 'w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-brand dark:focus:border-brand/50 focus:ring-1 focus:ring-brand/20 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 outline-none transition-all'

  const navItems: [string, string][] = [
    ['#features', t.nav.features],
    ['#how', t.nav.how],
    ['#pricing', t.nav.pricing],
    ['#contact', t.nav.contact],
  ]

  // Feature icon + color config
  const featureConfig = [
    { Icon: Star,          iconColor: 'text-amber-500',   iconBg: 'bg-amber-50 dark:bg-amber-500/[0.1]',   iconBorder: 'border-amber-200 dark:border-amber-500/[0.15]' },
    { Icon: Share2,        iconColor: 'text-violet-600',  iconBg: 'bg-violet-50 dark:bg-violet-500/[0.1]', iconBorder: 'border-violet-200 dark:border-violet-500/[0.15]' },
    { Icon: Users,         iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-500/[0.1]', iconBorder: 'border-emerald-200 dark:border-emerald-500/[0.15]' },
    { Icon: Search,        iconColor: 'text-accent',  iconBg: 'bg-accent/[0.08] dark:bg-accent/[0.08]', iconBorder: 'border-accent/20 dark:border-accent/20' },
    { Icon: Brain,         iconColor: 'text-brand',   iconBg: 'bg-brand/[0.08] dark:bg-brand/[0.1]', iconBorder: 'border-brand/20 dark:border-brand/20' },
    { Icon: LayoutDashboard, iconColor: 'text-brand', iconBg: 'bg-brand/[0.08] dark:bg-brand/[0.08]', iconBorder: 'border-brand/20 dark:border-brand/20' },
    { Icon: Lightbulb,       iconColor: 'text-amber-500',  iconBg: 'bg-amber-50 dark:bg-amber-500/[0.1]', iconBorder: 'border-amber-200 dark:border-amber-500/[0.15]' },
  ]

  // Problem card icon config
  const problemConfig = [
    { Icon: LayoutDashboard, iconColor: 'text-red-500',    iconBg: 'bg-red-100 dark:bg-red-500/[0.1]',    iconBorder: 'border-red-200 dark:border-red-500/[0.15]',    cardBg: 'bg-red-50/60 dark:bg-red-500/[0.04]',    cardBorder: 'border-red-200 dark:border-red-500/[0.12]' },
    { Icon: EyeOff,          iconColor: 'text-amber-600',  iconBg: 'bg-amber-100 dark:bg-amber-500/[0.1]', iconBorder: 'border-amber-200 dark:border-amber-500/[0.15]', cardBg: 'bg-amber-50/60 dark:bg-amber-500/[0.04]', cardBorder: 'border-amber-200 dark:border-amber-500/[0.12]' },
    { Icon: Clock,           iconColor: 'text-red-500',    iconBg: 'bg-red-100 dark:bg-red-500/[0.1]',    iconBorder: 'border-red-200 dark:border-red-500/[0.15]',    cardBg: 'bg-red-50/60 dark:bg-red-500/[0.04]',    cardBorder: 'border-red-200 dark:border-red-500/[0.12]' },
    { Icon: ListX,           iconColor: 'text-amber-600', iconBg: 'bg-amber-100 dark:bg-amber-500/[0.1]', iconBorder: 'border-amber-200 dark:border-amber-500/[0.15]', cardBg: 'bg-amber-50/60 dark:bg-amber-500/[0.04]', cardBorder: 'border-amber-200 dark:border-amber-500/[0.12]' },
  ]

  // Testimonial avatar colors
  const avatarColors = [
    'bg-brand',
    'bg-purple-500',
    'bg-emerald-500',
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d1a] text-gray-900 dark:text-white transition-colors">

      {/* CSS animations */}
      <style>{`
        @keyframes orb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-28px)} }
        @keyframes hero-in { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progress-fill { from{width:0} to{width:87%} }
        @keyframes badge-blink { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes mockup-pulse-anim { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.15)} 50%{box-shadow:0 0 0 4px rgba(245,158,11,0.08)} }
        .hero-animate { opacity:0; animation: hero-in 0.7s ease forwards; }
        .hero-animate-delay-1 { animation-delay:0.12s }
        .hero-animate-delay-2 { animation-delay:0.24s }
        .hero-animate-delay-3 { animation-delay:0.36s }
        .hero-animate-delay-4 { animation-delay:0.48s }
        .mockup-pulse { animation: mockup-pulse-anim 2.5s ease-in-out infinite; }
        .reveal { opacity:0; transform:translateY(16px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal.in-view { opacity:1; transform:translateY(0); }
        .reveal-delay-1 { transition-delay:0.08s }
        .reveal-delay-2 { transition-delay:0.16s }
        .reveal-delay-3 { transition-delay:0.24s }
        .reveal-delay-4 { transition-delay:0.32s }
        .reveal-delay-5 { transition-delay:0.40s }
        .reveal-delay-6 { transition-delay:0.48s }
      `}</style>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Axora Data',
        applicationCategory: 'BusinessApplication',
        description: 'Local business intelligence platform. Centralize Google reviews, social media, SEO and competitors. Monthly AI-powered reports.',
        url: 'https://axora-data.vercel.app',
        offers: [
          { '@type': 'Offer', name: 'Standard', price: '1000', priceCurrency: 'EUR' },
          { '@type': 'Offer', name: 'Premium',  price: '2000', priceCurrency: 'EUR' },
        ],
        provider: { '@type': 'Organization', name: 'Axora Data', url: 'https://axora-data.vercel.app' },
      }) }} />

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Image src="/logo.svg" alt="Axora Data" width={147} height={32} className="h-8 w-auto dark:hidden" />
            <Image src="/logo-white.svg" alt="Axora Data" width={147} height={32} className="h-8 w-auto hidden dark:block" />
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">{label}</a>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-lg overflow-hidden text-xs font-semibold">
              <button onClick={() => setLang('fr')} className={`px-2.5 py-1.5 transition-colors ${lang === 'fr' ? 'bg-brand text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}>FR</button>
              <button onClick={() => setLang('en')} className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-brand text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}>EN</button>
            </div>
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 border border-gray-200 dark:border-white/[0.1] rounded-lg hover:border-gray-300 dark:hover:border-white/[0.2]">{t.nav.login}</Link>
            <a href="#contact" className="text-sm font-semibold bg-brand hover:bg-brand-light text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-brand/20">{t.nav.cta}</a>
          </div>

          {/* Mobile burger */}
          <button className="md:hidden p-2 text-gray-500 dark:text-slate-400" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0d1a] px-4 py-5 flex flex-col gap-4">
            {navItems.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-base font-medium text-gray-700 dark:text-slate-200">{label}</a>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-lg overflow-hidden text-xs font-semibold">
                <button onClick={() => setLang('fr')} className={`px-2.5 py-1.5 ${lang === 'fr' ? 'bg-brand text-white' : 'text-gray-600 dark:text-slate-300'}`}>FR</button>
                <button onClick={() => setLang('en')} className={`px-2.5 py-1.5 ${lang === 'en' ? 'bg-brand text-white' : 'text-gray-600 dark:text-slate-300'}`}>EN</button>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="text-sm font-medium text-center border border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-lg">{t.nav.login}</Link>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm font-semibold bg-brand text-white px-4 py-2.5 rounded-lg text-center">{t.nav.cta}</a>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-0">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Light mode: subtle radial gradient */}
          <div className="absolute inset-0 dark:opacity-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,92,231,0.07) 0%, transparent 70%)' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-brand/[0.04] via-transparent to-accent/[0.03] dark:opacity-0" />
          {/* Dark mode: dot grid */}
          <div className="absolute inset-0 opacity-0 dark:opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          {/* Dark mode: orbs */}
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full opacity-0 dark:opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.5) 0%, transparent 70%)', animation: 'orb-float 9s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full opacity-0 dark:opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,206,201,0.4) 0%, transparent 70%)', animation: 'orb-float 13s ease-in-out infinite reverse' }} />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 dark:from-[#0d0d1a] to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <div>
              <div className="hero-animate inline-flex items-center gap-2 bg-brand/[0.08] dark:bg-brand/[0.1] border border-brand/20 dark:border-brand/30 text-brand dark:text-brand-light text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse shrink-0" />
                {t.hero.badge}
              </div>

              <h1 className="hero-animate hero-animate-delay-1 font-[family-name:var(--font-jakarta)] text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.1] tracking-tight mb-6">
                {t.hero.title1}{' '}
                <span className={`bg-gradient-to-r ${isDark ? 'from-brand-light to-accent' : 'from-brand to-accent'} bg-clip-text text-transparent`}>
                  {t.hero.title2}
                </span>
              </h1>

              <p className="hero-animate hero-animate-delay-2 text-lg text-gray-600 dark:text-slate-300 leading-relaxed mb-8 max-w-lg">{t.hero.sub}</p>

              <div className="hero-animate hero-animate-delay-3 flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/demo" className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-light text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-brand/25 text-sm">
                  {t.hero.cta1} <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-white/[0.12] hover:border-gray-400 dark:hover:border-white/[0.25] bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] text-gray-700 dark:text-white font-semibold px-6 py-3.5 rounded-xl transition-all text-sm">
                  {t.hero.cta2}
                </a>
              </div>

              <div className="hero-animate hero-animate-delay-4 flex flex-wrap gap-5 text-sm text-slate-400">
                {t.hero.trust.map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{s}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup desktop */}
            <div className="hidden lg:block hero-animate hero-animate-delay-2">
              <DashboardMockup mockupT={t.mockup} />
            </div>
          </div>

          {/* Mockup mobile — sous le texte */}
          <div className="lg:hidden mt-12 hero-animate hero-animate-delay-3">
            <DashboardMockup mockupT={t.mockup} />
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR (social proof) — contrôlé par SHOW_SOCIAL_PROOF dans src/config/features.ts */}
      {SHOW_SOCIAL_PROOF && (
        <div className="border-y border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
            <p className="text-center text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">{t.trustBar.text}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-slate-400 font-medium">
              {t.trustBar.clients.map((name, i) => (
                <span key={i} className="flex items-center gap-4">
                  {i > 0 && <span className="text-gray-300 dark:text-white/[0.1] select-none">·</span>}
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── PROBLEM ─────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gray-50 dark:bg-[#0d0d1a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 reveal">
            <span className="inline-block bg-red-100 dark:bg-red-500/[0.12] text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-5">
              {t.problem.label}
            </span>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight mb-5">{t.problem.title}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed">{t.problem.sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {t.problem.cards.map((p, i) => {
              const cfg = problemConfig[i]
              return (
                <div key={i} className={`reveal reveal-delay-${i + 1} flex gap-4 p-5 rounded-2xl border ${cfg.cardBorder} ${cfg.cardBg} hover:shadow-sm transition-all duration-200`}>
                  <div className={`w-9 h-9 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center shrink-0 mt-0.5`}>
                    <cfg.Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base">{p.title}</h3>
                    <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-slate-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <p className="text-xs font-semibold text-brand dark:text-brand-light uppercase tracking-widest mb-4">{t.solution.label}</p>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight mb-6">{t.solution.title1}<br />{t.solution.title2}</h2>
              <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed mb-8">{t.solution.sub}</p>
              <ul className="space-y-4">
                {t.solution.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-gray-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand dark:text-brand-light shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal reveal-delay-2 hidden lg:block">
              <div className="relative rounded-2xl border border-brand/20 dark:border-brand/15 bg-white dark:bg-[#1A1A2E] shadow-xl dark:shadow-black/40 overflow-hidden p-6">
                {/* Header carte rapport */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{t.mockup.title}</p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-500">Axora AI · Claude</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">Score 72/100</span>
                </div>
                {/* Recommandations */}
                {[
                  { priority: 'Haute', color: 'text-red-500 bg-red-50 dark:bg-red-500/10', action: 'Répondre aux 3 avis négatifs Google sous 24h' },
                  { priority: 'Haute', color: 'text-red-500 bg-red-50 dark:bg-red-500/10', action: 'Optimiser la balise title de votre page d\'accueil' },
                  { priority: 'Moy.', color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', action: 'Publier 2 posts Instagram cette semaine' },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-white/[0.05] last:border-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.color} shrink-0 mt-0.5`}>{r.priority}</span>
                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{r.action}</p>
                  </div>
                ))}
                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">Généré le 20 mars 2026</p>
                  <span className="text-[10px] text-brand dark:text-brand-light font-semibold">+2 recommandations →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-[#1A1A2E] border-b border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {t.stats.map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1}`}>
                <p className="text-5xl sm:text-6xl font-extrabold mb-2 bg-gradient-to-br from-gray-900 to-gray-400 dark:from-white dark:to-slate-500 bg-clip-text text-transparent">
                  {s.value === '100%'
                    ? `${statsVisible ? count100 : 0}%`
                    : s.value}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{s.label}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-gray-50 dark:bg-[#0d0d1a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-brand dark:text-brand-light uppercase tracking-widest mb-4">{t.features.label}</p>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight">{t.features.title1}<br />{t.features.title2}</h2>
          </div>

          {/* Feature IA en grand */}
          {(() => {
            const aiItem = t.features.items[4]
            const aiCfg = featureConfig[4]
            return (
              <div className="reveal mb-4 p-8 rounded-2xl border border-brand/20 dark:border-brand/20 bg-gradient-to-br from-brand/[0.04] to-accent/[0.02] dark:from-brand/[0.05] dark:to-accent/[0.02] hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className={`w-14 h-14 rounded-2xl ${aiCfg.iconBg} border ${aiCfg.iconBorder} flex items-center justify-center shrink-0`}>
                    <aiCfg.Icon className={`w-7 h-7 ${aiCfg.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{aiItem.title}</h3>
                    <p className="text-base text-gray-600 dark:text-slate-300 leading-relaxed max-w-2xl">{aiItem.desc}</p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* 5 autres features en grille */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.features.items.filter((_, i) => i !== 4).map((item, idx) => {
              const realIdx = idx < 4 ? idx : idx + 1
              const cfg = featureConfig[realIdx]
              return (
                <div key={idx} className={`reveal reveal-delay-${idx + 1} group relative p-6 rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-brand/30 dark:hover:border-brand/20 hover:bg-brand/[0.02] dark:hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(108,92,231,0.04) 0%, transparent 60%)' }} />
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center mb-4 transition-colors`}>
                      <cfg.Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">{item.title}</h3>
                    <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 bg-white dark:bg-[#1A1A2E] border-y border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-brand dark:text-brand-light uppercase tracking-widest mb-4">{t.how.label}</p>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight">{t.how.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Ligne horizontale de connexion (desktop) */}
            <div className="hidden md:block absolute top-7 left-[calc(16.5%+2.5rem)] right-[calc(16.5%+2.5rem)] h-px bg-gradient-to-r from-transparent via-brand/40 dark:via-brand/25 to-transparent" />
            {t.how.steps.map(({ num, title, desc }, i) => {
              const icons = [Zap, BarChart2, Brain]
              const Icon = icons[i]
              return (
                <div key={i} className={`reveal reveal-delay-${i + 1} flex flex-col items-center md:items-start text-center md:text-left`}>
                  <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shrink-0 bg-gradient-to-br from-brand to-accent shadow-lg shadow-brand/25">
                    <Icon className="w-6 h-6 text-white" />
                    <span className="absolute -top-2.5 -right-2.5 text-[10px] font-bold text-brand dark:text-brand-light bg-white dark:bg-[#1A1A2E] border border-brand/20 dark:border-brand/30 px-1.5 py-0.5 rounded-md">{num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS — contrôlé par SHOW_SOCIAL_PROOF dans src/config/features.ts */}
      {SHOW_SOCIAL_PROOF && (
        <section className="py-28 bg-gray-50 dark:bg-[#0d0d1a]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 reveal">
              <p className="text-xs font-semibold text-brand dark:text-brand-light uppercase tracking-widest mb-4">{t.testimonials.label}</p>
              <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight">{t.testimonials.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.testimonials.items.map((item, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 1} flex flex-col p-7 rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
                  <Stars count={item.stars} />
                  <p className="mt-4 mb-6 text-base italic text-gray-600 dark:text-slate-300 leading-relaxed flex-1">"{item.quote}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                    <div className={`w-10 h-10 rounded-full ${avatarColors[i]} flex items-center justify-center shrink-0`}>
                      <span className="text-xs font-bold text-white">{item.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{item.role} · {item.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white dark:bg-[#1A1A2E] border-y border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-brand dark:text-brand-light uppercase tracking-widest mb-4">{t.pricing.label}</p>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{t.pricing.title}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-base">{t.pricing.sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Standard */}
            <div className="reveal reveal-delay-1 p-8 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">{t.pricing.standard.hint}</p>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">{t.pricing.standard.name}</p>
              <div className="mb-0.5"><span className="text-4xl font-extrabold text-gray-900 dark:text-white">1 000 € <span className="text-lg font-bold">HT</span></span><span className="text-gray-400 dark:text-slate-500 text-sm ml-2">{t.pricing.setup}</span></div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">(1 085 € TTC)</p>
              <div className="mb-1"><span className="text-xl font-bold text-gray-600 dark:text-slate-300">150 € HT</span><span className="text-gray-400 dark:text-slate-500 text-sm ml-1">{t.pricing.monthly}</span></div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">(162,75 € TTC/mois)</p>
              <ul className="space-y-3 mb-8 flex-1">
                {t.pricing.standard.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-base text-gray-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full text-center border border-gray-300 dark:border-white/[0.1] hover:border-brand/40 dark:hover:border-brand/40 hover:text-brand dark:hover:text-brand-light text-gray-600 dark:text-slate-300 font-semibold py-3 rounded-xl transition-all text-sm">{t.pricing.standard.cta}</a>
            </div>
            {/* Premium */}
            <div className="reveal reveal-delay-2 relative p-8 rounded-2xl border-2 border-brand dark:border-brand/50 bg-brand/[0.03] dark:bg-brand/[0.04] flex flex-col shadow-xl shadow-brand/10 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-brand to-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-brand/30 tracking-wide">{t.pricing.premium.recommended}</span>
              </div>
              <p className="text-xs font-bold text-brand dark:text-brand-light uppercase tracking-widest mb-1">{t.pricing.premium.hint}</p>
              <p className="text-xs font-bold text-brand dark:text-brand-light uppercase tracking-widest mb-3">{t.pricing.premium.name}</p>
              <div className="mb-0.5"><span className="text-4xl font-extrabold text-gray-900 dark:text-white">2 000 € <span className="text-lg font-bold">HT</span></span><span className="text-gray-400 dark:text-slate-500 text-sm ml-2">{t.pricing.setup}</span></div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">(2 170 € TTC)</p>
              <div className="mb-1"><span className="text-xl font-bold text-gray-600 dark:text-slate-300">250 € HT</span><span className="text-gray-400 dark:text-slate-500 text-sm ml-1">{t.pricing.monthly}</span></div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">(271,25 € TTC/mois)</p>
              <ul className="space-y-3 mb-8 flex-1">
                {t.pricing.premium.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-base text-gray-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-brand dark:text-brand-light shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full text-center bg-brand hover:bg-brand-light text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-brand/20">{t.pricing.premium.cta}</a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">TVA applicable : 8,5 % (La Réunion). Prix TTC calculés sur cette base.</p>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-28 bg-gradient-to-br from-slate-50 to-brand/[0.04] dark:from-slate-900 dark:to-brand/[0.06]">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-semibold text-brand dark:text-brand-light uppercase tracking-widest mb-4">{t.contact.label}</p>
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{t.contact.title}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-base leading-relaxed">{t.contact.sub}</p>
          </div>

          {success ? (
            <div className="p-10 rounded-2xl border border-emerald-200 dark:border-emerald-500/[0.2] bg-emerald-50 dark:bg-emerald-500/[0.04] text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t.contact.successTitle}</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm">{t.contact.successBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reveal flex flex-col gap-4 p-8 rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02]">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.firstName}</label><input name="prenom" type="text" required placeholder="Jean" className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.lastName}</label><input name="nom" type="text" required placeholder="Dupont" className={inputCls} /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.company}</label><input name="entreprise" type="text" required placeholder="Mon Business" className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.email} <span className="text-red-400">*</span></label><input name="email" type="email" required placeholder="jean.dupont@example.com" className={inputCls} /></div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.phone} <span className="text-gray-400 dark:text-slate-500">{t.contact.phoneOpt}</span></label><input name="telephone" type="tel" placeholder="0692 00 00 00" className={inputCls} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t.contact.plan}</label>
                <select name="plan" required className={`${inputCls} bg-white dark:bg-[#1A1A2E]`}>
                  <option value="">{t.contact.planDefault}</option>
                  <option value="Standard">{t.contact.planStd}</option>
                  <option value="Premium">{t.contact.planPrem}</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.message} <span className="text-gray-400 dark:text-slate-500">{t.contact.messageOpt}</span></label><textarea name="message" rows={3} placeholder="..." className={`${inputCls} resize-none`} /></div>

              {error && <div className="bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/[0.15] text-red-500 dark:text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-base shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t.contact.sending}</>
                  : <>{t.contact.submit} <ArrowRight className="w-4 h-4" /></>}
              </button>
              <p className="text-xs text-gray-500 dark:text-slate-500 text-center leading-relaxed">{t.contact.privacy}</p>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1 — Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <Image src="/logo-white.svg" alt="Axora Data" width={128} height={28} className="h-7 w-auto opacity-90" />
              </div>
              <p className="text-sm leading-relaxed text-gray-400 mb-6">{t.footer.desc}</p>
              <p className="text-xs text-gray-500">© 2026 SING DEVELOPMENT — Axora Data. {t.footer.rights}</p>
            </div>

            {/* Col 2 — Produit */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">{t.footer.colProduct}</p>
              <ul className="space-y-2.5">
                {t.footer.links.product.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Légal */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">{t.footer.colLegal}</p>
              <ul className="space-y-2.5">
                {t.footer.links.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">{t.footer.colContact}</p>
              <ul className="space-y-2.5">
                <li>
                  <a href="mailto:contact@singdevelopment.fr" className="text-sm text-gray-400 hover:text-white transition-colors">contact@singdevelopment.fr</a>
                </li>
                <li>
                  <span className="text-sm text-gray-400">Saint-Leu, La Réunion 97436</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
