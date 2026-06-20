/**
 * Ingestion Google Form (brief technique v2 §1).
 * Le Google Form d'Eléa POST chaque nouvelle réponse ici via un Apps Script
 * (voir docs/INTAKE-GOOGLE-FORM.md). Authentifié par un jeton partagé.
 *
 * Runtime Node (accès service-role Supabase côté serveur uniquement).
 */
import { env, hasIntakeToken } from "@/lib/env";
import { normalizeIntake, ingestLessonRequest } from "@/lib/platform/intake";
import { sendEmail } from "@/lib/email";

function authorized(request: Request): boolean {
  const header = request.headers.get("x-intake-token");
  const url = new URL(request.url);
  const query = url.searchParams.get("token");
  return (!!header && header === env.intakeToken) || (!!query && query === env.intakeToken);
}

export async function POST(request: Request) {
  if (!hasIntakeToken) {
    return Response.json(
      { ok: false, error: "Ingestion non configurée (INTAKE_TOKEN manquant)." },
      { status: 503 },
    );
  }
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Non autorisé." }, { status: 401 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "JSON invalide." }, { status: 400 });
  }
  // Apps Script peut envelopper les réponses sous { data: {...} } ou { answers: {...} }.
  if (raw && typeof raw === "object") {
    if (raw.data && typeof raw.data === "object") raw = raw.data as Record<string, unknown>;
    else if (raw.answers && typeof raw.answers === "object")
      raw = raw.answers as Record<string, unknown>;
  }

  const payload = normalizeIntake(raw);
  const result = await ingestLessonRequest(payload, "google_form");
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error ?? "Échec." }, { status: 500 });
  }

  if (env.adminEmail) {
    const label = payload.type === "ocean" ? "Initiation océan" : "Cours à domicile";
    await sendEmail({
      to: env.adminEmail,
      subject: `Nouvelle demande (Google Form) — ${label}`,
      html: `<p>Nouvelle demande reçue via le Google Form.</p>
<ul>
  <li><strong>${payload.name}</strong>${payload.student_name ? ` — élève : ${payload.student_name}` : ""}</li>
  <li>${label}${payload.zone ? ` · secteur ${payload.zone}` : ""} · ${payload.duration_min} min</li>
  ${payload.email ? `<li>${payload.email}</li>` : ""}
  ${payload.phone ? `<li>${payload.phone}</li>` : ""}
</ul>
<p>À traiter dans l'espace gestion → Demandes.</p>`,
    }).catch((e) => console.error("[intake:email]", e));
  }

  return Response.json({ ok: true, id: result.id });
}

// Healthcheck simple (sans données) pour vérifier le déploiement du endpoint.
export async function GET() {
  return Response.json({ ok: true, configured: hasIntakeToken });
}
