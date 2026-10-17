/** PAGE 3 — BASSIN PRIVÉ (Annexe A). */
import { SQUARE_ANGLET_URL, SQUARE_BIDART_URL } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

/** Deux bassins = deux liens de réservation directe. */
const BOOK_BUTTONS = [
  { label: "Réserver à Bidart", href: SQUARE_BIDART_URL, kind: "primary" },
  { label: "Réserver à Anglet", href: SQUARE_ANGLET_URL, kind: "primary" },
] satisfies CtaButton[];

export const BASSIN = {
  hero: {
    eyebrow: "Bassin privé · Bidart (limite Biarritz) & Anglet · Toute l'année",
    titleLines: ["Deux bassins", "rien que", "pour vous."],
    text: "Un bassin privé à Bidart avec deux couloirs de 20 mètres, couvert et chauffé. Un bassin privé à Anglet de 30 mètres carrés, couvert et chauffé. Eau à 33°C à Anglet, 26°C à Bidart. Le bassin d'Anglet est pensé pour le public sensible : bébé nageur, aquaphobie, aquagym, Niveau 1 enfant. Le bassin de Bidart accueille les enfants niveaux 1, 2 et 3, le perfectionnement, les ados, les adultes et l'apnée.",
    buttons: BOOK_BUTTONS,
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
    eyebrow: "Adultes · séances individualisées",
    titleLines: ["Chaque cours", "adapté à vous."],
    text: "Cours de 30 à 45 minutes, 3 à 4 personnes maximum.",
    formats: [
      {
        title: "Apprentissage",
        text: "Pour les adultes ne sachant pas nager 25 mètres sans s'arrêter.",
      },
      {
        title: "Perfectionnement",
        text: "Pour les adultes sachant déjà nager 25 mètres sans s'arrêter.",
      },
      {
        title: "Apnée",
        text: "Pour les surfeurs de gros, les personnes souhaitant être plus à l'aise en océan, ou tout simplement pour les bienfaits physiologiques de l'apnée.",
      },
    ],
  },
  infos: [
    {
      label: "Lieu",
      value:
        "On se situe à Bidart et à Anglet, vous recevrez l'adresse exacte lors de la réservation.",
    },
    { label: "Disponibilité", value: "Tous les week-ends, toute l'année" },
    { label: "Enfants", value: "Mini-groupes de 3 maximum, même niveau" },
    { label: "Adultes", value: "Séances individualisées, personnalisées" },
    { label: "Réservation", value: "Directement en ligne · réponse sous 24h" },
    { label: "Annulation", value: "Sans frais jusqu'à 48h avant" },
  ],
  ctaMid: BOOK_BUTTONS,
  apnee: {
    eyebrow: "Apnée",
    titleLines: ["Nouveaux créneaux", "à Bidart."],
    items: [
      { title: "Apnée débutant", text: "Adulte / ado." },
      { title: "Apnée avancé", text: "À venir — novembre 2026." },
      { title: "Forfait apnée enfant", text: "À venir — novembre 2026." },
    ],
  },
  finalCta: {
    titleLines: ["Réservez", "votre créneau."],
    text: "Bassin privé couvert et chauffé à Bidart et à Anglet. Enfants en mini-groupes, adultes en individuel. Toute l'année.",
    buttons: [
      ...BOOK_BUTTONS,
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
