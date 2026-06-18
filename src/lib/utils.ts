import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge ne connaît pas nos tokens custom (@theme).
 * On lui apprend nos tailles de type (text-display/h1/…) et nos couleurs
 * (text-ink/paper/…) pour qu'il ne fusionne pas, par ex., `text-display`
 * (taille) avec `text-paper` (couleur).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "body", "small"] }],
      "text-color": [{ text: ["ink", "paper", "sand", "filet", "meta"] }],
    },
  },
});

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formate un montant en centimes vers une chaîne EUR (ex. 4500 → "45 €"). */
export function formatEuros(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
  }).format(euros);
}
