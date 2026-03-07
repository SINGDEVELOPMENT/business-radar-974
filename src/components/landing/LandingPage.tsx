'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star, Share2, Users, Search, Brain, LayoutDashboard,
  ArrowRight, CheckCircle2, X, Zap, BarChart2, Globe, Menu,
} from 'lucide-react'
import CookieBanner from './CookieBanner'

const DF = { fontFamily: 'var(--font-syne, ui-sans-serif)' } // display font shorthand

// ─── Dashboard Mockup ──────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative w-full select-none">
      {/* Glow behind */}
      <div
        className="absolute inset-[-15%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }}
      />
      {/* Card */}
      <div className="relative rounded-2xl border border-white/[0.09] bg-[#0b1628]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Titlebar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-3 h-5 rounded-md bg-white/[0.05] flex items-center justify-center">
            <span className="text-[10px] text-slate-500">axora-data.vercel.app/dashboard</span>
          </div>
        </div>
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { l: 'Google Rating', v: '4.7/5',   t: '▲ +0.2', c: '#f59e0b' },
              { l: 'SEO Score',     v: '87/100',  t: '▲ +12',  c: '#3b82f6' },
              { l: 'Reviews/mo',   v: '18',       t: '▲ +6',   c: '#10b981' },
            ].map((k) => (
              <div key={k.l} className="bg-white/[0.04] rounded-xl p-2.5 border border-white/[0.05]">
                <p className="text-[9px] text-slate-500 mb-1 truncate">{k.l}</p>
                <p className="text-sm font-bold" style={{ color: k.c, fontFamily: 'var(--font-syne)' }}>{k.v}</p>
                <p className="text-[9px] text-emerald-500 mt-0.5">{k.t}</p>
              </div>
            ))}
          </div>
          {/* Chart */}
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-slate-600 mb-2">Engagement — last 7 days</p>
            <div className="flex items-end gap-1.5 h-14">
              {[35, 58, 42, 75, 52, 88, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(59,130,246,0.7), rgba(59,130,246,0.2))` }}
                />
              ))}
            </div>
          </div>
          {/* AI snippet */}
          <div className="flex items-start gap-2.5 bg-blue-500/[0.08] border border-blue-500/[0.15] rounded-xl p-3">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] text-blue-300 font-semibold mb-0.5">AI Report — March 2026</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">3 priority actions detected. Your main competitor received 7 new reviews this month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Scroll-reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.target as HTMLFormElement)
    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? 'VOTRE_CLE_WEB3FORMS')
    formData.append('subject', `Nouvelle demande Axora — ${formData.get('plan')} — ${formData.get('entreprise')}`)
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
    const data = await res.json()
    setLoading(false)
    if (data.success) setSuccess(true)
    else setError("Erreur lors de l'envoi. Réessayez ou contactez-nous directement.")
  }

  const inputCls = 'w-full bg-white/[0.04] border border-white/[0.08] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all'

  return (
    <div className="min-h-screen bg-[#020817] text-white" style={{ fontFamily: 'var(--font-dm, ui-sans-serif)' }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Axora',
            applicationCategory: 'BusinessApplication',
            description: 'Local business intelligence platform. Centralize Google reviews, social media, SEO and competitors. Monthly AI-powered reports.',
            url: 'https://axora-data.vercel.app',
            offers: [
              { '@type': 'Offer', name: 'Standard', price: '1000', priceCurrency: 'EUR', description: 'Setup + 150€/month' },
              { '@type': 'Offer', name: 'Premium',  price: '1500', priceCurrency: 'EUR', description: 'Setup + 200€/month' },
            ],
            provider: { '@type': 'Organization', name: 'Axora', url: 'https://axora-data.vercel.app' },
          })
        }}
      />

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#020817]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Axora" width={30} height={30} />
            <span className="text-lg font-bold tracking-tight" style={DF}>Axora</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {([['#features', 'Features'], ['#how', 'How it works'], ['#pricing', 'Pricing'], ['#contact', 'Contact']] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">{label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/demo" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">Demo →</Link>
            <Link
              href="#contact"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              Get access
            </Link>
          </div>

          <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#020817]/98 px-4 py-5 flex flex-col gap-4">
            {([['#features', 'Features'], ['#how', 'How it works'], ['#pricing', 'Pricing'], ['#contact', 'Contact']] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-sm text-slate-400">{label}</a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.06]">
              <Link href="/demo" className="text-sm font-medium text-blue-400">See the demo →</Link>
              <Link href="#contact" onClick={() => setMenuOpen(false)} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center">Get access</Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
          />
          {/* Blue orb */}
          <div
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
              animation: 'orb-float 9s ease-in-out infinite',
            }}
          />
          {/* Violet orb */}
          <div
            className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)',
              animation: 'orb-float 13s ease-in-out infinite reverse',
            }}
          />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#020817] to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <div>
              <div className="hero-animate inline-flex items-center gap-2 bg-blue-500/[0.1] border border-blue-500/[0.2] text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
                Local Business Intelligence Platform
              </div>

              <h1
                className="hero-animate hero-animate-delay-1 text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.1] tracking-tight mb-6"
                style={DF}
              >
                Your business,{' '}
                <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  under intelligent surveillance.
                </span>
              </h1>

              <p className="hero-animate hero-animate-delay-2 text-lg text-slate-400 leading-relaxed mb-8 max-w-lg">
                Axora centralizes your Google reviews, social media, SEO data and competitors — and generates monthly AI reports with ranked, actionable priorities.
              </p>

              <div className="hero-animate hero-animate-delay-3 flex flex-col sm:flex-row gap-3 mb-10">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm"
                >
                  See the demo <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 border border-white/[0.12] hover:border-white/[0.25] bg-white/[0.03] hover:bg-white/[0.06] text-white font-semibold px-6 py-3.5 rounded-xl transition-all text-sm"
                >
                  Get access
                </a>
              </div>

              <div className="hero-animate hero-animate-delay-4 flex flex-wrap gap-5 text-xs text-slate-500">
                {['Setup in 24h', 'Real-time data', 'Monthly AI report', 'No technical skills needed'].map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{s}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="hidden lg:block hero-animate hero-animate-delay-2">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ───────────────────────────────────────────────────────── */}
      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
            {[
              { icon: <Zap       className="w-3.5 h-3.5 text-blue-400" />, label: 'Setup in 24 hours' },
              { icon: <BarChart2 className="w-3.5 h-3.5 text-blue-400" />, label: 'Real-time data sync' },
              { icon: <Brain    className="w-3.5 h-3.5 text-blue-400" />, label: 'Monthly AI report' },
              { icon: <Globe    className="w-3.5 h-3.5 text-blue-400" />, label: 'No technical skills needed' },
              { icon: <Star     className="w-3.5 h-3.5 text-blue-400" />, label: 'Powered by Claude AI' },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-2">{icon}{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PROBLEM ─────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">The problem</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5" style={DF}>
              Managing your local presence is a full-time job.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              You&apos;re juggling multiple tabs, tools and notifications — with no clear picture of what actually moves the needle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { title: 'Scattered data',    desc: 'Google, Facebook, Instagram, website — all siloed in separate tools with no unified view.' },
              { title: 'Zero visibility',   desc: 'You don\'t know how you compare to competitors or why your ratings are changing.' },
              { title: 'Wasted hours',      desc: 'Manual collection and reporting eats time that should go toward growing your business.' },
              { title: 'No clear priorities', desc: 'Too much information, not enough clarity on what to actually fix first.' },
            ].map((p, i) => (
              <div
                key={p.title}
                className={`reveal reveal-delay-${i + 1} flex gap-4 p-5 rounded-2xl border border-red-500/[0.1] bg-red-500/[0.03] hover:border-red-500/[0.2] transition-colors`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/[0.1] border border-red-500/[0.15] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm" style={DF}>{p.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-[#0b1221] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">The solution</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6" style={DF}>
                One platform.<br />Complete visibility.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Axora is the single source of truth for your local digital performance. Everything collected automatically, analyzed by AI, delivered as clear priorities.
              </p>
              <ul className="space-y-4">
                {[
                  'All your sources — Google, social, SEO, competitors — in one dashboard.',
                  'Automated daily collection. Zero manual work.',
                  'Monthly AI report with ranked, personalized recommendations.',
                  'Live in 24h. No developers needed.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal reveal-delay-2 hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={DF}>
              Everything your business needs.<br />Nothing it doesn&apos;t.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { Icon: Star,            title: 'Google Reviews',    desc: 'Automatic collection and sentiment analysis. Real-time alerts on negative reviews before they damage your rating.',       delay: 1 },
              { Icon: Share2,          title: 'Social Media',      desc: 'Centralized Facebook and Instagram metrics. Track engagement, reach and follower growth over time.',                     delay: 2 },
              { Icon: Users,           title: 'Competitor Watch',  desc: 'Automatic benchmarking of your local competitors. Compare ratings, review counts and overall digital presence.',          delay: 3 },
              { Icon: Search,          title: 'SEO Audit',         desc: 'Full technical audit: Core Web Vitals, on-page analysis, structured data, sitemap and robots.txt.',                      delay: 4 },
              { Icon: Brain,           title: 'AI Reports',        desc: 'Every month, Claude AI analyzes all your data and delivers prioritized, personalized recommendations.',                   delay: 5 },
              { Icon: LayoutDashboard, title: 'Live Dashboard',    desc: 'One place to monitor everything. Accessible from any device, any time. Always in sync.',                                 delay: 6 },
            ].map(({ Icon, title, desc, delay }) => (
              <div
                key={title}
                className={`reveal reveal-delay-${delay} group relative p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/[0.2] transition-all duration-300`}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 60%)' }}
                />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/[0.1] border border-blue-500/[0.12] flex items-center justify-center mb-4 group-hover:bg-blue-500/[0.18] transition-colors">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm" style={DF}>{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 bg-[#0b1221] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={DF}>
              Up and running in 3 steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-7 left-[calc(16.5%+2.5rem)] right-[calc(16.5%+2.5rem)] h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

            {[
              {
                num: '01', Icon: Zap,      title: 'Configure in 24h',
                desc: 'We set up your account with all your sources: Google My Business, Facebook, Instagram, and your website. Zero dev work required.',
              },
              {
                num: '02', Icon: BarChart2, title: 'Automated collection',
                desc: 'Axora collects and syncs your data every single day — reviews, metrics, SEO snapshots, competitor data. Fully hands-free.',
              },
              {
                num: '03', Icon: Brain,    title: 'AI recommendations',
                desc: 'Every month, a full AI report ranks your priorities. Know exactly what to fix first for maximum impact on your visibility.',
              },
            ].map(({ num, Icon, title, desc }, i) => (
              <div key={num} className={`reveal reveal-delay-${i + 1} flex flex-col items-center md:items-start text-center md:text-left`}>
                <div className="relative w-14 h-14 rounded-2xl bg-blue-500/[0.1] border border-blue-500/[0.18] flex items-center justify-center mb-6 shrink-0">
                  <Icon className="w-5 h-5 text-blue-400" />
                  <span className="absolute -top-2.5 -right-2.5 text-[10px] font-bold text-blue-300 bg-[#0b1221] border border-blue-500/30 px-1.5 py-0.5 rounded-md" style={DF}>{num}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-3" style={DF}>{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {[
              { value: '< 24h', label: 'From sign-up to live data',        sub: 'No long onboarding' },
              { value: '100%',  label: 'Automated data collection',         sub: 'Zero manual intervention' },
              { value: '5×',    label: 'Faster than managing it yourself',  sub: 'AI priorities, not guesswork' },
            ].map((s, i) => (
              <div key={s.value} className={`reveal reveal-delay-${i + 1}`}>
                <p
                  className="text-5xl sm:text-6xl font-extrabold mb-2"
                  style={{ ...DF, background: 'linear-gradient(135deg, #fff 0%, #475569 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {s.value}
                </p>
                <p className="text-sm font-semibold text-white mb-1">{s.label}</p>
                <p className="text-xs text-slate-600">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-[#0b1221] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4" style={DF}>
              Transparent pricing. No surprises.
            </h2>
            <p className="text-slate-400 text-sm">One-time setup fee + fixed monthly maintenance. That&apos;s it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Standard */}
            <div className="reveal reveal-delay-1 p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Standard</p>
              <div className="mb-0.5">
                <span className="text-4xl font-extrabold text-white" style={DF}>1 000 €</span>
                <span className="text-slate-500 text-sm ml-2">setup</span>
              </div>
              <div className="mb-8">
                <span className="text-xl font-bold text-slate-300" style={DF}>150 €</span>
                <span className="text-slate-500 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Google Reviews & real-time alerts',
                  'Social media tracking (FB + IG)',
                  'Competitor monitoring (2 max)',
                  'Base SEO audit',
                  'Full dashboard access',
                  'Email support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="w-full text-center border border-white/[0.1] hover:border-blue-500/40 hover:text-blue-400 text-slate-300 font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Get started
              </a>
            </div>

            {/* Premium */}
            <div className="reveal reveal-delay-2 relative p-8 rounded-2xl border border-blue-500/[0.3] bg-blue-500/[0.04] flex flex-col">
              {/* Top highlight line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              {/* Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-600/30 tracking-wide">RECOMMENDED</span>
              </div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Premium</p>
              <div className="mb-0.5">
                <span className="text-4xl font-extrabold text-white" style={DF}>1 500 €</span>
                <span className="text-slate-500 text-sm ml-2">setup</span>
              </div>
              <div className="mb-8">
                <span className="text-xl font-bold text-slate-300" style={DF}>200 €</span>
                <span className="text-slate-500 text-sm ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Everything in Standard',
                  'Full on-page SEO (H1/H2/H3, canonical, Open Graph, JSON-LD)',
                  'Core Web Vitals (LCP, FCP, CLS, TBT, Speed Index)',
                  'Full monthly AI reports with detailed recommendations',
                  'Priority alerts on negative reviews',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20"
              >
                Get Premium
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-28 bg-[#020817]">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">Get access</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4" style={DF}>
              Ready to take control of your local presence?
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fill in the form below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          {success ? (
            <div className="p-10 rounded-2xl border border-emerald-500/[0.2] bg-emerald-500/[0.04] text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2" style={DF}>Message sent!</h3>
              <p className="text-slate-400 text-sm">Thank you — we&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reveal flex flex-col gap-4 p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">First name</label>
                  <input name="prenom" type="text" required placeholder="Jean" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Last name</label>
                  <input name="nom" type="text" required placeholder="Dupont" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Company</label>
                <input name="entreprise" type="text" required placeholder="My Business — Saint-Denis" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input name="email" type="email" required placeholder="jean.dupont@example.com" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone <span className="text-slate-600 font-normal">(optional)</span></label>
                <input name="telephone" type="tel" placeholder="0692 00 00 00" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Plan</label>
                <select name="plan" required className={`${inputCls} bg-[#0b1221]`}>
                  <option value="">Select a plan...</option>
                  <option value="Standard">Standard — 1 000 € setup + 150 €/month</option>
                  <option value="Premium">Premium — 1 500 € setup + 200 €/month</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Message <span className="text-slate-600 font-normal">(optional)</span></label>
                <textarea name="message" rows={3} placeholder="Tell us about your business and your goals..." className={`${inputCls} resize-none`} />
              </div>

              {error && (
                <div className="bg-red-500/[0.08] border border-red-500/[0.15] text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</>
                ) : (
                  <>Send my request <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-slate-600 text-center leading-relaxed">
                Your information is sent directly by email and never stored on our servers.
                Used solely to contact you. GDPR / RGPD compliant.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Axora" width={26} height={26} className="opacity-80" />
              <span className="font-bold text-white" style={DF}>Axora</span>
            </div>
            <p className="text-xs text-slate-700">© 2026 Axora. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-slate-600">
              <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">Legal</Link>
              <Link href="/politique-confidentialite" className="hover:text-slate-400 transition-colors">Privacy</Link>
              <Link href="/cgv" className="hover:text-slate-400 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
