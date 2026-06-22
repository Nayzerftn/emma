/**
 * Relances automatiques des factures impayées (brief technique v2 §4 — relance J+3).
 * Déclenché par Vercel Cron (voir vercel.json). Protégé par CRON_SECRET.
 *
 * - Facture « pending » créée il y a ≥ 3 jours → email de relance.
 * - Facture « pending » créée il y a ≥ 7 jours → passe en « late ».
 */
import { env, hasSupabaseAdmin } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail, invoiceReminderEmail, adminAlertEmail } from "@/lib/email";
import { formatEuros } from "@/lib/utils";

function authorized(request: Request): boolean {
  // Vercel Cron envoie « Authorization: Bearer <CRON_SECRET> ».
  const auth = request.headers.get("authorization");
  if (env.cronSecret && auth === `Bearer ${env.cronSecret}`) return true;
  // Repli : ?token= pour déclenchement manuel.
  const token = new URL(request.url).searchParams.get("token");
  return !!env.cronSecret && token === env.cronSecret;
}

async function run(request: Request) {
  if (!env.cronSecret) {
    return Response.json({ ok: false, error: "CRON_SECRET manquant." }, { status: 503 });
  }
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }
  if (!hasSupabaseAdmin) {
    return Response.json({ ok: false, error: "DB non configurée." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  const now = Date.now();
  const threeDaysAgo = new Date(now - 3 * 86_400_000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 86_400_000).toISOString();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id,client_id,client_name,total_cents,stripe_url,status,created_at")
    .eq("status", "pending")
    .lte("created_at", threeDaysAgo);

  let reminded = 0;
  const nowLate: string[] = [];
  for (const inv of invoices ?? []) {
    let email: string | null = null;
    if (inv.client_id) {
      const { data: c } = await supabase
        .from("clients")
        .select("email")
        .eq("id", inv.client_id)
        .single();
      email = c?.email ?? null;
    }
    if (email) {
      await sendEmail({
        to: email,
        subject: "Rappel — facture Natation Côte Basque",
        html: invoiceReminderEmail({
          clientName: inv.client_name,
          total: formatEuros(inv.total_cents),
          url: inv.stripe_url,
        }),
      }).catch((e) => console.error("[cron:relance:email]", e));
      reminded++;
    }
    if (inv.created_at <= sevenDaysAgo) {
      await supabase.from("invoices").update({ status: "late" }).eq("id", inv.id);
      nowLate.push(`${inv.client_name} (${formatEuros(inv.total_cents)})`);
    }
  }

  // Alerte Eléa : paiements en retard (J+7).
  if (nowLate.length && env.adminEmail) {
    await sendEmail({
      to: env.adminEmail,
      subject: "⚠ Paiements en retard (J+7) · Natation Côte Basque",
      html: adminAlertEmail("Factures passées en retard", [
        `${nowLate.length} facture(s) impayée(s) depuis +7 jours :`,
        nowLate.join(" · "),
      ]),
    }).catch((e) => console.error("[cron:relance:alert]", e));
  }

  return Response.json({ ok: true, reminded, markedLate: nowLate.length, scanned: invoices?.length ?? 0 });
}

export const GET = run;
export const POST = run;
