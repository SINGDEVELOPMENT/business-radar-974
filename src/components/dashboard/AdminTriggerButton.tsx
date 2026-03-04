'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminTriggerButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [details, setDetails] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status === 'loading') {
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  async function handleTrigger() {
    setStatus('loading')
    setDetails(null)

    try {
      const res = await fetch('/api/admin/trigger-cron', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setDetails(data.error ?? 'Erreur inconnue')
      } else {
        setStatus('success')
        setDetails(`Terminé en ${elapsed}s — ${data.processed ?? 0} business(es) traités`)
        setTimeout(() => setStatus('idle'), 8000)
      }
    } catch {
      setStatus('error')
      setDetails('Erreur réseau')
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        onClick={handleTrigger}
        disabled={status === 'loading'}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {status === 'loading' ? `Collecte en cours... ${elapsed}s` : 'Déclencher la collecte'}
      </Button>

      {status === 'success' && (
        <span className="flex items-center gap-1.5 text-sm text-emerald-600">
          <CheckCircle2 className="w-4 h-4" />
          {details}
        </span>
      )}
      {status === 'error' && (
        <span className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {details}
        </span>
      )}
    </div>
  )
}
