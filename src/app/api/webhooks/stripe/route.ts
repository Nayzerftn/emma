import type Stripe from "stripe";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { env, hasStripe, hasSupabaseAdmin } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { nextBookingStatus, shouldConfirmSeat } from "@/lib/webhook";
import {
  sendEmail,
  bookingCustomerEmail,
  bookingAdminEmail,
} from "@/lib/email";
import { formatEuros } from "@/lib/utils";

export async function POST(request: Request) {
  if (!hasStripe || !env.stripeWebhookSecret || !hasSupabaseAdmin) {
    return new Response("Webhook non configuré.", { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature manquante.", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (err) {
    console.error("[stripe:signature]", err);
    return new Response("Signature invalide.", { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Idempotence : on n'agit qu'une fois par événement.
  const { error: dedupeError } = await supabase
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (dedupeError) {
    if (dedupeError.code === "23505") {
      return new Response("Déjà traité.", { status: 200 });
    }
    console.error("[stripe:dedupe]", dedupeError);
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      // Facture plateforme payée → marquer la facture comme réglée.
      const invoiceId = session.metadata?.invoice_id;
      if (invoiceId) {
        if (event.type === "checkout.session.completed") {
          await supabase.from("invoices").update({ status: "paid" }).eq("id", invoiceId);
        }
        return new Response("OK", { status: 200 });
      }

      const bookingId = session.metadata?.booking_id;
      const slotId = session.metadata?.slot_id;
      if (!bookingId || !slotId) return new Response("OK", { status: 200 });

      const { data: booking } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();
      if (!booking) return new Response("OK", { status: 200 });

      const target = nextBookingStatus(event.type, booking.status);

      if (event.type === "checkout.session.completed") {
        const { data: slot } = await supabase
          .from("pool_slots")
          .select("*")
          .eq("id", slotId)
          .single();
        const { count: paidCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("slot_id", slotId)
          .eq("status", "paid");

        const capacity = slot?.capacity ?? 0;
        const alreadyPaid = paidCount ?? 0;

        // Concurrence : si plein, on refuse proprement (rembourse + failed).
        if (
          shouldConfirmSeat(event.type, booking.status) &&
          alreadyPaid >= capacity
        ) {
          if (session.payment_intent) {
            try {
              await stripe.refunds.create({
                payment_intent: session.payment_intent as string,
              });
            } catch (refundErr) {
              console.error("[stripe:refund]", refundErr);
            }
          }
          await supabase
            .from("bookings")
            .update({
              status: "failed",
              stripe_payment_intent: (session.payment_intent as string) ?? null,
            })
            .eq("id", bookingId);
          return new Response("OK", { status: 200 });
        }

        await supabase
          .from("bookings")
          .update({
            status: target,
            stripe_payment_intent: (session.payment_intent as string) ?? null,
          })
          .eq("id", bookingId);

        // Capacité = nombre de réservations payées (recalculé).
        await supabase
          .from("pool_slots")
          .update({ booked_count: alreadyPaid + 1 })
          .eq("id", slotId);

        if (shouldConfirmSeat(event.type, booking.status) && slot) {
          const when = format(new Date(slot.starts_at), "EEEE d MMMM 'à' HH'h'mm", {
            locale: fr,
          });
          const amount = formatEuros(booking.amount_cents);
          await Promise.all([
            sendEmail({
              to: booking.customer_email,
              subject: "Réservation confirmée — Natation Côte Basque",
              html: bookingCustomerEmail({ name: booking.customer_name, when, amount }),
            }),
            env.adminEmail
              ? sendEmail({
                  to: env.adminEmail,
                  subject: "Nouvelle réservation payée",
                  html: bookingAdminEmail({
                    name: booking.customer_name,
                    email: booking.customer_email,
                    when,
                    amount,
                  }),
                })
              : Promise.resolve(),
          ]);
        }
      } else {
        // checkout.session.expired
        await supabase.from("bookings").update({ status: target }).eq("id", bookingId);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("bookings")
        .update({ status: "failed" })
        .eq("stripe_payment_intent", intent.id);
    }
  } catch (err) {
    console.error("[stripe:handler]", err);
    return new Response("Erreur de traitement.", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
