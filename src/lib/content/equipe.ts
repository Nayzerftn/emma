/** PAGE 2 — ÉQUIPE (Annexe A). Le roster vient de team.ts. */
import { SQUARE_BOOKING_URL, SQUARE_APPOINTMENTS_URL } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

export const EQUIPE = {
  hero: {
    eyebrow: "Équipe 100% féminine · Côte Basque",
    titleLines: ["Huit expertes", "de l'eau."],
    text: "Toutes maîtres-nageuses et expertes diplômées — chacune avec sa spécialité. Une championne du monde, une spécialiste du mouvement, une experte des enfants en difficulté, une surf-thérapeute, des kinésiologues de la peur de l'eau. On ne s'est pas réunies par hasard : on croit que chaque personne mérite la spécialiste qui lui correspond.",
  },
  sectionTitleLines: ["On vous accompagne", "à chaque étape."],
  finalCta: {
    titleLines: ["Trouvez votre", "spécialiste."],
    text: "Cours de natation à Bayonne, Anglet, Biarritz — à domicile ou en bassin privé. On vous répond sous 24h.",
    buttons: [
      {
        label: "Réserver un rendez-vous",
        href: SQUARE_APPOINTMENTS_URL,
        kind: "primary",
      },
      {
        label: "Réserver en bassin privé",
        href: SQUARE_BOOKING_URL,
        kind: "outline",
      },
    ] satisfies CtaButton[],
  },
} as const;
