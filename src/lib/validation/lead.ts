import { z } from "zod";

/** Lead = cours à domicile ou initiation océan (Flux B). */
export const leadTypeEnum = z.enum(["domicile", "ocean"]);

export const leadSchema = z.object({
  type: leadTypeEnum,
  name: z.string().trim().min(2, "Votre nom est requis."),
  email: z.email("Email invalide."),
  phone: z
    .string()
    .trim()
    .min(6, "Numéro de téléphone invalide.")
    .max(30, "Numéro de téléphone invalide."),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Indiquez votre ville."),
  level: z.string().trim().max(120).optional().or(z.literal("")),
  availability: z.string().trim().max(500).optional().or(z.literal("")),
  groupSize: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema>;
