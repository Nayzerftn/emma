"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSlot, deleteSlot, toggleSlotOpen } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, NativeSelect } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/AdminShell";

type Teacher = { id: string; name: string };
export type PlanningSlot = {
  id: string;
  when: string;
  audience: "enfant" | "adulte";
  level: number | null;
  teacher: string | null;
  capacity: number;
  booked_count: number;
  price: string;
  is_open: boolean;
};

export function PlanningManager({
  teachers,
  slots,
}: {
  teachers: Teacher[];
  slots: PlanningSlot[];
}) {
  const router = useRouter();
  const [audience, setAudience] = useState<"enfant" | "adulte">("enfant");
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const startLocal = String(fd.get("start"));
    if (!startLocal) {
      toast.error("Indiquez une date de début.");
      return;
    }
    const duration = Number(fd.get("duration")) || 45;
    const capacity = Number(fd.get("capacity")) || (audience === "enfant" ? 3 : 1);
    const priceEuros = Number(fd.get("price")) || 0;
    const level = audience === "enfant" ? Number(fd.get("level")) || 1 : null;
    const teacherId = String(fd.get("teacher") || "") || null;
    const repeat = fd.get("repeat") === "on" ? 4 : 1;
    const form = e.currentTarget;

    startTransition(async () => {
      let okCount = 0;
      for (let i = 0; i < repeat; i++) {
        const start = new Date(startLocal);
        start.setDate(start.getDate() + i * 7);
        const end = new Date(start.getTime() + duration * 60_000);
        const res = await createSlot({
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          audience,
          level,
          teacherId,
          capacity,
          priceCents: Math.round(priceEuros * 100),
          isOpen: true,
        });
        if (res.ok) okCount++;
        else toast.error(res.message ?? "Erreur");
      }
      if (okCount > 0) {
        toast.success(`${okCount} créneau${okCount > 1 ? "x" : ""} créé${okCount > 1 ? "s" : ""}.`);
        form.reset();
        refresh();
      }
    });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[360px_1fr]">
      <section>
        <h2 className="eyebrow mb-4">Nouveau créneau</h2>
        <form onSubmit={onCreate} className="grid gap-4">
          <Field label="Pour qui" htmlFor="audience">
            <NativeSelect
              id="audience"
              name="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as "enfant" | "adulte")}
            >
              <option value="enfant">Enfant — mini-groupe</option>
              <option value="adulte">Adulte — individuel</option>
            </NativeSelect>
          </Field>
          {audience === "enfant" && (
            <Field label="Niveau" htmlFor="level">
              <NativeSelect id="level" name="level" defaultValue="1">
                <option value="1">Niveau 1 — grands débutants</option>
                <option value="2">Niveau 2 — en progression</option>
                <option value="3">Niveau 3 — perfectionnement</option>
              </NativeSelect>
            </Field>
          )}
          <Field label="Début" htmlFor="start" required>
            <Input id="start" name="start" type="datetime-local" required />
          </Field>
          <Field label="Durée (minutes)" htmlFor="duration">
            <Input id="duration" name="duration" type="number" defaultValue={45} min={15} />
          </Field>
          <Field label="Professeure" htmlFor="teacher">
            <NativeSelect id="teacher" name="teacher" defaultValue="">
              <option value="">— Non assignée —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Capacité" htmlFor="capacity">
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                defaultValue={audience === "enfant" ? 3 : 1}
              />
            </Field>
            <Field label="Prix (€)" htmlFor="price">
              <Input id="price" name="price" type="number" min={0} step="0.5" defaultValue={45} />
            </Field>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="repeat" className="size-4" />
            Répéter sur les 4 week-ends suivants
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Enregistrement…" : "Créer le créneau"}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="eyebrow mb-4">Créneaux à venir</h2>
        {slots.length === 0 ? (
          <EmptyState>Aucun créneau. Créez-en un avec le formulaire.</EmptyState>
        ) : (
          <ul className="border-filet border-t">
            {slots.map((s) => (
              <li
                key={s.id}
                className="border-filet flex flex-wrap items-center justify-between gap-3 border-b py-4"
              >
                <div>
                  <p className="font-display font-bold capitalize">{s.when}</p>
                  <p className="text-meta text-sm">
                    {s.audience === "enfant" ? `Enfant niv. ${s.level ?? "-"}` : "Adulte"}
                    {s.teacher ? ` · ${s.teacher}` : ""} · {s.booked_count}/{s.capacity} ·{" "}
                    {s.price} · {s.is_open ? "ouvert" : "fermé"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await toggleSlotOpen(s.id, !s.is_open);
                        toast[res.ok ? "success" : "error"](res.message ?? "");
                        if (res.ok) refresh();
                      })
                    }
                  >
                    {s.is_open ? "Fermer" : "Ouvrir"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deleteSlot(s.id);
                        toast[res.ok ? "success" : "error"](res.message ?? "");
                        if (res.ok) refresh();
                      })
                    }
                  >
                    Supprimer
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
