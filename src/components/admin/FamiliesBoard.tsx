"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  generateInvoice,
  setInvoiceStatus,
  sendInvoiceReminder,
  deleteInvoice,
} from "@/actions/platform";
import { EmptyState } from "@/components/admin/AdminShell";
import { waLink, reminderMessage } from "@/lib/platform/notify";
import { formatEuros } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { InvoiceStatus, InvoiceLine, LessonStatus, LessonDuration } from "@/lib/supabase/types";

type FamilyInvoice = {
  id: string;
  periodLabel: string | null;
  totalCents: number;
  status: InvoiceStatus;
  stripeUrl: string | null;
  pdfUrl: string | null;
  lines: InvoiceLine[];
};

type HistoryItem = {
  startsAt: string;
  teacher: string;
  duration: LessonDuration;
  status: LessonStatus;
  invoiced: boolean;
};

export type FamilyCard = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  chargeableCount: number;
  dueCents: number;
  history: HistoryItem[];
  invoices: FamilyInvoice[];
};

const LESSON_STATUS: Record<LessonStatus, string> = {
  scheduled: "Prévu",
  done: "Effectué",
  cancelled: "Annulé",
  cancelled_late: "Annulé < 48h (dû)",
};

const INV_STATUS: Record<InvoiceStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  late: "En retard",
};

function monthLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
function monthBounds(): { fromISO: string; toISO: string } {
  const d = new Date();
  const from = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}

function FamilyItem({ f }: { f: FamilyCard }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState(monthLabel());
  const [scope, setScope] = useState<"all" | "month">("all");
  const [histOpen, setHistOpen] = useState(false);

  function act(fn: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const res = await fn();
      toast[res.ok ? "success" : "error"](res.message ?? "");
      if (res.ok) router.refresh();
    });
  }

  function genInvoice() {
    const bounds = scope === "month" ? monthBounds() : { fromISO: null, toISO: null };
    act(() =>
      generateInvoice({
        clientId: f.id,
        periodLabel: label || monthLabel(),
        fromISO: bounds.fromISO,
        toISO: bounds.toISO,
      }),
    );
  }

  const field = "border-filet focus:border-ink border bg-paper px-3 py-2 text-sm outline-none";

  return (
    <article className="border-filet border p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold">{f.name}</p>
          <p className="text-meta text-sm">
            {[f.email, f.phone].filter(Boolean).join(" · ") || "Pas de contact"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-black">{formatEuros(f.dueCents)}</p>
          <p className="eyebrow text-meta">{f.chargeableCount} cours facturables</p>
        </div>
      </div>

      <div className="border-filet mt-4 flex flex-wrap items-end gap-2 border-t pt-4">
        <label>
          <span className="eyebrow text-meta">Libellé période</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={`${field} mt-1 block`}
          />
        </label>
        <label>
          <span className="eyebrow text-meta">Portée</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as "all" | "month")}
            className={`${field} mt-1 block`}
          >
            <option value="all">Tous les cours non facturés</option>
            <option value="month">Ce mois-ci</option>
          </select>
        </label>
        <button
          disabled={pending}
          onClick={genInvoice}
          className="bg-ink text-paper px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] disabled:opacity-50"
        >
          Générer la facture
        </button>
      </div>

      {f.invoices.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="eyebrow text-meta">Factures</p>
          {f.invoices.map((inv) => (
            <div key={inv.id} className="border-filet border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold">{formatEuros(inv.totalCents)}</span>
                  <span className="text-meta text-sm"> · {inv.periodLabel ?? "—"}</span>
                </div>
                <span
                  className={`border px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${
                    inv.status === "paid" ? "border-ink bg-ink text-paper" : "border-filet text-meta"
                  }`}
                >
                  {INV_STATUS[inv.status]}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {inv.stripeUrl && (
                  <a
                    href={inv.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.72rem] underline-draw"
                  >
                    Lien de paiement
                  </a>
                )}
                {inv.pdfUrl && (
                  <a
                    href={inv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.72rem] underline-draw"
                  >
                    PDF
                  </a>
                )}
                {f.phone && inv.status !== "paid" && (
                  <a
                    href={waLink(
                      f.phone,
                      reminderMessage({
                        clientName: f.name,
                        total: formatEuros(inv.totalCents),
                        url: inv.stripeUrl,
                      }),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.72rem] underline-draw"
                  >
                    Relance WhatsApp
                  </a>
                )}
                {f.email && inv.status !== "paid" && (
                  <button
                    disabled={pending}
                    onClick={() => act(() => sendInvoiceReminder(inv.id))}
                    className="text-[0.72rem] underline-draw disabled:opacity-50"
                  >
                    Relance email
                  </button>
                )}
                {inv.status !== "paid" && (
                  <button
                    disabled={pending}
                    onClick={() => act(() => setInvoiceStatus(inv.id, "paid"))}
                    className="text-[0.72rem] underline-draw disabled:opacity-50"
                  >
                    Marquer payée
                  </button>
                )}
                <button
                  disabled={pending}
                  onClick={() => act(() => deleteInvoice(inv.id))}
                  className="text-meta hover:text-ink ml-auto text-[0.72rem] disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {f.history.length > 0 && (
        <div className="border-filet mt-4 border-t pt-3">
          <button
            onClick={() => setHistOpen((v) => !v)}
            className="eyebrow text-ink hover:opacity-60"
          >
            {histOpen ? "− Masquer l'historique" : `+ Historique (${f.history.length} cours)`}
          </button>
          {histOpen && (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {f.history.map((h, i) => (
                  <tr key={i} className="border-filet border-b last:border-0">
                    <td className="py-2 capitalize">
                      {format(new Date(h.startsAt), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="text-meta py-2">{h.teacher}</td>
                    <td className="py-2">{h.duration === 60 ? "1 h" : "30 min"}</td>
                    <td className="py-2 text-right">
                      {LESSON_STATUS[h.status]}
                      {h.invoiced ? " · facturé" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </article>
  );
}

export function FamiliesBoard({ families }: { families: FamilyCard[] }) {
  if (families.length === 0) {
    return (
      <EmptyState>
        Aucune famille pour l'instant. Les clients sont créés automatiquement à la confirmation des
        demandes.
      </EmptyState>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {families.map((f) => (
        <FamilyItem key={f.id} f={f} />
      ))}
    </div>
  );
}
