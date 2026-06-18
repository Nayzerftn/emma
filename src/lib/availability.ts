/**
 * Disponibilité d'un créneau — logique pure, testée unitairement.
 * Toujours recalculée côté serveur (jamais déduite du client).
 */

export type SlotLike = {
  capacity: number;
  booked_count: number;
  is_open: boolean;
  starts_at: string | Date;
};

/** Places restantes (jamais négatif). */
export function remainingSeats(slot: Pick<SlotLike, "capacity" | "booked_count">): number {
  return Math.max(0, slot.capacity - slot.booked_count);
}

/** Le créneau est-il complet ? */
export function isSlotFull(slot: Pick<SlotLike, "capacity" | "booked_count">): boolean {
  return remainingSeats(slot) <= 0;
}

/** Le créneau est-il dans le passé par rapport à `now` ? */
export function isSlotPast(slot: Pick<SlotLike, "starts_at">, now: Date = new Date()): boolean {
  const starts =
    slot.starts_at instanceof Date ? slot.starts_at : new Date(slot.starts_at);
  return starts.getTime() <= now.getTime();
}

/**
 * Le créneau est-il réservable ?
 * Ouvert + des places restantes + pas dans le passé.
 */
export function isSlotBookable(slot: SlotLike, now: Date = new Date()): boolean {
  return slot.is_open && !isSlotFull(slot) && !isSlotPast(slot, now);
}
