import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompetitorsPageClient from '@/components/dashboard/CompetitorsPageClient'

export default async function CompetitorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <CompetitorsPageClient />
}
