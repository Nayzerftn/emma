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
  const nowIso = new Date().toISOString();

  const [newLeads, paidBookings, upcoming, recent] = await Promise.all([
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
  ]);

  return (
    <>
      <AdminHeading title="Tableau de bord" />

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
