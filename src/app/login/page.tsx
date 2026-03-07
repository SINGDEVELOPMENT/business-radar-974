'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ui/ThemeToggle'

type View = 'login' | 'forgot'

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'

const labelClass =
  'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(urlError === 'lien_invalide' ? 'Le lien est invalide ou a expiré.' : '')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setResetSent(true)
  }

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200 dark:border-white/[0.08] p-8 shadow-sm dark:shadow-none backdrop-blur-sm">
      {view === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="vous@exemple.re"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => { setView('forgot'); setError('') }}
                className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      ) : resetSent ? (
        <div className="text-center py-4 space-y-3">
          <p className="text-green-600 dark:text-green-400 font-medium">Email envoyé !</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
          </p>
          <button
            onClick={() => { setView('login'); setResetSent(false) }}
            className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      ) : (
        <form onSubmit={handleForgot} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className={labelClass}>
              Votre email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="vous@exemple.re"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
          </button>

          <button
            type="button"
            onClick={() => { setView('login'); setError('') }}
            className="w-full text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
          >
            Retour à la connexion
          </button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#020817] relative transition-colors overflow-hidden">

      {/* Dot grid — dark mode only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Soft radial glow behind card — dark mode only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 dark:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Axora Data" className="w-12 h-12 mx-auto block mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Axora Data
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
            Connectez-vous à votre tableau de bord
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-gray-200 dark:border-white/[0.08] p-8 shadow-sm h-48" />
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-slate-600">
          Dashboard réservé aux clients Axora Data
        </p>
      </div>
    </div>
  )
}
