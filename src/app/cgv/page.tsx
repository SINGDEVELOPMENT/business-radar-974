import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  robots: { index: false },
}

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-10 flex items-center gap-3 px-6 h-14 bg-background/95 backdrop-blur border-b border-border">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.svg" alt="Axora Data" className="h-8 w-auto dark:hidden" />
          <img src="/logo-white.svg" alt="Axora Data" className="h-8 w-auto hidden dark:block" />
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground text-sm">CGV</span>
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

        <h1 className="text-3xl font-bold text-foreground mb-2">
          Conditions Générales de Vente
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Dernière mise à jour : mars 2026 — Version 1.0
        </p>

        <div className="space-y-10 text-base leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 1 — Objet et champ d&apos;application</h2>
            <p className="text-foreground/80">
              Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations
              contractuelles entre <strong>SING DEVELOPMENT, micro-entreprise — marque commerciale Axora Data</strong>,
              SIRET : [À COMPLÉTER],
              dont le siège est situé [ADRESSE À COMPLÉTER], 97436 Saint-Leu, La Réunion
              (ci-après « Axora Data » ou « le Prestataire »), et toute personne morale ou physique
              souscrivant aux services de la plateforme Axora Data (ci-après « le Client »).
            </p>
            <p className="mt-3 text-foreground/80">
              Toute commande implique l&apos;acceptation pleine et entière des présentes CGV.
              Des conditions particulières peuvent être convenues par écrit entre les parties et
              prévaudront sur les présentes en cas de contradiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 2 — Description des services</h2>
            <p className="text-foreground/80 mb-4">
              Axora Data est une plateforme SaaS de veille commerciale et d&apos;intelligence locale,
              dédiée aux entreprises de La Réunion et des DOM-TOM. Elle agrège automatiquement
              les données publiques du client (avis Google, réseaux sociaux, SEO, concurrents) et
              génère des analyses avec recommandations actionnables via intelligence artificielle.
            </p>
            <p className="text-foreground/80 mb-5">
              Deux offres sont proposées :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-muted/20 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-lg">Standard</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">Essentiel</span>
                </div>
                <div className="mb-4 space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    1 000 € <span className="text-sm font-normal text-muted-foreground">HT setup</span>
                  </p>
                  <p className="text-foreground/70">
                    + <strong>150 € HT/mois</strong> de maintenance
                  </p>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/70">
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Surveillance avis Google</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Réseaux sociaux (Facebook + Instagram)</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Veille concurrents (2 maximum)</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Audit SEO de base</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Dashboard complet en temps réel</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Rapport IA mensuel</li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-500/40 bg-blue-500/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-lg">Premium</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">Recommandé</span>
                </div>
                <div className="mb-4 space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    2 000 € <span className="text-sm font-normal text-muted-foreground">HT setup</span>
                  </p>
                  <p className="text-foreground/70">
                    + <strong>250 € HT/mois</strong> de maintenance
                  </p>
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/70">
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Tout le Standard</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Analyse SEO on-page complète</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Core Web Vitals détaillés (LCP, FCP, CLS, TBT, Speed Index)</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> % de réponses aux avis (vous vs concurrents)</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Avis récents 30 jours par concurrent</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Score PageSpeed des sites concurrents</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Rapports IA hebdomadaires</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Alertes prioritaires automatiques</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Export PDF & Excel des rapports</li>
                  <li className="flex gap-2"><span className="text-green-500 shrink-0">✓</span> Suggestions de contenu IA (posts réseaux sociaux Facebook + Instagram)</li>
                </ul>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Note : les coûts des APIs tierces (Google Places, Claude AI) sont à la charge du Client
              et estimés entre 15 et 35 €/mois selon le volume de données. Axora Data accompagne le
              Client dans la configuration de ces accès lors du setup.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 3 — Commande et formation du contrat</h2>
            <p className="text-foreground/80">
              Le contrat prend effet à la date de signature du devis ou, à défaut, à la date du
              premier paiement. Axora Data adresse un devis détaillé au Client avant toute
              intervention. L&apos;acceptation du devis par le Client, par email ou signature
              électronique, vaut commande ferme et définitive.
            </p>
            <p className="mt-3 text-foreground/80">
              La phase de setup (configuration initiale, paramétrage du dashboard, intégration
              des APIs) est réalisée dans un délai de 3 à 5 jours ouvrés à compter de la réception
              des accès nécessaires fournis par le Client.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 4 — Prix et modalités de paiement</h2>
            <div className="space-y-3 text-foreground/80">
              <p>
                Tous les prix sont indiqués en euros hors taxes (HT). La TVA applicable est celle
                en vigueur au moment de la facturation. Pour La Réunion (DOM), la TVA est de 8,5 %
                pour les prestations de services numériques.
              </p>
              <p>
                <strong>Setup one-shot :</strong> facturé intégralement à la signature du devis,
                avant le démarrage des travaux. Aucun remboursement n&apos;est possible une fois les
                travaux de configuration engagés.
              </p>
              <p>
                <strong>Abonnement mensuel :</strong> facturé mensuellement à terme échu (ou
                annuellement avec remise de 10 % si convenu au devis). Le paiement est dû sous
                15 jours à réception de la facture.
              </p>
              <p>
                <strong>Modes de paiement acceptés :</strong> virement bancaire (IBAN fourni sur
                facture), chèque à l&apos;ordre de SING DEVELOPMENT, ou tout autre moyen convenu par écrit.
              </p>
              <p>
                Tout retard de paiement au-delà de 30 jours entraîne l&apos;application d&apos;une pénalité
                de retard au taux légal en vigueur, ainsi qu&apos;une indemnité forfaitaire de 40 € pour
                frais de recouvrement, conformément à l&apos;article L.441-10 du Code de commerce.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 5 — Durée et résiliation</h2>
            <div className="space-y-3 text-foreground/80">
              <p>
                L&apos;abonnement mensuel est conclu pour une durée indéterminée, sans engagement de durée
                minimale après le premier mois. Il peut être résilié à tout moment par l&apos;une ou
                l&apos;autre des parties avec un préavis de <strong>30 jours calendaires</strong>, notifié
                par email à{' '}
                <a
                  href="mailto:contact@singdevelopment.fr"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  contact@singdevelopment.fr
                </a>
                .
              </p>
              <p>
                En cas de résiliation à l&apos;initiative du Client, le mois en cours reste dû
                intégralement. Axora Data peut résilier le contrat immédiatement et sans préavis en
                cas de non-paiement persistant au-delà de 45 jours, de violation des présentes CGV,
                ou d&apos;utilisation frauduleuse du service.
              </p>
              <p>
                À l&apos;expiration du préavis, les accès du Client sont désactivés. Les données
                (rapports, historique) sont conservées pendant <strong>30 jours</strong>, période
                durant laquelle le Client peut demander un export. Passé ce délai, toutes les données
                sont supprimées définitivement et de manière irréversible.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 6 — Obligations du prestataire</h2>
            <p className="text-foreground/80 mb-3">
              SING DEVELOPMENT (Axora Data) s&apos;engage à :
            </p>
            <ul className="space-y-2 text-foreground/80">
              {[
                'Mettre en oeuvre les moyens techniques nécessaires à la collecte automatisée des données et à la disponibilité du dashboard (obligation de moyens).',
                'Assurer la confidentialité des données du Client et ne pas les utiliser à d\'autres fins que la fourniture du service contracté.',
                'Maintenir le service disponible avec un objectif de disponibilité (SLA) de 99 % mensuels hors maintenances planifiées.',
                'Informer le Client de tout incident technique significatif dans un délai de 24 heures.',
                'Fournir une assistance par email dans un délai de réponse de 2 jours ouvrés.',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 7 — Obligations du client</h2>
            <p className="text-foreground/80 mb-3">
              Le Client s&apos;engage à :
            </p>
            <ul className="space-y-2 text-foreground/80">
              {[
                'Fournir des informations exactes et à jour lors de l\'inscription et tout au long de la relation contractuelle.',
                'Obtenir les autorisations nécessaires auprès des plateformes tierces (Meta, Google) avant de connecter ses comptes à Axora Data.',
                'Respecter le RGPD concernant les données de ses propres clients collectées via la plateforme.',
                'Ne pas utiliser le service à des fins illicites, notamment l\'espionnage industriel, l\'usurpation d\'identité ou la concurrence déloyale.',
                'Régler les factures dans les délais convenus.',
                'Ne pas partager ses identifiants de connexion avec des tiers non autorisés.',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 8 — Propriété intellectuelle</h2>
            <div className="space-y-3 text-foreground/80">
              <p>
                La plateforme Axora Data, son code source, ses algorithmes, ses interfaces, ses
                designs, ses marques et son logo demeurent la propriété exclusive d&apos;SING DEVELOPMENT (Axora Data).
                Le Client bénéficie d&apos;un droit d&apos;utilisation non exclusif, non cessible et non
                sous-licenciable, limité à la durée du contrat.
              </p>
              <p>
                Les données collectées par la plateforme pour le compte du Client (avis, métriques
                sociales, données SEO) appartiennent au Client. SING DEVELOPMENT (Axora Data) ne les utilise
                pas à des fins autres que la fourniture du service.
              </p>
              <p>
                Les rapports générés par intelligence artificielle (Claude AI) dans le cadre du
                service sont transmis au Client et lui appartiennent. SING DEVELOPMENT (Axora Data) se réserve le
                droit d&apos;utiliser des données agrégées et anonymisées à des fins d&apos;amélioration de ses
                modèles et algorithmes internes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 9 — Limitation de responsabilité</h2>
            <div className="space-y-3 text-foreground/80">
              <p>
                SING DEVELOPMENT (Axora Data) fournit ses services avec diligence et selon les règles de l&apos;art,
                dans le cadre d&apos;une <strong>obligation de moyens</strong>. La société ne peut garantir
                une disponibilité continue à 100 %, notamment en raison des indisponibilités
                possibles des APIs tierces (Google Places, Meta Graph, Anthropic Claude).
              </p>
              <p>
                SING DEVELOPMENT (Axora Data) ne saurait être tenue responsable des dommages indirects (manque à
                gagner, perte de clientèle, atteinte à l&apos;image) découlant de l&apos;utilisation ou de
                l&apos;impossibilité d&apos;utiliser le service.
              </p>
              <p>
                En tout état de cause, la responsabilité d&apos;SING DEVELOPMENT (Axora Data) est limitée au montant
                total des sommes effectivement versées par le Client au titre de l&apos;abonnement mensuel
                pendant les <strong>3 derniers mois</strong> précédant l&apos;événement donnant lieu à
                responsabilité.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 10 — Confidentialité</h2>
            <p className="text-foreground/80">
              Les parties s&apos;engagent réciproquement à maintenir la confidentialité de toutes les
              informations échangées dans le cadre du contrat, qu&apos;elles soient techniques,
              commerciales ou financières, et ce pendant la durée du contrat et pendant les
              5 années suivant sa résiliation. Cette obligation ne s&apos;applique pas aux informations
              déjà publiques ou communiquées par un tiers autorisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 11 — Protection des données personnelles</h2>
            <p className="text-foreground/80">
              Dans le cadre de l&apos;exécution du contrat, SING DEVELOPMENT (Axora Data) agit en qualité de
              <strong> sous-traitant</strong> au sens du RGPD pour les données que le Client lui
              confie concernant ses propres clients et collaborateurs. Un accord de traitement
              des données (DPA) peut être conclu sur demande du Client. Pour les données du
              Client lui-même, SING DEVELOPMENT (Axora Data) agit en qualité de responsable du traitement.
              Consultez notre{' '}
              <Link
                href="/politique-confidentialite"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                politique de confidentialité
              </Link>{' '}
              pour plus de détails.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 12 — Modifications des CGV</h2>
            <p className="text-foreground/80">
              SING DEVELOPMENT (Axora Data) se réserve le droit de modifier les présentes CGV à tout moment.
              Les modifications entrent en vigueur 30 jours après leur publication sur le site,
              sauf pour les modifications imposées par la loi qui s&apos;appliquent immédiatement.
              Le Client est informé par email de toute modification substantielle. L&apos;utilisation
              continue du service après le délai de 30 jours vaut acceptation des nouvelles CGV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Article 13 — Droit applicable et règlement des litiges</h2>
            <p className="text-foreground/80">
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties
              s&apos;engagent à rechercher en priorité une solution amiable. À défaut d&apos;accord amiable
              dans un délai de 30 jours, tout litige relatif à l&apos;interprétation ou à l&apos;exécution
              des présentes sera de la compétence exclusive du <strong>Tribunal de Commerce
              de Saint-Denis de La Réunion</strong>, sauf règles d&apos;ordre public contraires.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-muted/20 p-5">
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p className="text-foreground/80 text-sm">
              Pour toute question relative aux présentes CGV :{' '}
              <a
                href="mailto:contact@singdevelopment.fr"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                contact@singdevelopment.fr
              </a>
              <br />
              SING DEVELOPMENT — Axora Data — [ADRESSE À COMPLÉTER], 97436 Saint-Leu, La Réunion
            </p>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Retour à l&apos;accueil
          </Link>
          <span>© 2026 SING DEVELOPMENT — Axora Data</span>
        </div>
      </main>
    </div>
  )
}
