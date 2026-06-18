import { test, expect } from "@playwright/test";

/**
 * Parcours réservation bassin → Stripe Checkout (test mode).
 * Sélectionne enfant → niveau → créneau → coordonnées → "Payer et réserver",
 * et vérifie la redirection vers Stripe Checkout (preuve de session créée).
 * Nécessite la base seedée (créneaux démo) + clés Stripe test.
 */
test("parcours réservation bassin mène à Stripe Checkout", async ({ page }) => {
  await page.goto("/reservation#bassin");

  const tunnel = page.locator("#bassin");
  await expect(tunnel.getByText("Pour qui ?")).toBeVisible();

  const enfant = tunnel.getByRole("button", { name: /Enfant/i });
  if (!(await enfant.isVisible())) test.skip(true, "Tunnel indisponible.");
  await enfant.click();

  // Sélectionne le premier niveau proposé, s'il y en a.
  const level = tunnel.getByRole("button", { name: /niveau/i }).first();
  if (await level.isVisible().catch(() => false)) await level.click();

  // Sélectionne le premier créneau disponible.
  const slot = tunnel.locator("ul li button").first();
  if (!(await slot.isVisible().catch(() => false))) {
    test.skip(true, "Aucun créneau seedé.");
  }
  await slot.click();

  await tunnel.getByLabel("Votre nom").fill("Thomas Test");
  await tunnel.getByLabel("Email").fill("thomas.test@example.com");
  await tunnel.getByLabel("Téléphone").fill("0612345678");
  await tunnel.getByLabel("Nom du participant").fill("Léo");

  await Promise.all([
    page.waitForURL(/checkout\.stripe\.com/, { timeout: 30_000 }),
    tunnel.getByRole("button", { name: /Payer et réserver/i }).click(),
  ]);

  expect(page.url()).toContain("checkout.stripe.com");
});
