"use server";

import { headers } from "next/headers";
import { env, hasSupabaseAdmin } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { leadSchema } from "@/lib/validation/lead";
import { sendEmail, leadAdminEmail, leadCustomerEmail } from "@/lib/email";

export type LeadResult = { ok: boolean; message: string };

// Rate-limit best-effort en mémoire (anti-spam basique).
const hits = new Map<string, number[]>();
function rateLimited(ip: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}

/** Flux B — enregistre un lead (domicile / océan) puis notifie. */
export async function submitLead(
  raw: Record<string, unknown>,
): Promise<LeadResult> {
  // Honeypot : champ "website" rempli = bot → faux succès silencieux.
  if (typeof raw.website === "string" && raw.website.trim() !== "") {
    return { ok: true, message: "Merci, votre demande est bien partie." };
  }

  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") ?? "local").split(",")[0]!.trim();
  if (rateLimited(ip)) {
    return {
      ok: false,
      message: "Trop de demandes en peu de temps. Réessayez dans une minute.",
    };
  }

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
    };
  }
  const data = parsed.data;

  if (!hasSupabaseAdmin) {
    console.info("[lead:no-db]", data);
  } else {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("leads").insert({
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || null,
      city: data.city,
      level: data.level || null,
      availability: data.availability || null,
      group_size: data.groupSize || null,
      message: data.message || null,
      status: "new",
    });
    if (error) {
      console.error("[lead:insert-error]", error);
      return {
        ok: false,
        message: "Une erreur est survenue. Réessayez ou écrivez-nous sur WhatsApp.",
      };
    }
  }

  const label = data.type === "ocean" ? "Initiation océan" : "Cours à domicile";
  await Promise.all([
    env.adminEmail
      ? sendEmail({
          to: env.adminEmail,
          subject: `Nouvelle demande — ${label}`,
          html: leadAdminEmail({ ...data, type: label }),
        })
      : Promise.resolve(),
    sendEmail({
      to: data.email,
      subject: "Votre demande — Natation Côte Basque",
      html: leadCustomerEmail(data.name),
    }),
  ]);

  return {
    ok: true,
    message: "Merci ! On vous répond sous 24h avec la professeure la plus adaptée.",
  };
}
