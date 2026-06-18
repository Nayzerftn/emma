import { Resend } from "resend";
import { env, hasResend } from "@/lib/env";

type EmailInput = { to: string | string[]; subject: string; html: string };

/**
 * Envoi d'email transactionnel via Resend.
 * Sans clé (dev / avant prod), l'envoi est un no-op loggé : le flux
 * fonctionne, l'email est simplement journalisé.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: EmailInput): Promise<{ ok: boolean; skipped: boolean }> {
  if (!hasResend) {
    console.info("[email:no-op]", { to, subject });
    return { ok: true, skipped: true };
  }
  try {
    const resend = new Resend(env.resendApiKey);
    const { error } = await resend.emails.send({
      from: env.emailFrom,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email:error]", error);
      return { ok: false, skipped: false };
    }
    return { ok: true, skipped: false };
  } catch (err) {
    console.error("[email:exception]", err);
    return { ok: false, skipped: false };
  }
}

const wrap = (title: string, body: string) =>
  `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:560px;margin:auto">
    <h2 style="text-transform:uppercase;letter-spacing:-0.5px">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #e7e5e0;margin:24px 0" />
    <p style="color:#6b6b6b;font-size:13px">Natation Côte Basque — Bayonne · Anglet · Biarritz</p>
  </div>`;

export function leadAdminEmail(input: {
  type: string;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  message?: string | null;
}) {
  return wrap(
    "Nouvelle demande",
    `<p><strong>Type :</strong> ${input.type}</p>
     <p><strong>Nom :</strong> ${input.name}</p>
     <p><strong>Email :</strong> ${input.email}</p>
     <p><strong>Téléphone :</strong> ${input.phone}</p>
     ${input.city ? `<p><strong>Ville :</strong> ${input.city}</p>` : ""}
     ${input.message ? `<p><strong>Message :</strong> ${input.message}</p>` : ""}`,
  );
}

export function leadCustomerEmail(name: string) {
  return wrap(
    "Bien reçu",
    `<p>Bonjour ${name},</p>
     <p>Merci pour votre demande. On vous répond sous 24h avec la professeure la plus adaptée et des propositions de créneaux.</p>
     <p>À très vite,<br/>L'équipe Natation Côte Basque</p>`,
  );
}

export function bookingCustomerEmail(input: {
  name: string;
  when: string;
  amount: string;
}) {
  return wrap(
    "Réservation confirmée",
    `<p>Bonjour ${input.name},</p>
     <p>Votre créneau en bassin privé à Bidart est confirmé pour le <strong>${input.when}</strong>.</p>
     <p>Montant réglé : <strong>${input.amount}</strong>.</p>
     <p>Juste un maillot et des lunettes — on s'occupe du reste.</p>
     <p>À très vite,<br/>L'équipe Natation Côte Basque</p>`,
  );
}

export function bookingAdminEmail(input: {
  name: string;
  email: string;
  when: string;
  amount: string;
}) {
  return wrap(
    "Nouvelle réservation payée",
    `<p><strong>Client :</strong> ${input.name} (${input.email})</p>
     <p><strong>Créneau :</strong> ${input.when}</p>
     <p><strong>Montant :</strong> ${input.amount}</p>`,
  );
}
