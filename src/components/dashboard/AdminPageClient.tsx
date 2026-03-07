'use client'

import { useState } from 'react'
import AdminNewClientForm from '@/components/dashboard/AdminNewClientForm'
import AdminClientCard from '@/components/dashboard/AdminClientCard'
import type { OrgWithData } from '@/types/admin'

interface Props {
  orgs: OrgWithData[]
}

export default function AdminPageClient({ orgs }: Props) {
  const [activeTab, setActiveTab] = useState<'new' | 'clients'>('clients')

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800/60 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'new'
              ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
          }`}
        >
          Nouveau client
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'clients'
              ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
          }`}
        >
          Clients{' '}
          <span
            className={`ml-1 text-xs font-normal ${
              activeTab === 'clients' ? 'text-gray-400 dark:text-slate-400' : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            ({orgs.length})
          </span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'new' ? (
        <AdminNewClientForm />
      ) : (
        <>
          {orgs.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-slate-500">
              Aucun client configuré. Utilisez l&apos;onglet &ldquo;Nouveau client&rdquo; pour en créer un.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {orgs.map((org) => (
                <AdminClientCard key={org.id} org={org} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
