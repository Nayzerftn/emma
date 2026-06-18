/** PAGE 8 — RÉSERVATION (Annexe A). 3 chemins : lead en ligne, bassin Stripe, WhatsApp. */
import { RESERVATION_HREF, WHATSAPP, waLink } from "@/lib/constants";
import type { CtaButton } from "@/lib/content/types";

export const RESERVATION = {
  hero: {
    eyebrow: "Réservation · Natation Côte Basque",
    titleLines: ["On se", "lance ?"],
    text: "Trois façons de réserver, selon ce que vous cherchez. Simple, rapide, humain — on vous répond toujours sous 24h.",
    cta: { label: "Réserver en bassin privé", href: "#bassin" },
  },
  paths: [
    {
      kind: "En ligne",
      title: "Cours de natation & initiation océan",
      text: "Indiquez votre niveau, vos disponibilités et votre adresse. On vous recontacte avec la professeure la plus adaptée et des propositions de créneaux.",
      anchor: "en-ligne",
    },
    {
      kind: "En ligne",
      title: "Bassin privé à Bidart",
      text: "Choisissez votre créneau et votre professeure directement en ligne. 1415 av. de Biarritz, Bidart (Chambre d'hôtes Irigoyen).",
      anchor: "bassin",
    },
    {
      kind: "WhatsApp",
      title: "Kinésiologie & surf",
      text: "Pour la kinésiologie, le surf ou toute autre question — écrivez-nous sur WhatsApp. On préfère l'écrit pour prendre le temps de bien vous répondre, toujours sous 24h.",
      anchor: "whatsapp",
    },
  ],
  finalCta: {
    titleLines: ["Et pourquoi", "pas vous ?"],
    text: "Cours de natation à Bayonne, Anglet, Biarritz — enfant ou adulte, à domicile ou en bassin privé. On vous répond toujours sous 24h.",
    buttons: [
      { label: "Réserver en bassin privé", href: "#bassin", kind: "primary" },
      {
        label: "Réserver à domicile",
        href: `${RESERVATION_HREF}?type=domicile#en-ligne`,
        kind: "outline",
      },
      {
        label: "WhatsApp — toute question",
        href: waLink(WHATSAPP.general),
        kind: "whatsapp",
      },
    ] satisfies CtaButton[],
  },
} as const;
