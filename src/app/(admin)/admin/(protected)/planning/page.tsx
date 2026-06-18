import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { PlanningManager, type PlanningSlot } from "@/components/admin/PlanningManager";
import { formatEuros } from "@/lib/utils";

export default async function AdminPlanning() {
  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();

  const [{ data: slots }, { data: teachers }] = await Promise.all([
    supabase
      .from("pool_slots")
      .select("*")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true }),
    supabase
      .from("team_members")
      .select("id,name")
      .order("display_order", { ascending: true }),
  ]);

  const teacherMap = new Map((teachers ?? []).map((t) => [t.id, t.name]));

  const rows: PlanningSlot[] = (slots ?? []).map((s) => ({
    id: s.id,
    when: format(new Date(s.starts_at), "EEE d MMM · HH'h'mm", { locale: fr }),
    audience: s.audience,
    level: s.level,
    teacher: s.teacher_id ? (teacherMap.get(s.teacher_id) ?? null) : null,
    capacity: s.capacity,
    booked_count: s.booked_count,
    price: formatEuros(s.price_cents),
    is_open: s.is_open,
  }));

  return (
    <>
      <AdminHeading
        title="Planning"
        description="Créneaux bassin privé — création, récurrence week-ends, capacité, prix."
      />
      <PlanningManager teachers={teachers ?? []} slots={rows} />
    </>
  );
}
