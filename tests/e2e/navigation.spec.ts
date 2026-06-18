import { test, expect } from "@playwright/test";

const PAGES = [
  "/",
  "/equipe",
  "/bassin-prive",
  "/cours-a-domicile",
  "/initiation-ocean",
  "/kinesiologie",
  "/surf",
  "/reservation",
];

for (const path of PAGES) {
  test(`la page ${path} se charge sans erreur JS`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toBeVisible();
    expect(errors, errors.join("\n")).toHaveLength(0);
  });
}

test("le masthead pointe vers la réservation", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('header a[href="/reservation"]').first()).toHaveAttribute(
    "href",
    "/reservation",
  );
});
