'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import {
  Star, Share2, Users, Search, Brain, LayoutDashboard,
  ArrowRight, CheckCircle2, X, Zap, BarChart2, Globe, Menu,
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CookieBanner from './CookieBanner'

// ─── Translations ──────────────────────────────────────────────────────────────
const T = {
  fr: {
    nav: { features: 'Fonctionnalités', how: 'Comment ça marche', pricing: 'Tarifs', contact: 'Contact', demo: 'Voir la démo', login: 'Se connecter', cta: 'Obtenir l\'accès' },
    hero: {
      badge: 'Plateforme d\'intelligence commerciale locale',
      title1: 'Votre business,',
      title2: 'sous surveillance intelligente.',
      sub: 'Axora Data centralise vos avis Google, réseaux sociaux, données SEO et concurrents — et génère chaque mois des recommandations IA actionnables.',
      cta1: 'Voir la démo', cta2: 'Obtenir l\'accès',
      trust: ['Configuration en 24h', 'Données en temps réel', 'Rapport IA mensuel', 'Aucune compétence technique requise'],
    },
    trustBar: ['Configuration en 24h', 'Synchronisation temps réel', 'Rapport IA mensuel', 'Aucune compétence requise', 'Propulsé par Claude AI'],
    problem: {
      label: 'Le problème',
      title: 'Gérer sa présence locale est un travail à plein temps.',
      sub: 'Vous jongler entre plusieurs onglets, outils et notifications — sans avoir une idée claire de ce qui fait vraiment bouger les choses.',
      cards: [
        { title: 'Données dispersées', desc: 'Google, Facebook, Instagram, site web — tout est cloisonné dans des outils séparés, sans vue unifiée.' },
        { title: 'Zéro visibilité', desc: 'Vous ne savez pas comment vous vous situez par rapport à vos concurrents ni pourquoi vos notes évoluent.' },
        { title: 'Temps gaspillé', desc: 'La collecte et les rapports manuels bouffent un temps précieux qui devrait aller à la croissance de votre business.' },
        { title: 'Pas de priorités claires', desc: 'Trop d\'informations, pas assez de clarté sur ce qu\'il faut vraiment corriger en premier.' },
      ],
    },
    solution: {
      label: 'La solution', title1: 'Une plateforme.', title2: 'Visibilité totale.',
      sub: 'Axora Data est la source de vérité unique pour vos performances digitales locales. Tout collecté automatiquement, analysé par IA, livré sous forme de priorités claires.',
      bullets: ['Toutes vos sources — Google, social, SEO, concurrents — dans un seul tableau de bord.', 'Collecte quotidienne automatisée. Zéro intervention manuelle.', 'Rapport IA mensuel avec recommandations classées par priorité.', 'Opérationnel en 24h. Aucun développeur requis.'],
    },
    features: {
      label: 'Fonctionnalités', title1: 'Tout ce dont votre business a besoin.', title2: 'Rien de plus.',
      items: [
        { title: 'Avis Google', desc: 'Collecte et analyse automatiques. Alertes en temps réel sur les avis négatifs avant qu\'ils impactent votre note.' },
        { title: 'Réseaux Sociaux', desc: 'Métriques Facebook et Instagram centralisées. Suivez l\'engagement, la portée et la croissance.' },
        { title: 'Veille Concurrents', desc: 'Benchmark automatique de vos concurrents locaux. Comparez les notes, avis et présence digitale.' },
        { title: 'Audit SEO', desc: 'Audit technique complet : Core Web Vitals, analyse on-page, données structurées, sitemap et robots.txt.' },
        { title: 'Rapports IA', desc: 'Chaque mois, Claude AI analyse toutes vos données et livre des recommandations personnalisées et hiérarchisées.' },
        { title: 'Dashboard 24/7', desc: 'Un seul endroit pour tout surveiller. Accessible depuis n\'importe quel appareil, à tout moment.' },
      ],
    },
    how: {
      label: 'Comment ça marche', title: 'Opérationnel en 3 étapes.',
      steps: [
        { num: '01', title: 'Configuration en 24h', desc: 'On configure votre compte avec toutes vos sources : Google My Business, Facebook, Instagram et votre site web. Aucun développeur requis.' },
        { num: '02', title: 'Collecte automatique', desc: 'Axora Data collecte et synchronise vos données chaque jour — avis, métriques, snapshots SEO, concurrents. Entièrement automatique.' },
        { num: '03', title: 'Recommandations IA', desc: 'Chaque mois, un rapport IA complet classe vos priorités. Sachez exactement quoi corriger en premier pour un impact maximal.' },
      ],
    },
    stats: [
      { value: '< 24h', label: 'Du compte créé aux premières données', sub: 'Sans onboarding fastidieux' },
      { value: '100%', label: 'Collecte de données automatisée', sub: 'Zéro intervention manuelle' },
      { value: '5×', label: 'Plus rapide que de le gérer vous-même', sub: 'Priorités IA, pas des suppositions' },
    ],
    pricing: {
      label: 'Tarifs', title: 'Prix transparents. Sans surprises.', sub: 'Frais de setup unique + maintenance mensuelle fixe.',
      setup: 'setup', monthly: '/mois',
      standard: { name: 'Standard', hint: 'Pour commencer', recommended: '', cta: 'Démarrer', features: ['Avis Google et alertes en temps réel', 'Suivi réseaux sociaux (FB + IG)', 'Veille concurrents (2 max)', 'Audit SEO de base', 'Accès dashboard complet', 'Support email'] },
      premium: { name: 'Premium', hint: 'Pour aller plus loin', recommended: 'RECOMMANDÉ', cta: 'Choisir Premium', features: ['Tout le plan Standard', 'SEO on-page complet (H1/H2/H3, canonical, Open Graph, JSON-LD)', 'Core Web Vitals (LCP, FCP, CLS, TBT, Speed Index)', 'Rapports IA mensuels complets avec recommandations détaillées', 'Alertes prioritaires avis négatifs', 'Support prioritaire'] },
    },
    contact: {
      label: 'Obtenir l\'accès', title: 'Prêt à reprendre le contrôle de votre présence locale ?', sub: 'Remplissez ce formulaire et nous vous recontactons sous 24h.',
      firstName: 'Prénom', lastName: 'Nom', company: 'Entreprise', email: 'Email',
      phone: 'Téléphone', phoneOpt: '(optionnel)', plan: 'Plan souhaité', planDefault: 'Choisir un plan...',
      planStd: 'Standard — 1 000 € setup + 150 €/mois', planPrem: 'Premium — 1 500 € setup + 200 €/mois',
      message: 'Message', messageOpt: '(optionnel)', submit: 'Envoyer ma demande', sending: 'Envoi en cours...',
      privacy: 'Vos informations sont envoyées directement par email et ne sont jamais stockées sur nos serveurs. Conformité RGPD.',
      successTitle: 'Message envoyé !', successBody: 'Merci pour votre demande. Nous vous recontactons sous 24h.',
    },
    footer: { rights: 'Tous droits réservés.', legal: 'Mentions légales', privacy: 'Confidentialité', terms: 'CGV' },
    mockup: { title: 'Rapport IA — Mars 2026', body: '3 actions prioritaires détectées. Votre concurrent a obtenu 7 nouveaux avis ce mois.' },
  },
  en: {
    nav: { features: 'Features', how: 'How it works', pricing: 'Pricing', contact: 'Contact', demo: 'See the demo', login: 'Sign in', cta: 'Get access' },
    hero: {
      badge: 'Local Business Intelligence Platform',
      title1: 'Your business,',
      title2: 'under intelligent surveillance.',
      sub: 'Axora Data centralizes your Google reviews, social media, SEO data and competitors — and generates monthly AI reports with ranked, actionable priorities.',
      cta1: 'See the demo', cta2: 'Get access',
      trust: ['Setup in 24h', 'Real-time data', 'Monthly AI report', 'No technical skills needed'],
    },
    trustBar: ['Setup in 24 hours', 'Real-time data sync', 'Monthly AI report', 'No technical skills needed', 'Powered by Claude AI'],
    problem: {
      label: 'The problem',
      title: 'Managing your local presence is a full-time job.',
      sub: 'You\'re juggling multiple tabs, tools and notifications — with no clear picture of what actually moves the needle.',
      cards: [
        { title: 'Scattered data', desc: 'Google, Facebook, Instagram, website — all siloed in separate tools with no unified view.' },
        { title: 'Zero visibility', desc: 'You don\'t know how you compare to competitors or why your ratings are changing.' },
        { title: 'Wasted hours', desc: 'Manual collection and reporting eats time that should go toward growing your business.' },
        { title: 'No clear priorities', desc: 'Too much information, not enough clarity on what to actually fix first.' },
      ],
    },
    solution: {
      label: 'The solution', title1: 'One platform.', title2: 'Complete visibility.',
      sub: 'Axora Data is the single source of truth for your local digital performance. Everything collected automatically, analyzed by AI, delivered as clear priorities.',
      bullets: ['All your sources — Google, social, SEO, competitors — in one dashboard.', 'Automated daily collection. Zero manual work.', 'Monthly AI report with ranked, personalized recommendations.', 'Live in 24h. No developers needed.'],
    },
    features: {
      label: 'Features', title1: 'Everything your business needs.', title2: 'Nothing it doesn\'t.',
      items: [
        { title: 'Google Reviews', desc: 'Automatic collection and sentiment analysis. Real-time alerts on negative reviews before they damage your rating.' },
        { title: 'Social Media', desc: 'Centralized Facebook and Instagram metrics. Track engagement, reach and follower growth over time.' },
        { title: 'Competitor Watch', desc: 'Automatic benchmarking of your local competitors. Compare ratings, review counts and digital presence.' },
        { title: 'SEO Audit', desc: 'Full technical audit: Core Web Vitals, on-page analysis, structured data, sitemap and robots.txt.' },
        { title: 'AI Reports', desc: 'Every month, Claude AI analyzes all your data and delivers prioritized, personalized recommendations.' },
        { title: 'Live Dashboard', desc: 'One place to monitor everything. Accessible from any device, any time. Always in sync.' },
      ],
    },
    how: {
      label: 'How it works', title: 'Up and running in 3 steps.',
      steps: [
        { num: '01', title: 'Configure in 24h', desc: 'We set up your account with all your sources: Google My Business, Facebook, Instagram, and your website. No dev work required.' },
        { num: '02', title: 'Automated collection', desc: 'Axora Data collects and syncs your data every day — reviews, metrics, SEO snapshots, competitor data. Fully hands-free.' },
        { num: '03', title: 'AI recommendations', desc: 'Every month, a full AI report ranks your priorities. Know exactly what to fix first for maximum impact on your visibility.' },
      ],
    },
    stats: [
      { value: '< 24h', label: 'From sign-up to live data', sub: 'No long onboarding' },
      { value: '100%', label: 'Automated data collection', sub: 'Zero manual intervention' },
      { value: '5×', label: 'Faster than managing it yourself', sub: 'AI priorities, not guesswork' },
    ],
    pricing: {
      label: 'Pricing', title: 'Transparent pricing. No surprises.', sub: 'One-time setup fee + fixed monthly maintenance.',
      setup: 'setup', monthly: '/month',
      standard: { name: 'Standard', hint: 'To get started', recommended: '', cta: 'Get started', features: ['Google Reviews & real-time alerts', 'Social media tracking (FB + IG)', 'Competitor monitoring (2 max)', 'Base SEO audit', 'Full dashboard access', 'Email support'] },
      premium: { name: 'Premium', hint: 'To go further', recommended: 'RECOMMENDED', cta: 'Get Premium', features: ['Everything in Standard', 'Full on-page SEO (H1/H2/H3, canonical, Open Graph, JSON-LD)', 'Core Web Vitals (LCP, FCP, CLS, TBT, Speed Index)', 'Full monthly AI reports with detailed recommendations', 'Priority alerts on negative reviews', 'Priority support'] },
    },
    contact: {
      label: 'Get access', title: 'Ready to take control of your local presence?', sub: 'Fill in the form below and we\'ll get back to you within 24 hours.',
      firstName: 'First name', lastName: 'Last name', company: 'Company', email: 'Email',
      phone: 'Phone', phoneOpt: '(optional)', plan: 'Plan', planDefault: 'Select a plan...',
      planStd: 'Standard — 1 000 € setup + 150 €/month', planPrem: 'Premium — 1 500 € setup + 200 €/month',
      message: 'Message', messageOpt: '(optional)', submit: 'Send my request', sending: 'Sending...',
      privacy: 'Your data is sent directly by email and never stored on our servers. GDPR compliant.',
      successTitle: 'Message sent!', successBody: 'Thank you — we\'ll get back to you within 24 hours.',
    },
    footer: { rights: 'All rights reserved.', legal: 'Legal', privacy: 'Privacy', terms: 'Terms' },
    mockup: { title: 'AI Report — March 2026', body: '3 priority actions detected. Your main competitor received 7 new reviews this month.' },
  },
} as const

type Lang = keyof typeof T

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
  { label: 'Note Google',   value: '4.7 / 5',   sub: '124 avis',      color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/[0.1]',   border: 'border-amber-100 dark:border-amber-500/[0.1]' },
  { label: 'Avis ce mois',  value: '18',         sub: '+6 vs préc.',   color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-500/[0.1]',     border: 'border-blue-100 dark:border-blue-500/[0.1]' },
  { label: 'Engagement',    value: '1 240',      sub: '+12 % vs préc.', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/[0.1]', border: 'border-emerald-100 dark:border-emerald-500/[0.1]' },
  { label: 'Score SEO',     value: '87 / 100',  sub: '+5 pts',        color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/[0.1]',  border: 'border-purple-100 dark:border-purple-500/[0.1]' },
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
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />

      <div className="relative rounded-2xl border border-gray-200 dark:border-white/[0.09] bg-white dark:bg-[#0b1628]/95 shadow-xl dark:shadow-black/60 overflow-hidden">

        {/* ── Titlebar ── */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-3 h-5 rounded-md bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
            <span className="text-[10px] text-gray-400 dark:text-slate-500">axora-data.vercel.app/dashboard</span>
          </div>
        </div>

        {/* ── Layout sidebar + contenu ── */}
        <div className="flex min-h-0">

          {/* Sidebar */}
          <aside className="w-32 flex-none bg-[#030f1c] flex flex-col p-2 gap-0.5">
            {/* Logo */}
            <div className="flex items-center gap-1.5 px-2 py-2 mb-1.5">
              <div className="w-5 h-5 rounded-[4px] flex-none overflow-hidden">
                <img src="/logo.svg" alt="" className="w-full h-full" />
              </div>
              <span className="text-[9px] font-bold text-white truncate">Axora Data</span>
            </div>
            {/* Nav */}
            {NAV_ITEMS.map(({ Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${active ? 'bg-blue-600/20' : ''}`}>
                <Icon className={`w-3 h-3 flex-none ${active ? 'text-blue-400' : 'text-slate-600'}`} />
                <span className={`text-[8px] truncate ${active ? 'text-blue-300 font-medium' : 'text-slate-600'}`}>{label}</span>
              </div>
            ))}
          </aside>

          {/* Main */}
          <div className="flex-1 p-3 space-y-2.5 min-w-0 overflow-hidden">

            {/* KPI grid 2×2 */}
            <div className="grid grid-cols-2 gap-1.5">
              {KPIS.map((k) => (
                <div key={k.label} className={`${k.bg} border ${k.border} rounded-lg p-2`}>
                  <p className="text-[8px] text-gray-500 dark:text-slate-500 mb-1 truncate">{k.label}</p>
                  <p className={`text-xs font-bold leading-none ${k.color}`}>{k.value}</p>
                  <p className="text-[8px] text-emerald-500 mt-1">{k.sub}</p>
                </div>
              ))}
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
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-500/[0.08] border border-blue-200 dark:border-blue-500/[0.15] rounded-lg p-2">
              <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-blue-600 dark:text-blue-300 font-semibold mb-0.5">{mockupT.title}</p>
                <p className="text-[9px] text-gray-600 dark:text-slate-400 leading-snug line-clamp-2">{mockupT.body}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const t = T[lang]

  // Scroll reveal — re-run on lang change because keys change → DOM elements remount
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target) } }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    // Short delay so React finishes mounting new elements before we query them
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal:not(.in-view)').forEach((el) => observer.observe(el))
    })
    return () => { cancelAnimationFrame(id); observer.disconnect() }
  }, [lang])

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

  const inputCls = 'w-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 outline-none transition-all'

  const navItems: [string, string][] = [
    ['#features', t.nav.features],
    ['#how', t.nav.how],
    ['#pricing', t.nav.pricing],
    ['#contact', t.nav.contact],
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020817] text-gray-900 dark:text-white transition-colors">

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'Axora Data',
        applicationCategory: 'BusinessApplication',
        description: 'Local business intelligence platform. Centralize Google reviews, social media, SEO and competitors. Monthly AI-powered reports.',
        url: 'https://axora-data.vercel.app',
        offers: [
          { '@type': 'Offer', name: 'Standard', price: '1000', priceCurrency: 'EUR' },
          { '@type': 'Offer', name: 'Premium',  price: '1500', priceCurrency: 'EUR' },
        ],
        provider: { '@type': 'Organization', name: 'Axora Data', url: 'https://axora-data.vercel.app' },
      }) }} />

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/[0.06] bg-white/90 dark:bg-[#020817]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.svg" alt="Axora Data" width={28} height={28} />
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">Axora Data</span>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">{label}</a>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Lang toggle */}
            <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-lg overflow-hidden text-xs font-semibold">
              <button onClick={() => setLang('fr')} className={`px-2.5 py-1.5 transition-colors ${lang === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}>FR</button>
              <button onClick={() => setLang('en')} className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'}`}>EN</button>
            </div>
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 border border-gray-200 dark:border-white/[0.1] rounded-lg hover:border-gray-300 dark:hover:border-white/[0.2]">{t.nav.login}</Link>
            <a href="#contact" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-blue-600/20">{t.nav.cta}</a>
          </div>

          {/* Mobile */}
          <button className="md:hidden p-2 text-gray-500 dark:text-slate-400" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#020817] px-4 py-5 flex flex-col gap-4">
            {navItems.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="text-base font-medium text-gray-700 dark:text-slate-200">{label}</a>
            ))}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-lg overflow-hidden text-xs font-semibold">
                <button onClick={() => setLang('fr')} className={`px-2.5 py-1.5 ${lang === 'fr' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}>FR</button>
                <button onClick={() => setLang('en')} className={`px-2.5 py-1.5 ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-slate-300'}`}>EN</button>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="text-sm font-medium text-center border border-gray-200 dark:border-white/[0.1] text-gray-700 dark:text-slate-200 px-4 py-2.5 rounded-lg">{t.nav.login}</Link>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2.5 rounded-lg text-center">{t.nav.cta}</a>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Light mode: subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/40 dark:opacity-0" />
          {/* Dark mode: dot grid */}
          <div className="absolute inset-0 opacity-0 dark:opacity-40" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          {/* Dark mode: orbs */}
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full opacity-0 dark:opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)', animation: 'orb-float 9s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full opacity-0 dark:opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)', animation: 'orb-float 13s ease-in-out infinite reverse' }} />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 dark:from-[#020817] to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <div>
              <div className="hero-animate inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/[0.1] border border-blue-200 dark:border-blue-500/[0.2] text-blue-600 dark:text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                {t.hero.badge}
              </div>

              <h1 className="hero-animate hero-animate-delay-1 text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-[1.1] tracking-tight mb-6">
                {t.hero.title1}{' '}
                <span className={`bg-gradient-to-r ${isDark ? 'from-blue-400 to-indigo-400' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                  {t.hero.title2}
                </span>
              </h1>

              <p className="hero-animate hero-animate-delay-2 text-lg text-gray-600 dark:text-slate-300 leading-relaxed mb-8 max-w-lg">{t.hero.sub}</p>

              <div className="hero-animate hero-animate-delay-3 flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/demo" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm">
                  {t.hero.cta1} <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-white/[0.12] hover:border-gray-400 dark:hover:border-white/[0.25] bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] text-gray-700 dark:text-white font-semibold px-6 py-3.5 rounded-xl transition-all text-sm">
                  {t.hero.cta2}
                </a>
              </div>

              <div className="hero-animate hero-animate-delay-4 flex flex-wrap gap-5 text-sm text-gray-600 dark:text-slate-400">
                {t.hero.trust.map((s) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{s}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="hidden lg:block hero-animate hero-animate-delay-2">
              <DashboardMockup mockupT={t.mockup} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ───────────────────────────────────────────────────────── */}
      <div className="border-y border-gray-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-gray-600 dark:text-slate-400 font-medium">
            {[
              { Icon: Zap,        label: t.trustBar[0] },
              { Icon: BarChart2,  label: t.trustBar[1] },
              { Icon: Brain,      label: t.trustBar[2] },
              { Icon: Globe,      label: t.trustBar[3] },
              { Icon: Star,       label: t.trustBar[4] },
            ].map(({ Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />{label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PROBLEM ─────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-gray-50 dark:bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{t.problem.label}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5">{t.problem.title}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed">{t.problem.sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {t.problem.cards.map((p, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} flex gap-4 p-5 rounded-2xl border border-red-200 dark:border-red-500/[0.1] bg-red-50/50 dark:bg-red-500/[0.03] hover:border-red-300 dark:hover:border-red-500/[0.2] transition-colors`}>
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/[0.1] border border-red-200 dark:border-red-500/[0.15] flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-4 h-4 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base">{p.title}</h3>
                  <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ────────────────────────────────────────────────────────── */}
      <section className="py-28 bg-white dark:bg-[#0b1221] border-y border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{t.solution.label}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6">{t.solution.title1}<br />{t.solution.title2}</h2>
              <p className="text-gray-600 dark:text-slate-300 text-lg leading-relaxed mb-8">{t.solution.sub}</p>
              <ul className="space-y-4">
                {t.solution.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-gray-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal reveal-delay-2 hidden lg:block">
              <DashboardMockup mockupT={t.mockup} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-28 bg-gray-50 dark:bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{t.features.label}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">{t.features.title1}<br />{t.features.title2}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.features.items.map(({ title, desc }, i) => {
              const icons = [Star, Share2, Users, Search, Brain, LayoutDashboard]
              const Icon = icons[i]
              return (
                <div key={i} className={`reveal reveal-delay-${i + 1} group relative p-6 rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/[0.2] hover:bg-blue-50/30 dark:hover:bg-white/[0.04] transition-all duration-300`}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 60%)' }} />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/[0.1] border border-blue-200 dark:border-blue-500/[0.12] flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/[0.18] transition-colors">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">{title}</h3>
                    <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-28 bg-white dark:bg-[#0b1221] border-y border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{t.how.label}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">{t.how.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-7 left-[calc(16.5%+2.5rem)] right-[calc(16.5%+2.5rem)] h-px bg-gradient-to-r from-transparent via-blue-300/50 dark:via-blue-500/25 to-transparent" />
            {t.how.steps.map(({ num, title, desc }, i) => {
              const icons = [Zap, BarChart2, Brain]
              const Icon = icons[i]
              return (
                <div key={i} className={`reveal reveal-delay-${i + 1} flex flex-col items-center md:items-start text-center md:text-left`}>
                  <div className="relative w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/[0.1] border border-blue-200 dark:border-blue-500/[0.18] flex items-center justify-center mb-6 shrink-0">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="absolute -top-2.5 -right-2.5 text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-white dark:bg-[#0b1221] border border-blue-200 dark:border-blue-500/30 px-1.5 py-0.5 rounded-md">{num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
                  <p className="text-base text-gray-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            {t.stats.map((s, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1}`}>
                <p className="text-5xl sm:text-6xl font-extrabold mb-2 bg-gradient-to-br from-gray-900 to-gray-400 dark:from-white dark:to-slate-500 bg-clip-text text-transparent">{s.value}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{s.label}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-28 bg-white dark:bg-[#0b1221] border-y border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 reveal">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{t.pricing.label}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{t.pricing.title}</h2>
            <p className="text-gray-600 dark:text-slate-300 text-base">{t.pricing.sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Standard */}
            <div className="reveal reveal-delay-1 p-8 rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] flex flex-col">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">{t.pricing.standard.hint}</p>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">{t.pricing.standard.name}</p>
              <div className="mb-0.5"><span className="text-4xl font-extrabold text-gray-900 dark:text-white">1 000 €</span><span className="text-gray-400 dark:text-slate-500 text-sm ml-2">{t.pricing.setup}</span></div>
              <div className="mb-8"><span className="text-xl font-bold text-gray-600 dark:text-slate-300">150 €</span><span className="text-gray-400 dark:text-slate-500 text-sm ml-1">{t.pricing.monthly}</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {t.pricing.standard.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-base text-gray-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full text-center border border-gray-300 dark:border-white/[0.1] hover:border-blue-400 dark:hover:border-blue-500/40 hover:text-blue-600 dark:hover:text-blue-400 text-gray-600 dark:text-slate-300 font-semibold py-3 rounded-xl transition-all text-sm">{t.pricing.standard.cta}</a>
            </div>
            {/* Premium */}
            <div className="reveal reveal-delay-2 relative p-8 rounded-2xl border border-blue-400/60 dark:border-blue-500/[0.3] bg-blue-50/30 dark:bg-blue-500/[0.04] flex flex-col">
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-blue-600/30 tracking-wide">{t.pricing.premium.recommended}</span>
              </div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{t.pricing.premium.hint}</p>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">{t.pricing.premium.name}</p>
              <div className="mb-0.5"><span className="text-4xl font-extrabold text-gray-900 dark:text-white">1 500 €</span><span className="text-gray-400 dark:text-slate-500 text-sm ml-2">{t.pricing.setup}</span></div>
              <div className="mb-8"><span className="text-xl font-bold text-gray-600 dark:text-slate-300">200 €</span><span className="text-gray-400 dark:text-slate-500 text-sm ml-1">{t.pricing.monthly}</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {t.pricing.premium.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-base text-gray-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="#contact" className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20">{t.pricing.premium.cta}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-28 bg-gray-50 dark:bg-[#020817]">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">{t.contact.label}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">{t.contact.title}</h2>
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
                <select name="plan" required className={`${inputCls} bg-white dark:bg-[#0b1221]`}>
                  <option value="">{t.contact.planDefault}</option>
                  <option value="Standard">{t.contact.planStd}</option>
                  <option value="Premium">{t.contact.planPrem}</option>
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t.contact.message} <span className="text-gray-400 dark:text-slate-500">{t.contact.messageOpt}</span></label><textarea name="message" rows={3} placeholder="..." className={`${inputCls} resize-none`} /></div>

              {error && <div className="bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/[0.15] text-red-500 dark:text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all text-base shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
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
      <footer className="border-t border-gray-200 dark:border-white/[0.06] py-10 bg-white dark:bg-[#020817]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Axora Data" width={24} height={24} className="opacity-80" />
            <span className="font-bold text-gray-900 dark:text-white text-sm">Axora Data</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">© 2026 Axora Data. {t.footer.rights}</p>
          <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-slate-400">
            <Link href="/mentions-legales" className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors">{t.footer.legal}</Link>
            <Link href="/politique-confidentialite" className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors">{t.footer.privacy}</Link>
            <Link href="/cgv" className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors">{t.footer.terms}</Link>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
