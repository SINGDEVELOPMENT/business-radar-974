'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings2, X } from 'lucide-react'

const STORAGE_KEY = 'axora_cookie_consent'

export default function CookieBanner() {
  const [bannerVisible, setBannerVisible] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY)
    if (!consent) {
      setBannerVisible(true)
    } else {
      setHasConsent(true)
    }
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, date: new Date().toISOString() }))
    setBannerVisible(false)
    setHasConsent(true)
  }

  function refuse() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, date: new Date().toISOString() }))
    setBannerVisible(false)
    setHasConsent(true)
  }

  return (
    <>
      {/* ─── Bannière principale ─── */}
      {bannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-2xl">
          <div className="max-w-5xl mx-auto p-4 md:p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Ce site utilise des cookies
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                    Nous utilisons des cookies <strong>strictement nécessaires</strong> au fonctionnement du site (authentification, session) ainsi que des cookies <strong>analytiques</strong> pour mesurer l&apos;audience de manière anonyme. Vous pouvez refuser les cookies analytiques sans que cela affecte votre navigation.{' '}
                    <Link href="/politique-confidentialite" className="text-blue-500 hover:underline">
                      Politique de confidentialité
                    </Link>
                  </p>
                </div>
                <button
                  onClick={() => setBannerVisible(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 shrink-0 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showDetails && (
                <div className="space-y-2 text-xs text-gray-500 dark:text-slate-500 border-t border-gray-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Cookies essentiels</span>
                    {' '}— Session Supabase (authentification). Durée : session.{' '}
                    <span className="text-emerald-600 font-medium">Toujours actifs</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300">Cookies analytiques</span>
                    {' '}— Mesure d&apos;audience anonymisée (pages visitées, durée). Aucune donnée personnelle transmise à des tiers. Durée : 13 mois max.
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDetails(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors underline text-left w-fit"
              >
                {showDetails ? 'Masquer les détails' : 'Voir les détails'}
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={refuse}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Refuser les cookies analytiques
                </button>
                <button
                  onClick={accept}
                  className="px-4 py-2 text-xs font-semibold bg-brand hover:bg-brand-light text-white rounded-lg transition-colors"
                >
                  Accepter tous les cookies
                </button>
              </div>

              <p className="text-[10px] text-gray-400 dark:text-slate-600">
                Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bouton flottant préférences cookies ─── */}
      {hasConsent && !bannerVisible && (
        <button
          onClick={() => setBannerVisible(true)}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg hover:shadow-xl hover:border-brand dark:hover:border-brand text-gray-500 dark:text-slate-400 hover:text-brand dark:hover:text-brand transition-all duration-200"
          title="Gérer mes préférences cookies"
          aria-label="Gérer mes préférences cookies"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      )}
    </>
  )
}
