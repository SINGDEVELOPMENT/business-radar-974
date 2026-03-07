import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import HeaderUserMenu from '@/components/layout/HeaderUserMenu'
import ThemeToggle from '@/components/ui/ThemeToggle'
import NotificationBell from '@/components/layout/NotificationBell'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default async function Header({ title, subtitle }: HeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, organization_id')
    .eq('id', user?.id)
    .single()

  const { data: org } = profile?.organization_id
    ? await supabase
        .from('organizations')
        .select('name, plan')
        .eq('id', profile.organization_id)
        .single()
    : { data: null }

  const displayName = profile?.full_name ?? user?.email ?? 'Utilisateur'
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-30 -mx-4 -mt-4 md:-mx-6 md:-mt-6 flex items-center justify-between h-14 md:h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="flex flex-col min-w-0">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs md:text-sm text-gray-500 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {org && (
          <Badge variant="secondary" className="hidden sm:flex gap-1.5 font-medium">
            <Building2 className="w-3 h-3" />
            {org.name}
          </Badge>
        )}

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
        </div>

        <HeaderUserMenu
          displayName={displayName}
          email={user?.email ?? ''}
          initials={initials}
          role={profile?.role}
        />
      </div>
    </header>
  )
}
