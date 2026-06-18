import { test, expect } from "@playwright/test";

test("parcours lead domicile : remplir → envoyer → confirmation", async ({ page }) => {
  await page.goto("/reservation?type=domicile#en-ligne");

  const form = page.locator("#en-ligne form");
  await form.getByLabel("Nom").fill("Sophie Test");
  await form.getByLabel("Email").fill("sophie.test@example.com");
  await form.getByLabel("Téléphone").fill("0612345678");
  await form.getByLabel("Ville").fill("Anglet");
  await form.getByRole("button", { name: /Envoyer ma demande/i }).click();

  await expect(page.getByText(/Demande envoyée/i)).toBeVisible({ timeout: 15_000 });
});
