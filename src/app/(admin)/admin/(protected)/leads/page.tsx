import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeading } from "@/components/admin/AdminShell";
import { LeadsBoard, type LeadCard } from "@/components/admin/LeadsBoard";

export default async function AdminLeads() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leads")
    .select("id,type,name,email,phone,city,message,status")
    .order("created_at", { ascending: false })
    .limit(400);

  const leads: LeadCard[] = (data ?? []).map((l) => ({
    id: l.id,
    type: l.type,
    name: l.name,
    email: l.email,
    phone: l.phone,
    city: l.city,
    message: l.message,
    status: l.status,
  }));

  return (
    <>
      <AdminHeading
        title="Leads"
        description="Cours à domicile & initiation océan — new → contacté → converti / perdu."
      />
      <LeadsBoard leads={leads} />
    </>
  );
}
