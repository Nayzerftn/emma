"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setBookingStatus } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/AdminShell";
import type { BookingStatus } from "@/lib/supabase/types";

export type BookingRow = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  participant_name: string;
  amount: string;
  status: BookingStatus;
  when: string;
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échouée",
  cancelled: "Annulée",
};

const FILTERS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "paid", label: "Payées" },
  { key: "pending", label: "En attente" },
  { key: "cancelled", label: "Annulées" },
  { key: "failed", label: "Échouées" },
];

export function ReservationsTable({ rows }: { rows: BookingRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<BookingStatus | "all">("all");
  const [pending, startTransition] = useTransition();

  const shown = rows.filter((r) => filter === "all" || r.status === filter);

  function cancel(id: string) {
    startTransition(async () => {
      const res = await setBookingStatus(id, "cancelled");
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div>
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] ${
              filter === f.key ? "border-ink bg-ink text-paper" : "border-filet text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState>Aucune réservation pour ce filtre.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-filet text-meta border-b text-left">
                <th className="py-3 pr-4 font-semibold uppercase tracking-[0.1em]">Créneau</th>
                <th className="py-3 pr-4 font-semibold uppercase tracking-[0.1em]">Client</th>
                <th className="py-3 pr-4 font-semibold uppercase tracking-[0.1em]">Montant</th>
                <th className="py-3 pr-4 font-semibold uppercase tracking-[0.1em]">Statut</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-filet border-b align-top">
                  <td className="py-3 pr-4 capitalize">{r.when}</td>
                  <td className="py-3 pr-4">
                    <div className="font-medium">{r.customer_name}</div>
                    <div className="text-meta">{r.customer_email}</div>
                    <div className="text-meta">{r.customer_phone}</div>
                    <div className="text-meta">Participant : {r.participant_name}</div>
                  </td>
                  <td className="py-3 pr-4">{r.amount}</td>
                  <td className="py-3 pr-4">{STATUS_LABEL[r.status]}</td>
                  <td className="py-3">
                    {r.status !== "cancelled" && r.status !== "failed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => cancel(r.id)}
                      >
                        Annuler
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
