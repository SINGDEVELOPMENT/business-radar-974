import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  robots: { index: false },
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-10 flex items-center gap-4 px-6 h-14 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Axora" className="w-8 h-8" />
          <span className="font-bold text-gray-900">Axora</span>
        </Link>
        <span className="text-gray-400">/ Politique de confidentialité</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-gray">
        <h1>Politique de confidentialité</h1>
        <p className="text-gray-500 text-sm">Dernière mise à jour : mars 2026 — Conformément au RGPD (UE 2016/679)</p>

        <h2>1. Responsable du traitement</h2>
        <p>
          <strong>[NOM DE LA SOCIÉTÉ]</strong> — [ADRESSE], La Réunion (974)<br />
          Email DPO : [contact@axora.re]
        </p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes :</p>
        <ul>
          <li><strong>Données de compte :</strong> nom, prénom, adresse email, nom d&apos;entreprise</li>
          <li><strong>Données de navigation :</strong> adresse IP, pages visitées, durée de visite (via cookies analytiques)</li>
          <li><strong>Données formulaire de contact :</strong> nom, email, téléphone, message (transmises par email, non stockées)</li>
          <li><strong>Données métier client :</strong> avis Google, métriques réseaux sociaux, données SEO collectées pour le compte du client</li>
        </ul>

        <h2>3. Finalités et bases légales</h2>
        <ul>
          <li>Fourniture du service Axora (exécution du contrat)</li>
          <li>Communication et support client (intérêt légitime)</li>
          <li>Amélioration du service (intérêt légitime)</li>
          <li>Obligations légales et comptables (obligation légale)</li>
        </ul>

        <h2>4. Sous-traitants et transferts</h2>
        <ul>
          <li><strong>Supabase</strong> (base de données) — USA, clauses contractuelles types</li>
          <li><strong>Vercel</strong> (hébergement) — USA, clauses contractuelles types</li>
          <li><strong>Anthropic / Claude AI</strong> (analyse IA) — USA, clauses contractuelles types</li>
          <li><strong>Web3Forms</strong> (formulaire contact) — transmis par email uniquement</li>
        </ul>

        <h2>5. Durée de conservation</h2>
        <ul>
          <li>Données de compte : durée de la relation contractuelle + 3 ans</li>
          <li>Données comptables : 10 ans (obligation légale)</li>
          <li>Cookies analytiques : 13 mois maximum</li>
        </ul>

        <h2>6. Vos droits (RGPD)</h2>
        <p>Vous disposez des droits suivants : accès, rectification, effacement, opposition, portabilité, limitation.</p>
        <p>Pour exercer ces droits : <a href="mailto:contact@axora.re">contact@axora.re</a></p>
        <p>En cas de réclamation : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a></p>

        <h2>7. Cookies</h2>
        <p>Nous utilisons :</p>
        <ul>
          <li><strong>Cookies essentiels :</strong> authentification Supabase (session utilisateur) — nécessaires au fonctionnement</li>
          <li><strong>Cookies de préférence :</strong> thème clair/sombre — stocké localement</li>
          <li><strong>Consentement cookie :</strong> votre choix d&apos;acceptation/refus — stocké localement</li>
        </ul>
        <p>Vous pouvez gérer vos cookies via les paramètres de votre navigateur.</p>

        <div className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline">← Retour à l&apos;accueil</Link>
        </div>
      </main>
    </div>
  )
}
