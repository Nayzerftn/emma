"use server";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { env, hasStripe, hasSupabaseAdmin } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { bookingSchema } from "@/lib/validation/booking";
import { bookingAmountCents } from "@/lib/pricing";
import { isSlotBookable } from "@/lib/availability";

export type CheckoutResult = { ok: boolean; url?: string; message?: string };

/** Flux A — crée une réservation `pending` et ouvre une session Stripe Checkout. */
export async function createBookingCheckout(
  raw: Record<string, unknown>,
): Promise<CheckoutResult> {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  if (!hasSupabaseAdmin || !hasStripe) {
    return {
      ok: false,
      message: "Le paiement en ligne est momentanément indisponible. Écrivez-nous sur WhatsApp.",
    };
  }

  const data = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: slot, error: slotErr } = await supabase
    .from("pool_slots")
    .select("*")
    .eq("id", data.slotId)
    .single();
  if (slotErr || !slot) return { ok: false, message: "Créneau introuvable." };

  // Revalidation serveur : capacité > réservations PAYÉES.
  const { count: paidCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("slot_id", slot.id)
    .eq("status", "paid");

  const effective = { ...slot, booked_count: paidCount ?? slot.booked_count };
  if (!isSlotBookable(effective)) {
    return { ok: false, message: "Ce créneau n'est plus disponible." };
  }

  const amount = bookingAmountCents(slot.price_cents);

  const { data: booking, error: insErr } = await supabase
    .from("bookings")
    .insert({
      slot_id: slot.id,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      participant_name: data.participantName,
      participant_age: data.participantAge ?? null,
      amount_cents: amount,
      status: "pending",
    })
    .select("id")
    .single();
  if (insErr || !booking) {
    return { ok: false, message: "Impossible de créer la réservation. Réessayez." };
  }

  const when = format(new Date(slot.starts_at), "EEEE d MMMM 'à' HH'h'mm", { locale: fr });
  const productName =
    slot.audience === "enfant"
      ? `Cours de natation enfant (niveau ${slot.level ?? "-"}) — bassin privé Bidart`
      : "Cours de natation adulte — bassin privé Bidart";

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: data.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: { name: productName, description: when },
        },
      },
    ],
    metadata: { booking_id: booking.id, slot_id: slot.id },
    success_url: `${env.siteUrl}/reservation/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.siteUrl}/reservation/cancel`,
  });

  await supabase
    .from("bookings")
    .update({ stripe_session_id: session.id })
    .eq("id", booking.id);

  if (!session.url) return { ok: false, message: "Erreur Stripe : session sans URL." };
  return { ok: true, url: session.url };
}
