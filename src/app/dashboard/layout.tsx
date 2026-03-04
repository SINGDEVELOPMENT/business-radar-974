import { createClient } from '@/lib/supabase/server'
import AuthGuard from '@/components/auth/AuthGuard'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isSuperAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isSuperAdmin = profile?.role === 'superadmin'
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
        <Sidebar isSuperAdmin={isSuperAdmin} />
        <div className="flex-1 md:ml-64 min-w-0 flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
