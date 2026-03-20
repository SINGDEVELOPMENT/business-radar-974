import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Axora — Local Business Intelligence Platform',
  description:
    'Axora centralizes your Google reviews, social media metrics, SEO audits and competitor data — and generates monthly AI-powered reports with actionable priorities. Setup in 24h.',
  alternates: {
    canonical: 'https://axora-data.vercel.app',
  },
  openGraph: {
    title: 'Axora — Local Business Intelligence Platform',
    description:
      'The command center for your local digital performance. Google reviews, social media, SEO, competitors and AI reports — all in one dashboard. Setup in 24h.',
    url: 'https://axora-data.vercel.app',
    images: [{ url: '/icon.svg', width: 400, height: 400, alt: 'Axora' }],
  },
  keywords: [
    'local business intelligence',
    'google reviews dashboard',
    'SEO audit tool',
    'competitor monitoring',
    'AI business reports',
    'social media analytics',
    'business dashboard',
    'local SEO',
  ],
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  return <LandingPage />
}
