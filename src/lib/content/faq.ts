/** FAQ (Annexe A) — Accueil (6) + Réservation (6). Source de vérité + seed + JSON-LD. */
export type FaqItem = {
  page: "home" | "reservation";
  question: string;
  answer: string;
  order: number;
};

export const FAQ_HOME: FaqItem[] = [
  {
    page: "home",
    question: "Qu'est-ce qu'il faut apporter ?",
    answer: "Juste un maillot et des lunettes, on s'occupe du reste.",
    order: 1,
  },
  {
    page: "home",
    question: "Combien faut-il de séances ?",
    answer:
      "On conseille d'en réserver 5 à 10 à l'avance. Annulation sans frais jusqu'à 48h avant.",
    order: 2,
  },
  {
    page: "home",
    question: "Vous vous déplacez jusqu'où ?",
    answer:
      "Sur tout le Pays Basque.",
    order: 3,
  },
  {
    page: "home",
    question: "C'est pour les adultes aussi ?",
    answer:
      "Absolument, dès 3 ans.",
    order: 4,
  },
  {
    page: "home",
    question: "C'est disponible toute l'année ?",
    answer:
      "Oui — bassin privé, cours à domicile, océan, kinésiologie et surf, toute l'année. Également bébé nageur, aquaphobie et aquagym au bassin d'Anglet.",
    order: 5,
  },
  {
    page: "home",
    question: "Comment réserver ?",
    answer:
      "Directement en ligne pour les cours de natation et les initiations océan. Sur WhatsApp pour la kinésiologie et le surf. Réponse sous 24h.",
    order: 6,
  },
];

export const FAQ_RESERVATION: FaqItem[] = [
  {
    page: "reservation",
    question: "Quel est le délai de réponse ?",
    answer:
      "On s'engage à répondre sous 24h.",
    order: 1,
  },
  {
    page: "reservation",
    question: "Quel matériel faut-il ?",
    answer: "Juste un maillot et des lunettes.",
    order: 2,
  },
  {
    page: "reservation",
    question: "Peut-on annuler un cours ?",
    answer: "Oui, sans frais jusqu'à 48h avant.",
    order: 3,
  },
  {
    page: "reservation",
    question: "C'est pour les adultes aussi ?",
    answer:
      "Enfants dès 3 ans et adultes de tous niveaux.",
    order: 4,
  },
  {
    page: "reservation",
    question: "Comment choisit-on notre professeure ?",
    answer:
      "On vous propose la plus adaptée à votre profil.",
    order: 5,
  },
  {
    page: "reservation",
    question: "Combien de séances ?",
    answer:
      "5 à 10 à l'avance — on est souvent complet.",
    order: 6,
  },
];

export const ALL_FAQ: FaqItem[] = [...FAQ_HOME, ...FAQ_RESERVATION];
