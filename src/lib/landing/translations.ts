// ─── Landing page translations ─────────────────────────────────────────────────

export const T = {
  fr: {
    nav: { features: 'Fonctionnalités', how: 'Comment ça marche', pricing: 'Tarifs', contact: 'Contact', demo: 'Voir la démo', login: 'Se connecter', cta: 'Obtenir l\'accès' },
    hero: {
      badge: 'Plateforme d\'intelligence commerciale locale',
      title1: 'Votre business,',
      title2: 'sous surveillance intelligente.',
      sub: 'Axora Data centralise vos avis Google, réseaux sociaux, données SEO et concurrents — et génère chaque mois des recommandations IA actionnables.',
      cta1: 'Voir la démo', cta2: 'Obtenir l\'accès',
      trust: ['Configuration en 24h', 'Données en temps réel', 'Rapport IA mensuel', 'Aucune compétence technique requise'],
    },
    trustBar: ['Configuration en 24h', 'Synchronisation temps réel', 'Rapport IA mensuel', 'Aucune compétence requise', 'Propulsé par Claude AI'],
    problem: {
      label: 'Le problème',
      title: 'Gérer sa présence locale est un travail à plein temps.',
      sub: 'Vous jongler entre plusieurs onglets, outils et notifications — sans avoir une idée claire de ce qui fait vraiment bouger les choses.',
      cards: [
        { title: 'Données dispersées', desc: 'Google, Facebook, Instagram, site web — tout est cloisonné dans des outils séparés, sans vue unifiée.' },
        { title: 'Zéro visibilité', desc: 'Vous ne savez pas comment vous vous situez par rapport à vos concurrents ni pourquoi vos notes évoluent.' },
        { title: 'Temps gaspillé', desc: 'La collecte et les rapports manuels bouffent un temps précieux qui devrait aller à la croissance de votre business.' },
        { title: 'Pas de priorités claires', desc: 'Trop d\'informations, pas assez de clarté sur ce qu\'il faut vraiment corriger en premier.' },
      ],
    },
    solution: {
      label: 'La solution', title1: 'Une plateforme.', title2: 'Visibilité totale.',
      sub: 'Axora Data est la source de vérité unique pour vos performances digitales locales. Tout collecté automatiquement, analysé par IA, livré sous forme de priorités claires.',
      bullets: ['Toutes vos sources — Google, social, SEO, concurrents — dans un seul tableau de bord.', 'Collecte quotidienne automatisée. Zéro intervention manuelle.', 'Rapport IA mensuel avec recommandations classées par priorité.', 'Opérationnel en 24h. Aucun développeur requis.'],
    },
    features: {
      label: 'Fonctionnalités', title1: 'Tout ce dont votre business a besoin.', title2: 'Rien de plus.',
      items: [
        { title: 'Avis Google', desc: 'Collecte et analyse automatiques. Alertes en temps réel sur les avis négatifs avant qu\'ils impactent votre note.' },
        { title: 'Réseaux Sociaux', desc: 'Métriques Facebook et Instagram centralisées. Suivez l\'engagement, la portée et la croissance.' },
        { title: 'Veille Concurrents', desc: 'Benchmark automatique de vos concurrents locaux. Comparez les notes, avis et présence digitale.' },
        { title: 'Audit SEO', desc: 'Audit technique complet : Core Web Vitals, analyse on-page, données structurées, sitemap et robots.txt.' },
        { title: 'Rapports IA', desc: 'Chaque mois, Claude AI analyse toutes vos données et livre des recommandations personnalisées et hiérarchisées.' },
        { title: 'Dashboard 24/7', desc: 'Un seul endroit pour tout surveiller. Accessible depuis n\'importe quel appareil, à tout moment.' },
      ],
    },
    how: {
      label: 'Comment ça marche', title: 'Opérationnel en 3 étapes.',
      steps: [
        { num: '01', title: 'Configuration en 24h', desc: 'On configure votre compte avec toutes vos sources : Google My Business, Facebook, Instagram et votre site web. Aucun développeur requis.' },
        { num: '02', title: 'Collecte automatique', desc: 'Axora Data collecte et synchronise vos données chaque jour — avis, métriques, snapshots SEO, concurrents. Entièrement automatique.' },
        { num: '03', title: 'Recommandations IA', desc: 'Chaque mois, un rapport IA complet classe vos priorités. Sachez exactement quoi corriger en premier pour un impact maximal.' },
      ],
    },
    stats: [
      { value: '< 24h', label: 'Du compte créé aux premières données', sub: 'Sans onboarding fastidieux' },
      { value: '100%', label: 'Collecte de données automatisée', sub: 'Zéro intervention manuelle' },
      { value: '5×', label: 'Plus rapide que de le gérer vous-même', sub: 'Priorités IA, pas des suppositions' },
    ],
    pricing: {
      label: 'Tarifs', title: 'Prix transparents. Sans surprises.', sub: 'Frais de setup unique + maintenance mensuelle fixe.',
      setup: 'setup', monthly: '/mois',
      standard: { name: 'Standard', hint: 'Pour commencer', recommended: '', cta: 'Démarrer', features: ['Avis Google et alertes en temps réel', 'Suivi réseaux sociaux (FB + IG)', 'Veille concurrents (2 max)', 'Audit SEO de base', 'Accès dashboard complet', 'Support email'] },
      premium: { name: 'Premium', hint: 'Pour aller plus loin', recommended: 'RECOMMANDÉ', cta: 'Choisir Premium', features: ['Tout le plan Standard', 'SEO on-page complet (H1/H2/H3, canonical, Open Graph, JSON-LD)', 'Core Web Vitals (LCP, FCP, CLS, TBT, Speed Index)', 'Rapports IA mensuels complets avec recommandations détaillées', 'Alertes prioritaires avis négatifs', 'Support prioritaire'] },
    },
    contact: {
      label: 'Obtenir l\'accès', title: 'Prêt à reprendre le contrôle de votre présence locale ?', sub: 'Remplissez ce formulaire et nous vous recontactons sous 24h.',
      firstName: 'Prénom', lastName: 'Nom', company: 'Entreprise', email: 'Email',
      phone: 'Téléphone', phoneOpt: '(optionnel)', plan: 'Plan souhaité', planDefault: 'Choisir un plan...',
      planStd: 'Standard — 1 000 € setup + 150 €/mois', planPrem: 'Premium — 1 500 € setup + 200 €/mois',
      message: 'Message', messageOpt: '(optionnel)', submit: 'Envoyer ma demande', sending: 'Envoi en cours...',
      privacy: 'Vos informations sont envoyées directement par email et ne sont jamais stockées sur nos serveurs. Conformité RGPD.',
      successTitle: 'Message envoyé !', successBody: 'Merci pour votre demande. Nous vous recontactons sous 24h.',
    },
    footer: { rights: 'Tous droits réservés.', legal: 'Mentions légales', privacy: 'Confidentialité', terms: 'CGV' },
    mockup: { title: 'Rapport IA — Mars 2026', body: '3 actions prioritaires détectées. Votre concurrent a obtenu 7 nouveaux avis ce mois.' },
  },
  en: {
    nav: { features: 'Features', how: 'How it works', pricing: 'Pricing', contact: 'Contact', demo: 'See the demo', login: 'Sign in', cta: 'Get access' },
    hero: {
      badge: 'Local Business Intelligence Platform',
      title1: 'Your business,',
      title2: 'under intelligent surveillance.',
      sub: 'Axora Data centralizes your Google reviews, social media, SEO data and competitors — and generates monthly AI reports with ranked, actionable priorities.',
      cta1: 'See the demo', cta2: 'Get access',
      trust: ['Setup in 24h', 'Real-time data', 'Monthly AI report', 'No technical skills needed'],
    },
    trustBar: ['Setup in 24 hours', 'Real-time data sync', 'Monthly AI report', 'No technical skills needed', 'Powered by Claude AI'],
    problem: {
      label: 'The problem',
      title: 'Managing your local presence is a full-time job.',
      sub: 'You\'re juggling multiple tabs, tools and notifications — with no clear picture of what actually moves the needle.',
      cards: [
        { title: 'Scattered data', desc: 'Google, Facebook, Instagram, website — all siloed in separate tools with no unified view.' },
        { title: 'Zero visibility', desc: 'You don\'t know how you compare to competitors or why your ratings are changing.' },
        { title: 'Wasted hours', desc: 'Manual collection and reporting eats time that should go toward growing your business.' },
        { title: 'No clear priorities', desc: 'Too much information, not enough clarity on what to actually fix first.' },
      ],
    },
    solution: {
      label: 'The solution', title1: 'One platform.', title2: 'Complete visibility.',
      sub: 'Axora Data is the single source of truth for your local digital performance. Everything collected automatically, analyzed by AI, delivered as clear priorities.',
      bullets: ['All your sources — Google, social, SEO, competitors — in one dashboard.', 'Automated daily collection. Zero manual work.', 'Monthly AI report with ranked, personalized recommendations.', 'Live in 24h. No developers needed.'],
    },
    features: {
      label: 'Features', title1: 'Everything your business needs.', title2: 'Nothing it doesn\'t.',
      items: [
        { title: 'Google Reviews', desc: 'Automatic collection and sentiment analysis. Real-time alerts on negative reviews before they damage your rating.' },
        { title: 'Social Media', desc: 'Centralized Facebook and Instagram metrics. Track engagement, reach and follower growth over time.' },
        { title: 'Competitor Watch', desc: 'Automatic benchmarking of your local competitors. Compare ratings, review counts and digital presence.' },
        { title: 'SEO Audit', desc: 'Full technical audit: Core Web Vitals, on-page analysis, structured data, sitemap and robots.txt.' },
        { title: 'AI Reports', desc: 'Every month, Claude AI analyzes all your data and delivers prioritized, personalized recommendations.' },
        { title: 'Live Dashboard', desc: 'One place to monitor everything. Accessible from any device, any time. Always in sync.' },
      ],
    },
    how: {
      label: 'How it works', title: 'Up and running in 3 steps.',
      steps: [
        { num: '01', title: 'Configure in 24h', desc: 'We set up your account with all your sources: Google My Business, Facebook, Instagram, and your website. No dev work required.' },
        { num: '02', title: 'Automated collection', desc: 'Axora Data collects and syncs your data every day — reviews, metrics, SEO snapshots, competitor data. Fully hands-free.' },
        { num: '03', title: 'AI recommendations', desc: 'Every month, a full AI report ranks your priorities. Know exactly what to fix first for maximum impact on your visibility.' },
      ],
    },
    stats: [
      { value: '< 24h', label: 'From sign-up to live data', sub: 'No long onboarding' },
      { value: '100%', label: 'Automated data collection', sub: 'Zero manual intervention' },
      { value: '5×', label: 'Faster than managing it yourself', sub: 'AI priorities, not guesswork' },
    ],
    pricing: {
      label: 'Pricing', title: 'Transparent pricing. No surprises.', sub: 'One-time setup fee + fixed monthly maintenance.',
      setup: 'setup', monthly: '/month',
      standard: { name: 'Standard', hint: 'To get started', recommended: '', cta: 'Get started', features: ['Google Reviews & real-time alerts', 'Social media tracking (FB + IG)', 'Competitor monitoring (2 max)', 'Base SEO audit', 'Full dashboard access', 'Email support'] },
      premium: { name: 'Premium', hint: 'To go further', recommended: 'RECOMMENDED', cta: 'Get Premium', features: ['Everything in Standard', 'Full on-page SEO (H1/H2/H3, canonical, Open Graph, JSON-LD)', 'Core Web Vitals (LCP, FCP, CLS, TBT, Speed Index)', 'Full monthly AI reports with detailed recommendations', 'Priority alerts on negative reviews', 'Priority support'] },
    },
    contact: {
      label: 'Get access', title: 'Ready to take control of your local presence?', sub: 'Fill in the form below and we\'ll get back to you within 24 hours.',
      firstName: 'First name', lastName: 'Last name', company: 'Company', email: 'Email',
      phone: 'Phone', phoneOpt: '(optional)', plan: 'Plan', planDefault: 'Select a plan...',
      planStd: 'Standard — 1 000 € setup + 150 €/month', planPrem: 'Premium — 1 500 € setup + 200 €/month',
      message: 'Message', messageOpt: '(optional)', submit: 'Send my request', sending: 'Sending...',
      privacy: 'Your data is sent directly by email and never stored on our servers. GDPR compliant.',
      successTitle: 'Message sent!', successBody: 'Thank you — we\'ll get back to you within 24 hours.',
    },
    footer: { rights: 'All rights reserved.', legal: 'Legal', privacy: 'Privacy', terms: 'Terms' },
    mockup: { title: 'AI Report — March 2026', body: '3 priority actions detected. Your main competitor received 7 new reviews this month.' },
  },
} as const

export type Lang = keyof typeof T
export type Translations = typeof T
