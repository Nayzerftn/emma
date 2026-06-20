# Connecter le Google Form à l'espace gestion

Chaque réponse du Google Form de demande de cours peut arriver **automatiquement**
dans l'espace gestion → **Demandes** (table `lesson_requests`), prête pour le matching.

Le site web envoie déjà ses demandes domicile/océan dans ce pipeline. Ce guide
ajoute le **Google Form** comme deuxième source.

---

## 1. Définir le jeton de sécurité

Le endpoint d'ingestion est protégé par un jeton partagé. Dans les variables
d'environnement de l'app (Vercel → Settings → Environment Variables) :

```
INTAKE_TOKEN=<une longue chaîne aléatoire, ex. 48 caractères>
```

Génère-la, par ex., avec `openssl rand -hex 24`. Garde-la secrète.

Vérifier que le endpoint répond (après déploiement) :

```
GET https://VOTRE-DOMAINE/api/intake/google-form
→ { "ok": true, "configured": true }
```

---

## 2. Coller le script dans le Google Form

1. Ouvrir le **Google Form** → menu **⋮** → **Éditeur de scripts** (Apps Script).
2. Coller le code ci-dessous (remplacer `ENDPOINT` et `TOKEN`).
3. Enregistrer.

```javascript
// === Natation Côte Basque — envoi des réponses vers l'espace gestion ===
var ENDPOINT = 'https://VOTRE-DOMAINE/api/intake/google-form';
var TOKEN = 'COLLER_ICI_LA_VALEUR_DE_INTAKE_TOKEN';

function onFormSubmit(e) {
  var data = {};
  var items = e.response.getItemResponses();
  for (var i = 0; i < items.length; i++) {
    data[items[i].getItem().getTitle()] = items[i].getResponse();
  }
  UrlFetchApp.fetch(ENDPOINT, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-intake-token': TOKEN },
    payload: JSON.stringify({ data: data }),
    muteHttpExceptions: true
  });
}

// À exécuter UNE fois pour activer l'envoi automatique.
function installerDeclencheur() {
  var form = FormApp.getActiveForm();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onFormSubmit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
}
```

4. Dans la barre d'outils, sélectionner la fonction **installerDeclencheur** puis
   cliquer **Exécuter**. Autoriser l'accès quand Google le demande.
5. C'est prêt : chaque nouvelle réponse est envoyée automatiquement.

> Tester : remplir le formulaire une fois, puis vérifier que la demande apparaît
> dans **Espace gestion → Demandes**.

---

## 3. Libellés du formulaire (mapping automatique)

Le serveur **reconnaît les libellés en français** (avec ou sans accents). Inutile
de renommer quoi que ce soit, mais pour une reconnaissance optimale, garde des
intitulés clairs. Correspondances reconnues :

| Donnée                | Libellés reconnus (exemples)                          |
| --------------------- | ----------------------------------------------------- |
| Nom du parent         | « Nom », « Nom et prénom », « Parent »                 |
| Email                 | « Email », « Adresse e-mail », « Courriel »            |
| Téléphone             | « Téléphone », « Numéro », « Portable », « WhatsApp »  |
| Type de cours         | « Type de cours », « Formule » (→ domicile / océan)    |
| Secteur               | « Secteur », « Zone » (lettre A–J détectée)            |
| Adresse               | « Adresse », « Ville », « Lieu »                       |
| Prénom de l'enfant    | « Prénom de l'enfant », « Enfant »                     |
| Âge de l'enfant       | « Âge de l'enfant », « Âge »                           |
| Niveau                | « Niveau », « Niveau de natation »                     |
| Objectif              | « Objectif »                                           |
| Période souhaitée     | « Période souhaitée », « Quand », « Dates »            |
| Créneaux souhaités    | « Créneaux souhaités », « Disponibilités », « Horaires »|
| Fréquence             | « Fréquence », « Rythme »                              |
| Durée                 | « Durée du cours » (→ 30 min ou 1 h)                   |
| Nombre de cours       | « Nombre de cours », « Combien »                       |
| Professeure souhaitée | « Professeure souhaitée », « Prof » (par prénom)       |
| Commentaire           | « Commentaire », « Remarque », « Précisions »          |

Valeurs par défaut si une donnée manque : **type = domicile**, **durée = 30 min**.
La professeure souhaitée est retrouvée par prénom (ex. « Oïana »).

---

## 4. Sécurité & dépannage

- **401 Non autorisé** → le `TOKEN` du script ne correspond pas à `INTAKE_TOKEN`.
- **503 Ingestion non configurée** → `INTAKE_TOKEN` absent côté serveur.
- Le endpoint accepte aussi `?token=...` en query si l'en-tête est gênant.
- Le payload peut être `{ "data": { ... } }`, `{ "answers": { ... } }` ou plat.
- Rien n'est jamais perdu : en l'absence de base configurée, la demande est
  journalisée côté serveur.
