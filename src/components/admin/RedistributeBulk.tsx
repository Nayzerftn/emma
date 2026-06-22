"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reassignLessons } from "@/actions/platform";

export function RedistributeBulk({
  teachers,
}: {
  teachers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fromTeacherId: "",
    toTeacherId: "",
    from: "",
    to: "",
    markUnavailable: true,
  });

  const field =
    "border-filet focus:border-ink mt-1 block w-full border bg-paper px-3 py-2 text-sm outline-none";

  function submit() {
    if (!form.fromTeacherId || !form.toTeacherId || !form.from || !form.to) {
      toast.error("Professeure absente, remplaçante et période sont requis.");
      return;
    }
    if (form.fromTeacherId === form.toTeacherId) {
      toast.error("Choisissez deux professeures différentes.");
      return;
    }
    const fromISO = new Date(`${form.from}T00:00:00`).toISOString();
    const toISO = new Date(`${form.to}T23:59:59`).toISOString();
    startTransition(async () => {
      const res = await reassignLessons({
        fromTeacherId: form.fromTeacherId,
        toTeacherId: form.toTeacherId,
        fromISO,
        toISO,
        markUnavailable: form.markUnavailable,
      });
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) {
        router.refresh();
        setOpen(false);
      }
    });
  }

  return (
    <div className="border-filet border" data-testid="redistribute">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
      >
        <span className="font-display font-bold">Redistribution en masse</span>
        <span className="text-meta text-[0.7rem] font-semibold uppercase tracking-[0.08em]">
          {open ? "− Fermer" : "Prof absente ?"}
        </span>
      </button>

      {open && (
        <div className="border-filet space-y-4 border-t p-5">
          <p className="text-meta text-sm">
            Réaffecte tous les cours <strong className="text-ink">planifiés</strong> de la
            professeure absente vers une remplaçante (battement vérifié, paie recalculée au taux de
            la remplaçante). Les cours en conflit sont signalés pour arbitrage.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className="eyebrow text-meta">Professeure absente</span>
              <select
                value={form.fromTeacherId}
                onChange={(e) => setForm({ ...form, fromTeacherId: e.target.value })}
                className={field}
              >
                <option value="">—</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="eyebrow text-meta">Remplaçante</span>
              <select
                value={form.toTeacherId}
                onChange={(e) => setForm({ ...form, toTeacherId: e.target.value })}
                className={field}
              >
                <option value="">—</option>
                {teachers
                  .filter((t) => t.id !== form.fromTeacherId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span className="eyebrow text-meta">Du</span>
              <input
                type="date"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                className={field}
              />
            </label>
            <label>
              <span className="eyebrow text-meta">Au</span>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
                className={field}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.markUnavailable}
              onChange={(e) => setForm({ ...form, markUnavailable: e.target.checked })}
            />
            Marquer la professeure absente indisponible sur la période (exceptions au planning)
          </label>
          <button
            disabled={pending}
            onClick={submit}
            className="bg-ink text-paper px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
          >
            {pending ? "Redistribution…" : "Redistribuer les cours"}
          </button>
        </div>
      )}
    </div>
  );
}
