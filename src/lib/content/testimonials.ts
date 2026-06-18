/** Témoignages (Annexe A) — source de vérité + seed. */
export type Testimonial = {
  quote: string;
  author: string;
  order: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Léo hurlait dès qu'on approchait de l'eau. Trois séances avec Emma, et il saute du bord en riant. On n'y croyait plus.",
    author: "Sophie, maman de Léo (5 ans) — Anglet",
    order: 1,
  },
  {
    quote:
      "Je n'avais jamais vraiment su nager. À 42 ans, j'ai osé. Aujourd'hui je fais mes longueurs sans paniquer. Merci Oïana.",
    author: "Thomas (42 ans) — Bayonne",
    order: 2,
  },
  {
    quote:
      "Les cours à la maison ont tout changé. La prof s'adapte à chacun, mes trois enfants adorent. Un vrai luxe, simple.",
    author: "Laurène, maman de 3 enfants — Biarritz",
    order: 3,
  },
];
