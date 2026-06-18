"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadStatus } from "@/actions/admin";
import { EmptyState } from "@/components/admin/AdminShell";
import type { LeadStatus } from "@/lib/supabase/types";

export type LeadCard = {
  id: string;
  type: "domicile" | "ocean";
  name: string;
  email: string;
  phone: string;
  city: string | null;
  message: string | null;
  status: LeadStatus;
};

const COLUMNS: { key: LeadStatus; label: string }[] = [
  { key: "new", label: "Nouveaux" },
  { key: "contacted", label: "Contactés" },
  { key: "converted", label: "Convertis" },
  { key: "lost", label: "Perdus" },
];

function waFromPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "33" + digits.slice(1);
  return `https://wa.me/${digits}`;
}

export function LeadsBoard({ leads }: { leads: LeadCard[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(id: string, status: LeadStatus) {
    startTransition(async () => {
      const res = await updateLeadStatus(id, status);
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const items = leads.filter((l) => l.status === col.key);
        return (
          <div key={col.key}>
            <h2 className="eyebrow mb-4 flex items-center justify-between">
              <span>{col.label}</span>
              <span className="text-meta">{items.length}</span>
            </h2>
            <div className="space-y-3">
              {items.length === 0 ? (
                <EmptyState>Aucun lead ici pour l'instant.</EmptyState>
              ) : (
                items.map((l) => (
                  <article key={l.id} className="border-filet border p-4">
                    <p className="eyebrow text-meta">
                      {l.type === "ocean" ? "Initiation océan" : "À domicile"}
                    </p>
                    <p className="font-display mt-1 font-bold">{l.name}</p>
                    <p className="text-meta text-sm">
                      {l.city ? `${l.city} · ` : ""}
                      {l.phone}
                    </p>
                    {l.message && (
                      <p className="text-meta mt-2 line-clamp-3 text-sm">{l.message}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      <a href={`mailto:${l.email}`} className="text-[0.72rem] underline-draw">
                        Email
                      </a>
                      <a
                        href={waFromPhone(l.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[0.72rem] underline-draw"
                      >
                        WhatsApp
                      </a>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {COLUMNS.filter((c) => c.key !== l.status).map((c) => (
                        <button
                          key={c.key}
                          disabled={pending}
                          onClick={() => move(l.id, c.key)}
                          className="border-filet hover:border-ink border px-2 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
