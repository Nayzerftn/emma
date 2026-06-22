// Vérif Stripe RÉELLE (mode test) : génère une facture via l'admin, la paie via
// l'API Stripe (pm_card_visa), et confirme que le WEBHOOK passe la facture en « paid ».
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const BASE = "http://localhost:3002";
const FAMILY = "Marie Lasalle";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let pass = 0, fail = 0;
const check = (l, ok) => { if (ok) pass++; else fail++; console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${l}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { data: fam } = await db.from("clients").select("id").eq("name", FAMILY).single();
const SEL = "id,status,total_cents,stripe_invoice_id,pdf_url,stripe_url";
const latestInvoice = async () => {
  const { data } = await db
    .from("invoices")
    .select(SEL)
    .eq("client_id", fam.id)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
};

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  // 1. Réutiliser une facture impayée existante, sinon la générer via l'UI réelle.
  let inv = await latestInvoice();
  if (!inv || inv.status === "paid" || !inv.stripe_invoice_id) {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
    await page.fill("#email", "contact@nayzerapp.com");
    await page.fill("#password", "NatationCB2026!");
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15000 });
    await page.goto(`${BASE}/admin/familles`, { waitUntil: "networkidle" });
    const card = page.locator("article", { hasText: FAMILY });
    await card.getByRole("button", { name: "Générer la facture" }).click();
    console.log("→ génération de facture demandée (Stripe Invoices API)…");
    for (let i = 0; i < 30; i++) {
      inv = await latestInvoice();
      if (inv?.stripe_invoice_id) break;
      await sleep(1000);
    }
  } else {
    console.log("→ réutilisation d'une facture impayée existante");
  }
  check("facture en base avec stripe_invoice_id", !!inv?.stripe_invoice_id);
  if (!inv?.stripe_invoice_id) throw new Error("pas de facture exploitable");
  console.log(`   facture ${inv.id} · ${(inv.total_cents / 100).toFixed(2)}€ · statut=${inv.status} · stripe=${inv.stripe_invoice_id}`);
  check("montant facture > 0 (lignes de cours présentes)", inv.total_cents > 0);

  // 3. Vérifier côté Stripe : facture finalisée + PDF disponible
  const sInv = await stripe.invoices.retrieve(inv.stripe_invoice_id);
  check(`facture Stripe finalisée (status=${sInv.status})`, ["open", "paid"].includes(sInv.status));
  check("PDF Stripe + page de paiement hébergée disponibles", !!sInv.invoice_pdf && !!sInv.hosted_invoice_url);

  // 4. PAIEMENT RÉEL via l'API Stripe (carte de test 4242)
  if (sInv.status === "open") {
    // pm_card_visa est re-tokenisée à chaque appel : on attache, puis on paie avec l'id attaché.
    const pm = await stripe.paymentMethods.attach("pm_card_visa", { customer: sInv.customer });
    await stripe.invoices.pay(inv.stripe_invoice_id, { payment_method: pm.id });
    console.log(`→ facture payée via Stripe (carte test 4242, ${pm.id}) — en attente du webhook…`);
  } else if (sInv.status === "paid") {
    console.log("→ facture Stripe déjà payée (run précédent)");
  }

  // 5. Le WEBHOOK (via stripe listen) doit passer NOTRE facture en « paid »
  let paid = false;
  for (let i = 0; i < 25; i++) {
    const { data } = await db.from("invoices").select("status").eq("id", inv.id).single();
    if (data?.status === "paid") { paid = true; break; }
    await sleep(1000);
  }
  check("WEBHOOK → facture passée en « paid » en base", paid);

  // 6. Idempotence : l'évènement est bien enregistré dans stripe_events
  const sEvents = await stripe.events.list({ limit: 10 });
  const paidEvent = sEvents.data.find((e) => e.type === "invoice.paid" || e.type === "invoice.payment_succeeded");
  if (paidEvent) {
    const { data: rec } = await db.from("stripe_events").select("id").eq("id", paidEvent.id).maybeSingle();
    check("idempotence : évènement enregistré dans stripe_events", !!rec);
  } else {
    console.log("  (évènement invoice.paid introuvable côté Stripe pour vérifier l'idempotence)");
  }

  console.log(`\nRésultat Stripe : ${pass} OK · ${fail} échec(s)`);
} catch (e) {
  console.error("ERREUR :", e.message);
  fail++;
} finally {
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
