import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompetitorsPageClient from '@/components/dashboard/CompetitorsPageClient'
import Header from '@/components/layout/Header'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <Header title="Concurrents" subtitle="Surveillez et comparez vos concurrents" />
      <CompetitorsPageClient />
    </div>
  )
}
