import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Business Radar 974',
  description: 'Dashboard d\'intelligence commerciale pour les entreprises réunionnaises',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
