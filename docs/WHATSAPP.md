# Activer WhatsApp 100 % automatique (Meta Cloud API)

Aujourd'hui les messages WhatsApp sont **semi-auto** (liens `wa.me` pré-remplis dans
le back-office). Pour passer en **100 % automatique** (envoi + réception OUI/NON/MODIFIER) :

## 1. Côté Meta (action à faire par toi)
1. Crée un compte **Meta WhatsApp Business** (business.facebook.com) + un numéro WhatsApp.
2. Dans **Meta for Developers** → app → WhatsApp → récupère :
   - le **token** d'accès permanent
   - le **Phone number ID**
3. Configure le **webhook** : URL `https://natationcotebasque.fr/api/webhooks/whatsapp`,
   avec un **verify token** que tu choisis. Abonne-toi à l'événement `messages`.

## 2. Côté app (variables d'env Vercel)
```
WHATSAPP_TOKEN=...            # token Meta
WHATSAPP_PHONE_ID=...         # Phone number ID
WHATSAPP_VERIFY_TOKEN=...     # le même que dans le webhook Meta
```
→ Redeploy.

## 3. Ce qui devient automatique
- **Envoi** : la proposition de prof part automatiquement sur WhatsApp (en plus de l'email).
- **Réception** : le client répond **OUI / NON / MODIFIER** →
  - OUI → alerte Eléa « à planifier »
  - NON / MODIFIER → la demande repasse « à relancer » + alerte Eléa

> Sans ces variables, tout fonctionne en **semi-auto** (liens wa.me) — aucune régression.
