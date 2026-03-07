import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales',
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-10 flex items-center gap-4 px-6 h-14 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Axora" className="w-8 h-8" />
          <span className="font-bold text-gray-900">Axora</span>
        </Link>
        <span className="text-gray-400">/ Mentions légales</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-gray">
        <h1>Mentions légales</h1>
        <p className="text-gray-500 text-sm">Dernière mise à jour : mars 2026</p>

        <h2>Éditeur du site</h2>
        <p>
          <strong>[NOM DE LA SOCIÉTÉ]</strong><br />
          [Forme juridique] au capital de [XXX] €<br />
          Siège social : [ADRESSE], La Réunion (974)<br />
          RCS : [VILLE] [NUMÉRO]<br />
          SIRET : [NUMÉRO]<br />
          Email : contact@axora.re<br />
          Téléphone : [NUMÉRO]
        </p>

        <h2>Directeur de la publication</h2>
        <p>[NOM PRÉNOM], en qualité de [Gérant / Directeur]</p>

        <h2>Hébergement</h2>
        <p>
          Ce site est hébergé par :<br />
          <strong>Vercel Inc.</strong><br />
          340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble du contenu de ce site (textes, images, logos, graphismes) est protégé par le droit d&apos;auteur.
          Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
        </p>

        <h2>Cookies</h2>
        <p>
          Ce site utilise des cookies essentiels au fonctionnement et des cookies analytiques.
          Consultez notre <Link href="/politique-confidentialite">politique de confidentialité</Link> pour plus d&apos;informations.
        </p>

        <h2>Limitation de responsabilité</h2>
        <p>
          Axora s&apos;efforce de maintenir les informations de ce site à jour et exactes.
          Cependant, Axora ne saurait être tenu responsable des erreurs ou omissions, ni des dommages résultant de l&apos;utilisation des informations présentées.
        </p>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline">← Retour à l&apos;accueil</Link>
        </div>
      </main>
    </div>
  )
}
