/** PAGE 8 — RÉSERVATION : 3 chemins, FAQ, CTA (script Emma, octobre 2026). */
import {
  SQUARE_ANGLET_URL,
  SQUARE_APPOINTMENTS_URL,
  SQUARE_BIDART_URL,
  SQUARE_OCEAN_URL,
  WHATSAPP,
  WHATSAPP_INFO_URL,
  waLink,
} from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

export const RESERVATION = {
  paths: [
    {
      id: "en-ligne",
      eyebrow: "01 · En ligne",
      title: "Cours de natation & initiation océan, aquaphobie, aquagym et bébé nageur",
      text: "Indiquez votre niveau, vos disponibilités et votre adresse. On vous recontacte avec la professeure la plus adaptée et des propositions de créneaux.",
      buttons: [
        { label: "Réserver à domicile", href: SQUARE_APPOINTMENTS_URL },
        { label: "Je réserve un cours en océan", href: SQUARE_OCEAN_URL },
      ],
    },
    {
      id: "bassins",
      eyebrow: "02 · En ligne",
      title: "Bassin privé à Bidart et à Anglet",
      text: "Choisissez votre créneau et votre professeure directement en ligne.",
      buttons: [
        { label: "Réserver à Bidart", href: SQUARE_BIDART_URL },
        { label: "Réserver à Anglet", href: SQUARE_ANGLET_URL },
      ],
    },
    {
      id: "whatsapp",
      eyebrow: "03 · WhatsApp",
      title: "Kinésiologie & surf",
      text: "Pour la kinésiologie, le surf ou toute autre question, écrivez-nous sur WhatsApp. On préfère l'écrit pour prendre le temps de bien vous répondre, toujours sous 24h.",
      buttons: [
        { label: "WhatsApp Maïka — kiné", href: waLink(WHATSAPP.maika) },
        { label: "WhatsApp Clara D. — surf", href: waLink(WHATSAPP.claraD) },
        { label: "WhatsApp — toute question", href: WHATSAPP_INFO_URL },
      ],
    },
  ],
  finalCta: {
    titleLines: ["Et pourquoi", "pas vous ?"],
    text: "Cours de natation à Bayonne, Anglet, Biarritz — enfant ou adulte, à domicile ou en bassin privé. On vous répond toujours sous 24h.",
    buttons: [
      { label: "Réserver en bassin privé", href: "#bassins", kind: "primary" },
      { label: "Réserver à domicile", href: SQUARE_APPOINTMENTS_URL, kind: "outline" },
      { label: "WhatsApp — toute question", href: WHATSAPP_INFO_URL, kind: "whatsapp" },
    ] satisfies CtaButton[],
  },
} as const;
