'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Store } from 'lucide-react'
import BusinessSettingsCard from '@/components/dashboard/BusinessSettingsCard'

interface Business {
  id: string
  name: string
  google_place_id?: string | null
  facebook_page_id?: string | null
  instagram_username?: string | null
  website_url?: string | null
}

export default function BusinessSettingsSection({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses)

  function handleDelete(id: string) {
    setBusinesses(prev => prev.filter(b => b.id !== id))
  }

  function handleUpdate(id: string, data: Partial<Business>) {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...data } : b))
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Store className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Business surveillés</h3>
      </div>

      {businesses.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">
          Aucun business configuré. Contactez votre administrateur pour la configuration initiale.
        </p>
      ) : (
        <div className="space-y-3">
          {businesses.map(biz => (
            <BusinessSettingsCard
              key={biz.id}
              business={biz}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
