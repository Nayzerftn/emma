import { startOfWeek, endOfWeek } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { RequestsBoard, type RequestCard } from "@/components/admin/RequestsBoard";
import { topMatches, type MatchTeacher } from "@/lib/platform/matching";
import type { LessonRequestRow, TeamMemberRow, TeacherSettingsRow } from "@/lib/supabase/types";

export default async function AdminDemandes() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();

  const [{ data: requests }, { data: team }, { data: settings }, { data: weekLessons }] =
    await Promise.all([
      supabase
        .from("lesson_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(400),
      supabase.from("team_members").select("*").eq("is_active", true).order("display_order"),
      supabase.from("teacher_settings").select("*"),
      supabase
        .from("lessons")
        .select("teacher_id,status,zone")
        .gte("starts_at", weekStart)
        .lte("starts_at", weekEnd)
        .in("status", ["scheduled", "done"]),
    ]);

  const settingsByTeacher = new Map<string, TeacherSettingsRow>(
    (settings ?? []).map((s) => [s.teacher_id, s]),
  );
  const loadByTeacher = new Map<string, number>();
  const zonesByTeacher = new Map<string, Set<string>>(); // secteurs déjà couverts (trajets)
  for (const l of weekLessons ?? []) {
    loadByTeacher.set(l.teacher_id, (loadByTeacher.get(l.teacher_id) ?? 0) + 1);
    if (l.zone) {
      if (!zonesByTeacher.has(l.teacher_id)) zonesByTeacher.set(l.teacher_id, new Set());
      zonesByTeacher.get(l.teacher_id)!.add(l.zone);
    }
  }

  const pool: MatchTeacher[] = (team ?? []).map((t: TeamMemberRow) => {
    const s = settingsByTeacher.get(t.id);
    return {
      id: t.id,
      name: t.name,
      services: t.services,
      zones: s?.zones ?? [],
      hasAvailability: (s?.availability?.base?.length ?? 0) > 0,
      weekLoad: loadByTeacher.get(t.id) ?? 0,
      isActive: t.is_active,
      activeZones: [...(zonesByTeacher.get(t.id) ?? [])],
    };
  });

  const teacherOptions = (team ?? []).map((t) => ({ id: t.id, name: t.name }));

  const cards: RequestCard[] = (requests ?? []).map((r: LessonRequestRow) => {
    const matches = topMatches(
      { type: r.type, zone: r.zone, preferredTeacherId: r.preferred_teacher_id },
      pool,
      3,
    ).map((m) => ({ id: m.teacher.id, name: m.teacher.name, score: m.score, reasons: m.reasons }));
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      type: r.type,
      zone: r.zone,
      address: r.address,
      studentName: r.student_name,
      studentAge: r.student_age,
      studentLevel: r.student_level,
      objective: r.objective,
      weeks: r.weeks,
      slotsWanted: r.slots_wanted,
      frequency: r.frequency,
      durationMin: r.duration_min,
      nbCourses: r.nb_courses,
      message: r.message,
      source: r.source,
      status: r.status,
      matchedTeacherId: r.matched_teacher_id,
      matches,
    };
  });

  return (
    <>
      <AdminHeading
        title="Demandes"
        description="Collecte → matching → proposition → confirmation. Domicile & océan."
      />
      <RequestsBoard requests={cards} teachers={teacherOptions} />
    </>
  );
}
