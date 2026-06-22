import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/env";
import type { TeamMemberRow } from "@/lib/supabase/types";

/**
 * Retourne la professeure liée à l'utilisateur courant (team_member dont
 * auth_user_id = auth.uid()), sinon null. Résolu via service role côté serveur.
 */
export const getTeacher = cache(async (): Promise<TeamMemberRow | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !hasSupabaseAdmin) return null;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("team_members")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return data ?? null;
});

/** Garde serveur : redirige vers /prof/login si l'utilisateur n'est pas une prof. */
export async function requireTeacher(): Promise<TeamMemberRow> {
  const teacher = await getTeacher();
  if (!teacher) redirect("/prof/login");
  return teacher;
}
