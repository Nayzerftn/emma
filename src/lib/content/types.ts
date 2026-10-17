import type { PhotoKey } from "@/lib/photos";

/** Bouton d'appel à l'action. */
export type CtaButton = {
  label: string;
  href: string;
  kind: "primary" | "outline" | "whatsapp";
};

/** Une offre présentée en ligne éditoriale (accueil). */
export type Offer = {
  eyebrow: string;
  /** Titre, lignes séparées (les "/" du brief = retours à la ligne). */
  titleLines: readonly string[];
  text: string;
  /** Ligne courte mise en avant sous le texte (ex. publics, disciplines). */
  detail?: string;
  href: string;
  photo: PhotoKey;
};

/** Section illustrée plein cadre (citation sur photo). */
export type IllustratedSection = {
  quoteLines: readonly string[];
  meta: string;
  photo: PhotoKey;
};
