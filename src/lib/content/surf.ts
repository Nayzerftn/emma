/** PAGE 7 — SURF (Annexe A). Réservation = Square (rendez-vous). Aucun prix. */
import { SQUARE_APPOINTMENTS_URL } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const CLARA_CTA = "Réserver un cours";
const CLARA_HREF = SQUARE_APPOINTMENTS_URL;

export const SURF = {
  hero: {
    eyebrow: "Cours de surf · Toute la Côte Basque · Toute l'année",
    titleLines: ["Le surf,", "à votre", "rythme."],
    text: "Pour la première vague ou pour se réconcilier avec l'océan. Avec Clara D. — surfeuse, naturopathe, réflexologue — le surf devient bien plus qu'un sport : une reconnexion. Pour tous les âges.",
    cta: { label: CLARA_CTA, href: CLARA_HREF },
  },
  formules: {
    eyebrow: "3 formules",
    titleLines: ["Quelle que soit", "votre relation à l'océan."],
    items: [
      {
        title: "Débutant·e",
        text: "Première fois sur une planche. Les bases en sécurité — position, lecture des vagues, premier take off.",
      },
      {
        title: "Perfectionnement",
        text: "Vous surfez déjà. On travaille la technique, on analyse, on affine.",
      },
      {
        title: "Surf thérapeutique",
        text: "Pour celles et ceux qui ne sont pas à l'aise dans l'océan. L'eau comme reconnexion, en douceur.",
      },
    ],
    infos: [
      {
        label: "Avec",
        value: "Clara D. — maître-nageuse, surfeuse, naturopathe et réflexologue",
      },
      { label: "Lieu", value: "Sur toute la Côte Basque" },
      { label: "Pour qui", value: "Tous les âges · toute l'année" },
      { label: "Réservation", value: "En ligne · sur rendez-vous" },
    ],
    cta: { label: CLARA_CTA, href: CLARA_HREF },
  },
  finalCta: {
    titleLines: ["Apprendre le surf", "ou surf-thérapie."],
    text: "Cours de surf sur toute la Côte Basque — débutant, perfectionnement ou thérapeutique. Pour tous les âges, toute l'année.",
    buttons: [
      { label: CLARA_CTA, href: CLARA_HREF, kind: "primary" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
