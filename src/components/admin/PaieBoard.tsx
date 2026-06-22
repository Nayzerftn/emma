"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/admin/AdminShell";
import { formatEuros } from "@/lib/utils";

export type TeacherPay = {
  teacherId: string;
  name: string;
  rate30: number;
  rate60: number;
  families: { family: string; count30: number; count60: number; amountCents: number }[];
  totalCents: number;
  totalCourses: number;
};

export function PaieBoard({ month, rows }: { month: string; rows: TeacherPay[] }) {
  const router = useRouter();
  const grandTotal = rows.reduce((s, r) => s + r.totalCents, 0);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3">
          <span className="eyebrow text-meta">Mois</span>
          <input
            type="month"
            defaultValue={month}
            onChange={(e) => router.push(`/admin/paie?month=${e.target.value}`)}
            className="border-filet focus:border-ink border bg-paper px-3 py-2 text-sm outline-none"
          />
        </label>
        <div className="text-right">
          <p className="font-display text-2xl font-black">{formatEuros(grandTotal)}</p>
          <p className="eyebrow text-meta">Total à reverser ce mois</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState>Aucun cours effectué sur ce mois.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((r) => (
            <article key={r.teacherId} className="border-filet border p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-lg font-bold">{r.name}</p>
                <p className="font-display text-xl font-black">{formatEuros(r.totalCents)}</p>
              </div>
              <p className="eyebrow text-meta mt-1">
                {r.totalCourses} cours · {formatEuros(r.rate30)}/30min · {formatEuros(r.rate60)}/1h
              </p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-meta eyebrow border-filet border-b text-left">
                    <th className="pb-2 font-normal">Famille</th>
                    <th className="pb-2 text-center font-normal">30min</th>
                    <th className="pb-2 text-center font-normal">1h</th>
                    <th className="pb-2 text-right font-normal">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {r.families.map((f) => (
                    <tr key={f.family} className="border-filet border-b last:border-0">
                      <td className="py-2">{f.family}</td>
                      <td className="py-2 text-center">{f.count30 || "—"}</td>
                      <td className="py-2 text-center">{f.count60 || "—"}</td>
                      <td className="py-2 text-right font-medium">{formatEuros(f.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
