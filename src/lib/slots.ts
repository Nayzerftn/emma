import { hasSupabase } from "@/lib/env";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { remainingSeats } from "@/lib/availability";

export type OpenSlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  audience: "enfant" | "adulte";
  level: number | null;
  capacity: number;
  booked_count: number;
  price_cents: number;
  remaining: number;
  teacher: string | null;
};

/** Créneaux ouverts & futurs avec des places restantes (lecture publique). */
export async function getOpenSlots(): Promise<OpenSlot[]> {
  if (!hasSupabase) return [];
  try {
    const supabase = createSupabasePublicClient();
    const { data: rows, error } = await supabase
      .from("pool_slots")
      .select(
        "id,starts_at,ends_at,audience,level,capacity,booked_count,price_cents,teacher_id",
      )
      .order("starts_at", { ascending: true });
    if (error || !rows) return [];

    const teacherIds = [
      ...new Set(rows.map((r) => r.teacher_id).filter((id): id is string => Boolean(id))),
    ];
    const teacherMap = new Map<string, string>();
    if (teacherIds.length > 0) {
      const { data: teachers } = await supabase
        .from("team_members")
        .select("id,name")
        .in("id", teacherIds);
      for (const t of teachers ?? []) teacherMap.set(t.id, t.name);
    }

    return rows
      .map((s) => ({
        id: s.id,
        starts_at: s.starts_at,
        ends_at: s.ends_at,
        audience: s.audience,
        level: s.level,
        capacity: s.capacity,
        booked_count: s.booked_count,
        price_cents: s.price_cents,
        remaining: remainingSeats(s),
        teacher: s.teacher_id ? (teacherMap.get(s.teacher_id) ?? null) : null,
      }))
      .filter((s) => s.remaining > 0);
  } catch {
    return [];
  }
}
