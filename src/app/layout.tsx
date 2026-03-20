import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Axora Data — Local Business Intelligence',
    template: '%s | Axora Data',
  },
  description: 'Axora Data centralizes your Google reviews, social media, SEO and competitors — and generates monthly AI-powered reports with actionable priorities for your business.',
  metadataBase: new URL('https://axora-data.vercel.app'),
  openGraph: {
    title: 'Axora Data — Local Business Intelligence',
    description: 'The command center for your local digital performance. Google reviews, social, SEO, competitors and AI reports in one dashboard.',
    url: 'https://axora-data.vercel.app',
    siteName: 'Axora Data',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axora Data — Local Business Intelligence',
    description: 'Google reviews, social media, SEO, competitors and AI reports — all in one dashboard.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={GeistSans.variable}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
