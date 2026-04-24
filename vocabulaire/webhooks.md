# Webhooks

---

## Définition

Un **webhook** est un mécanisme de communication entre serveurs basé sur des **callbacks HTTP**. Plutôt qu'un service qui interroge régulièrement un autre pour savoir si quelque chose a changé, c'est le serveur source qui envoie lui-même une requête **HTTP POST** vers une URL prédéfinie dès qu'un événement se produit.

> "Webhooks are HTTP callbacks which can be used to send notifications when data in Contentful is changed, allowing external systems to react to changes to do things such as trigger a website rebuild or send a notification to a chat application." — Contentful

### Schéma de fonctionnement

```
Événement se produit
        │
        ▼
[ Serveur source ]
  (ex : Contentful)
        │
        │  HTTP POST  →  payload JSON
        ▼
[ Serveur destinataire ]
  (ex : Vercel, Slack, Stripe listener…)
        │
        ▼
  Traitement de l'événement
```

### Webhook vs Polling

| Critère | Webhook (push) | Polling (pull) |
|---|---|---|
| Initiative | Le serveur source envoie | Le client interroge |
| Latence | Quasi-temps réel | Dépend de l'intervalle |
| Ressources | Légères (envoi à la demande) | Lourdes (requêtes répétées) |
| Complexité | Nécessite une URL publique | Plus simple à mettre en place |
| Fiabilité | Dépend des retries | Contrôle total côté client |

---

## Cas d'usage

### Déclencher un rebuild de site

Contentful détecte une modification de contenu → envoie un webhook à Vercel ou Netlify → le site est reconstruit automatiquement.

```
Contentful (CMS) → webhook → Vercel Deploy Hook → nouveau build
```

### Notifier un canal Slack

Un service (GitHub, Jira, Stripe…) envoie un webhook à l'API Slack pour poster un message dans un canal dès qu'un événement survient (PR ouverte, ticket créé, paiement reçu…).

### Synchroniser des données entre services

Un webhook peut déclencher une mise à jour dans une base de données tierce, un CRM, ou un outil analytics dès qu'une ressource change dans le service source.

### Paiements avec Stripe

Stripe utilise intensivement les webhooks pour notifier ton backend des événements de paiement :

- `payment_intent.succeeded` → marquer une commande comme payée
- `customer.subscription.deleted` → désactiver l'accès premium
- `invoice.payment_failed` → envoyer un email de relance

---

## Sécurité

Les webhooks arrivent de l'extérieur : n'importe qui pourrait envoyer une fausse requête à ton URL. Il faut **vérifier la signature** de chaque requête pour s'assurer qu'elle provient bien du serveur attendu.

### Vérification par signature HMAC

Le serveur source calcule un hash HMAC-SHA256 du corps de la requête avec un secret partagé, et l'inclut dans un header HTTP (ex : `X-Hub-Signature-256`, `Stripe-Signature`…).

Ton serveur recalcule ce hash et compare.

### Exemple de vérification en Node.js

```js
const crypto = require('crypto');

function verifyWebhookSignature(req, secret) {
  const signature = req.headers['x-hub-signature-256'];
  const body = JSON.stringify(req.body);

  const expectedSignature =
    'sha256=' +
    crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex');

  // Comparaison résistante aux timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

> Ne jamais comparer les signatures avec `===` : utiliser `crypto.timingSafeEqual` pour éviter les attaques par timing.

---

## Exemple Contentful

### Configuration dans l'interface

1. Aller dans **Settings → Webhooks** dans ton espace Contentful
2. Cliquer sur **Add Webhook**
3. Renseigner l'URL de destination (ex : ton endpoint Express ou un Deploy Hook Vercel)
4. Choisir les déclencheurs : `Entry published`, `Asset deleted`, etc.
5. Optionnel : ajouter des headers personnalisés (ex : clé d'API, secret)

### Payload JSON reçu

Voici un exemple simplifié de ce que Contentful envoie lors de la publication d'une entrée :

```json
{
  "sys": {
    "type": "Entry",
    "id": "abc123",
    "space": {
      "sys": { "type": "Link", "linkType": "Space", "id": "xyz789" }
    },
    "contentType": {
      "sys": { "type": "Link", "linkType": "ContentType", "id": "blogPost" }
    },
    "revision": 3,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:00:00Z"
  },
  "fields": {
    "title": {
      "en-US": "Mon article de blog"
    },
    "slug": {
      "en-US": "mon-article-de-blog"
    },
    "body": {
      "en-US": "Contenu de l'article..."
    }
  }
}
```

Le header `X-Contentful-Topic` précise le type d'événement : `ContentManagement.Entry.publish`, `ContentManagement.Asset.delete`, etc.

---

## Bonnes pratiques

### Répondre rapidement (202 Accepted)

Le serveur source attend une réponse rapide. Si ton traitement est long, réponds immédiatement avec un `202 Accepted` et délègue le travail à une file de messages (queue) ou un worker en arrière-plan.

```js
app.post('/webhook', (req, res) => {
  // Répondre immédiatement
  res.status(202).send('Accepted');

  // Traiter en arrière-plan
  processWebhookAsync(req.body).catch(console.error);
});
```

### Idempotence

Le même webhook peut être livré **plusieurs fois** (en cas de retry). Ton handler doit produire le même résultat même s'il est appelé plusieurs fois avec le même payload.

Stratégie : stocker l'identifiant de l'événement (`sys.id` + révision) et ignorer les doublons.

```js
const processedEvents = new Set();

async function processWebhookAsync(payload) {
  const eventId = `${payload.sys.id}-${payload.sys.revision}`;

  if (processedEvents.has(eventId)) {
    console.log('Événement déjà traité, ignoré :', eventId);
    return;
  }

  processedEvents.add(eventId);
  // … traitement réel
}
```

### Retry et gestion des échecs

La plupart des services retentent l'envoi du webhook si ton serveur répond avec un code d'erreur (5xx) ou ne répond pas dans le délai imparti. Prévois :

- Un **logging** de tous les webhooks reçus (pour le débogage)
- Une **dead-letter queue** pour les événements qui échouent après N retries
- Des **alertes** si le taux d'échec dépasse un seuil

| Code de réponse | Interprétation par le serveur source |
|---|---|
| `200` / `202` | Succès, pas de retry |
| `4xx` | Erreur client, généralement pas de retry |
| `5xx` | Erreur serveur → retry automatique |
| Timeout | Retry automatique |
