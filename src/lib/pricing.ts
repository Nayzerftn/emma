/**
 * Logique de prix — pure, testée unitairement.
 * Tous les montants sont en centimes (entiers). Le prix vient toujours
 * de `pool_slots.price_cents` côté serveur, jamais codé en dur côté client.
 */

/** Montant d'une réservation = prix du créneau × quantité (centimes). */
export function bookingAmountCents(slotPriceCents: number, quantity = 1): number {
  if (!Number.isInteger(slotPriceCents) || slotPriceCents < 0) {
    throw new Error("Prix du créneau invalide.");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantité invalide.");
  }
  return slotPriceCents * quantity;
}

/**
 * Partage de frais (cours à domicile) : coût par enfant lorsqu'on partage
 * une séance jusqu'à 3 enfants du même niveau.
 */
export function perChildCost(totalCents: number, children: number): number {
  if (!Number.isInteger(totalCents) || totalCents < 0) {
    throw new Error("Montant total invalide.");
  }
  if (!Number.isInteger(children) || children < 1 || children > 3) {
    throw new Error("Le partage va de 1 à 3 enfants du même niveau.");
  }
  return Math.round(totalCents / children);
}
