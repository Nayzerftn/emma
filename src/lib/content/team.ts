/**
 * Les 8 expertes (Annexe A) — ORDRE STRICT.
 * Source de vérité. Le seed Supabase est généré à partir d'ici ;
 * l'admin peut ensuite éditer la base (override).
 *
 * Règle copy : toujours écrire « fondatrice de Natation Côte Basque » en entier.
 * Thaïs = championne du monde de sauvetage côtier. Zéro émoji.
 */

export type Service = "bassin" | "domicile" | "ocean" | "kine" | "surf";

export const SERVICE_LABELS: Record<Service, string> = {
  bassin: "Bassin privé",
  domicile: "À domicile",
  ocean: "Initiation océan",
  kine: "Kinésiologie",
  surf: "Surf",
};

export type TeamMember = {
  slug: string;
  name: string;
  /** Accroche courte (« ... »). */
  tagline: string;
  /** Rôle affiché en eyebrow. */
  role: string;
  bio: string;
  services: Service[];
  /** Numéro WhatsApp (sans +) si la personne en a un public. */
  whatsapp: string | null;
  order: number;
};

export const TEAM: TeamMember[] = [
  {
    slug: "emma",
    name: "Emma",
    tagline: "Celle qui a tout imaginé.",
    role: "Fondatrice · Organisation",
    bio: "Fondatrice de Natation Côte Basque, elle a réuni cette équipe pour proposer une vision moderne et complète de l'apprentissage : plus humaine, plus adaptée, accessible à tous. Aujourd'hui, elle est responsable de l'organisation du collectif.",
    services: [],
    whatsapp: null,
    order: 1,
  },
  {
    slug: "elea",
    name: "Eléa",
    tagline: "Celle qui rend tout simple.",
    role: "Secrétariat · Coordination",
    bio: "Eléa orchestre toute l'organisation du collectif : planning, réservations, annulations, suivi des cours. Toujours disponible et réactive, c'est elle qui fait le lien entre les élèves et les professeures — et qui permet à toute l'équipe d'avancer ensemble.",
    services: [],
    whatsapp: null,
    order: 2,
  },
  {
    slug: "oiana",
    name: "Oïana",
    tagline: "Maître-nageuse & spécialiste du mouvement.",
    role: "Bassin · Domicile · Océan",
    bio: "Ancienne nageuse de compétition à Biarritz pendant plus de dix ans, maître-nageuse et sauveteuse. Spécialisée dans la compréhension du corps et du mouvement, elle allie expertise technique et expérience du terrain.",
    services: ["bassin", "domicile", "ocean"],
    whatsapp: null,
    order: 3,
  },
  {
    slug: "thais",
    name: "Thaïs",
    tagline: "Maître-nageuse & championne du monde.",
    role: "Bassin · Domicile · Océan",
    bio: "Ancienne sauveteuse en équipe de France, maître-nageuse et championne du monde de sauvetage côtier — elle incarne une expertise aquatique de très haut niveau, du débutant au sportif confirmé.",
    services: ["bassin", "domicile", "ocean"],
    whatsapp: null,
    order: 4,
  },
  {
    slug: "clara",
    name: "Clara",
    tagline: "Maître-nageuse & infirmière, bilingue.",
    role: "Domicile · Océan · FR/EN",
    bio: "Infirmière de formation, maître-nageuse et sauveteuse. Une vraie sensibilité à la pédagogie et au rythme de chacun, en particulier pour les profils anxieux ou débutants. Bilingue français/anglais pour les familles internationales.",
    services: ["domicile", "ocean"],
    whatsapp: null,
    order: 5,
  },
  {
    slug: "audrey",
    name: "Audrey",
    tagline: "La spécialiste des enfants qu'on dit difficiles.",
    role: "Domicile · Éducatrice Jeunes Enfants",
    bio: "Maître-nageuse et Éducatrice de Jeunes Enfants. Une double expertise rare pour l'apprentissage dès le plus jeune âge. Spécialiste des enfants en bas âge, elle accompagne aussi les profils en difficulté ou neuroatypiques.",
    services: ["domicile"],
    whatsapp: null,
    order: 6,
  },
  {
    slug: "clara-d",
    name: "Clara D.",
    tagline: "Le surf comme thérapie.",
    role: "Surf · Naturopathie · Réflexologie",
    bio: "Surfeuse talentueuse et professeure de surf, naturopathe et réflexologue. Elle développe une approche globale du bien-être à travers le surf : apprentissage, plaisir et reconnexion au corps.",
    services: ["surf"],
    whatsapp: null,
    order: 7,
  },
  {
    slug: "maika",
    name: "Maïka",
    tagline: "Elle parle aux tout-petits comme personne.",
    role: "Kinésiologue · Petite enfance",
    bio: "Kinésiologue certifiée, spécialisée dans l'accompagnement de la petite enfance. Elle travaille aussi en crèche et en MAM, avec une approche très douce centrée sur la sécurité émotionnelle des tout-petits dès 3 ans.",
    services: ["kine"],
    whatsapp: null,
    order: 8,
  },
];
