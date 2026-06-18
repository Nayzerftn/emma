import type { BookingStatus } from "@/lib/supabase/types";

/**
 * Transition de statut d'une réservation suite à un événement Stripe.
 * Fonction PURE (testée unitairement). Idempotente : une résa déjà payée
 * reste payée quoi qu'il arrive.
 */
export function nextBookingStatus(
  event: string,
  current: BookingStatus,
): BookingStatus {
  if (current === "paid") return "paid";
  switch (event) {
    case "checkout.session.completed":
      return "paid";
    case "checkout.session.expired":
    case "payment_intent.payment_failed":
      return "failed";
    default:
      return current;
  }
}

/** Un paiement réussi confirme-t-il (incrémente la capacité) ? */
export function shouldConfirmSeat(event: string, previous: BookingStatus): boolean {
  return event === "checkout.session.completed" && previous !== "paid";
}
