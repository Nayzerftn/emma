import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { PaieBoard, type TeacherPay } from "@/components/admin/PaieBoard";
import { teacherPayout } from "@/lib/platform/billing";
import type { TeacherSettingsRow } from "@/lib/supabase/types";

/** Bornes ISO d'un mois "YYYY-MM" (heure de Paris approchée via UTC, suffisant pour le regroupement). */
function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { from: start.toISOString(), to: end.toISOString() };
}

export default async function AdminPaie({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const month = sp.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { from, to } = monthBounds(month);

  const supabase = await createSupabaseServerClient();
  const [{ data: team }, { data: settings }, { data: lessons }, { data: clients }] =
    await Promise.all([
      supabase.from("team_members").select("id,name").order("display_order"),
      supabase.from("teacher_settings").select("*"),
      supabase
        .from("lessons")
        .select("teacher_id,client_id,duration_min,status,starts_at")
        .eq("status", "done")
        .gte("starts_at", from)
        .lt("starts_at", to),
      supabase.from("clients").select("id,name"),
    ]);

  const rateByTeacher = new Map<string, TeacherSettingsRow>(
    (settings ?? []).map((s) => [s.teacher_id, s]),
  );
  const clientName = new Map((clients ?? []).map((c) => [c.id, c.name]));
  const teacherName = new Map((team ?? []).map((t) => [t.id, t.name]));

  // teacher → family → { c30, c60 }
  const agg = new Map<string, Map<string, { c30: number; c60: number }>>();
  for (const l of lessons ?? []) {
    const fam = l.client_id ? (clientName.get(l.client_id) ?? "Sans famille") : "Sans famille";
    if (!agg.has(l.teacher_id)) agg.set(l.teacher_id, new Map());
    const fams = agg.get(l.teacher_id)!;
    if (!fams.has(fam)) fams.set(fam, { c30: 0, c60: 0 });
    const e = fams.get(fam)!;
    if (l.duration_min === 60) e.c60++;
    else e.c30++;
  }

  const rows: TeacherPay[] = [...agg.entries()]
    .map(([teacherId, fams]) => {
      const s = rateByTeacher.get(teacherId);
      const r30 = s?.payout_30_cents ?? 2500;
      const r60 = s?.payout_60_cents ?? 4000;
      const families = [...fams.entries()].map(([family, { c30, c60 }]) => ({
        family,
        count30: c30,
        count60: c60,
        amountCents: teacherPayout(c30, c60, r30, r60),
      }));
      return {
        teacherId,
        name: teacherName.get(teacherId) ?? "—",
        rate30: r30,
        rate60: r60,
        families,
        totalCents: families.reduce((s2, f) => s2 + f.amountCents, 0),
        totalCourses: families.reduce((s2, f) => s2 + f.count30 + f.count60, 0),
      };
    })
    .filter((r) => r.totalCourses > 0)
    .sort((a, b) => b.totalCents - a.totalCents);

  return (
    <>
      <AdminHeading
        title="Paie professeures"
        description="Cours effectués et montant à reverser, par professeure et par famille."
      />
      <PaieBoard month={month} rows={rows} />
    </>
  );
}
