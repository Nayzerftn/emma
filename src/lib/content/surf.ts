/** PAGE 7 — SURF (Annexe A). Réservation = WhatsApp Clara D. Aucun prix. */
import { WHATSAPP, waLink } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const CLARA_CTA = `WhatsApp Clara D. — ${WHATSAPP.claraD.phone}`;
const CLARA_HREF = waLink(WHATSAPP.claraD);

export const SURF = {
  hero: {
    eyebrow: "Cours de surf · Toute la Côte Basque · Toute l'année",
    titleLines: ["Le surf,", "à votre", "rythme."],
    text: "Vous vivez sur la Côte Basque mais vous n'avez jamais surfé. Vous avez essayé mais l'océan vous intimide encore. Ou vous surfez déjà et vous voulez progresser vraiment. Avec Clara D. — surfeuse, naturopathe, réflexologue — le surf devient une reconnexion. Pour tous les âges.",
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
      { label: "Réservation", value: `WhatsApp — ${WHATSAPP.claraD.phone}` },
    ],
    cta: { label: CLARA_CTA, href: CLARA_HREF },
  },
  finalCta: {
    titleLines: ["Apprendre le surf", "ou surf-thérapie."],
    text: "Cours de surf sur toute la Côte Basque — débutant, perfectionnement ou thérapeutique. Pour tous les âges, toute l'année.",
    buttons: [
      { label: CLARA_CTA, href: CLARA_HREF, kind: "whatsapp" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
