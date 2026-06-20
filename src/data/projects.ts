export interface Project {
  id: string
  index: string
  year: string
  title: string
  tagline: string
  description: string
  fullDescription: string
  stack: string[]
  role: string
  duration: string
  perf: string
  liveLink: string
  codeLink?: string
  image: string
  accent: 'cyan' | 'purple'
}

export const projects: Project[] = [
  {
    id: 'parole-et-vie',
    index: '01',
    year: '2025',
    title: 'PAROLE ET VIE',
    tagline: 'Site vitrine avec back-office, lives et dons',
    description:
      'Site complet pour l\'Assemblée Chrétienne Parole Et Vie — back-office de gestion du contenu, boutique, formulaire de contact et dons en ligne.',
    fullDescription:
      'Site Web complet pour l\'Assemblée Chrétienne Parole Et Vie, avec un back-office pour la gestion du contenu, de la boutique et l\'affichage dynamique de certaines sections. Gestion des lives YouTube avec tchat intégré et connexion Google.',
    stack: ['Next.js', 'Payload CMS', 'TypeScript'],
    role: 'Fullstack Dev',
    duration: '3 mois',
    perf: '100/100',
    liveLink: 'https://paroleetvie.com',
    image: '/images/paroleetvie.webp',
    accent: 'cyan',
  },
  {
    id: 'optiow-saas',
    index: '02',
    year: '2024',
    title: 'Optiow SaaS',
    tagline: "Saas d'optimisation de projets de production de contenu",
    description:
        'Une plateforme permettant de centraliser, simplifier et accélérer vos projets de production de contenu pour des résultats exceptionnels',
    fullDescription:
        'Une plateforme unifié et intuitive permettant de centraliser, simplifier et accélérer vos projets de production de contenu pour des résultats exceptionnels. Réalisé en Vue3 + Pinia',
    stack: ['Vue.js', 'TypeScript', 'Pinia'],
    role: 'Front-End Dev',
    duration: '3 mois',
    perf: '-',
    liveLink: 'https://optiow.com',
    image: '/images/optiow.webp',
    accent: 'purple',
  },
  {
    id: 'busterwood',
    index: '03',
    year: '2024',
    title: 'BUSTERWOOD',
    tagline: 'Site créatif — branding & digital',
    description:
      'Site créatif qui présente l\'identité et les activités de Busterwood, agence spécialisée en branding et marketing digital.',
    fullDescription:
      'Site créatif présentant Busterwood, agence spécialisée en branding, web design et marketing digital. Réalisé en HTML, CSS et JavaScript.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    role: 'Front-End Dev',
    duration: '2 mois',
    perf: '94',
    liveLink: 'https://busterwood.com',
    image: '/images/busterwood.webp',
    accent: 'purple',
  },
  {
    id: 'firestone',
    index: '04',
    year: '2023-2024',
    title: 'ROAD TO THE MAIN STAGE',
    tagline: 'Site officiel Firestone × Deezer 2024',
    description:
      'reprise du Site officiel de l\'événement Road to the Main Stage by Firestone, édition 2024 — artistes émergents, grandes scènes.',
    fullDescription:
      'Road to the Main Stage est un événement organisé par Firestone en partenariat avec Deezer, offrant à des artistes émergents la chance de se produire sur de grandes scènes. Site réalisé sous WordPress avec du CSS personnalisé pour coller à l\'identité de la marque. Travail sur deux éditions : maintenance, mises à jour et personnalisations visuelles.',
    stack: ['WordPress', 'CSS'],
    role: 'Front-End Dev',
    duration: '2 semaines',
    perf: '-',
    liveLink: 'https://roadtothemainstagebyfirestone.withdeezer.com/fr/',
    image: '/images/firestone.webp',
    accent: 'cyan',
  },
  {
    id: 'pastitalia',
    index: '05',
    year: '2022',
    title: 'PASTITALIA',
    tagline: 'Site vitrine restaurant italien — New York',
    description:
        'Site vitrine pour un restaurant italien basé à New York. Menu, localisation et contact.',
    fullDescription:
        'Site vitrine pour un restaurant italien basé à New York. Entièrement réalisé en HTML, CSS et JavaScript, avec un contenu géré via WordPress.',
    stack: ['HTML', 'CSS', 'JavaScript', 'WordPress'],
    role: 'Front-End Dev',
    duration: '1 mois',
    perf: '91',
    liveLink: 'https://pastitaliaus.com',
    image: '/images/pastitalia.webp',
    accent: 'cyan',
  },
]
