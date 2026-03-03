'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AdminTriggerButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [details, setDetails] = useState<string | null>(null)

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
        setDetails(`${data.processed ?? 0} business(es) traités`)
        setTimeout(() => setStatus('idle'), 5000)
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
        {status === 'loading' ? 'Collecte en cours...' : 'Déclencher la collecte'}
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
