"use client";

import { useMemo, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { moveLesson } from "@/actions/platform";
import { lessonEndsAt, snapDropMinutes } from "@/lib/platform/planning";
import type { PlanningLesson } from "@/components/admin/DomicilePlanning";

const START_H = 8;
const END_H = 20;
const PX_PER_MIN = 28 / 30; // 28px par tranche de 30 min
const HEIGHT = (END_H - START_H) * 60 * PX_PER_MIN;

// Palette sobre par professeure (back-office = outil, hors charte N&B du site).
const COLORS = [
  "#2563eb", "#059669", "#d97706", "#7c3aed",
  "#db2777", "#0891b2", "#65a30d", "#dc2626",
];

export function WeekPlanning({
  lessons,
  teachers,
}: {
  lessons: PlanningLesson[];
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null); // id synchrone (le drop ne dépend pas d'un re-render)
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  const startDrag = (id: string) => { dragIdRef.current = id; setDragId(id); };
  const endDrag = () => { dragIdRef.current = null; setDragId(null); };

  const colorOf = (teacherId: string) => {
    const i = teachers.findIndex((t) => t.id === teacherId);
    return COLORS[(i < 0 ? 0 : i) % COLORS.length];
  };

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  function lessonsForDay(day: Date) {
    return lessons.filter((l) => isSameDay(new Date(l.startsAt), day));
  }

  function onDropOnDay(day: Date, clientY: number, colEl: HTMLDivElement) {
    const id = dragIdRef.current;
    endDrag();
    if (!id) return;
    const rect = colEl.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const minutes = snapDropMinutes(offsetY, {
      pxPerMin: PX_PER_MIN,
      startHour: START_H,
      endHour: END_H,
    });
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    const dateStr = format(day, "yyyy-MM-dd");
    const iso = new Date(`${dateStr}T${hh}:${mm}:00`).toISOString();
    startTransition(async () => {
      const res = await moveLesson(id, iso);
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  const hours = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);

  return (
    <div>
      {/* Navigation + légende */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart((w) => addDays(w, -7))} className="border-filet hover:border-ink border px-3 py-1.5 text-sm">←</button>
          <button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="border-filet hover:border-ink border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em]">Cette semaine</button>
          <button onClick={() => setWeekStart((w) => addDays(w, 7))} className="border-filet hover:border-ink border px-3 py-1.5 text-sm">→</button>
          <span className="font-display ml-2 font-bold capitalize">
            {format(weekStart, "d MMM", { locale: fr })} – {format(addDays(weekStart, 6), "d MMM yyyy", { locale: fr })}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {teachers.map((t) => (
            <span key={t.id} className="flex items-center gap-1.5 text-xs">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colorOf(t.id) }} />
              {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[760px]" style={{ gridTemplateColumns: "44px repeat(7, minmax(0,1fr))" }}>
          <div />
          {days.map((d) => (
            <div key={d.toISOString()} className="border-filet border-b pb-2 text-center">
              <p className="eyebrow capitalize">{format(d, "EEE", { locale: fr })}</p>
              <p className="font-display text-sm font-bold">{format(d, "d", { locale: fr })}</p>
            </div>
          ))}

          {/* Colonne heures */}
          <div className="relative" style={{ height: HEIGHT }}>
            {hours.map((h) => (
              <div key={h} className="text-meta absolute -translate-y-1/2 text-[0.65rem]" style={{ top: (h - START_H) * 60 * PX_PER_MIN }}>
                {h}h
              </div>
            ))}
          </div>

          {/* 7 colonnes jour */}
          {days.map((day, di) => (
            <div
              key={day.toISOString()}
              ref={(el) => { colRefs.current[di] = el; }}
              data-day={format(day, "yyyy-MM-dd")}
              className="border-filet relative border-l"
              style={{ height: HEIGHT }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onDropOnDay(day, e.clientY, colRefs.current[di]!);
              }}
            >
              {/* lignes horaires */}
              {hours.map((h) => (
                <div key={h} className="border-filet/60 absolute w-full border-t" style={{ top: (h - START_H) * 60 * PX_PER_MIN }} />
              ))}
              {/* cours */}
              {lessonsForDay(day).map((l) => {
                const start = new Date(l.startsAt);
                const min = start.getHours() * 60 + start.getMinutes();
                const top = (min - START_H * 60) * PX_PER_MIN;
                const height = l.durationMin * PX_PER_MIN;
                const cancelled = l.status === "cancelled" || l.status === "cancelled_late";
                return (
                  <div
                    key={l.id}
                    data-lesson-id={l.id}
                    draggable={!cancelled}
                    onDragStart={() => startDrag(l.id)}
                    onDragEnd={endDrag}
                    title={`${l.teacherName} · ${l.studentName ?? l.clientName ?? ""}`}
                    className="absolute right-0.5 left-0.5 overflow-hidden rounded-sm px-1.5 py-0.5 text-[0.62rem] leading-tight text-white"
                    style={{
                      top,
                      height: Math.max(height - 2, 16),
                      background: colorOf(l.teacherId),
                      opacity: cancelled ? 0.4 : dragId === l.id ? 0.5 : 1,
                      pointerEvents: dragId && dragId !== l.id ? "none" : "auto",
                      cursor: cancelled ? "default" : "grab",
                    }}
                  >
                    <span className="font-semibold">
                      {format(start, "HH'h'mm")}–{format(lessonEndsAt(start, l.durationMin), "HH'h'mm")}
                    </span>
                    <br />
                    {l.studentName ?? l.clientName ?? "Élève"}
                    {l.zone ? ` · ${l.zone}` : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="text-meta mt-3 text-xs">Glissez-déposez un cours pour le replanifier (battement vérifié).</p>
    </div>
  );
}
