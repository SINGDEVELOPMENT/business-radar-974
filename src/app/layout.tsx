import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Axora — Local Business Intelligence',
    template: '%s | Axora',
  },
  description: 'Axora centralizes your Google reviews, social media, SEO and competitors — and generates monthly AI-powered reports with actionable priorities for your business.',
  metadataBase: new URL('https://axora-data.vercel.app'),
  openGraph: {
    title: 'Axora — Local Business Intelligence',
    description: 'The command center for your local digital performance. Google reviews, social, SEO, competitors and AI reports in one dashboard.',
    url: 'https://axora-data.vercel.app',
    siteName: 'Axora',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axora — Local Business Intelligence',
    description: 'Google reviews, social media, SEO, competitors and AI reports — all in one dashboard.',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
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
      <body className={`${syne.variable} ${dmSans.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
