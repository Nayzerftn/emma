import { test, expect } from "@playwright/test";

/**
 * Réservation bassin privé.
 * Choix produit validé : la réservation du bassin se fait via Square (lien
 * externe), et non par un tunnel Stripe interne. On vérifie donc le point
 * d'entrée Square + la page de demande (domicile / océan).
 */
test("le bassin privé renvoie vers la réservation Square", async ({ page }) => {
  await page.goto("/bassin-prive");
  const square = page.locator('a[href*="book.squareup.com"]').first();
  await expect(square).toBeVisible();
  await expect(square).toHaveAttribute("target", "_blank");
});

test("la page réservation propose le formulaire de demande", async ({ page }) => {
  await page.goto("/reservation");
  await expect(page.locator('input[name="email"]').first()).toBeVisible();
});
