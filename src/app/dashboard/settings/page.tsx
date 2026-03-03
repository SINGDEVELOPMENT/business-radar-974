import Header from '@/components/layout/Header'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Header title="Paramètres" />
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        Configuration du business et des clés API.
      </div>
    </div>
  )
}
