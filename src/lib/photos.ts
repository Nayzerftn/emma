/**
 * Registre des photos (Annexe B).
 * Chaque slot = un fichier attendu dans /public/photos, un `alt` descriptif
 * et localisé (SEO), et un `object-position` (cadrage soigné, jamais un visage coupé).
 *
 * Toutes les photos sont traitées en N&B duotone, plein cadre, watermark NCB.
 * Tant qu'un fichier n'est pas déposé, <EditorialImage> affiche un placeholder propre.
 */

export type PhotoSlot = {
  /** Chemin du fichier dans /public (sans le domaine). */
  src: string;
  /** Texte alternatif descriptif + localisé. */
  alt: string;
  /** Cadrage CSS object-position. */
  position?: string;
};

export const PHOTOS = {
  /** Hero accueil — poster vidéo : Oïana au bassin (visage → nombril, légèrement éclairci). */
  heroPoster: {
    src: "/photos/hero-poster.jpg",
    alt: "Maître-nageuse de Natation Côte Basque dans le bassin privé chauffé de Bidart",
    position: "center 28%",
  },
  /** Bassin privé — piscine intérieure couverte, poutres bois. */
  bassin: {
    src: "/photos/bassin.jpg",
    alt: "Bassin privé couvert et chauffé à Bidart, deux couloirs de 20 mètres pour les cours de natation",
    position: "center center",
  },
  /** Bassin privé d'Anglet — couvert, chauffé à 33°C (carte offre accueil). */
  bassinAnglet: {
    src: "/photos/bassin-anglet.jpg",
    alt: "Bassin privé couvert et chauffé à 33°C à Anglet pour bébé nageur, aquaphobie et aquagym",
    position: "center center",
  },
  /** Bassin privé d'Anglet — second cadrage (bandeau photo accueil). */
  bassinAnglet2: {
    src: "/photos/bassin-anglet-2.jpg",
    alt: "Piscine intérieure du bassin privé d'Anglet, Natation Côte Basque",
    position: "center center",
  },
  /** Cours à domicile — maison basque (montrer la maison, pas le toit). */
  domicile: {
    src: "/photos/maison-basque.jpg",
    alt: "Maison basque avec piscine pour les cours de natation à domicile sur la Côte Basque",
    position: "center 80%",
  },
  /** Initiation océan — sauveteurs / vue océan Côte Basque. */
  ocean: {
    src: "/photos/ocean.jpg",
    alt: "Initiation océan et longe côte sur les plages de Biarritz, Bidart, Guéthary et Hendaye",
    position: "center center",
  },
  /** Kinésiologie — médecine chinoise, fleurs de Bach, buste de phrénologie. */
  kinesiologie: {
    src: "/photos/kinesiologie.jpg",
    alt: "Kinésiologie pour la peur de l'eau : médecine chinoise et approche douce à Anglet et Bidart",
    position: "center center",
  },
  /** Surf — surfeuse en combinaison avec sa planche. */
  surf: {
    src: "/photos/surf.jpg",
    alt: "Cours de surf avec Clara D. sur la Côte Basque, surfeuse et naturopathe",
    position: "center 40%",
  },
  /** Réservation — paysage Côte Basque (Villa Belza / chemin de falaise). */
  reservation: {
    src: "/photos/reservation.jpg",
    alt: "Côte Basque entre Biarritz et Bidart, là où Natation Côte Basque donne ses cours",
    position: "center center",
  },
  /** Bloc collectif — l'équipe / l'eau. */
  collectif: {
    src: "/photos/collectif.jpg",
    alt: "Le collectif de maîtres-nageuses de Natation Côte Basque",
    position: "center 30%",
  },
} as const satisfies Record<string, PhotoSlot>;

export type PhotoKey = keyof typeof PHOTOS;

/** Portraits de l'équipe, indexés par slug (cadrage visage propre). */
export const TEAM_PHOTOS: Record<string, PhotoSlot> = {
  emma: {
    src: "/photos/equipe/emma.jpg",
    alt: "Emma, fondatrice de Natation Côte Basque et kinésiologue certifiée à Anglet",
    position: "center 25%",
  },
  oiana: {
    src: "/photos/equipe/oiana.jpg",
    alt: "Oïana, maître-nageuse et spécialiste du mouvement à Biarritz",
    position: "center 25%",
  },
  thais: {
    src: "/photos/equipe/thais.jpg",
    alt: "Thaïs, maître-nageuse et championne du monde de sauvetage côtier",
    position: "center 25%",
  },
  otxanda: {
    src: "/photos/equipe/otxanda.jpg",
    alt: "Otxanda, maître-nageuse spécialiste de l'océan et du longe côte, bilingue français-basque",
    position: "center 30%",
  },
  clara: {
    src: "/photos/equipe/clara.jpg",
    alt: "Clara, maître-nageuse et infirmière bilingue français-anglais sur la Côte Basque",
    position: "center 25%",
  },
  audrey: {
    src: "/photos/equipe/audrey.jpg",
    alt: "Audrey, maître-nageuse et éducatrice de jeunes enfants, spécialiste des tout-petits",
    position: "center 25%",
  },
  "clara-d": {
    src: "/photos/equipe/clara-d.jpg",
    alt: "Clara D., professeure de surf, naturopathe et réflexologue sur la Côte Basque",
    position: "center 25%",
  },
  maika: {
    src: "/photos/equipe/maika.jpg",
    alt: "Maïka, kinésiologue certifiée spécialisée dans la petite enfance dès 3 ans",
    position: "center 25%",
  },
};
