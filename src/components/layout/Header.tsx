import { createClient } from '@/lib/supabase/server'

interface HeaderProps {
  title: string
}

export default async function Header({ title }: HeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, organization_id')
    .eq('id', user?.id)
    .single()

  const { data: org } = profile?.organization_id
    ? await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single()
    : { data: null }

  const initials = (profile?.full_name ?? user?.email ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {org && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {org.name}
          </span>
        )}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
      </div>
    </header>
  )
}
