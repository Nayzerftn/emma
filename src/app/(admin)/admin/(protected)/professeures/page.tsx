import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { TeachersSettings, type TeacherCard } from "@/components/admin/TeachersSettings";
import type { TeacherSettingsRow } from "@/lib/supabase/types";

export default async function AdminProfesseures() {
  const supabase = await createSupabaseServerClient();
  const [{ data: team }, { data: settings }] = await Promise.all([
    supabase
      .from("team_members")
      .select("id,name,services,is_active")
      .order("display_order"),
    supabase.from("teacher_settings").select("*"),
  ]);

  const byId = new Map<string, TeacherSettingsRow>((settings ?? []).map((s) => [s.teacher_id, s]));

  const teachers: TeacherCard[] = (team ?? []).map((t) => {
    const s = byId.get(t.id);
    return {
      id: t.id,
      name: t.name,
      services: t.services,
      isActive: t.is_active,
      zones: s?.zones ?? [],
      maxPerDay: s?.max_per_day ?? 4,
      payout30Cents: s?.payout_30_cents ?? 2500,
      payout60Cents: s?.payout_60_cents ?? 4000,
      availability: s?.availability ?? { base: [], exceptions: [] },
    };
  });

  return (
    <>
      <AdminHeading
        title="Professeures"
        description="Secteurs, disponibilités, tarifs de paie et nombre de cours max par jour. Ces réglages alimentent le matching."
      />
      <TeachersSettings teachers={teachers} />
    </>
  );
}
