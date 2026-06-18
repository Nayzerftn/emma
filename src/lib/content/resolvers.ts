/**
 * Résolveurs de contenu : DB Supabase (override admin) → fallback code (Annexe A).
 * Le site reste exact et fonctionnel même sans Supabase branché.
 * `cache()` dédoublonne les requêtes au sein d'une même requête serveur.
 */
import { cache } from "react";
import { hasSupabase } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { TEAM, type Service, type TeamMember } from "@/lib/content/team";
import { TESTIMONIALS, type Testimonial } from "@/lib/content/testimonials";
import { FAQ_HOME, FAQ_RESERVATION, type FaqItem } from "@/lib/content/faq";

export type TeamView = TeamMember & { photoPath: string | null };

export const getTeam = cache(async (): Promise<TeamView[]> => {
  const fallback = (): TeamView[] =>
    TEAM.map((m) => ({ ...m, photoPath: null })).sort((a, b) => a.order - b.order);

  if (!hasSupabase) return fallback();
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error || !data || data.length === 0) return fallback();
    return data.map((row) => ({
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      role: row.role,
      bio: row.bio,
      services: (row.services ?? []) as Service[],
      whatsapp: row.whatsapp,
      order: row.display_order,
      photoPath: row.photo_path,
    }));
  } catch {
    return fallback();
  }
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  if (!hasSupabase) return TESTIMONIALS;
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("display_order", { ascending: true });
    if (error || !data || data.length === 0) return TESTIMONIALS;
    return data.map((row) => ({
      quote: row.quote,
      author: row.author,
      order: row.display_order,
    }));
  } catch {
    return TESTIMONIALS;
  }
});

export const getFaq = cache(async (page: "home" | "reservation"): Promise<FaqItem[]> => {
  const fallback = page === "home" ? FAQ_HOME : FAQ_RESERVATION;
  if (!hasSupabase) return fallback;
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .eq("page", page)
      .eq("published", true)
      .order("display_order", { ascending: true });
    if (error || !data || data.length === 0) return fallback;
    return data.map((row) => ({
      page,
      question: row.question,
      answer: row.answer,
      order: row.display_order,
    }));
  } catch {
    return fallback;
  }
});

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
