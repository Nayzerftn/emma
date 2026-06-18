import Stripe from "stripe";
import { env, hasStripe } from "@/lib/env";

let cached: Stripe | null = null;

/** Client Stripe (clé secrète serveur). Lazy + guardé. */
export function getStripe(): Stripe {
  if (!hasStripe) {
    throw new Error("Stripe indisponible : STRIPE_SECRET_KEY manquante.");
  }
  if (!cached) {
    cached = new Stripe(env.stripeSecretKey, { typescript: true });
  }
  return cached;
}
