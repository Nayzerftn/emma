import { z } from "zod";

/** Réservation bassin privé (Flux A — paiement Stripe). */
export const bookingSchema = z.object({
  slotId: z.uuid("Créneau invalide."),
  customerName: z.string().trim().min(2, "Votre nom est requis."),
  customerEmail: z.email("Email invalide."),
  customerPhone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide.")
    .max(30, "Numéro de téléphone invalide."),
  participantName: z.string().trim().min(1, "Nom du participant requis."),
  participantAge: z.coerce
    .number()
    .int()
    .min(2, "Âge invalide.")
    .max(99, "Âge invalide.")
    .optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
