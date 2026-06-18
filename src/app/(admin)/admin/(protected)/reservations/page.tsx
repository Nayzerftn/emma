import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { ReservationsTable, type BookingRow } from "@/components/admin/ReservationsTable";
import { formatEuros } from "@/lib/utils";

export default async function AdminReservations() {
  const supabase = await createSupabaseServerClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  const slotIds = [...new Set((bookings ?? []).map((b) => b.slot_id))];
  const slotMap = new Map<string, string>();
  if (slotIds.length > 0) {
    const { data: slots } = await supabase
      .from("pool_slots")
      .select("id,starts_at")
      .in("id", slotIds);
    for (const s of slots ?? []) {
      slotMap.set(s.id, format(new Date(s.starts_at), "EEE d MMM yyyy · HH'h'mm", { locale: fr }));
    }
  }

  const rows: BookingRow[] = (bookings ?? []).map((b) => ({
    id: b.id,
    customer_name: b.customer_name,
    customer_email: b.customer_email,
    customer_phone: b.customer_phone,
    participant_name: b.participant_name,
    amount: formatEuros(b.amount_cents),
    status: b.status,
    when: slotMap.get(b.slot_id) ?? "—",
  }));

  return (
    <>
      <AdminHeading title="Réservations" description="Bassin privé — paiements Stripe." />
      <ReservationsTable rows={rows} />
    </>
  );
}
