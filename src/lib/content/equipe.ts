/** PAGE 2 — ÉQUIPE (Annexe A). Le roster vient de team.ts. */
import { RESERVATION_HREF, WHATSAPP_INFO_URL } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

export const EQUIPE = {
  hero: {
    eyebrow: "Équipe 100% féminine · Côte Basque",
    titleLines: ["Huit expertes", "de l'eau."],
    text: "Toutes maîtres-nageuses et expertes diplômées — chacune avec sa spécialité. Une championne du monde, une spécialiste du mouvement, une experte des enfants en difficulté, une surf-thérapeute, des kinésiologues de la peur de l'eau. On ne s'est pas réunies par hasard : on croit que chaque personne mérite la spécialiste qui lui correspond.",
  },
  sectionTitleLines: ["On vous accompagne", "à chaque étape."],
  sectionText:
    "Chacune a sa spécialité, on se complète, et c'est la collaboration entre nos expertes qui fait toute la qualité de Natation Côte Basque. Une séance de kinésiologie avec Maïka pour débloquer la peur, des cours en bassin privé avec Oïana, des initiations en océan avec Otxanda, puis du surf avec Clara — on vous accompagne du tout début jusqu'à l'aisance totale.",
  finalCta: {
    titleLines: ["Trouvez votre", "spécialiste."],
    text: "Cours de natation à Bayonne, Anglet, Biarritz — à domicile ou en bassin privé. On vous répond sous 24h.",
    buttons: [
      { label: "Réserver", href: RESERVATION_HREF, kind: "primary" },
      { label: "WhatsApp — toute question", href: WHATSAPP_INFO_URL, kind: "whatsapp" },
    ] satisfies CtaButton[],
  },
} as const;
