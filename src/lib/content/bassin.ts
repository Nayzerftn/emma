/** PAGE 3 — BASSIN PRIVÉ (Annexe A). */
import { RESERVATION_HREF } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const BOOK_HREF = `${RESERVATION_HREF}#bassin`;

export const BASSIN = {
  hero: {
    eyebrow: "Bassin privé · Bidart (limite Biarritz) · Toute l'année",
    titleLines: ["Un bassin", "rien que", "pour vous."],
    text: "Une piscine privée, couverte et chauffée, 2 couloirs de 20 mètres, sans foule ni bruit. Pour les enfants : mini-groupes de 3 maximum, par niveau. Pour les adultes : séances individuelles, personnalisées selon vos objectifs. Toute l'année.",
    cta: { label: "Réserver ici", href: BOOK_HREF },
  },
  enfants: {
    eyebrow: "Enfants · 3 niveaux · dès 3 ans",
    titleLines: ["Un niveau", "pour chacun."],
    intro:
      "Des mini-groupes de 3 enfants maximum, de même niveau. Un format pensé pour allier suivi quasi individuel et dynamique de groupe : chacun avance à son rythme, porté par l'énergie d'un groupe qui progresse ensemble.",
    levels: [
      {
        n: "01",
        title: "Grands débutants (niveau 1)",
        text: "N'a jamais été immergé, ne flotte pas encore. On part de zéro, en sécurité.",
      },
      {
        n: "02",
        title: "En progression (niveau 2)",
        text: "Flotte et s'immerge, pas encore autonome. On consolide et on progresse.",
      },
      {
        n: "03",
        title: "Perfectionnement (niveau 3)",
        text: "Déjà autonome. Crawl, dos, brasse — on affine la technique.",
      },
    ],
  },
  adultes: {
    eyebrow: "Adultes · séances individuelles",
    titleLines: ["Chaque cours", "adapté à vous."],
    text: "Pour les adultes, des séances individuelles sur-mesure : 1 couloir rien que pour vous. Remise en forme, perte de poids, douleur dorsale, apprentissage, perfectionnement, triathlon, nouvelle nage, reprise — ou juste le plaisir de retrouver l'eau.",
  },
  infos: [
    {
      label: "Adresse",
      value:
        "1415 av. de Biarritz, Bidart (Chambre d'hôtes Irigoyen) — petit parking sur la droite, bâtiment en face.",
    },
    { label: "Disponibilité", value: "Tous les week-ends, toute l'année" },
    { label: "Enfants", value: "Mini-groupes de 3 maximum, même niveau" },
    { label: "Adultes", value: "Séances individuelles, 1 couloir" },
    { label: "Réservation", value: "Directement en ligne · réponse sous 24h" },
    { label: "Annulation", value: "Sans frais jusqu'à 48h avant" },
  ],
  ctaMid: { label: "Réserver ici", href: BOOK_HREF },
  finalCta: {
    titleLines: ["Réservez", "votre créneau."],
    text: "Bassin privé couvert et chauffé à Bidart. Enfants en mini-groupes, adultes en individuel. Toute l'année.",
    buttons: [
      { label: "Réserver en bassin privé", href: BOOK_HREF, kind: "primary" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
