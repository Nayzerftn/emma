"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  proposeRequest,
  setRequestStatus,
  confirmRequestLessons,
  proposeSlotsForRequest,
  type NewLessonInput,
} from "@/actions/platform";
import { EmptyState } from "@/components/admin/AdminShell";
import { waLink, proposalMessage, proposalWithSlotsMessage } from "@/lib/platform/notify";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { RequestStatus, LessonDuration, LeadType } from "@/lib/supabase/types";

type Match = { id: string; name: string; score: number; reasons: string[] };

export type RequestCard = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: LeadType;
  zone: string | null;
  address: string | null;
  studentName: string | null;
  studentAge: number | null;
  studentLevel: string | null;
  objective: string | null;
  weeks: string | null;
  slotsWanted: string | null;
  frequency: string | null;
  durationMin: LessonDuration;
  nbCourses: number | null;
  message: string | null;
  source: "site" | "google_form" | "manual";
  status: RequestStatus;
  matchedTeacherId: string | null;
  matches: Match[];
};

const STATUS: { key: RequestStatus; label: string }[] = [
  { key: "new", label: "Nouvelles" },
  { key: "matching", label: "En matching" },
  { key: "proposed", label: "Proposées" },
  { key: "confirmed", label: "Confirmées" },
  { key: "to_retreat", label: "À relancer" },
  { key: "lost", label: "Perdues" },
];
const STATUS_LABEL: Record<RequestStatus, string> = {
  new: "Nouvelle",
  matching: "En matching",
  proposed: "Proposée",
  confirmed: "Confirmée",
  to_retreat: "À relancer",
  lost: "Perdue",
};
const SOURCE_LABEL: Record<RequestCard["source"], string> = {
  site: "Site web",
  google_form: "Google Form",
  manual: "Saisie manuelle",
};

type LessonRow = { date: string; time: string; duration: LessonDuration };

function RequestItem({ r, teachers }: { r: RequestCard; teachers: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [planOpen, setPlanOpen] = useState(false);
  const defaultTeacher = r.matchedTeacherId ?? r.matches[0]?.id ?? teachers[0]?.id ?? "";
  const [teacherId, setTeacherId] = useState(defaultTeacher);
  const [rows, setRows] = useState<LessonRow[]>(
    Array.from({ length: Math.max(1, r.nbCourses ?? 1) }, () => ({
      date: "",
      time: "",
      duration: r.durationMin,
    })),
  );

  function act(fn: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const res = await fn();
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  function confirm() {
    const lessons: Omit<NewLessonInput, "requestId" | "clientId">[] = [];
    for (const row of rows) {
      if (!row.date || !row.time) {
        toast.error("Renseignez la date et l'heure de chaque cours.");
        return;
      }
      const iso = new Date(`${row.date}T${row.time}`).toISOString();
      lessons.push({ teacherId, startsAt: iso, durationMin: row.duration });
    }
    act(() => confirmRequestLessons(r.id, lessons));
  }

  function autoPropose() {
    startTransition(async () => {
      const res = await proposeSlotsForRequest(r.id);
      if (!res.ok || !res.slots) {
        toast.error(res.message ?? "Aucun créneau.");
        return;
      }
      setRows(res.slots.map((s) => ({ date: s.date, time: s.time, duration: r.durationMin })));
      toast.success(`${res.slots.length} créneau(x) proposé(s).`);
    });
  }

  const proposedName = teachers.find((t) => t.id === teacherId)?.name ?? "";
  const detail = (label: string, value: React.ReactNode) =>
    value ? (
      <div>
        <dt className="eyebrow text-meta">{label}</dt>
        <dd className="text-sm">{value}</dd>
      </div>
    ) : null;

  return (
    <article className="border-filet border p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="eyebrow text-meta">
            {r.type === "ocean" ? "Initiation océan" : "À domicile"} · {SOURCE_LABEL[r.source]}
          </p>
          <p className="font-display mt-1 text-lg font-bold">{r.name}</p>
          {r.studentName && (
            <p className="text-meta text-sm">
              Élève : {r.studentName}
              {r.studentAge ? ` · ${r.studentAge} ans` : ""}
              {r.studentLevel ? ` · ${r.studentLevel}` : ""}
            </p>
          )}
        </div>
        <span className="border-ink border px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em]">
          {STATUS_LABEL[r.status]}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        {detail("Secteur", r.zone)}
        {detail("Durée", `${r.durationMin} min`)}
        {detail("Nb cours", r.nbCourses)}
        {detail("Objectif", r.objective)}
        {detail("Période", r.weeks)}
        {detail("Créneaux", r.slotsWanted)}
        {detail("Fréquence", r.frequency)}
        {detail("Adresse", r.address)}
      </dl>
      {r.message && <p className="text-meta mt-3 text-sm italic">« {r.message} »</p>}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {r.email && (
          <a href={`mailto:${r.email}`} className="text-[0.72rem] underline-draw">
            {r.email}
          </a>
        )}
        {r.phone && (
          <a
            href={waLink(
              r.phone,
              proposedName
                ? proposalMessage({
                    clientName: r.name,
                    teacherName: proposedName,
                    studentName: r.studentName,
                    type: r.type,
                  })
                : undefined,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.72rem] underline-draw"
          >
            WhatsApp {r.phone}
          </a>
        )}
      </div>

      {/* Matching */}
      {r.matches.length > 0 && r.status !== "confirmed" && r.status !== "lost" && (
        <div className="border-filet mt-4 border-t pt-4">
          <p className="eyebrow text-meta mb-2">Professeures suggérées</p>
          <div className="space-y-2">
            {r.matches.map((m, i) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <span className="font-semibold">
                    {i + 1}. {m.name}
                  </span>{" "}
                  <span className="text-meta">· score {m.score}</span>
                  <p className="text-meta text-xs">{m.reasons.join(" · ") || "Aucun critère"}</p>
                </div>
                <button
                  disabled={pending}
                  onClick={() => {
                    setTeacherId(m.id);
                    act(() => proposeRequest(r.id, m.id));
                  }}
                  className="border-filet hover:border-ink border px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                >
                  Proposer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planification */}
      {r.status !== "lost" && (
        <div className="border-filet mt-4 border-t pt-4">
          <button
            onClick={() => setPlanOpen((v) => !v)}
            className="eyebrow text-ink hover:opacity-60"
          >
            {planOpen ? "− Masquer la planification" : "+ Planifier les cours"}
          </button>
          {planOpen && (
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="eyebrow text-meta">Professeure</span>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="border-filet focus:border-ink mt-1 block w-full border bg-paper px-3 py-2 text-sm outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
              {rows.map((row, idx) => (
                <div key={idx} className="flex flex-wrap items-end gap-2">
                  <label className="grow">
                    <span className="eyebrow text-meta">Date cours {idx + 1}</span>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs.map((x, i) => (i === idx ? { ...x, date: e.target.value } : x)),
                        )
                      }
                      className="border-filet focus:border-ink mt-1 block w-full border bg-paper px-3 py-2 text-sm outline-none"
                    />
                  </label>
                  <label>
                    <span className="eyebrow text-meta">Heure</span>
                    <input
                      type="time"
                      value={row.time}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs.map((x, i) => (i === idx ? { ...x, time: e.target.value } : x)),
                        )
                      }
                      className="border-filet focus:border-ink mt-1 block border bg-paper px-3 py-2 text-sm outline-none"
                    />
                  </label>
                  <label>
                    <span className="eyebrow text-meta">Durée</span>
                    <select
                      value={row.duration}
                      onChange={(e) =>
                        setRows((rs) =>
                          rs.map((x, i) =>
                            i === idx
                              ? { ...x, duration: Number(e.target.value) as LessonDuration }
                              : x,
                          ),
                        )
                      }
                      className="border-filet focus:border-ink mt-1 block border bg-paper px-3 py-2 text-sm outline-none"
                    >
                      <option value={30}>30 min</option>
                      <option value={60}>1 h</option>
                    </select>
                  </label>
                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows((rs) => rs.filter((_, i) => i !== idx))}
                      className="text-meta hover:text-ink px-2 py-2 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={pending}
                  onClick={autoPropose}
                  className="border-ink hover:bg-ink hover:text-paper border px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                >
                  ⚡ Proposer des créneaux
                </button>
                <button
                  onClick={() =>
                    setRows((rs) => [...rs, { date: "", time: "", duration: r.durationMin }])
                  }
                  className="border-filet hover:border-ink border px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em]"
                >
                  + Ajouter un cours
                </button>
                <button
                  disabled={pending}
                  onClick={confirm}
                  className="bg-ink text-paper px-4 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                >
                  Confirmer {rows.length} cours
                </button>
                {r.phone && (
                  <a
                    href={waLink(
                      r.phone,
                      proposalWithSlotsMessage({
                        clientName: r.name,
                        teacherName: proposedName,
                        type: r.type,
                        slots: rows
                          .filter((row) => row.date && row.time)
                          .map((row) =>
                            format(new Date(`${row.date}T${row.time}`), "EEEE d MMMM 'à' HH'h'mm", {
                              locale: fr,
                            }),
                          ),
                      }),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10 border px-3 py-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.08em]"
                  >
                    📲 Envoyer la proposition WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statut */}
      <div className="mt-4 flex flex-wrap gap-2">
        {r.status !== "to_retreat" && (
          <button
            disabled={pending}
            onClick={() => act(() => setRequestStatus(r.id, "to_retreat"))}
            className="border-filet hover:border-ink border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
          >
            À relancer
          </button>
        )}
        {r.status !== "lost" && (
          <button
            disabled={pending}
            onClick={() => act(() => setRequestStatus(r.id, "lost"))}
            className="border-filet hover:border-ink border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
          >
            Marquer perdue
          </button>
        )}
        {r.status !== "new" && (
          <button
            disabled={pending}
            onClick={() => act(() => setRequestStatus(r.id, "new"))}
            className="border-filet hover:border-ink border px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
          >
            Remettre nouvelle
          </button>
        )}
      </div>
    </article>
  );
}

export function RequestsBoard({
  requests,
  teachers,
}: {
  requests: RequestCard[];
  teachers: { id: string; name: string }[];
}) {
  if (requests.length === 0) {
    return <EmptyState>Aucune demande pour l'instant. Les demandes du site et du Google Form arrivent ici.</EmptyState>;
  }
  return (
    <div className="space-y-10">
      {STATUS.map((col) => {
        const items = requests.filter((r) => r.status === col.key);
        if (items.length === 0) return null;
        return (
          <section key={col.key}>
            <h2 className="eyebrow mb-4 flex items-center gap-3">
              <span>{col.label}</span>
              <span className="text-meta">{items.length}</span>
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((r) => (
                <RequestItem key={r.id} r={r} teachers={teachers} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
