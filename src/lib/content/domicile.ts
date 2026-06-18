/** PAGE 4 — COURS À DOMICILE (Annexe A). */
import { RESERVATION_HREF } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const LEAD_HREF = `${RESERVATION_HREF}?type=domicile#en-ligne`;

export const DOMICILE = {
  hero: {
    eyebrow: "Cours à domicile · Côte Basque · Toute l'année",
    titleLines: ["On vient", "chez vous."],
    text: "Pas de trajet, pas de vestiaire bondé. Votre professeure arrive chez vous, dans votre piscine. Pour les enfants, le cadre rassurant de la maison ; pour les adultes, l'intimité pour progresser à l'abri des regards. Partout sur la Côte Basque.",
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  steps: {
    eyebrow: "Comment ça marche · 3 étapes",
    titleLines: ["Simple", "et rapide."],
    items: [
      {
        n: "01",
        title: "Vous réservez en ligne",
        text: "Votre niveau, vos disponibilités, votre adresse. 2 minutes.",
      },
      {
        n: "02",
        title: "On vous répond sous 24h",
        text: "On vous envoie la professeure la plus adaptée à vos besoins et vos dispos.",
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
    text: "À Bayonne, Anglet, Biarritz et sur toute la Côte Basque, on vous met en relation avec la professeure la plus adaptée à votre profil — enfant ou adulte.",
    infos: [
      { label: "Âge", value: "Dès 3 ans, sans limite d'âge" },
      { label: "Groupe", value: "Jusqu'à 3 enfants du même niveau" },
      { label: "Période", value: "Toute l'année" },
      { label: "Réponse", value: "Sous 24h" },
    ],
    offerLabel: "Offre spéciale",
    offer:
      "Venez avec un ami ou un voisin — jusqu'à 3 enfants du même niveau pour partager les frais. Moins de 15€ par enfant.",
    cta: { label: "Réserver ici", href: LEAD_HREF },
  },
  finalCta: {
    titleLines: ["On vient", "chez vous."],
    text: "Cours de natation à domicile à Bayonne, Anglet, Biarritz — enfant ou adulte. On vous répond sous 24h.",
    buttons: [
      { label: "Réserver un cours à domicile", href: LEAD_HREF, kind: "primary" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
