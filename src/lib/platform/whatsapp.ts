/**
 * WhatsApp Cloud API (Meta) — envoi automatique de messages.
 * Activé seulement si WHATSAPP_TOKEN + WHATSAPP_PHONE_ID sont définis.
 * Sinon : no-op loggé (l'app retombe sur les liens wa.me semi-auto existants).
 *
 * Mise en service : créer un compte Meta WhatsApp Business, un numéro,
 * récupérer le token + phone number id, et définir WHATSAPP_VERIFY_TOKEN
 * (pour le webhook /api/webhooks/whatsapp).
 */
import { env, hasWhatsapp } from "@/lib/env";
import { waFromPhone } from "@/lib/platform/notify";

export async function sendWhatsApp(
  to: string,
  body: string,
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasWhatsapp) {
    console.info("[wa:no-op]", { to });
    return { ok: true, skipped: true };
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${env.whatsappPhoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: waFromPhone(to),
          type: "text",
          text: { body },
        }),
      },
    );
    if (!res.ok) {
      console.error("[wa:error]", await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[wa:exception]", e);
    return { ok: false };
  }
}
