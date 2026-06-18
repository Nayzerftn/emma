/**
 * Source unique des coordonnées, liens et constantes (Annexe C du brief).
 * Téléphones / WhatsApp / Instagram / URL vidéo / adresse — tout est ici.
 */

export const SITE = {
  name: "Natation Côte Basque",
  shortName: "NCB",
  domain: "https://www.natationcotebasque.fr",
  instagram: "https://www.instagram.com/natationcotebasque",
  instagramHandle: "@natationcotebasque",
} as const;

/** Vidéo hero (déjà hébergée). */
export const HERO_VIDEO_URL =
  "https://www.natationcotebasque.fr/wp-content/uploads/2026/01/Natation-des-3-ans-1.mp4";

/** Adresse du bassin privé (Bidart). */
export const POOL_ADDRESS = {
  street: "1415 avenue de Biarritz",
  postalCode: "64210",
  city: "Bidart",
  venue: "Chambre d'hôtes Irigoyen",
  note: "petit parking sur la droite, bâtiment en face",
  full: "1415 av. de Biarritz, Bidart (Chambre d'hôtes Irigoyen) — petit parking sur la droite, bâtiment en face.",
} as const;

type WhatsAppEntry = { phone: string; number: string; message: string };

export const WHATSAPP = {
  general: {
    phone: "07 56 85 18 29",
    number: "33756851829",
    message: "Bonjour, je souhaite des renseignements sur vos cours de natation.",
  },
  maika: {
    phone: "06 65 57 37 40",
    number: "33665573740",
    message:
      "Bonjour Maïka, je souhaite des informations sur une séance de kinésiologie (peur de l'eau).",
  },
  claraD: {
    phone: "06 77 83 66 04",
    number: "33677836604",
    message: "Bonjour Clara, je souhaite des informations sur un cours de surf.",
  },
  // Numéro d'Emma (fondatrice) — À CONFIRMER : utilise le numéro général par défaut.
  emma: {
    phone: "07 56 85 18 29",
    number: "33756851829",
    message: "Bonjour Emma, je souhaite des renseignements sur vos cours de natation.",
  },
} satisfies Record<string, WhatsAppEntry>;

/** Construit un lien wa.me avec message pré-rempli. */
export function waLink(entry: WhatsAppEntry): string {
  return `https://wa.me/${entry.number}?text=${encodeURIComponent(entry.message)}`;
}

/** Villes du Pays Basque desservies (marquee + SEO). */
export const CITIES = [
  "Bayonne",
  "Anglet",
  "Biarritz",
  "Bidart",
  "Guéthary",
  "Saint-Jean-de-Luz",
  "Hendaye",
  "Ciboure",
  "Urrugne",
  "Arbonne",
  "Arcangues",
  "Ustaritz",
  "Cambo-les-Bains",
  "Espelette",
] as const;

/** Navigation principale du site public. */
export const NAV_LINKS = [
  { label: "Équipe", href: "/equipe" },
  { label: "Bassin privé", href: "/bassin-prive" },
  { label: "À domicile", href: "/cours-a-domicile" },
  { label: "Initiation océan", href: "/initiation-ocean" },
  { label: "Kinésiologie", href: "/kinesiologie" },
  { label: "Surf", href: "/surf" },
] as const;

export const RESERVATION_HREF = "/reservation";

/** Liens legacy (référence — remplacés par les flux natifs). */
export const LEGACY = {
  square: null,
  googleForm: "https://forms.gle/VtwMktvbLYPeYDpS7",
} as const;
