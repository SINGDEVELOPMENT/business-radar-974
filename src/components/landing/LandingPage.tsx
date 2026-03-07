'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CookieBanner from './CookieBanner'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.target as HTMLFormElement)
    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? 'VOTRE_CLE_WEB3FORMS')
    formData.append(
      'subject',
      `Nouvelle demande Axora — ${formData.get('plan')} — ${formData.get('entreprise')}`
    )
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSuccess(true)
    } else {
      setError("Erreur lors de l'envoi. Réessayez ou contactez-nous directement.")
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Axora",
            "applicationCategory": "BusinessApplication",
            "description": "Dashboard d'intelligence commerciale locale pour les entreprises réunionnaises.",
            "url": "https://axora.vercel.app",
            "offers": [
              {
                "@type": "Offer",
                "name": "Standard",
                "price": "1000",
                "priceCurrency": "EUR",
                "description": "Setup one-shot + 150€/mois"
              },
              {
                "@type": "Offer",
                "name": "Premium",
                "price": "1500",
                "priceCurrency": "EUR",
                "description": "Setup one-shot + 200€/mois"
              }
            ],
            "provider": {
              "@type": "Organization",
              "name": "Axora",
              "url": "https://axora.vercel.app"
            }
          })
        }}
      />

      {/* ─── NAVBAR ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Axora" width={32} height={32} className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">Axora</span>
            </div>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Tarifs
              </a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>

            {/* CTAs desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/demo"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Voir la démo →
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </Link>
            </div>

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Menu mobile */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 flex flex-col gap-4">
              <a href="#features" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600">
                Fonctionnalités
              </a>
              <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600">
                Tarifs
              </a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="text-sm text-gray-600">
                Contact
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <Link href="/demo" className="text-sm font-medium text-blue-600">
                  Voir la démo →
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span>🌴</span>
            <span>Spécialement conçu pour La Réunion</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-4xl mx-auto mb-6">
            L&apos;intelligence commerciale locale,{' '}
            <span className="text-blue-400">en pilote automatique.</span>
          </h1>

          {/* Sous-titre */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Axora centralise vos avis Google, réseaux sociaux, données SEO et concurrents — et génère
            chaque mois des recommandations IA actionnables pour faire grandir votre business.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/demo"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-base"
            >
              Voir la démo →
            </Link>
            <a
              href="#contact"
              className="w-full sm:w-auto border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base"
            >
              Demander un accès
            </a>
          </div>

          {/* Indicateurs de confiance */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Setup en 24h
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Aucune compétence technique
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Données temps réel
            </span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Tout ce dont votre business a besoin
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Une plateforme complète pour surveiller, analyser et améliorer votre présence digitale locale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                emoji: '⭐',
                title: 'Avis Google',
                desc: 'Collecte et analyse automatique de vos avis. Alertes en temps réel sur les avis négatifs.',
              },
              {
                emoji: '📱',
                title: 'Réseaux Sociaux',
                desc: "Métriques Facebook et Instagram centralisées. Suivi de l'engagement et de la croissance.",
              },
              {
                emoji: '👥',
                title: 'Veille Concurrents',
                desc: 'Benchmark automatique de vos concurrents locaux. Comparez notes, avis et présence digitale.',
              },
              {
                emoji: '🔍',
                title: 'Audit SEO',
                desc: 'Audit technique complet de votre site : Core Web Vitals, on-page, données structurées, opportunités.',
              },
              {
                emoji: '🤖',
                title: 'Rapports IA',
                desc: 'Chaque mois, Claude AI analyse vos données et génère des recommandations prioritaires personnalisées.',
              },
              {
                emoji: '📊',
                title: 'Dashboard 24/7',
                desc: "Un seul endroit pour tout suivre. Accessible depuis n'importe quel appareil, partout.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-100 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100 transition-colors">
                  {f.emoji}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT CA MARCHE ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              En trois étapes simples, votre business est sous surveillance intelligente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion desktop */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-blue-100 z-0" />

            {[
              {
                num: '01',
                title: 'Configuration (24h)',
                desc: 'On configure votre compte avec vos sources : Google, Facebook, Instagram, site web.',
              },
              {
                num: '02',
                title: 'Collecte automatique',
                desc: "Axora collecte et agrège vos données chaque jour. Zéro intervention manuelle.",
              },
              {
                num: '03',
                title: 'Recommandations IA',
                desc: "Chaque mois, un rapport IA avec les actions prioritaires pour améliorer votre visibilité.",
              },
            ].map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center z-10">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl font-extrabold mb-6 shadow-lg shadow-blue-600/20">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TARIFS ─── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Des tarifs transparents, pensés pour les PME réunionnaises
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Un investissement unique + une maintenance mensuelle sans surprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* Standard */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Pour commencer</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Standard</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-gray-900">1 000 €</span>
                  <span className="text-gray-500 text-sm">setup</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-600">150 €</span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {[
                  'Avis Google & alertes',
                  'Réseaux sociaux (FB + IG)',
                  'Veille concurrents (2 max)',
                  'Audit SEO (base)',
                  'Dashboard complet',
                  'Support email',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="w-full text-center border border-gray-300 hover:border-blue-600 hover:text-blue-600 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Demander un accès
              </a>
            </div>

            {/* Premium */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 flex flex-col bg-blue-50/30 relative">
              {/* Badge Recommandé */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                  Recommandé
                </span>
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-blue-600 mb-1">Pour aller plus loin</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-4">Premium</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-gray-900">1 500 €</span>
                  <span className="text-gray-500 text-sm">setup</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-600">200 €</span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {[
                  'Tout le plan Standard',
                  'Analyse SEO on-page complète (H1/H2/H3, canonical, Open Graph, schema JSON-LD, sitemap, robots.txt)',
                  'Core Web Vitals (LCP, FCP, CLS, TBT, Speed Index)',
                  'Rapports IA mensuels complets avec recommandations détaillées',
                  'Alertes prioritaires avis négatifs',
                  'Support prioritaire',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20"
              >
                Choisir Premium
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Prêt à booster votre visibilité ?
            </h2>
            <p className="text-lg text-gray-500">
              Remplissez ce formulaire et nous vous recontactons sous 24h.
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Message envoyé !</h3>
              <p className="text-green-700">
                Merci pour votre demande. Nous vous recontactons sous 24h.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-5"
            >
              {/* Prénom + Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    name="prenom"
                    type="text"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    name="nom"
                    type="text"
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              {/* Entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                <input
                  name="entreprise"
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mon Restaurant — Saint-Denis"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jean.dupont@exemple.re"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  name="telephone"
                  type="tel"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0692 00 00 00"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan souhaité</label>
                <select
                  name="plan"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Choisir un plan...</option>
                  <option value="Standard">Standard — 1 000 € setup + 150 €/mois</option>
                  <option value="Premium">Premium — 1 500 € setup + 200 €/mois</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Décrivez votre activité, vos besoins, vos questions..."
                />
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  'Envoyer ma demande'
                )}
              </button>

              {/* Note RGPD */}
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Vos informations sont transmises directement par email et ne sont pas stockées sur nos
                serveurs. Elles sont utilisées uniquement pour vous recontacter.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            {/* Logo + nom */}
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Axora" width={24} height={24} className="w-6 h-6 opacity-70" />
              <span className="font-bold text-white">Axora</span>
            </div>
            {/* Fait avec amour */}
            <span>Fait avec ❤️ à La Réunion 🌋</span>
            {/* Copyright */}
            <div className="flex flex-col items-center sm:items-end gap-1">
              <span>© 2026 Axora. Tous droits réservés.</span>
              <div className="flex items-center gap-4 flex-wrap justify-center text-xs text-slate-500">
                <Link href="/mentions-legales" className="hover:text-slate-300 transition-colors">Mentions légales</Link>
                <span>·</span>
                <Link href="/politique-confidentialite" className="hover:text-slate-300 transition-colors">Politique de confidentialité</Link>
                <span>·</span>
                <Link href="/cgv" className="hover:text-slate-300 transition-colors">CGV</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  )
}
