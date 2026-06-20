import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { FamiliesBoard, type FamilyCard } from "@/components/admin/FamiliesBoard";
import { familyTotalCents, isChargeable } from "@/lib/platform/billing";
import type { InvoiceRow, LessonDuration, LessonStatus } from "@/lib/supabase/types";

export default async function AdminFamilles() {
  const supabase = await createSupabaseServerClient();

  const [{ data: clients }, { data: lessons }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("id,name,email,phone").order("name"),
    supabase.from("lessons").select("client_id,duration_min,status,invoice_id").limit(5000),
    supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  // Seuls les cours NON facturés (invoice_id null) comptent dans le « dû ».
  const lessonsByClient = new Map<string, { duration_min: LessonDuration; status: LessonStatus }[]>();
  for (const l of lessons ?? []) {
    if (!l.client_id || l.invoice_id) continue;
    lessonsByClient.set(l.client_id, [
      ...(lessonsByClient.get(l.client_id) ?? []),
      { duration_min: l.duration_min, status: l.status },
    ]);
  }
  const invoicesByClient = new Map<string, InvoiceRow[]>();
  for (const inv of invoices ?? []) {
    if (!inv.client_id) continue;
    invoicesByClient.set(inv.client_id, [...(invoicesByClient.get(inv.client_id) ?? []), inv]);
  }

  const families: FamilyCard[] = (clients ?? []).map((c) => {
    const ls = lessonsByClient.get(c.id) ?? [];
    const chargeable = ls.filter((l) => isChargeable(l.status));
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      chargeableCount: chargeable.length,
      dueCents: familyTotalCents(ls),
      invoices: (invoicesByClient.get(c.id) ?? []).map((inv) => ({
        id: inv.id,
        periodLabel: inv.period_label,
        totalCents: inv.total_cents,
        status: inv.status,
        stripeUrl: inv.stripe_url,
        lines: inv.lines,
      })),
    };
  });

  return (
    <>
      <AdminHeading
        title="Familles & facturation"
        description="Facturation regroupée par famille, paie professeures, paiement Stripe et relances."
      />
      <FamiliesBoard families={families} />
    </>
  );
}
