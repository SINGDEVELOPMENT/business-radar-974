export interface BusinessWithMeta {
  id: string
  name: string
  google_place_id: string | null
  website_url: string | null
  facebook_page_id: string | null
  instagram_username: string | null
  instagram_business_id: string | null
  lat: number | null
  lng: number | null
  is_competitor: boolean
  custom_competitor: boolean
  google_rating: number | null
  google_reviews_count: number | null
  seo_snapshots: { lighthouse_score: number | null }[]
}

export interface OrgWithData {
  id: string
  name: string
  slug: string
  plan: string | null
  created_at: string
  api_key_claude: string | null
  meta_access_token: string | null
  avatar_url: string | null
  client_full_name: string | null
  client_user_id: string | null
  businesses: BusinessWithMeta[]
  ai_reports: { generated_at: string }[]
}
