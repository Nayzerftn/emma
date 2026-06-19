/** PAGE 6 — KINÉSIOLOGIE (Annexe A). Réservation = WhatsApp Maïka. Aucun prix. */
import { WHATSAPP, waLink } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

const MAIKA_CTA = `WhatsApp Maïka — ${WHATSAPP.maika.phone}`;
const MAIKA_HREF = waLink(WHATSAPP.maika);

export const KINE = {
  hero: {
    eyebrow: "Kinésiologie · peur de l'eau · Anglet, Bidart et domicile",
    titleLines: ["La peur", "de l'eau ?", "Notre spécialité."],
    text: "Certains enfants pleurent avant d'entrer dans l'eau. Certains adultes n'ont jamais osé. Ce n'est pas une fatalité — c'est un blocage, et il se lève. 90% de nos élèves, petits comme grands, débloquent leurs appréhensions dès la première séance.",
    cta: { label: MAIKA_CTA, href: MAIKA_HREF },
  },
  what: {
    eyebrow: "Qu'est-ce que la kinésiologie ?",
    titleLines: ["Une thérapie issue", "de la médecine chinoise."],
    text: "Un mix de médecine chinoise, neurosciences, ostéopathie et psychologie pour identifier et lever les blocages émotionnels liés à l'eau. On travaille hors de l'eau — à votre rythme, juste à l'écoute et du corps. Une séance suffit souvent.",
    cases: [
      {
        title: "Enfant qui refuse l'eau",
        text: "Qui ne peut pas mettre la tête sous l'eau. 1 à 2 séances suffisent souvent.",
      },
      {
        title: "Adulte avec appréhension",
        text: "Qui n'a jamais appris à nager et a beaucoup d'appréhension.",
      },
      {
        title: "Stress lié à l'eau au quotidien",
        text: "Shampoing, pluie, douche, baignoire — tout ce qui crée de l'anxiété.",
      },
    ],
  },
  experts: {
    eyebrow: "Maïka · kinésiologue certifiée",
    titleLines: ["Une experte,", "à votre écoute."],
    items: [
      {
        name: "Maïka — Spécialiste petite enfance",
        text: "Kinésiologue certifiée. Travaille en crèche et en MAM. Expertise unique pour les tout-petits dès 3 ans.",
      },
    ],
    infos: [
      { label: "Durée", value: "Environ 1 heure" },
      { label: "Lieu", value: "À domicile ou cabinet à Anglet et Bidart" },
      { label: "Pour qui", value: "Petits comme grands, toute l'année" },
    ],
    cta: { label: MAIKA_CTA, href: MAIKA_HREF },
  },
  finalCta: {
    titleLines: ["La peur de l'eau,", "c'est fini."],
    text: "Kinésiologie à domicile ou cabinet à Anglet et Bidart. Petits comme grands, toute l'année.",
    buttons: [
      { label: MAIKA_CTA, href: MAIKA_HREF, kind: "whatsapp" },
      { label: "Voir l'équipe", href: "/equipe", kind: "outline" },
    ] satisfies CtaButton[],
  },
} as const;
