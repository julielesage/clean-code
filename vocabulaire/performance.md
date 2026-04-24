# Performance

---

## Cache & Redis

### Concept du cache applicatif

Le cache applicatif consiste à stocker temporairement des données coûteuses à recalculer ou à récupérer (requêtes BDD, appels API, calculs lourds) afin de les servir plus rapidement lors des accès suivants.

**Pourquoi cacher ?**
- Réduire la latence des réponses
- Diminuer la charge sur la base de données
- Améliorer la scalabilité sans augmenter l'infrastructure

---

### `@Cacheable` — annotation Spring / NestJS

En **Spring Boot (Java)**, `@Cacheable` est une annotation qui met automatiquement en cache le résultat d'une méthode :

```java
@Cacheable(value = "produits", key = "#id")
public Produit getProduitById(Long id) {
    return produitRepository.findById(id).orElseThrow();
}
```

En **NestJS (TypeScript)**, via le module `cache-manager` :

```typescript
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';

@UseInterceptors(CacheInterceptor)
@CacheKey('liste_produits')
@CacheTTL(60) // secondes
async getProduits() {
  return this.produitsService.findAll();
}
```

---

### Redis comme store de cache distribué

**Redis** (Remote Dictionary Server) est une base de données en mémoire utilisée comme store de cache distribué. Il est rapide (sub-milliseconde), supporte TTL natif et est accessible depuis plusieurs instances de l'application.

Installation et usage basique en Node.js avec `ioredis` :

```js
const Redis = require('ioredis');
const redis = new Redis(); // connexion localhost:6379 par défaut

// Mise en cache d'une requête
async function getProduit(id) {
  const cacheKey = `produit:${id}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached); // retour depuis le cache
  }

  const produit = await db.query('SELECT * FROM produits WHERE id = ?', [id]);
  await redis.set(cacheKey, JSON.stringify(produit), 'EX', 3600); // TTL 1h

  return produit;
}
```

---

### TTL (Time to Live) et invalidation du cache

Le **TTL** définit la durée de vie d'une entrée en cache. Une fois expiré, l'entrée est supprimée automatiquement.

```js
// TTL de 600 secondes (10 minutes)
await redis.set('cle', 'valeur', 'EX', 600);

// Vérifier le TTL restant
const ttl = await redis.ttl('cle'); // retourne les secondes restantes

// Supprimer manuellement (invalidation explicite)
await redis.del('produit:42');
```

**Invalidation du cache** : supprimer ou mettre à jour une entrée quand la donnée source change (ex. : après une modification en BDD).

---

### Patterns de cache

| Pattern | Description | Avantage | Inconvénient |
|---|---|---|---|
| **Cache-aside** | L'app vérifie le cache, sinon charge la BDD et met en cache | Contrôle total | Code de gestion explicite |
| **Write-through** | Chaque écriture en BDD met aussi à jour le cache | Cache toujours à jour | Latence d'écriture plus élevée |
| **Write-behind** | L'écriture va d'abord dans le cache, puis en BDD de manière asynchrone | Écriture très rapide | Risque de perte de données |

---

## Lighthouse

### Qu'est-ce que Lighthouse ?

**Lighthouse** est un outil d'audit open-source développé par Google, intégré dans les **Chrome DevTools** (onglet "Lighthouse"). Il analyse une page web et génère un rapport de performance et de qualité.

Il peut aussi être utilisé en ligne de commande :

```bash
npx lighthouse https://mon-site.com --output html --output-path ./rapport.html
```

---

### Les 5 catégories auditées

| Catégorie | Description |
|---|---|
| **Performance** | Vitesse de chargement et rendu de la page |
| **Accessibilité** | Conformité aux standards WCAG, lisibilité pour tous |
| **Best Practices** | Bonnes pratiques web (HTTPS, console errors, etc.) |
| **SEO** | Optimisation pour les moteurs de recherche |
| **PWA** | Conformité Progressive Web App (offline, manifest, etc.) |

---

### Les métriques Core Web Vitals

Les **Core Web Vitals** sont les métriques clés de Lighthouse pour évaluer l'expérience utilisateur :

| Métrique | Signification | Seuil "bon" |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Temps d'affichage du plus grand élément visible | < 2,5 s |
| **INP** (Interaction to Next Paint) | Réactivité aux interactions utilisateur | < 200 ms |
| **CLS** (Cumulative Layout Shift) | Stabilité visuelle, décalages de mise en page | < 0,1 |

> Note : FID (First Input Delay) a été remplacé par INP depuis mars 2024.

---

### Interpréter le score Lighthouse

- **90-100** : Bon (vert)
- **50-89** : A améliorer (orange)
- **0-49** : Mauvais (rouge)

Chaque catégorie produit un score de 0 à 100. Le score de performance est une moyenne pondérée des métriques Core Web Vitals et d'autres indicateurs (TTFB, FCP, Speed Index, TTI, TBT).

---

### Mobile First

Lighthouse simule par défaut un appareil **mobile** avec une connexion réseau simulée (4G lente). C'est intentionnel : Google favorise l'indexation mobile-first. Un bon score mobile garantit une expérience correcte sur tous les supports.

```bash
# Audit desktop uniquement
npx lighthouse https://mon-site.com --preset=desktop
```

---

## APM — Application Performance Management

L'**APM** désigne l'ensemble des pratiques et outils permettant de surveiller et gérer les performances des applications en production.

### Les 5 actions clés de l'APM

1. **Suivi de l'expérience de l'utilisateur final** — mesurer les temps de réponse et la qualité de l'expérience perçue par l'utilisateur (Real User Monitoring)
2. **Découverte et modélisation de l'architecture d'exécution des applications** — cartographier automatiquement les services, dépendances et flux de données
3. **Profilage des transactions défini par l'utilisateur** — tracer des transactions métier précises de bout en bout (ex. : parcours d'achat)
4. **Suivi des composantes de l'application** — monitorer chaque composant (base de données, files de messages, micro-services)
5. **Rapports et analyse des données d'application** — générer des tableaux de bord, alertes et analyses de tendances

---

### Outils APM

| Outil | Type | Points forts |
|---|---|---|
| **New Relic** | SaaS | Full-stack, facile à intégrer, AI insights |
| **Datadog** | SaaS | Logs + métriques + traces unifiés |
| **Dynatrace** | SaaS | IA avancée, auto-découverte des services |
| **Prometheus** | Open-source | Métriques time-series, écosystème Kubernetes |

---

### Métriques clés à surveiller

| Métrique | Description |
|---|---|
| **Latence (p95, p99)** | Temps de réponse pour 95 % ou 99 % des requêtes |
| **Taux d'erreur** | Pourcentage de requêtes en erreur (4xx, 5xx) |
| **Throughput** | Nombre de requêtes traitées par seconde (RPS) |
| **Apdex** | Score de satisfaction utilisateur (0 à 1) |
| **CPU / Mémoire** | Utilisation des ressources serveur |
| **Temps de réponse BDD** | Latence des requêtes SQL/NoSQL |

---

## Grafana

### Qu'est-ce que Grafana ?

**Grafana** est un outil open-source de **visualisation de métriques et de logs**. Il permet de créer des dashboards interactifs à partir de diverses sources de données (Prometheus, Loki, InfluxDB, Elasticsearch, etc.).

---

### Dashboards et alertes

- **Dashboards** : panneaux configurables avec graphiques, jauges, heatmaps, tableaux. Chaque panneau requête une source de données.
- **Alertes** : règles définissant des seuils sur des métriques. En cas de dépassement, Grafana notifie via Slack, PagerDuty, email, etc.

```yaml
# Exemple de règle d'alerte Grafana (YAML)
alert: HauteLatence
expr: http_request_duration_seconds{quantile="0.95"} > 2
for: 5m
labels:
  severity: warning
annotations:
  summary: "Latence p95 > 2s depuis 5 minutes"
```

---

### Intégration avec Prometheus

**Prometheus** collecte les métriques en scrapant des endpoints `/metrics` exposés par les applications. **Grafana** se connecte à Prometheus comme source de données et visualise ces métriques en temps réel.

```
Application → expose /metrics → Prometheus scrape → Grafana dashboard
```

Exemple de métrique exposée en Node.js avec `prom-client` :

```js
const client = require('prom-client');

const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
});

// Dans le middleware Express
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});
```

---

## PIM — Product Information Management

### Définition

Le **PIM** (Product Information Management) est un système centralisé permettant de gérer, enrichir et distribuer les informations produits (descriptions, images, attributs techniques, prix, traductions) vers différents canaux de vente.

---

### Cas d'usage e-commerce

- Centraliser les fiches produits provenant de fournisseurs multiples
- Gérer les variantes (tailles, couleurs, langues) dans un seul référentiel
- Publier automatiquement vers un site e-commerce, une marketplace, un catalogue papier
- Garantir la cohérence des données produits sur tous les canaux (omnicanal)

---

### Outils PIM

| Outil | Type | Points forts |
|---|---|---|
| **Akeneo** | Open-source / SaaS | Très répandu, interface intuitive, API REST |
| **Pimcore** | Open-source | PIM + DAM + CMS intégrés, très flexible |
| **Contentful** | SaaS headless CMS | API-first, adapté contenu + produits simples |

---

## Optimisation front-end

### Lazy loading des images

Charger les images uniquement lorsqu'elles entrent dans le viewport, réduisant le temps de chargement initial :

```html
<img src="photo.jpg" loading="lazy" alt="Description" />
```

En JavaScript (Intersection Observer) :

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
```

---

### Code splitting (Webpack)

Diviser le bundle JavaScript en chunks chargés à la demande, réduisant le bundle initial :

```js
// Import dynamique (ES2020)
const MonComposant = () => import('./MonComposant.js');

// Avec React (lazy loading de composant)
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

Dans `webpack.config.js`, la configuration `splitChunks` automatise ce découpage :

```js
optimization: {
  splitChunks: {
    chunks: 'all',
  },
},
```

---

### Minification

Supprimer les espaces, commentaires et raccourcir les noms de variables pour réduire la taille des fichiers :

- **JS** : Terser (intégré dans Webpack en mode production)
- **CSS** : CSSNano, csso
- **HTML** : html-minifier-terser

```bash
# Build de production Webpack (minification automatique)
webpack --mode production
```

---

### Compression Gzip / Brotli

Compresser les assets côté serveur avant de les envoyer au navigateur :

| Algorithme | Taux de compression | Support navigateur |
|---|---|---|
| **Gzip** | Bon | Universel |
| **Brotli** | Meilleur (+20-26%) | Tous navigateurs modernes |

Configuration Express avec compression :

```js
const compression = require('compression');
app.use(compression()); // Gzip par défaut
```

Configuration Nginx (Brotli) :

```nginx
brotli on;
brotli_comp_level 6;
brotli_types text/html text/css application/javascript application/json;
```
