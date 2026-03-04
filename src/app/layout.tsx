import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Radar 974',
  description: "Dashboard d'intelligence commerciale pour les entreprises réunionnaises",
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
