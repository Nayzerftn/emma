"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveTeacherSettings } from "@/actions/platform";
import { ZONES } from "@/lib/platform/zones";
import type { Service } from "@/lib/supabase/types";

type Availability = {
  base: { weekday: number; parts: string[] }[];
  exceptions: { date: string; off?: boolean }[];
};

export type TeacherCard = {
  id: string;
  name: string;
  services: Service[];
  isActive: boolean;
  zones: string[];
  maxPerDay: number;
  payout30Cents: number;
  payout60Cents: number;
  availability: Availability;
};

const DAYS = [
  { wd: 1, label: "Lundi" },
  { wd: 2, label: "Mardi" },
  { wd: 3, label: "Mercredi" },
  { wd: 4, label: "Jeudi" },
  { wd: 5, label: "Vendredi" },
  { wd: 6, label: "Samedi" },
  { wd: 7, label: "Dimanche" },
];

function TeacherItem({ t }: { t: TeacherCard }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [zones, setZones] = useState<string[]>(t.zones);
  const [maxPerDay, setMaxPerDay] = useState(t.maxPerDay);
  const [payout30, setPayout30] = useState(t.payout30Cents / 100);
  const [payout60, setPayout60] = useState(t.payout60Cents / 100);
  const [days, setDays] = useState<Record<number, { on: boolean; text: string }>>(() => {
    const init: Record<number, { on: boolean; text: string }> = {};
    for (const d of DAYS) {
      const found = t.availability.base.find((b) => b.weekday === d.wd);
      init[d.wd] = { on: !!found, text: found?.parts.join(", ") ?? "" };
    }
    return init;
  });

  function toggleZone(z: string) {
    setZones((cur) => (cur.includes(z) ? cur.filter((x) => x !== z) : [...cur, z].sort()));
  }

  function save() {
    const base = DAYS.filter((d) => days[d.wd].on).map((d) => ({
      weekday: d.wd,
      parts: days[d.wd].text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    }));
    startTransition(async () => {
      const res = await saveTeacherSettings({
        teacherId: t.id,
        zones,
        maxPerDay,
        payout30Cents: Math.round(payout30 * 100),
        payout60Cents: Math.round(payout60 * 100),
        availability: { base, exceptions: t.availability.exceptions ?? [] },
      });
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  const field = "border-filet focus:border-ink border bg-paper px-3 py-2 text-sm outline-none";

  return (
    <article className="border-filet border p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-bold">{t.name}</p>
        {!t.isActive && <span className="text-meta text-xs">inactive</span>}
      </div>
      <p className="eyebrow text-meta mt-1">{t.services.join(" · ")}</p>

      {/* Secteurs */}
      <div className="mt-4">
        <p className="eyebrow text-meta mb-2">Secteurs couverts</p>
        <div className="flex flex-wrap gap-2">
          {ZONES.map((z) => (
            <button
              key={z}
              onClick={() => toggleZone(z)}
              className={`h-9 w-9 border text-sm font-semibold ${
                zones.includes(z) ? "bg-ink text-paper border-ink" : "border-filet hover:border-ink"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      {/* Tarifs paie + max/jour */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <label>
          <span className="eyebrow text-meta">Paie 30 min (€)</span>
          <input
            type="number"
            min={0}
            value={payout30}
            onChange={(e) => setPayout30(Number(e.target.value))}
            className={`${field} mt-1 block w-full`}
          />
        </label>
        <label>
          <span className="eyebrow text-meta">Paie 1 h (€)</span>
          <input
            type="number"
            min={0}
            value={payout60}
            onChange={(e) => setPayout60(Number(e.target.value))}
            className={`${field} mt-1 block w-full`}
          />
        </label>
        <label>
          <span className="eyebrow text-meta">Max / jour</span>
          <input
            type="number"
            min={0}
            value={maxPerDay}
            onChange={(e) => setMaxPerDay(Number(e.target.value))}
            className={`${field} mt-1 block w-full`}
          />
        </label>
      </div>

      {/* Disponibilités */}
      <div className="mt-4">
        <p className="eyebrow text-meta mb-2">Disponibilités hebdomadaires</p>
        <div className="space-y-2">
          {DAYS.map((d) => (
            <div key={d.wd} className="flex items-center gap-3">
              <label className="flex w-28 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={days[d.wd].on}
                  onChange={(e) =>
                    setDays((cur) => ({ ...cur, [d.wd]: { ...cur[d.wd], on: e.target.checked } }))
                  }
                />
                {d.label}
              </label>
              <input
                placeholder="ex. matin, 17h-19h"
                value={days[d.wd].text}
                disabled={!days[d.wd].on}
                onChange={(e) =>
                  setDays((cur) => ({ ...cur, [d.wd]: { ...cur[d.wd], text: e.target.value } }))
                }
                className={`${field} grow disabled:opacity-40`}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        disabled={pending}
        onClick={save}
        className="bg-ink text-paper mt-5 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
      >
        Enregistrer
      </button>
    </article>
  );
}

export function TeachersSettings({ teachers }: { teachers: TeacherCard[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {teachers.map((t) => (
        <TeacherItem key={t.id} t={t} />
      ))}
    </div>
  );
}
