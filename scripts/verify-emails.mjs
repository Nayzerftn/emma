// Vérif Resend LIVE : envoi réel via la clé + le domaine de l'app, puis relecture du statut.
const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM;
const TO = process.env.ADMIN_NOTIFICATION_EMAIL || "contact@nayzerapp.com";
let pass = 0, fail = 0;
const check = (l, ok) => { ok ? pass++ : fail++; console.log(`${ok ? "✓" : "✗ ÉCHEC"} ${l}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`from=${FROM} → to=${TO}`);
check("clé Resend + EMAIL_FROM présents", !!KEY && !!FROM);

// 1. Envoi réel via l'API Resend (mêmes identifiants que l'app)
const sendRes = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    from: FROM,
    to: TO,
    subject: "Vérif live — Natation Côte Basque",
    html: "<p>Test d'envoi réel depuis la vérif live. Le domaine d'envoi et la clé fonctionnent.</p>",
  }),
});
const sendBody = await sendRes.json();
check(`Resend accepte l'envoi (HTTP ${sendRes.status}, id=${sendBody.id ?? "—"})`, sendRes.ok && !!sendBody.id);

// 2. Relecture du statut de l'email (le domaine doit être autorisé → pas d'erreur de domaine)
if (sendBody.id) {
  await sleep(2500);
  const getRes = await fetch(`https://api.resend.com/emails/${sendBody.id}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const got = await getRes.json();
  const status = got.last_event || got.status || "?";
  console.log(`   statut Resend : ${status}`);
  check(`email enregistré chez Resend (statut=${status}, pas rejeté domaine)`, getRes.ok && status !== "bounced" && status !== "failed");
}

// 3. Erreur attendue si le domaine n'était PAS vérifié (preuve que la vérif compte) — contrôle négatif
const badRes = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from: "test@domaine-non-verifie-xyz.com", to: TO, subject: "x", html: "x" }),
});
check("Resend REFUSE un domaine d'envoi non vérifié (sécurité d'envoi active)", !badRes.ok);

console.log(`\nRésultat Resend : ${pass} OK · ${fail} échec(s)`);
process.exit(fail > 0 ? 1 : 0);
