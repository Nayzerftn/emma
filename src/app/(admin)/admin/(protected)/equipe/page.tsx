import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { TeamManager, type TeamRow } from "@/components/admin/TeamManager";

export default async function AdminEquipe() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <>
      <AdminHeading
        title="Équipe"
        description="Fiches des expertes — ordre, services, photos, visibilité."
      />
      <TeamManager members={(data ?? []) as TeamRow[]} />
    </>
  );
}
