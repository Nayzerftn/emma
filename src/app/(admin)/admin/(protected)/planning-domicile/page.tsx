import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { DomicilePlanning, type PlanningLesson } from "@/components/admin/DomicilePlanning";

export default async function AdminPlanningDomicile() {
  const supabase = await createSupabaseServerClient();
  const from = new Date();
  from.setDate(from.getDate() - 2);
  const to = new Date();
  to.setDate(to.getDate() + 45);

  const [{ data: lessons }, { data: team }, { data: clients }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .gte("starts_at", from.toISOString())
      .lte("starts_at", to.toISOString())
      .order("starts_at"),
    supabase.from("team_members").select("id,name").eq("is_active", true).order("display_order"),
    supabase.from("clients").select("id,name").order("name"),
  ]);

  const teacherName = new Map((team ?? []).map((t) => [t.id, t.name]));
  const clientName = new Map((clients ?? []).map((c) => [c.id, c.name]));

  const items: PlanningLesson[] = (lessons ?? []).map((l) => ({
    id: l.id,
    startsAt: l.starts_at,
    durationMin: l.duration_min,
    teacherId: l.teacher_id,
    teacherName: teacherName.get(l.teacher_id) ?? "—",
    studentName: l.student_name,
    clientName: l.client_id ? (clientName.get(l.client_id) ?? null) : null,
    zone: l.zone,
    address: l.address,
    status: l.status,
    priceCents: l.price_cents,
    payoutCents: l.payout_cents,
  }));

  return (
    <>
      <AdminHeading
        title="Planning domicile & océan"
        description="Vue d'ensemble (Eléa) et par professeure. Règle des 30 min de battement appliquée à la création."
      />
      <DomicilePlanning
        lessons={items}
        teachers={(team ?? []).map((t) => ({ id: t.id, name: t.name }))}
        clients={(clients ?? []).map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
