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

/** Vidéo hero (page d'accueil) — fichier local dans /public/videos. */
export const HERO_VIDEO_URL = "/videos/accueil.mp4";

/** Adresse du bassin privé (Bidart). */
export const POOL_ADDRESS = {
  street: "1415 avenue de Biarritz",
  postalCode: "64210",
  city: "Bidart",
  venue: "Chambre d'hôtes Irigoyen",
  note: "petit parking sur la droite, bâtiment en face",
  full: "1415 av. de Biarritz, Bidart (Chambre d'hôtes Irigoyen) — petit parking sur la droite, bâtiment en face.",
} as const;

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

/** Réservation BASSIN PRIVÉ — Square (cours collectifs / classes). */
export const SQUARE_BOOKING_URL =
  "https://book.squareup.com/classes/g7n1j9vp7a40l8/location/LJ3931E19TX0B/classes?buttonTextColor=ffffff&color=000000&referrer=so";

/** Réservation RENDEZ-VOUS — Square (domicile, océan, kiné, surf). */
export const SQUARE_APPOINTMENTS_URL =
  "https://book.squareup.com/appointments/g7n1j9vp7a40l8/location/LJ3931E19TX0B/services";
