/**
 * Tâches quotidiennes (brief technique v2 §5) — déclenché par Vercel Cron.
 *  - Rappel J-1 aux clients (cours dans ~24h).
 *  - Alertes Eléa (digest) : demandes non traitées > 20h, propositions sans
 *    réponse client > 24h, demandes sans professeure disponible.
 * Protégé par CRON_SECRET.
 */
import { env, hasSupabaseAdmin } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEmail, lessonReminderEmail, adminAlertEmail } from "@/lib/email";
import { formatWhenParis } from "@/lib/platform/notify";

function authorized(request: Request): boolean {
  const auth = request.headers.get("authorization");
  if (env.cronSecret && auth === `Bearer ${env.cronSecret}`) return true;
  const token = new URL(request.url).searchParams.get("token");
  return !!env.cronSecret && token === env.cronSecret;
}

async function run(request: Request) {
  if (!env.cronSecret) return Response.json({ ok: false, error: "CRON_SECRET manquant." }, { status: 503 });
  if (!authorized(request)) return Response.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  if (!hasSupabaseAdmin) return Response.json({ ok: false, error: "DB non configurée." }, { status: 503 });

  const supabase = createSupabaseAdminClient();
  const now = Date.now();
  const iso = (ms: number) => new Date(now + ms).toISOString();
  const H = 3_600_000;

  // ── 1) Rappels J-1 (cours dans ~12h à ~36h, encore prévus) ──
  const { data: lessons } = await supabase
    .from("lessons")
    .select("starts_at,client_id,teacher_id")
    .eq("status", "scheduled")
    .gte("starts_at", iso(12 * H))
    .lte("starts_at", iso(36 * H));

  let reminded = 0;
  for (const l of lessons ?? []) {
    if (!l.client_id) continue;
    const { data: c } = await supabase.from("clients").select("name,email").eq("id", l.client_id).single();
    if (!c?.email) continue;
    const { data: t } = await supabase.from("team_members").select("name").eq("id", l.teacher_id).single();
    await sendEmail({
      to: c.email,
      subject: "Rappel — cours demain · Natation Côte Basque",
      html: lessonReminderEmail({
        clientName: c.name,
        when: formatWhenParis(l.starts_at),
        teacherName: t?.name ?? "votre professeure",
      }),
    }).catch((e) => console.error("[cron:rappel]", e));
    reminded++;
  }

  // ── 2) Alertes Eléa (digest) ──
  const alerts: string[] = [];

  // a) demandes non traitées depuis > 20h (SLA 24h)
  const { data: untreated } = await supabase
    .from("lesson_requests")
    .select("name")
    .eq("status", "new")
    .lte("created_at", iso(-20 * H));
  if (untreated?.length)
    alerts.push(
      `⏰ ${untreated.length} demande(s) non traitée(s) depuis +20h (SLA 24h) : ${untreated.map((r) => r.name).join(", ")}.`,
    );

  // b) propositions sans réponse client depuis > 24h
  const { data: silent } = await supabase
    .from("lesson_requests")
    .select("name")
    .eq("status", "proposed")
    .lte("status_changed_at", iso(-24 * H));
  if (silent?.length)
    alerts.push(
      `💬 ${silent.length} proposition(s) sans réponse client depuis +24h : ${silent.map((r) => r.name).join(", ")}.`,
    );

  // c) demandes sans professeure disponible (aucune prof active n'offre ce type)
  const { data: team } = await supabase
    .from("team_members")
    .select("services")
    .eq("is_active", true);
  const offered = new Set<string>();
  for (const t of team ?? []) for (const s of t.services) offered.add(s);
  const { data: news } = await supabase
    .from("lesson_requests")
    .select("name,type")
    .eq("status", "new");
  const noMatch = (news ?? []).filter((r) => !offered.has(r.type));
  if (noMatch.length)
    alerts.push(
      `🚫 ${noMatch.length} demande(s) sans professeure disponible (aucune active sur le type) : ${noMatch.map((r) => r.name).join(", ")}.`,
    );

  if (alerts.length && env.adminEmail) {
    await sendEmail({
      to: env.adminEmail,
      subject: "Alertes — demandes à traiter · Natation Côte Basque",
      html: adminAlertEmail("Demandes nécessitant votre attention", alerts),
    }).catch((e) => console.error("[cron:alertes]", e));
  }

  return Response.json({ ok: true, reminded, alerts: alerts.length });
}

export const GET = run;
export const POST = run;
