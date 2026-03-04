import { createAdminClient } from '@/lib/supabase/admin'
import { RateLimiter } from '@/lib/utils/rate-limiter'

const limiter = new RateLimiter(200)

interface PlaceReview {
  author_name: string
  rating: number
  text: string
  time: number
}

interface PlaceResult {
  rating?: number
  user_ratings_total?: number
  reviews?: PlaceReview[]
}

export async function collectGoogleReviews(businessId: string, placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY manquante')

  await limiter.throttle()

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'rating,user_ratings_total,reviews')
  url.searchParams.set('language', 'fr')
  url.searchParams.set('key', apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Google Places API error: ${res.status}`)

  const data = await res.json()
  const place: PlaceResult = data.result

  if (!place) return { inserted: 0 }

  const supabase = createAdminClient()
  const reviews = place.reviews ?? []

  const rows = reviews.map((r) => ({
    business_id: businessId,
    author_name: r.author_name,
    rating: r.rating,
    text: r.text,
    published_at: new Date(r.time * 1000).toISOString(),
    source: 'google' as const,
  }))

  // Mettre à jour la note globale sur le business (même s'il n'y a pas de nouveaux avis)
  if (place.rating != null) {
    await supabase.from('businesses').update({
      google_rating: place.rating,
      google_reviews_count: place.user_ratings_total ?? null,
    }).eq('id', businessId)
  }

  if (rows.length === 0) return { inserted: 0, avgRating: place.rating, totalReviews: place.user_ratings_total }

  const { error } = await supabase.from('reviews').upsert(rows, {
    onConflict: 'business_id,author_name,published_at',
    ignoreDuplicates: true,
  })

  if (error) throw new Error(`Supabase insert error: ${error.message}`)

  return { inserted: rows.length, avgRating: place.rating, totalReviews: place.user_ratings_total }
}
