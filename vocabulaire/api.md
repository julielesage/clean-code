# API — Communication client-serveur

---

## HTTP — Protocole de communication

HTTP (HyperText Transfer Protocol) est le protocole utilisé pour la communication entre un client (navigateur, app) et un serveur. C'est la base de toute requête vers une API.

### Méthodes HTTP

| Méthode  | Usage                                      | Corps ? |
|----------|--------------------------------------------|---------|
| `GET`    | Lire une ressource                         | Non     |
| `POST`   | Créer une ressource                        | Oui     |
| `PUT`    | Remplacer entièrement une ressource        | Oui     |
| `PATCH`  | Modifier partiellement une ressource       | Oui     |
| `DELETE` | Supprimer une ressource                    | Non     |

### Codes de statut

| Code | Catégorie     | Signification                              |
|------|---------------|--------------------------------------------|
| 200  | 2xx Succès    | OK — requête réussie                       |
| 201  | 2xx Succès    | Created — ressource créée                  |
| 204  | 2xx Succès    | No Content — succès sans corps de réponse  |
| 301  | 3xx Redirect  | Moved Permanently — redirection permanente |
| 304  | 3xx Redirect  | Not Modified — cache valide                |
| 400  | 4xx Client    | Bad Request — requête malformée            |
| 401  | 4xx Client    | Unauthorized — authentification requise    |
| 403  | 4xx Client    | Forbidden — accès refusé                  |
| 404  | 4xx Client    | Not Found — ressource introuvable          |
| 422  | 4xx Client    | Unprocessable Entity — données invalides   |
| 429  | 4xx Client    | Too Many Requests — rate limit atteint     |
| 500  | 5xx Serveur   | Internal Server Error — erreur serveur     |
| 503  | 5xx Serveur   | Service Unavailable — serveur indisponible |

### Headers importants

```http
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
Cache-Control: no-cache
X-Request-ID: abc123
```

- **Content-Type** : format du corps de la requête/réponse
- **Authorization** : jeton d'authentification (Bearer, Basic, API Key)
- **Accept** : format attendu dans la réponse
- **Cache-Control** : directives de mise en cache

---

## XML — eXtensible Markup Language

Langage de balisage extensible utilisé pour structurer et transporter des données. Précède JSON dans l'usage courant des APIs (notamment SOAP).

### Structure d'un document XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<utilisateurs>
  <utilisateur id="1">
    <nom>Julie</nom>
    <email>lesage.julie@gmail.com</email>
    <role>admin</role>
  </utilisateur>
  <utilisateur id="2">
    <nom>Marc</nom>
    <email>marc@example.com</email>
    <role>user</role>
  </utilisateur>
</utilisateurs>
```

### Usage dans les APIs

- Encore utilisé dans les APIs **SOAP** (web services d'entreprise)
- Présent dans certains flux RSS / Atom
- Lisible par les humains mais verbeux comparé à JSON
- Supporte les **namespaces** et les **schémas de validation** (XSD)

---

## XHR — XMLHttpRequest

Objet JavaScript natif permettant d'effectuer des requêtes HTTP asynchrones sans recharger la page. C'est la base historique d'AJAX (Asynchronous JavaScript And XML).

### Exemple de requête XHR

```js
const xhr = new XMLHttpRequest();

xhr.open('GET', 'https://api.exemple.com/users');
xhr.setRequestHeader('Content-Type', 'application/json');

xhr.onload = function () {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  } else {
    console.error('Erreur :', xhr.status);
  }
};

xhr.onerror = function () {
  console.error('Erreur réseau');
};

xhr.send();
```

### XHR vs fetch()

| Critère              | XHR                          | fetch()                        |
|----------------------|------------------------------|--------------------------------|
| Syntaxe              | Callbacks, verbose           | Promesses, concis              |
| Annulation           | `xhr.abort()`                | `AbortController`              |
| Suivi de progression | `xhr.onprogress`             | Non natif (streams)            |
| Support navigateurs  | Très large (IE inclus)       | Navigateurs modernes           |
| Usage recommandé     | Legacy / cas spéciaux        | Standard actuel                |

---

## REST API — Representational State Transfer

Architecture de conception d'APIs qui utilise HTTP comme protocole de communication. Une API est dite RESTful si elle respecte les contraintes REST.

### Les 6 contraintes REST

1. **Client-Serveur** : séparation stricte entre client (UI) et serveur (data)
2. **Sans état (Stateless)** : chaque requête est indépendante, le serveur ne garde pas de session
3. **Cache** : les réponses doivent indiquer si elles sont cachables
4. **Interface uniforme** : URLs cohérentes, méthodes HTTP standard, représentations normalisées
5. **Système en couches** : le client ne sait pas s'il parle directement au serveur ou à un intermédiaire
6. **Code à la demande** (optionnel) : le serveur peut envoyer du code exécutable (ex : JavaScript)

### Conventions de nommage des endpoints

- Utiliser des **noms** (ressources), pas des verbes
- Mettre au **pluriel** : `/users` et non `/user`
- Minuscules avec tirets : `/articles-publiees`
- Hiérarchie pour les ressources imbriquées : `/users/:id/posts`

### Exemple de routes RESTful (CRUD sur `users`)

```
GET    /users          → liste de tous les utilisateurs
GET    /users/:id      → un utilisateur par ID
POST   /users          → créer un utilisateur
PUT    /users/:id      → remplacer entièrement un utilisateur
PATCH  /users/:id      → modifier partiellement un utilisateur
DELETE /users/:id      → supprimer un utilisateur
```

### REST vs GraphQL

| Critère              | REST                              | GraphQL                          |
|----------------------|-----------------------------------|----------------------------------|
| Structure            | Endpoints multiples               | Un seul endpoint (`/graphql`)    |
| Données reçues       | Fixées par le serveur             | Demandées par le client          |
| Sur-fetching         | Fréquent (trop de données)        | Évité (requête précise)          |
| Sous-fetching        | Fréquent (plusieurs requêtes)     | Évité (requête unique)           |
| Courbe d'apprentissage | Faible                          | Plus élevée                      |
| Cas d'usage idéal    | APIs simples, CRUD classique      | APIs complexes, données imbriquées |

---

## fetch() — Requêtes HTTP modernes

API native des navigateurs (et Node.js 18+) pour effectuer des requêtes HTTP. Basée sur les Promesses, elle remplace avantageusement XHR.

### Syntaxe avec async/await

```js
async function getUser(id) {
  const response = await fetch(`https://api.exemple.com/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mon-token',
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status}`);
  }

  const user = await response.json();
  return user;
}
```

### Exemple POST avec corps JSON

```js
async function createUser(data) {
  const response = await fetch('https://api.exemple.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### Gestion des erreurs

> Attention : fetch() ne rejette la promesse que sur les erreurs réseau, pas sur les codes 4xx/5xx. Il faut vérifier `response.ok` manuellement.

```js
try {
  const response = await fetch('/api/data');

  if (!response.ok) {
    throw new Error(`Erreur ${response.status} : ${response.statusText}`);
  }

  const data = await response.json();
} catch (err) {
  console.error('Requête échouée :', err.message);
}
```

---

## JSON — Format de données standard

JSON (JavaScript Object Notation) est le format d'échange de données le plus utilisé dans les APIs modernes. Léger, lisible, et nativement supporté en JavaScript.

### Structure JSON

```json
{
  "id": 1,
  "nom": "Julie",
  "email": "lesage.julie@gmail.com",
  "roles": ["admin", "editor"],
  "adresse": {
    "ville": "Paris",
    "codePostal": "75001"
  },
  "actif": true
}
```

### JSON.parse() et JSON.stringify()

```js
// Convertir une chaîne JSON en objet JS
const texte = '{"nom":"Julie","age":30}';
const objet = JSON.parse(texte);
console.log(objet.nom); // "Julie"

// Convertir un objet JS en chaîne JSON (pour l'envoyer dans une requête)
const data = { nom: 'Julie', age: 30 };
const json = JSON.stringify(data);
console.log(json); // '{"nom":"Julie","age":30}'

// Avec indentation (pour l'affichage)
console.log(JSON.stringify(data, null, 2));
```

### Bonnes pratiques JSON dans les APIs

- Toujours spécifier `Content-Type: application/json` dans les headers
- Utiliser le **camelCase** pour les clés (convention JS)
- Envelopper les listes dans un objet : `{ "users": [...] }` plutôt qu'un tableau nu
- Inclure un champ `error` ou `message` dans les réponses d'erreur
