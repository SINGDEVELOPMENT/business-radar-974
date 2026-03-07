import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  robots: { index: false },
}

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-10 flex items-center gap-4 px-6 h-14 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Axora" className="w-8 h-8" />
          <span className="font-bold text-gray-900">Axora</span>
        </Link>
        <span className="text-gray-400">/ CGV</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-gray">
        <h1>Conditions Générales de Vente</h1>
        <p className="text-gray-500 text-sm">Dernière mise à jour : mars 2026</p>

        <h2>Article 1 — Objet</h2>
        <p>
          Les présentes CGV régissent les relations contractuelles entre <strong>[NOM DE LA SOCIÉTÉ]</strong> (ci-après « Axora »)
          et tout client souscrivant aux services de la plateforme Axora.
        </p>

        <h2>Article 2 — Services proposés</h2>
        <p>Axora propose deux offres :</p>
        <ul>
          <li>
            <strong>Standard :</strong> Setup one-shot à 1 000 € HT + maintenance mensuelle à 150 € HT/mois.
            Inclut : surveillance avis Google, réseaux sociaux (FB + IG), veille concurrents (2 max), audit SEO de base, dashboard complet.
          </li>
          <li>
            <strong>Premium :</strong> Setup one-shot à 1 500 € HT + maintenance mensuelle à 200 € HT/mois.
            Inclut tout le Standard + analyse SEO on-page complète, Core Web Vitals, rapports IA mensuels, alertes prioritaires.
          </li>
        </ul>

        <h2>Article 3 — Prix et paiement</h2>
        <p>
          Les prix sont indiqués en euros HT. TVA applicable selon la réglementation en vigueur.
          Le setup est facturé à la signature. La maintenance est facturée mensuellement ou annuellement selon accord.
          Paiement par virement bancaire ou autre modalité convenue.
        </p>

        <h2>Article 4 — Durée et résiliation</h2>
        <p>
          L&apos;abonnement mensuel est sans engagement. Il peut être résilié avec un préavis de 30 jours par email à <a href="mailto:contact@axora.re">contact@axora.re</a>.
          Les données client sont conservées 30 jours après résiliation avant suppression définitive.
        </p>

        <h2>Article 5 — Obligations du client</h2>
        <p>Le client s&apos;engage à :</p>
        <ul>
          <li>Fournir des informations exactes lors de l&apos;inscription</li>
          <li>Obtenir les autorisations nécessaires pour connecter ses comptes sociaux (RGPD)</li>
          <li>Ne pas utiliser le service à des fins illicites</li>
          <li>Régler les factures dans les délais convenus</li>
        </ul>

        <h2>Article 6 — Responsabilité</h2>
        <p>
          Axora s&apos;engage à fournir le service avec diligence mais ne peut garantir une disponibilité continue à 100 %.
          Axora n&apos;est pas responsable des indisponibilités des APIs tierces (Google, Meta, etc.).
          La responsabilité d&apos;Axora est limitée au montant des sommes versées sur les 3 derniers mois.
        </p>

        <h2>Article 7 — Propriété intellectuelle</h2>
        <p>
          Le logiciel Axora, ses algorithmes et son design restent la propriété exclusive d&apos;Axora.
          Les données collectées appartiennent au client.
        </p>

        <h2>Article 8 — Droit applicable</h2>
        <p>
          Ces CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité.
          À défaut, le Tribunal compétent de [VILLE, La Réunion] sera saisi.
        </p>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline">← Retour à l&apos;accueil</Link>
        </div>
      </main>
    </div>
  )
}
