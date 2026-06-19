/** PAGE 1 — ACCUEIL (Annexe A, copy exact, zéro émoji). */
import {
  CITIES,
  RESERVATION_HREF,
  SQUARE_BOOKING_URL,
  WHATSAPP,
  waLink,
} from "@/lib/constants";
import type { CtaButton, IllustratedSection, Offer } from "@/lib/content/types";

export const HOME = {
  hero: {
    eyebrow: "Bayonne · Anglet · Biarritz · toute la Côte Basque",
    titleLines: ["La première", "école de natation", "de la Côte Basque"],
    titlePlain: "La première école de natation de la Côte Basque",
    subtitle:
      "Nous sommes un collectif de maîtres-nageuses diplômées — chacune avec sa spécialité : spécialiste du mouvement, experte des enfants en difficulté, kinésiologue de la peur de l'eau, surf-thérapeute, athlète de haut niveau. Ensemble, bien plus que des profs de natation : une experte pour chaque besoin.",
    cta: { label: "Découvrir nos offres", href: "#offres" },
  },

  stats: [
    { head: "Dès 3 ans", sub: "Enfants & adultes · tous niveaux" },
    { head: "Maîtres-nageuses", sub: "Diplômées & spécialistes" },
    { head: "Bassin · Domicile · Océan", sub: "Du sur-mesure" },
    { head: "Toute l'année", sub: "Toute la Côte Basque" },
  ],

  manifesto: {
    titleLines: ["L'eau,", "ça s'apprend", "avec la bonne", "personne."],
    text: "Toutes maîtres-nageuses diplômées — et chacune avec une spécialité rare. Vous ne tombez pas sur « un prof ». Vous trouvez LA spécialiste de votre besoin.",
  },

  offers: [
    {
      eyebrow: "Bassin privé · Bidart",
      titleLines: ["Cours en bassin", "privé à Bidart"],
      text: "Une piscine privée, couverte et chauffée, rien que pour nous. Mini-groupes de 3 maximum par niveau pour les enfants ; séances personnalisées pour les adultes, adaptées à vos besoins.",
      href: "/bassin-prive",
      photo: "bassin",
    },
    {
      eyebrow: "À domicile · Pays Basque",
      titleLines: ["On vient", "chez vous"],
      text: "Votre piscine, notre expertise. Pour les enfants, le cadre rassurant de la maison. Pour les adultes, l'intimité pour progresser à son rythme. Partout sur la Côte Basque.",
      href: "/cours-a-domicile",
      photo: "domicile",
    },
    {
      eyebrow: "Initiation océan",
      titleLines: ["Nager en conscience", "dans l'océan"],
      text: "L'étape après la piscine. Courants, vagues, lecture de l'eau — tout ce qu'on n'apprend pas dans un bassin. Pour les enfants comme pour les adultes, au Port-Vieux de Biarritz ou aux plages d'Anglet.",
      href: "/initiation-ocean",
      photo: "ocean",
    },
    {
      eyebrow: "Kinésiologie · peur de l'eau",
      titleLines: ["La peur de l'eau ?", "Notre spécialité"],
      text: "Un enfant qui pleure avant la piscine, un adulte qui n'a jamais osé ? La peur de l'eau n'a pas d'âge — et on peut la dépasser. Notre kinésiologue lève les blocages en douceur. 90% de nos nageurs débloquent leurs appréhensions dès la première séance, petits comme grands.",
      href: "/kinesiologie",
      photo: "kinesiologie",
    },
    {
      eyebrow: "Cours de surf",
      titleLines: ["Le surf,", "autrement"],
      text: "Débuter, progresser ou se réconcilier avec l'océan. Avec Clara D., surfeuse, naturopathe et réflexologue — une approche douce et complète, pour tous les âges, sur toute la Côte Basque.",
      href: "/surf",
      photo: "surf",
    },
    {
      eyebrow: "Natation Côte Basque",
      titleLines: ["Une école pensée", "autrement."],
      text: "Huit spécialistes qui se connaissent, s'écoutent et avancent ensemble — pour répondre à vos objectifs. On ne vous confie pas à un prof. On vous confie à une équipe.",
      href: "/equipe",
      photo: "collectif",
    },
  ] satisfies Offer[],

  illustrated: [
    {
      quoteLines: ["Un bassin", "rien que", "pour vous."],
      meta: "Bassin privé · Bidart",
      photo: "bassin",
    },
    {
      quoteLines: ["L'océan,", "ça s'apprend."],
      meta: "Initiation océan · Port-Vieux Biarritz / Anglet",
      photo: "ocean",
    },
    {
      quoteLines: ["La peur", "de l'eau —", "notre spécialité."],
      meta: "Kinésiologie · Anglet, Bidart et domicile",
      photo: "kinesiologie",
    },
  ] satisfies IllustratedSection[],

  collective: {
    titleLines: ["On vous accompagne", "à chaque étape", "vers votre objectif."],
    text: "Chacune a sa spécialité, on se complète, et c'est la collaboration entre nos expertes qui fait toute la qualité de Natation Côte Basque. On peut commencer par une séance de kinésiologie avec Maïka pour débloquer la peur, continuer avec des cours en bassin privé avec Oïana, passer aux initiations en océan, puis finir par du surf avec Clara une fois à l'aise.",
  },

  trust: [
    "Des maîtres-nageuses spécialistes — la bonne experte pour chaque besoin.",
    "Enfants dès 3 ans et adultes — on accompagne tous les profils, à tout âge.",
    "Chez vous, en bassin privé ou dans l'océan — on s'adapte à votre vie.",
    "Les expertes de la natation en Pays Basque réunies dans une même équipe.",
  ],

  bab: {
    titleLines: ["Partout dans", "le Pays Basque."],
    text: "Cours de natation à domicile sur toute la Côte Basque. Indiquez votre adresse — on trouve la professeure la plus proche et la plus adaptée.",
    cities: CITIES,
  },

  finalCta: {
    titleLines: ["Et si l'eau", "devenait", "un plaisir ?"],
    text: "La première séance commence par un simple message. Bassin privé, domicile, initiation océan, surf ou peur de l'eau — enfant ou adulte, on trouve la bonne formule ensemble. On vous répond toujours sous 24h.",
    buttons: [
      {
        label: "Je réserve mon cours en bassin privé",
        href: SQUARE_BOOKING_URL,
        kind: "primary",
      },
      {
        label: "Réserver un cours à domicile",
        href: `${RESERVATION_HREF}?type=domicile#en-ligne`,
        kind: "outline",
      },
      {
        label: "WhatsApp — on vous répond",
        href: waLink(WHATSAPP.general),
        kind: "whatsapp",
      },
    ] satisfies CtaButton[],
  },
} as const;
