/** PAGE 1 — ACCUEIL (Annexe A, copy exact, zéro émoji). */
import {
  CITIES,
  SQUARE_ANGLET_URL,
  SQUARE_APPOINTMENTS_URL,
  SQUARE_BIDART_URL,
  SQUARE_OCEAN_URL,
} from "@/lib/constants";
import type { CtaButton, IllustratedSection, Offer } from "@/lib/content/types";

export const HOME = {
  /** Bandeau tout en haut de l'accueil, avant le hero. */
  announcement: {
    label: "Nouveau 2026",
    text: "Cours d'apnée, bébé nageur, cours spécial aquaphobie, cours ado, aquagym.",
  },

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
      text: "Une piscine privée, couverte et chauffée, rien que pour nous. Mini-groupes de 3 maximum par niveau pour les enfants ; séances personnalisées ou un petit groupe pour les adultes, adaptées à vos besoins.",
      detail: "Apprentissage, perfectionnement : enfant, ado, adulte. Cours d'apnée.",
      href: "/bassin-prive",
      photo: "bassin",
    },
    {
      eyebrow: "Bassin privé · Anglet",
      titleLines: ["Cours en bassin", "privé à Anglet"],
      text: "Un bassin plus doux, pensé pour le public sensible : bébé nageur, aquaphobie, aquagym, Niveau 1 enfant. Piscine couverte et chauffée à 33°C, pour commencer dans un environnement plus cocon.",
      detail: "Bébé nageur, aquaphobie, aquagym, Niveau 1 enfant.",
      href: "/bassin-prive",
      photo: "bassinAnglet",
    },
    {
      eyebrow: "À domicile · Pays Basque",
      titleLines: ["On vient", "chez vous"],
      text: "Votre piscine, notre expertise. Pour les enfants, le cadre rassurant de la maison. Pour les adultes, l'intimité pour progresser à son rythme. Partout sur la Côte Basque.",
      href: "/cours-a-domicile",
      photo: "domicile",
    },
    {
      eyebrow: "Océan",
      titleLines: ["Nager en conscience", "dans l'océan"],
      text: "L'étape après la piscine. Courants, vagues, lecture de l'eau — tout ce qu'on n'apprend pas dans un bassin. Pour les enfants comme pour les adultes, sur toutes les plages basques.",
      detail: "Initiation océan, et longe côte.",
      href: "/initiation-ocean",
      photo: "ocean",
    },
    {
      eyebrow: "Aquaphobie et kinésiologie",
      titleLines: ["La peur de l'eau,", "notre spécialité"],
      text: "La peur de l'eau n'a pas d'âge — on peut la dépasser. On propose des cours ados et adultes d'aquaphobie à Anglet, ainsi que des séances de kinésiologie pour débloquer les blocages émotionnels. 90% de nos nageurs débloquent leurs appréhensions dès la première séance, petits comme grands.",
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
      quoteLines: ["Un bassin", "à Bidart."],
      meta: "Bassin privé · Bidart",
      photo: "bassin",
    },
    {
      quoteLines: ["Un bassin", "à Anglet."],
      meta: "Bassin privé · Anglet",
      photo: "bassinAnglet2",
    },
    {
      quoteLines: ["L'océan,", "ça s'apprend."],
      meta: "Initiation océan",
      photo: "ocean",
    },
    {
      quoteLines: ["La peur", "de l'eau,", "notre spécialité."],
      meta: "Kinésiologie, aquaphobie",
      photo: "kinesiologie",
    },
  ] satisfies IllustratedSection[],

  collective: {
    titleLines: ["On vous accompagne", "à chaque étape", "vers votre objectif."],
    text: "Chacune a sa spécialité, on se complète, et c'est la collaboration entre nos expertes qui fait toute la qualité de Natation Côte Basque. Une séance de kinésiologie avec Maïka pour débloquer la peur, des cours en bassin privé avec Oïana, des initiations en océan avec Otxanda, puis du surf avec Clara — on vous accompagne du tout début jusqu'à l'aisance totale.",
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
    text: "La première séance commence par un simple message. Bassin privé, domicile, océan, surf ou peur de l'eau — enfant ou adulte, on trouve la bonne formule ensemble. On vous répond toujours sous 24h.",
    buttons: [
      {
        label: "Je réserve mon cours en bassin privé à Bidart",
        href: SQUARE_BIDART_URL,
        kind: "primary",
      },
      {
        label: "Je réserve mon cours en bassin privé à Anglet",
        href: SQUARE_ANGLET_URL,
        kind: "primary",
      },
      {
        label: "Je réserve un cours en océan",
        href: SQUARE_OCEAN_URL,
        kind: "outline",
      },
      {
        label: "Réserver un cours à domicile",
        href: SQUARE_APPOINTMENTS_URL,
        kind: "outline",
      },
    ] satisfies CtaButton[],
  },
} as const;
