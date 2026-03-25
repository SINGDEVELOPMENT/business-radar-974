export type UserRole = 'superadmin' | 'admin' | 'member'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  api_key_claude?: string
  created_at: string
}

export interface Profile {
  id: string
  organization_id: string
  role: UserRole
  full_name?: string
  created_at: string
}

export interface Business {
  id: string
  organization_id: string
  name: string
  google_place_id?: string
  facebook_page_id?: string
  instagram_username?: string
  instagram_business_id?: string | null
  website_url?: string
  is_competitor: boolean
  google_rating?: number | null
  google_reviews_count?: number | null
  lat?: number | null
  lng?: number | null
  custom_competitor?: boolean
  social_consent_given?: boolean
  social_consent_date?: string | null
  created_at: string
}

export interface Review {
  id: string
  business_id: string
  author_name?: string
  rating: number
  text?: string
  published_at?: string
  source: 'google' | 'tripadvisor' | 'facebook'
  collected_at: string
}

export interface SocialPost {
  id: string
  business_id: string
  platform: 'facebook' | 'instagram'
  post_id?: string
  content?: string
  likes: number
  comments: number
  shares: number
  published_at?: string
  collected_at: string
}

export interface SeoSnapshot {
  id: string
  business_id: string
  url?: string
  status_code?: number
  load_time_ms?: number
  title?: string
  meta_description?: string
  h1_count?: number
  has_ssl?: boolean
  mobile_friendly?: boolean
  lighthouse_score?: number
  page_size_kb?: number
  collected_at: string
  // Core Web Vitals
  fcp_ms?: number | null
  lcp_ms?: number | null
  cls_score?: number | null
  tbt_ms?: number | null
  speed_index_ms?: number | null
  accessibility_score?: number | null
  seo_audit_score?: number | null
  best_practices_score?: number | null
  opportunities?: { id: string; title: string; displayValue: string; score: number }[] | null
  // On-page SEO (migration 009)
  canonical_url?: string | null
  has_og_tags?: boolean | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  h2_count?: number | null
  h3_count?: number | null
  images_without_alt?: number | null
  total_images?: number | null
  internal_links_count?: number | null
  external_links_count?: number | null
  word_count?: number | null
  has_sitemap?: boolean | null
  has_robots_txt?: boolean | null
  has_schema?: boolean | null
  schema_types?: string[] | null
  title_length?: number | null
  meta_description_length?: number | null
  mobile_performance_score?: number | null
  desktop_performance_score?: number | null
}

export interface AiReport {
  id: string
  organization_id: string
  report_type: 'monthly' | 'weekly' | 'alert'
  content?: AiReportContent
  summary?: string
  recommendations?: AiRecommendation[]
  generated_at: string
}

export interface AiReportContent {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: AiRecommendation[]
  competitor_analysis: string
  score_global: number
}

export interface AiRecommendation {
  priority: 'haute' | 'moyenne' | 'basse'
  action: string
  impact: string
}

export interface SeoDetails {
  hasSchema?: boolean | null
  schemaTypes?: string[] | null
  hasOgTags?: boolean | null
  canonicalUrl?: string | null
  hasSitemap?: boolean | null
  h1Count?: number | null
  h2Count?: number | null
  h3Count?: number | null
  imagesWithoutAlt?: number | null
  totalImages?: number | null
  wordCount?: number | null
  internalLinksCount?: number | null
  externalLinksCount?: number | null
}

export interface BusinessData {
  businessName: string
  avgRating: number
  totalReviews: number
  ratingTrend: string
  negativeReviews: Review[]
  postsCount: number
  avgEngagement: number
  bestPost: string
  competitors: Array<{ name: string; rating: number; reviews: number }>
  seoScore: number
  seoIssues: string[]
  seoDetails?: SeoDetails
}
