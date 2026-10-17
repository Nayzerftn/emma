/** PAGE 5 — OCÉAN : initiation océan + longe côte. Réservation = Square océan. */
import { SQUARE_OCEAN_URL } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const LEAD_HREF = SQUARE_OCEAN_URL;

export const OCEAN = {
  hero: {
    eyebrow: "Plages de Biarritz, Bidart, Guéthary, Hendaye · Toute l'année",
    titleLines: ["L'océan,", "ça s'apprend."],
    text: "Pour tous ceux, enfants comme adultes, qui ont envie de nager en conscience dans l'océan. L'étape après la piscine — tout ce qu'on n'apprend pas dans un bassin. Avec Otxanda, notre spécialiste de l'océan, bilingue français/basque.",
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  learn: {
    titleLines: ["Ce que la piscine", "ne vous apprend pas."],
    text: "Courants, vagues, fond irrégulier, fatigue, lecture de l'eau — autant de compétences indispensables pour nager en sécurité dans l'Atlantique.",
    items: [
      {
        title: "Comprendre courants et dangers",
        text: "Identifier les zones sûres, lire une plage, repérer les drapeaux.",
      },
      {
        title: "Nager avec les vagues — pas contre",
        text: "Gérer les séries, passer les brisants, sortir en sécurité.",
      },
      {
        title: "Gérer son énergie en eau libre",
        text: "L'effort en océan est différent. Anticiper et doser.",
      },
      {
        title: "Les règles de sécurité",
        text: "Les bons réflexes pour profiter en toute confiance.",
      },
    ],
    infos: [
      { label: "Prérequis", value: "Savoir nager en piscine" },
      { label: "Pour qui", value: "Enfants et adultes" },
      {
        label: "Lieux",
        value: "Plages de Biarritz, Bidart, Guéthary, Hendaye — selon météo",
      },
      { label: "Réservation", value: "En ligne · réponse sous 24h" },
    ],
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  longeCote: {
    eyebrow: "Longe côte",
    titleLines: ["Une autre façon", "de découvrir l'océan."],
    text: "À un rythme plus doux, pour partager des moments entre habitants du Pays Basque — une discipline très complète, en plus de sa dimension sociale.",
    infos: [
      {
        label: "Lieu de rendez-vous",
        value:
          "Plage confirmée selon les conditions océaniques et météorologiques — peut être variable d'une semaine à l'autre.",
      },
    ],
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  finalCta: {
    titleLines: ["Nager en", "sécurité."],
    text: "On choisit la plage et le créneau selon votre niveau et les conditions océaniques. Seul, entre amis ou en famille — l'initiation océan prend encore plus de sens quand on apprend ensemble à se responsabiliser face aux dangers.",
    buttons: [
      { label: "Réserver une initiation océan", href: LEAD_HREF, kind: "primary" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
