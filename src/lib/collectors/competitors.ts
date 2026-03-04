import { createAdminClient } from '@/lib/supabase/admin'
import { RateLimiter } from '@/lib/utils/rate-limiter'

const limiter = new RateLimiter(300)

interface NearbyPlace {
  place_id: string
  name: string
  rating?: number
  user_ratings_total?: number
  types?: string[]
}

// Rafraîchit les données Google Places pour les concurrents custom (ajoutés manuellement)
export async function refreshCustomCompetitors() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return { updated: 0 }

  const supabase = createAdminClient()

  const { data: customComps } = await supabase
    .from('businesses')
    .select('id, google_place_id')
    .eq('is_competitor', true)
    .eq('custom_competitor', true)
    .not('google_place_id', 'is', null)

  if (!customComps || customComps.length === 0) return { updated: 0 }

  let updated = 0
  for (const comp of customComps) {
    try {
      await limiter.throttle()
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
      url.searchParams.set('place_id', comp.google_place_id!)
      url.searchParams.set('fields', 'rating,user_ratings_total,name')
      url.searchParams.set('language', 'fr')
      url.searchParams.set('key', apiKey)

      const res = await fetch(url.toString())
      if (!res.ok) continue

      const data = await res.json()
      const result = data.result
      if (!result) continue

      await supabase
        .from('businesses')
        .update({
          google_rating: result.rating ?? null,
          google_reviews_count: result.user_ratings_total ?? null,
          name: result.name ?? undefined,
        })
        .eq('id', comp.id)

      updated++
    } catch {
      // Ne pas bloquer les autres concurrents
    }
  }

  return { updated }
}

export async function collectCompetitors(
  organizationId: string,
  lat: number,
  lng: number,
  type: string,
  radiusMeters = 2000
) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY manquante')

  await limiter.throttle()

  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', String(radiusMeters))
  url.searchParams.set('type', type)
  url.searchParams.set('language', 'fr')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Google Places API error: ${res.status}`)

  const data = await res.json()
  const places: NearbyPlace[] = data.results ?? []

  const supabase = createAdminClient()

  const rows = places.map((p) => ({
    organization_id: organizationId,
    name: p.name,
    google_place_id: p.place_id,
    google_rating: p.rating ?? null,
    google_reviews_count: p.user_ratings_total ?? null,
    category: p.types?.[0]?.replace(/_/g, ' ') ?? null,
    is_competitor: true,
  }))

  if (rows.length === 0) return { found: 0 }

  // ignoreDuplicates: false → update rating/reviews_count à chaque collecte
  const { error } = await supabase.from('businesses').upsert(rows, {
    onConflict: 'organization_id,google_place_id',
    ignoreDuplicates: false,
  })

  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return { found: rows.length }
}
