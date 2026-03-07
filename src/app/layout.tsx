import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Axora — Intelligence commerciale locale',
    template: '%s | Axora',
  },
  description: "Axora surveille vos avis Google, réseaux sociaux, concurrents et SEO — et génère chaque mois des recommandations IA actionnables pour les entreprises réunionnaises.",
  metadataBase: new URL('https://axora.vercel.app'),
  openGraph: {
    title: 'Axora — Intelligence commerciale locale',
    description: "Dashboard d'intelligence commerciale pour les entreprises réunionnaises. Avis Google, social, SEO, concurrents et rapports IA.",
    url: 'https://axora.vercel.app',
    siteName: 'Axora',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axora',
    description: "Dashboard d'intelligence commerciale locale — La Réunion",
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
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
