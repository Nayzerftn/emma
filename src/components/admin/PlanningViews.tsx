"use client";

import { useState } from "react";
import { DomicilePlanning, type PlanningLesson } from "@/components/admin/DomicilePlanning";
import { WeekPlanning } from "@/components/admin/WeekPlanning";

export function PlanningViews({
  lessons,
  teachers,
  clients,
}: {
  lessons: PlanningLesson[];
  teachers: { id: string; name: string }[];
  clients: { id: string; name: string }[];
}) {
  const [view, setView] = useState<"list" | "week">("list");

  return (
    <div className="space-y-6">
      <div className="inline-flex">
        {(["list", "week"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`border px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${
              view === v ? "bg-ink text-paper border-ink" : "border-filet hover:border-ink"
            } ${v === "list" ? "border-r-0" : ""}`}
          >
            {v === "list" ? "Liste" : "Semaine"}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <DomicilePlanning lessons={lessons} teachers={teachers} clients={clients} />
      ) : (
        <WeekPlanning lessons={lessons} teachers={teachers} />
      )}
    </div>
  );
}
