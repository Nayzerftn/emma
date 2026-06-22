import { getTeacher } from "@/lib/supabase/teacher-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdmin } from "@/lib/env";
import { ProfPlanning, type ProfLesson } from "@/components/prof/ProfPlanning";

export const dynamic = "force-dynamic";

export default async function ProfHome() {
  const teacher = await getTeacher();
  if (!teacher) return null; // le layout a déjà redirigé

  let lessons: ProfLesson[] = [];
  if (hasSupabaseAdmin) {
    const db = createSupabaseAdminClient();
    const from = new Date(new Date().getTime() - 24 * 3600_000).toISOString();

    // Cloisonnement : on ne lit QUE les cours de cette professeure.
    const { data: rows } = await db
      .from("lessons")
      .select("id,starts_at,duration_min,student_name,zone,address,status,client_id")
      .eq("teacher_id", teacher.id)
      .gte("starts_at", from)
      .in("status", ["scheduled", "done"])
      .order("starts_at")
      .limit(100);

    const clientIds = [...new Set((rows ?? []).map((l) => l.client_id).filter(Boolean))] as string[];
    const clientMap = new Map<string, { name: string; phone: string | null }>();
    if (clientIds.length) {
      const { data: clients } = await db
        .from("clients")
        .select("id,name,phone")
        .in("id", clientIds);
      for (const c of clients ?? []) clientMap.set(c.id, { name: c.name, phone: c.phone });
    }

    lessons = (rows ?? []).map((l) => {
      const c = l.client_id ? clientMap.get(l.client_id) : null;
      return {
        id: l.id,
        startsAt: l.starts_at,
        durationMin: l.duration_min,
        studentName: l.student_name,
        clientName: c?.name ?? null,
        clientPhone: c?.phone ?? null,
        zone: l.zone,
        address: l.address,
        status: l.status,
      };
    });
  }

  return <ProfPlanning teacherName={teacher.name} lessons={lessons} />;
}
