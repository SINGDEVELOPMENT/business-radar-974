'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('axora_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('axora_cookie_consent', 'accepted')
    setVisible(false)
  }

  function refuse() {
    localStorage.setItem('axora_cookie_consent', 'refused')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 border-t border-slate-700 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300">
            🍪 Axora utilise des cookies essentiels pour le fonctionnement du site et des cookies analytiques pour améliorer votre expérience.{' '}
            <Link href="/politique-confidentialite" className="text-blue-400 hover:underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={refuse}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 rounded-lg transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
