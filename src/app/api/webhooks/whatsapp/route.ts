/**
 * Webhook WhatsApp Cloud API (Meta) — réception des réponses client.
 *  GET  : vérification du webhook (challenge Meta).
 *  POST : message entrant → OUI / NON / MODIFIER → met à jour la demande
 *         + alerte Eléa. Activé seulement si WHATSAPP_VERIFY_TOKEN est défini.
 */
import { env, hasSupabaseAdmin } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail, adminAlertEmail } from "@/lib/email";
import { waFromPhone } from "@/lib/platform/notify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && env.whatsappVerifyToken && token === env.whatsappVerifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  if (!hasSupabaseAdmin) return Response.json({ ok: true });

  let payload: { entry?: { changes?: { value?: { messages?: { from?: string; text?: { body?: string } }[] } }[] }[] };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: true });
  }

  const msg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const from = msg?.from;
  const body = (msg?.text?.body ?? "").trim().toUpperCase();
  if (!from || !body) return Response.json({ ok: true });

  const supabase = createSupabaseAdminClient();

  // Retrouver la demande "proposée" la plus récente pour ce numéro.
  const { data: requests } = await supabase
    .from("lesson_requests")
    .select("id,name,phone,status")
    .eq("status", "proposed")
    .order("status_changed_at", { ascending: false })
    .limit(50);
  const req = (requests ?? []).find((r) => r.phone && waFromPhone(r.phone) === waFromPhone(from));
  if (!req) return Response.json({ ok: true });

  let alert: string;
  if (/\bOUI\b|\bOK\b|\bYES\b/.test(body)) {
    // Client OK → reste "proposed", Eléa planifie les cours.
    alert = `✅ ${req.name} a répondu OUI à la proposition — à planifier (Demandes).`;
  } else if (/\bNON\b|\bNO\b/.test(body)) {
    await supabase
      .from("lesson_requests")
      .update({ status: "to_retreat", status_changed_at: new Date().toISOString() })
      .eq("id", req.id);
    alert = `🔁 ${req.name} a répondu NON — demande remise « à relancer ».`;
  } else if (/MODIF/.test(body)) {
    await supabase
      .from("lesson_requests")
      .update({ status: "to_retreat", status_changed_at: new Date().toISOString() })
      .eq("id", req.id);
    alert = `✏️ ${req.name} souhaite MODIFIER — demande remise « à relancer ».`;
  } else {
    alert = `💬 ${req.name} a répondu : « ${msg?.text?.body} »`;
  }

  if (env.adminEmail) {
    await sendEmail({
      to: env.adminEmail,
      subject: "Réponse WhatsApp client · Natation Côte Basque",
      html: adminAlertEmail("Réponse client", [alert]),
    }).catch((e) => console.error("[wa:webhook:email]", e));
  }
  return Response.json({ ok: true });
}
