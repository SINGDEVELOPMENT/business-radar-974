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
  website_url?: string
  is_competitor: boolean
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
}
