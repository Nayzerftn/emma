"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { lessonEndsAt } from "@/lib/platform/planning";
import type { LessonStatus, LessonDuration } from "@/lib/supabase/types";

export type ProfLesson = {
  id: string;
  startsAt: string;
  durationMin: LessonDuration;
  studentName: string | null;
  clientName: string | null;
  clientPhone: string | null;
  zone: string | null;
  address: string | null;
  status: LessonStatus;
};

function timeRange(iso: string, d: LessonDuration) {
  const s = new Date(iso);
  return `${format(s, "HH'h'mm")} – ${format(lessonEndsAt(s, d), "HH'h'mm")}`;
}

export function ProfPlanning({
  teacherName,
  lessons,
}: {
  teacherName: string;
  lessons: ProfLesson[];
}) {
  const byDay = useMemo(() => {
    const map = new Map<string, ProfLesson[]>();
    for (const l of lessons) {
      const key = format(new Date(l.startsAt), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), l]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [lessons]);

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-[-0.02em]">
        Bonjour {teacherName.split(" ")[0]}
      </h1>
      <p className="text-meta mt-1 text-sm">Vos prochains cours.</p>

      {byDay.length === 0 ? (
        <div className="border-filet text-meta mt-8 border border-dashed p-8 text-center text-sm">
          Aucun cours à venir pour le moment.
        </div>
      ) : (
        <div className="mt-6 space-y-7">
          {byDay.map(([day, items]) => (
            <section key={day}>
              <h2 className="font-display border-filet mb-3 border-b pb-2 text-base font-bold capitalize">
                {format(new Date(`${day}T12:00:00`), "EEEE d MMMM", { locale: fr })}
              </h2>
              <div className="space-y-3">
                {items
                  .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                  .map((l) => (
                    <article key={l.id} className="border-filet border p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-display font-bold">{timeRange(l.startsAt, l.durationMin)}</p>
                        <span className="eyebrow text-meta">
                          {l.durationMin === 60 ? "1 h" : "30 min"}
                          {l.status === "done" ? " · effectué" : ""}
                        </span>
                      </div>
                      <p className="mt-1 font-medium">
                        {l.studentName ?? l.clientName ?? "Élève"}
                        {l.zone ? ` · secteur ${l.zone}` : ""}
                      </p>
                      {l.address && <p className="text-meta text-sm">{l.address}</p>}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {l.clientName && <span className="text-meta">{l.clientName}</span>}
                        {l.clientPhone && (
                          <a href={`tel:${l.clientPhone}`} className="underline-draw text-ink">
                            {l.clientPhone}
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
