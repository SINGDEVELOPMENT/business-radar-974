import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Header from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdminNewClientForm from '@/components/dashboard/AdminNewClientForm'
import AdminTriggerButton from '@/components/dashboard/AdminTriggerButton'
import { Building2, Globe, Facebook, Instagram, MapPin, Calendar } from 'lucide-react'
import type { Business } from '@/types/index'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (profile?.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const adminClient = createAdminClient()

  const { data: orgs } = await adminClient
    .from('organizations')
    .select(`
      id, name, slug, plan, created_at,
      businesses(id, name, google_place_id, website_url, facebook_page_id, instagram_username, is_competitor)
    `)
    .order('created_at', { ascending: false })

  const orgList = orgs ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <Header title="Administration" subtitle="Onboarding et gestion des clients" />
        <div className="pt-1">
          <AdminTriggerButton />
        </div>
      </div>

      {/* Formulaire nouveau client */}
      <AdminNewClientForm />

      {/* Liste des clients */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">
            Clients <span className="text-gray-400 font-normal">({orgList.length})</span>
          </h3>
        </div>

        {orgList.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun client configuré. Utilisez le formulaire ci-dessus.</p>
        ) : (
          <div className="space-y-2">
            {orgList.map((org) => {
              const businesses = org.businesses as Business[]
              const mainBiz = businesses.find((b) => !b.is_competitor)
              const competitorCount = businesses.filter((b) => b.is_competitor).length

              return (
                <div
                  key={org.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-900">{org.name}</p>
                      <Badge variant="secondary" className="text-xs">{org.plan ?? 'standard'}</Badge>
                      {competitorCount > 0 && (
                        <span className="text-xs text-gray-400">{competitorCount} concurrent{competitorCount > 1 ? 's' : ''}</span>
                      )}
                    </div>

                    {mainBiz && (
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-medium text-gray-700">{mainBiz.name}</span>
                        {mainBiz.google_place_id && (
                          <span className="flex items-center gap-1 text-green-600">
                            <MapPin className="w-3 h-3" /> Google
                          </span>
                        )}
                        {mainBiz.facebook_page_id && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Facebook className="w-3 h-3" /> Facebook
                          </span>
                        )}
                        {mainBiz.instagram_username && (
                          <span className="flex items-center gap-1 text-pink-600">
                            <Instagram className="w-3 h-3" /> @{mainBiz.instagram_username}
                          </span>
                        )}
                        {mainBiz.website_url && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Globe className="w-3 h-3" />
                            {mainBiz.website_url.replace(/https?:\/\//, '').replace(/\/$/, '')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-4">
                    <Calendar className="w-3 h-3" />
                    {new Date(org.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
