import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales',
  robots: { index: false },
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 flex items-center gap-3 px-6 h-14 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="Axora Data" className="w-7 h-7" />
          <span className="font-bold text-foreground">Axora Data</span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground text-sm">Mentions légales</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Mentions légales</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Dernière mise à jour : mars 2026
        </p>

        <div className="space-y-10 text-base leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Éditeur du site</h2>
            <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-1 text-foreground">
              <p><strong>Axora Data SAS</strong></p>
              <p>Société par actions simplifiée au capital de 1 000 €</p>
              <p>Siège social : 12 rue Labourdonnais, 97400 Saint-Denis, La Réunion</p>
              <p>SIRET : 123 456 789 00012</p>
              <p>RCS : Saint-Denis 123 456 789</p>
              <p>Code APE : 6311Z — Traitement de données, hébergement et activités connexes</p>
              <p>
                Email :{' '}
                <a
                  href="mailto:contact@axora-data.fr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  contact@axora-data.fr
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Directeur de la publication</h2>
            <p className="text-foreground/80">
              Le directeur de la publication est le représentant légal d&apos;Axora Data SAS,
              joignable à l&apos;adresse email indiquée ci-dessus.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Hébergement</h2>
            <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-1 text-foreground">
              <p><strong>Vercel Inc.</strong></p>
              <p>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
              <p>
                Site web :{' '}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              La base de données est hébergée par <strong>Supabase Inc.</strong> (infrastructure AWS eu-west-1, région Paris).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Propriété intellectuelle</h2>
            <p className="text-foreground/80">
              L&apos;ensemble du contenu de ce site — textes, images, logos, graphismes, interfaces,
              algorithmes et code source — est protégé par le droit d&apos;auteur et appartient
              exclusivement à Axora Data SAS ou à ses partenaires.
            </p>
            <p className="mt-3 text-foreground/80">
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou
              partie du site, par quelque moyen que ce soit, est interdite sans autorisation écrite
              préalable d&apos;Axora Data SAS. Toute exploitation non autorisée constitue une contrefaçon
              sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Cookies</h2>
            <p className="text-foreground/80">
              Ce site utilise des cookies strictement nécessaires au fonctionnement (authentification,
              préférences d&apos;affichage) ainsi que des cookies analytiques soumis à votre consentement.
              Consultez notre{' '}
              <Link
                href="/politique-confidentialite"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                politique de confidentialité
              </Link>{' '}
              pour plus d&apos;informations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Limitation de responsabilité</h2>
            <p className="text-foreground/80">
              Axora Data SAS s&apos;efforce de maintenir les informations publiées sur ce site à jour
              et exactes. Cependant, la société ne saurait être tenue responsable des erreurs ou
              omissions, ni des dommages directs ou indirects résultant de l&apos;utilisation des
              informations présentées ou de l&apos;indisponibilité temporaire du service.
            </p>
            <p className="mt-3 text-foreground/80">
              Les liens hypertextes vers des sites tiers sont fournis à titre indicatif.
              Axora Data SAS n&apos;exerce aucun contrôle sur ces sites et n&apos;en est pas responsable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Droit applicable</h2>
            <p className="text-foreground/80">
              Le présent site est régi par le droit français. Tout litige relatif à son utilisation
              relève de la compétence exclusive des tribunaux de Saint-Denis de La Réunion.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Retour à l&apos;accueil
          </Link>
          <span>© 2026 Axora Data SAS</span>
        </div>
      </main>
    </div>
  )
}
