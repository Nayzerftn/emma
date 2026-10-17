/**
 * Résolveurs de contenu. Équipe / témoignages / FAQ viennent du code ;
 * seuls les blocs texte (getBlocks) lisent encore Supabase s'il est branché.
 * `cache()` dédoublonne les requêtes au sein d'une même requête serveur.
 */
import { cache } from "react";
import { hasSupabase } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { TEAM, type TeamMember } from "@/lib/content/team";
import { TESTIMONIALS, type Testimonial } from "@/lib/content/testimonials";
import { FAQ_HOME, FAQ_RESERVATION, type FaqItem } from "@/lib/content/faq";

export type TeamView = TeamMember & { photoPath: string | null };

/*
 * Équipe, témoignages et FAQ : le code fait foi. Depuis la suppression du
 * back-office (pivot vitrine), la base Supabase n'est plus éditable et en
 * gardait une copie figée (Eléa, ancienne FAQ) qui masquait les mises à jour.
 */
export const getTeam = cache(async (): Promise<TeamView[]> =>
  TEAM.map((m) => ({ ...m, photoPath: null })).sort((a, b) => a.order - b.order),
);

export const getTestimonials = cache(async (): Promise<Testimonial[]> => TESTIMONIALS);

export const getFaq = cache(
  async (page: "home" | "reservation"): Promise<FaqItem[]> =>
    page === "home" ? FAQ_HOME : FAQ_RESERVATION,
);

/**
 * Blocs de contenu éditables (texte) pour une page, sous forme de map clé→valeur.
 * Les pages les fusionnent par-dessus le copy code (fallback) pour les paragraphes.
 */
export const getBlocks = cache(async (page: string): Promise<Record<string, string>> => {
  if (!hasSupabase) return {};
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("key,value")
      .eq("page", page);
    if (error || !data) return {};
    return Object.fromEntries(data.map((b) => [b.key, b.value]));
  } catch {
    return {};
  }
});
