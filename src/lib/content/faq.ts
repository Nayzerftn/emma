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
      "On conseille d'en réserver 5 à 10 à l'avance — on est souvent complet. Annulation sans frais jusqu'à 48h avant.",
    order: 2,
  },
  {
    page: "home",
    question: "Vous vous déplacez jusqu'où ?",
    answer:
      "Sur tout le Pays Basque : Bayonne, Anglet, Biarritz, Bidart, Guéthary, Saint-Jean-de-Luz, Hendaye, Ciboure et bien plus.",
    order: 3,
  },
  {
    page: "home",
    question: "C'est pour les adultes aussi ?",
    answer:
      "Absolument. Enfants dès 3 ans et adultes de tous niveaux — débutants, perfectionnement, peur de l'eau, remise en forme.",
    order: 4,
  },
  {
    page: "home",
    question: "C'est disponible toute l'année ?",
    answer:
      "Oui — bassin privé, cours à domicile, initiation océan, kinésiologie et surf, toute l'année.",
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
      "On s'engage à répondre sous 24h. On échange par WhatsApp plutôt que par téléphone : ça nous laisse le temps de bien répondre à chacun.",
    order: 1,
  },
  {
    page: "reservation",
    question: "Quel matériel faut-il ?",
    answer: "Juste un maillot et des lunettes. On s'occupe du reste.",
    order: 2,
  },
  {
    page: "reservation",
    question: "Peut-on annuler un cours ?",
    answer: "Oui, annulation sans frais jusqu'à 48h avant.",
    order: 3,
  },
  {
    page: "reservation",
    question: "C'est pour les adultes aussi ?",
    answer:
      "Bien sûr. Enfants dès 3 ans et adultes de tous niveaux, partout sur la Côte Basque.",
    order: 4,
  },
  {
    page: "reservation",
    question: "Comment choisit-on notre professeure ?",
    answer:
      "On vous propose la plus adaptée à votre profil. Si vous avez une préférence, dites-le nous.",
    order: 5,
  },
  {
    page: "reservation",
    question: "Combien de séances ?",
    answer:
      "5 à 10 à l'avance — on est souvent complet. Plus tôt vous réservez, plus de choix de créneaux.",
    order: 6,
  },
];

export const ALL_FAQ: FaqItem[] = [...FAQ_HOME, ...FAQ_RESERVATION];
