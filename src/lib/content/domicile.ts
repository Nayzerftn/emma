/** PAGE 4 — COURS À DOMICILE (Annexe A). */
import { SQUARE_APPOINTMENTS_URL } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const LEAD_HREF = SQUARE_APPOINTMENTS_URL;

export const DOMICILE = {
  hero: {
    eyebrow: "Cours à domicile · Côte Basque · Toute l'année",
    titleLines: ["On vient", "chez vous."],
    text: "Pas de piscine accessible près de chez vous ? Pas de créneau compatible avec votre emploi du temps ? Votre professeure vient à vous. Pas de trajet, pas de vestiaire bondé — juste votre piscine et la bonne experte. Pour les enfants, le cadre rassurant de la maison ; pour les adultes, l'intimité pour progresser à l'abri des regards.",
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  steps: {
    eyebrow: "Comment ça marche · 3 étapes",
    titleLines: ["Simple", "et rapide."],
    items: [
      {
        n: "01",
        title: "Vous choisissez votre cours",
        text: "Enfant ou adulte, selon votre niveau.",
      },
      {
        n: "02",
        title: "Vous réservez votre créneau en ligne",
        text: "Directement sur notre page de réservation, en 2 minutes.",
      },
      {
        n: "03",
        title: "La professeure arrive chez vous",
        text: "Juste un maillot et des lunettes. On s'occupe du reste.",
      },
    ],
  },
  accessible: {
    titleLines: ["Nager,", "accessible à tous."],
    text: "À Bayonne, Anglet, Biarritz et sur toute la Côte Basque, votre professeure vient chez vous — enfant ou adulte.",
    infos: [
      { label: "Âge", value: "Dès 3 ans, sans limite d'âge" },
      { label: "Groupe", value: "Jusqu'à 3 enfants du même niveau" },
      { label: "Période", value: "Toute l'année" },
      { label: "Réservation", value: "Directement en ligne" },
    ],
    offerLabel: "Offre spéciale",
    offer:
      "Venez avec un ami ou un voisin — jusqu'à 3 enfants du même niveau pour partager les frais. Moins de 15€ par enfant.",
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  finalCta: {
    titleLines: ["On vient", "chez vous."],
    text: "Cours de natation à domicile à Bayonne, Anglet, Biarritz — enfant ou adulte. Réservation directement en ligne.",
    buttons: [
      { label: "Réserver un cours à domicile", href: LEAD_HREF, kind: "primary" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
