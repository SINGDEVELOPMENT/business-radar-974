import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  robots: { index: false },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 flex items-center gap-3 px-6 h-14 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="Axora Data" className="w-7 h-7" />
          <span className="font-bold text-foreground">Axora Data</span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground text-sm">Politique de confidentialité</span>
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

        <h1 className="text-3xl font-bold text-foreground mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Dernière mise à jour : mars 2026 — Conformément au Règlement Général sur la Protection des
          Données (RGPD — UE 2016/679)
        </p>

        <div className="space-y-10 text-base leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Responsable du traitement</h2>
            <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-1 text-foreground">
              <p><strong>Axora Data SAS</strong></p>
              <p>12 rue Labourdonnais, 97400 Saint-Denis, La Réunion</p>
              <p>SIRET : 123 456 789 00012</p>
              <p>
                Email DPO :{' '}
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
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Données collectées</h2>
            <p className="text-foreground/80 mb-4">
              Dans le cadre de la fourniture de ses services, Axora Data SAS collecte les catégories
              de données suivantes :
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Données de compte',
                  detail:
                    'Nom, prénom, adresse email professionnelle, nom de l&apos;entreprise. Collectées lors de la création du compte ou lors de l&apos;onboarding réalisé par Axora Data.',
                },
                {
                  title: 'Données de connexion',
                  detail:
                    'Adresse IP, horodatage des connexions, type de navigateur et système d&apos;exploitation. Conservées à des fins de sécurité et de diagnostic.',
                },
                {
                  title: 'Données de navigation (analytics)',
                  detail:
                    'Pages visitées, durée de visite, source de trafic. Collectées uniquement avec votre consentement via un outil d&apos;analyse anonymisé.',
                },
                {
                  title: 'Données métier clients',
                  detail:
                    'Avis Google, métriques réseaux sociaux (Facebook, Instagram), données SEO, informations concurrents — collectées automatiquement via les APIs tierces autorisées, pour le compte et au bénéfice exclusif du client.',
                },
                {
                  title: 'Données de contact',
                  detail:
                    'Nom, email, téléphone, message. Collectées via le formulaire de contact du site vitrine. Transmises par email et non stockées en base de données.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border bg-muted/20 p-4"
                >
                  <p className="font-medium text-foreground mb-1">{item.title}</p>
                  <p
                    className="text-sm text-foreground/70"
                    dangerouslySetInnerHTML={{ __html: item.detail }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Finalités et bases légales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-foreground font-semibold">Finalité</th>
                    <th className="text-left py-2 text-foreground font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ['Fourniture du service de veille commerciale', 'Exécution du contrat'],
                    ['Authentification et sécurité du compte', 'Exécution du contrat'],
                    ['Facturation et comptabilité', 'Obligation légale'],
                    ['Support client et communication', 'Intérêt légitime'],
                    ['Amélioration et développement du service', 'Intérêt légitime'],
                    ['Analyse d\'audience du site vitrine', 'Consentement'],
                  ].map(([finalite, base]) => (
                    <tr key={finalite}>
                      <td className="py-3 pr-4 text-foreground/80">{finalite}</td>
                      <td className="py-3 text-muted-foreground">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Sous-traitants et transferts hors UE</h2>
            <p className="text-foreground/80 mb-4">
              Axora Data SAS fait appel aux sous-traitants suivants, dans le cadre de l&apos;exécution
              du service. Chaque transfert hors Union Européenne est encadré par des Clauses
              Contractuelles Types (CCT) conformes à la décision de la Commission européenne.
            </p>
            <div className="space-y-2">
              {[
                {
                  name: 'Supabase Inc.',
                  role: 'Base de données et authentification',
                  location: 'USA — infrastructure AWS eu-west-1 (Paris) disponible',
                },
                {
                  name: 'Vercel Inc.',
                  role: 'Hébergement de l\'application web',
                  location: 'USA — CDN mondial',
                },
                {
                  name: 'Anthropic PBC (Claude AI)',
                  role: 'Génération de rapports d\'analyse IA',
                  location: 'USA — CCT en vigueur',
                },
                {
                  name: 'Google LLC',
                  role: 'API Places (collecte avis et données locales)',
                  location: 'USA — Privacy Shield successeur / CCT',
                },
                {
                  name: 'Meta Platforms Ireland Ltd.',
                  role: 'API Graph Facebook / Instagram',
                  location: 'Irlande (UE)',
                },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 rounded-lg border border-border bg-muted/20 px-4 py-3"
                >
                  <span className="font-medium text-foreground w-48 shrink-0">{s.name}</span>
                  <span className="text-foreground/70 text-sm flex-1">{s.role}</span>
                  <span className="text-muted-foreground text-xs">{s.location}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Durée de conservation</h2>
            <div className="space-y-2 text-foreground/80">
              <div className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <p><strong>Données de compte actif :</strong> pendant toute la durée de la relation contractuelle.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <p><strong>Après résiliation :</strong> les données sont conservées 30 jours (période de grâce pour réactivation) puis supprimées définitivement, sauf obligation légale.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <p><strong>Données comptables et factures :</strong> 10 ans à compter de la clôture de l&apos;exercice (article L.123-22 du Code de commerce).</p>
              </div>
              <div className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <p><strong>Logs de connexion et sécurité :</strong> 12 mois.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                <p><strong>Cookies analytiques :</strong> 13 mois maximum à compter du dépôt (recommandation CNIL).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Vos droits (RGPD)</h2>
            <p className="text-foreground/80 mb-4">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { right: 'Droit d\'accès', desc: 'Obtenir une copie de vos données.' },
                { right: 'Droit de rectification', desc: 'Corriger des données inexactes.' },
                { right: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données.' },
                { right: 'Droit d\'opposition', desc: 'Vous opposer à certains traitements.' },
                { right: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format lisible.' },
                { right: 'Droit à la limitation', desc: 'Restreindre temporairement un traitement.' },
              ].map((item) => (
                <div
                  key={item.right}
                  className="rounded-lg border border-border bg-muted/20 p-4"
                >
                  <p className="font-medium text-foreground text-sm">{item.right}</p>
                  <p className="text-xs text-foreground/60 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-foreground/80">
              <p>
                Pour exercer vos droits, contactez-nous à{' '}
                <a
                  href="mailto:contact@axora-data.fr"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  contact@axora-data.fr
                </a>
                . Nous nous engageons à répondre dans un délai d&apos;un mois. En cas de réclamation non
                résolue, vous pouvez saisir la{' '}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  CNIL
                </a>
                .
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies</h2>
            <p className="text-foreground/80 mb-4">
              Nous utilisons trois catégories de cookies :
            </p>
            <div className="space-y-3">
              {[
                {
                  label: 'Cookies essentiels',
                  badge: 'Toujours actifs',
                  badgeColor: 'bg-green-500/20 text-green-600 dark:text-green-400',
                  detail:
                    'Cookies de session Supabase (authentification), cookie de préférence de thème (clair/sombre). Indispensables au fonctionnement du service — aucun consentement requis.',
                },
                {
                  label: 'Cookie de consentement',
                  badge: 'Fonctionnel',
                  badgeColor: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
                  detail:
                    'Mémorise votre choix d\'acceptation ou de refus des cookies analytiques. Stocké en localStorage pour une durée de 12 mois.',
                },
                {
                  label: 'Cookies analytiques',
                  badge: 'Sous consentement',
                  badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
                  detail:
                    'Mesure d\'audience anonymisée du site vitrine (pages vues, source de trafic). Déposés uniquement après acceptation explicite via la bannière de consentement. Durée : 13 mois maximum.',
                },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badgeColor}`}>
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70">{c.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Vous pouvez modifier vos préférences cookies à tout moment via l&apos;icône de paramètres
              en bas à gauche de chaque page, ou via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Sécurité des données</h2>
            <p className="text-foreground/80">
              Axora Data SAS met en oeuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données contre tout accès non autorisé, perte, destruction ou
              altération. Ces mesures comprennent notamment : chiffrement TLS en transit,
              authentification à deux facteurs disponible, Row Level Security (RLS) en base de données,
              clés API chiffrées au repos, journalisation des accès administrateurs.
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
