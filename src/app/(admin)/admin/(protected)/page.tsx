import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading, StatCard, EmptyState } from "@/components/admin/AdminShell";
import { formatEuros } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  failed: "Échouée",
  cancelled: "Annulée",
};

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const weekAhead = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  const [newLeads, paidBookings, upcoming, recent, newRequests, weekLessons, pendingInvoices] =
    await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "paid"),
      supabase
        .from("pool_slots")
        .select("id,starts_at,audience,level,booked_count,capacity")
        .gte("starts_at", nowIso)
        .order("starts_at", { ascending: true })
        .limit(5),
      supabase
        .from("bookings")
        .select("id,customer_name,amount_cents,status,created_at")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("lesson_requests")
        .select("*", { count: "exact", head: true })
        .in("status", ["new", "matching"]),
      supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("status", "scheduled")
        .gte("starts_at", nowIso)
        .lte("starts_at", weekAhead),
      supabase.from("invoices").select("total_cents").in("status", ["pending", "late"]),
    ]);

  const pendingTotal = (pendingInvoices.data ?? []).reduce((s, i) => s + i.total_cents, 0);

  return (
    <>
      <AdminHeading title="Tableau de bord" />

      <h2 className="eyebrow text-meta mb-3">Plateforme domicile & océan</h2>
      <div className="grid grid-cols-2 gap-px md:grid-cols-4">
        <StatCard label="Demandes à traiter" value={newRequests.count ?? 0} />
        <StatCard label="Cours cette semaine" value={weekLessons.count ?? 0} />
        <StatCard label="Factures en attente" value={pendingInvoices.data?.length ?? 0} />
        <StatCard label="Montant en attente" value={formatEuros(pendingTotal)} />
      </div>

      <h2 className="eyebrow text-meta mt-10 mb-3">Bassin privé</h2>
      <div className="grid grid-cols-2 gap-px md:grid-cols-4">
        <StatCard label="Nouveaux leads" value={newLeads.count ?? 0} />
        <StatCard label="Réservations payées" value={paidBookings.count ?? 0} />
        <StatCard label="Prochains créneaux" value={upcoming.data?.length ?? 0} />
        <StatCard
          label="Dernier paiement"
          value={recent.data?.find((b) => b.status === "paid") ? "✓" : "—"}
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="eyebrow mb-4">Prochains créneaux</h2>
          {upcoming.data && upcoming.data.length > 0 ? (
            <ul className="border-filet border-t">
              {upcoming.data.map((s) => (
                <li key={s.id} className="border-filet flex justify-between border-b py-3">
                  <span className="capitalize">
                    {format(new Date(s.starts_at), "EEE d MMM · HH'h'mm", { locale: fr })}
                  </span>
                  <span className="text-meta text-sm">
                    {s.audience === "enfant" ? `Enfant niv. ${s.level ?? "-"}` : "Adulte"} ·{" "}
                    {s.booked_count}/{s.capacity}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>Aucun créneau à venir — créez-en dans Planning.</EmptyState>
          )}
        </section>

        <section>
          <h2 className="eyebrow mb-4">Dernières réservations</h2>
          {recent.data && recent.data.length > 0 ? (
            <ul className="border-filet border-t">
              {recent.data.map((b) => (
                <li key={b.id} className="border-filet flex justify-between border-b py-3">
                  <span>{b.customer_name}</span>
                  <span className="text-meta text-sm">
                    {formatEuros(b.amount_cents)} · {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>Aucune réservation pour l'instant.</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
