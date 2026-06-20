"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { createLesson, updateLessonStatus, deleteLesson } from "@/actions/platform";
import { EmptyState } from "@/components/admin/AdminShell";
import { tooClose, lessonEndsAt } from "@/lib/platform/planning";
import { formatEuros } from "@/lib/utils";
import type { LessonStatus, LessonDuration } from "@/lib/supabase/types";

export type PlanningLesson = {
  id: string;
  startsAt: string;
  durationMin: LessonDuration;
  teacherId: string;
  teacherName: string;
  studentName: string | null;
  clientName: string | null;
  zone: string | null;
  address: string | null;
  status: LessonStatus;
  priceCents: number;
  payoutCents: number;
};

const STATUS_LABEL: Record<LessonStatus, string> = {
  scheduled: "Prévu",
  done: "Effectué",
  cancelled: "Annulé",
  cancelled_late: "Annulé < 48h",
};

function timeRange(iso: string, duration: LessonDuration): string {
  const start = new Date(iso);
  const end = lessonEndsAt(start, duration);
  return `${format(start, "HH'h'mm")} – ${format(end, "HH'h'mm")}`;
}

export function DomicilePlanning({
  lessons,
  teachers,
  clients,
}: {
  lessons: PlanningLesson[];
  teachers: { id: string; name: string }[];
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    teacherId: teachers[0]?.id ?? "",
    clientId: "",
    studentName: "",
    date: "",
    time: "",
    duration: 30 as LessonDuration,
    zone: "",
    address: "",
  });

  const shown = filter ? lessons.filter((l) => l.teacherId === filter) : lessons;

  // Conflits de battement (mêmes prof, même jour, < 30 min) — visuels.
  const conflictIds = useMemo(() => {
    const set = new Set<string>();
    const byTeacherDay = new Map<string, PlanningLesson[]>();
    for (const l of lessons) {
      if (l.status === "cancelled" || l.status === "cancelled_late") continue;
      const key = `${l.teacherId}|${format(new Date(l.startsAt), "yyyy-MM-dd")}`;
      byTeacherDay.set(key, [...(byTeacherDay.get(key) ?? []), l]);
    }
    for (const group of byTeacherDay.values()) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = { startsAt: new Date(group[i].startsAt), durationMin: group[i].durationMin };
          const b = { startsAt: new Date(group[j].startsAt), durationMin: group[j].durationMin };
          if (tooClose(a, b)) {
            set.add(group[i].id);
            set.add(group[j].id);
          }
        }
      }
    }
    return set;
  }, [lessons]);

  const byDay = useMemo(() => {
    const map = new Map<string, PlanningLesson[]>();
    for (const l of shown) {
      const key = format(new Date(l.startsAt), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), l]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [shown]);

  function act(fn: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const res = await fn();
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  function add() {
    if (!form.teacherId || !form.date || !form.time) {
      toast.error("Professeure, date et heure sont requis.");
      return;
    }
    const iso = new Date(`${form.date}T${form.time}`).toISOString();
    act(() =>
      createLesson({
        teacherId: form.teacherId,
        clientId: form.clientId || null,
        studentName: form.studentName || null,
        startsAt: iso,
        durationMin: form.duration,
        zone: form.zone || null,
        address: form.address || null,
      }),
    );
    setForm((f) => ({ ...f, date: "", time: "", studentName: "", address: "" }));
  }

  const field = "border-filet focus:border-ink mt-1 block w-full border bg-paper px-3 py-2 text-sm outline-none";

  return (
    <div className="space-y-8">
      {/* Filtre + ajout */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("")}
            className={`border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${
              filter === "" ? "bg-ink text-paper border-ink" : "border-filet hover:border-ink"
            }`}
          >
            Toutes les profs
          </button>
          {teachers.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${
                filter === t.id ? "bg-ink text-paper border-ink" : "border-filet hover:border-ink"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setAddOpen((v) => !v)}
          className="border-ink hover:bg-ink hover:text-paper border px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em]"
        >
          {addOpen ? "− Fermer" : "+ Nouveau cours"}
        </button>
      </div>

      {addOpen && (
        <div className="border-filet grid gap-3 border p-5 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="eyebrow text-meta">Professeure</span>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className={field}
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="eyebrow text-meta">Famille (optionnel)</span>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className={field}
            >
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="eyebrow text-meta">Élève</span>
            <input
              value={form.studentName}
              onChange={(e) => setForm({ ...form, studentName: e.target.value })}
              className={field}
            />
          </label>
          <label>
            <span className="eyebrow text-meta">Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={field}
            />
          </label>
          <label>
            <span className="eyebrow text-meta">Heure</span>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className={field}
            />
          </label>
          <label>
            <span className="eyebrow text-meta">Durée</span>
            <select
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: Number(e.target.value) as LessonDuration })
              }
              className={field}
            >
              <option value={30}>30 min</option>
              <option value={60}>1 h</option>
            </select>
          </label>
          <label>
            <span className="eyebrow text-meta">Secteur</span>
            <input
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value.toUpperCase() })}
              maxLength={1}
              className={field}
            />
          </label>
          <label className="lg:col-span-2">
            <span className="eyebrow text-meta">Adresse</span>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={field}
            />
          </label>
          <div className="flex items-end">
            <button
              disabled={pending}
              onClick={add}
              className="bg-ink text-paper w-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
            >
              Planifier
            </button>
          </div>
        </div>
      )}

      {/* Planning par jour */}
      {byDay.length === 0 ? (
        <EmptyState>Aucun cours sur la période.</EmptyState>
      ) : (
        byDay.map(([day, items]) => (
          <section key={day}>
            <h2 className="font-display border-filet mb-3 border-b pb-2 text-lg font-bold capitalize">
              {format(new Date(day + "T12:00:00"), "EEEE d MMMM", { locale: fr })}
            </h2>
            <div className="space-y-3">
              {items
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                .map((l) => {
                  const cancelled = l.status === "cancelled" || l.status === "cancelled_late";
                  return (
                    <article
                      key={l.id}
                      className={`border p-4 ${
                        conflictIds.has(l.id) ? "border-ink bg-sand" : "border-filet"
                      } ${cancelled ? "opacity-60" : ""}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-bold">
                            {timeRange(l.startsAt, l.durationMin)} · {l.teacherName}
                          </p>
                          <p className="text-meta text-sm">
                            {l.studentName ?? l.clientName ?? "Élève —"}
                            {l.zone ? ` · secteur ${l.zone}` : ""}
                            {l.address ? ` · ${l.address}` : ""}
                          </p>
                          <p className="text-meta mt-1 text-xs">
                            {formatEuros(l.priceCents)} client · {formatEuros(l.payoutCents)} prof
                          </p>
                        </div>
                        <span className="border-filet text-meta border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em]">
                          {STATUS_LABEL[l.status]}
                        </span>
                      </div>
                      {conflictIds.has(l.id) && (
                        <p className="text-ink mt-2 text-xs font-semibold">
                          ⚠ Battement insuffisant (&lt; 30 min) avec un autre cours.
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {l.status !== "done" && (
                          <button
                            disabled={pending}
                            onClick={() => act(() => updateLessonStatus(l.id, "done"))}
                            className="border-filet hover:border-ink border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                          >
                            Effectué
                          </button>
                        )}
                        {!cancelled && (
                          <>
                            <button
                              disabled={pending}
                              onClick={() => act(() => updateLessonStatus(l.id, "cancelled"))}
                              className="border-filet hover:border-ink border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                            >
                              Annuler
                            </button>
                            <button
                              disabled={pending}
                              onClick={() => act(() => updateLessonStatus(l.id, "cancelled_late"))}
                              className="border-filet hover:border-ink border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                            >
                              Annuler &lt; 48h (dû)
                            </button>
                          </>
                        )}
                        <button
                          disabled={pending}
                          onClick={() => act(() => deleteLesson(l.id))}
                          className="text-meta hover:text-ink ml-auto px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                        >
                          Supprimer
                        </button>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
