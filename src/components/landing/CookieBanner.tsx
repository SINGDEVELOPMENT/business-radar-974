'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'axora_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: true, date: new Date().toISOString() }))
    setVisible(false)
  }

  function refuse() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics: false, date: new Date().toISOString() }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-2xl">
      <div className="max-w-5xl mx-auto p-4 md:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Ce site utilise des cookies
            </p>
            <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
              Nous utilisons des cookies <strong>strictement nécessaires</strong> au fonctionnement du site (authentification, session) ainsi que des cookies <strong>analytiques</strong> pour mesurer l&apos;audience de manière anonyme. Vous pouvez refuser les cookies analytiques sans que cela affecte votre navigation.{' '}
              <Link href="/politique-confidentialite" className="text-blue-500 hover:underline">
                Politique de confidentialité
              </Link>
            </p>

            {showDetails && (
              <div className="mt-3 space-y-2 text-xs text-gray-500 dark:text-slate-500 border-t border-gray-100 dark:border-slate-800 pt-3">
                <div>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">Cookies essentiels</span>
                  {' '}— Session Supabase (authentification). Durée : session.{' '}
                  <span className="text-green-600 font-medium">Toujours actifs</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700 dark:text-slate-300">Cookies analytiques</span>
                  {' '}— Mesure d&apos;audience anonymisée (pages visitées, durée). Aucune donnée personnelle transmise à des tiers. Durée : 13 mois max.
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetails(v => !v)}
              className="mt-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors underline"
            >
              {showDetails ? 'Masquer les détails' : 'Voir les détails'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={refuse}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Refuser les cookies analytiques
            </button>
            <button
              onClick={accept}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Accepter tous les cookies
            </button>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-slate-600">
            Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés. Vous pouvez modifier votre choix à tout moment depuis la{' '}
            <Link href="/politique-confidentialite" className="hover:underline">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
