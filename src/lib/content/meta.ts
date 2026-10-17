/** Métadonnées SEO exactes par page (Annexe A). */
export type PageMeta = { title: string; description: string; path: string };

export const PAGE_META = {
  home: {
    title: "Cours de Natation Bayonne Anglet Biarritz | Natation Côte Basque",
    description:
      "La première école de natation de la Côte Basque. Cours enfants et adultes à domicile et en bassin privé. Initiation océan, kinésiologie peur de l'eau, surf, bébé nageur, aquagym. Dès 3 ans.",
    path: "/",
  },
  equipe: {
    title: "L'équipe — 8 expertes | Natation Côte Basque",
    description:
      "8 expertes de l'eau à Bayonne, Anglet, Biarritz. Maîtres-nageuses diplômées, championne du monde, kinésiologues, surf-thérapie, spécialiste océan & longe côte. Équipe 100% féminine.",
    path: "/equipe",
  },
  bassin: {
    title: "Cours de natation en bassin privé Bidart & Anglet | Natation Côte Basque",
    description:
      "Cours de natation en piscine privée couverte et chauffée à Bidart. Enfants en mini-groupes de 3, adultes en séances individuelles. 2 couloirs de 20m. Également bassin couvert et chauffé à Anglet pour les publics sensibles : bébé nageur, aquaphobie, aquagym, Niveau 1 enfant. Toute l'année.",
    path: "/bassin-prive",
  },
  domicile: {
    title: "Cours de natation à domicile Bayonne Anglet Biarritz | Natation Côte Basque",
    description:
      "Cours de natation à domicile sur tout le Pays Basque. Enfants et adultes. Jusqu'à 3 enfants du même niveau — moins de 15€ par enfant. Réponse sous 24h.",
    path: "/cours-a-domicile",
  },
  ocean: {
    title: "Océan & longe côte Biarritz Anglet | Natation Côte Basque",
    description:
      "Initiation océan et longe côte dans l'océan. Enfants et adultes. Plages de Biarritz, Bidart, Guéthary, Hendaye. Courants, vagues, sécurité. Avec Otxanda, notre spécialiste océan. Toute l'année.",
    path: "/initiation-ocean",
  },
  kine: {
    title: "Aquaphobie — Peur de l'eau | Natation Côte Basque",
    description:
      "Cours d'aquaphobie en bassin privé à Anglet, en douceur, mini-groupes de 3. Si besoin, séance de kinésiologie complémentaire avec Maïka, hors de l'eau. Peur de l'eau, aquaphobie — enfants et adultes. 90% débloquent leurs appréhensions dès la 1ère séance. Toute l'année.",
    path: "/kinesiologie",
  },
  surf: {
    title: "Cours de surf Côte Basque | Natation Côte Basque",
    description:
      "Cours de surf débutant, perfectionnement et thérapeutique sur toute la Côte Basque. Avec Clara D., surfeuse naturopathe. Tous les âges, toute l'année.",
    path: "/surf",
  },
  reservation: {
    title: "Réserver un cours de natation | Natation Côte Basque",
    description:
      "Réserver un cours de natation à Bayonne, Anglet, Biarritz. En ligne pour domicile, océan et bassins privés de Bidart et Anglet. WhatsApp pour kinésiologie et surf. Réponse sous 24h.",
    path: "/reservation",
  },
} as const satisfies Record<string, PageMeta>;

export type PageKey = keyof typeof PAGE_META;
