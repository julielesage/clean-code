# Scalabilité

> Se dit d'une application capable de s'étendre sur plus de ressources si besoin : plus de serveurs, plus de données, etc. Elle a besoin d'être cloud-native, compartimentée en architecture micro-service.

> Scalability refers to an application's ability to handle increasing loads and user traffic while maintaining optimal performance. For Node.js applications, achieving scalability involves various considerations, including database optimization, caching, load balancing, and horizontal scaling.

En pratique : une app scalable ne "tombe" pas quand le trafic explose — elle s'adapte, que ce soit verticalement (plus de RAM/CPU sur la même machine) ou horizontalement (plus de machines en parallèle). Le scaling horizontal est généralement privilégié car il est plus flexible et moins coûteux à long terme.

---

## Tableau récapitulatif des outils par catégorie

| Catégorie | Outils | Usage principal |
|---|---|---|
| Cache | Redis, Memcached | Stockage en mémoire de données fréquentes |
| Message Queue | RabbitMQ, Apache Kafka | Communication asynchrone entre services |
| Load Balancer | Nginx, HAProxy, AWS ELB | Distribution du trafic entrant |
| Conteneurisation | Docker, Kubernetes | Scaling horizontal et isolation |
| CDN | Cloudflare, AWS CloudFront, Fastly | Distribution des assets statiques |
| Monitoring | Prometheus, New Relic, Grafana | Observabilité et alertes |
| Session store | Redis + express-session | Persistance de session multi-instance |
| Temps réel | Socket.IO, WebSocket | Communication bidirectionnelle client/serveur |
| Cloud | AWS, Azure, Google Cloud | Infrastructure auto-scalable |
| Tests de charge | JMeter, Artillery | Simulation de fort trafic |

---

## Optimisation des performances base de données

Gérer efficacement les opérations de base de données est crucial pour scaler les applications Node.js. Plusieurs techniques permettent d'améliorer les performances :

- **Indexation** : créer des index sur les colonnes fréquemment interrogées accélère les requêtes SELECT.
- **Dénormalisation** : dans certains cas, dupliquer des données évite des jointures coûteuses.
- **Connection pooling** : réutiliser des connexions existantes au lieu d'en ouvrir une par requête (ex: `pg-pool`, `mongoose` pool).
- **Bases NoSQL** : MongoDB, Cassandra ou DynamoDB sont conçus pour scaler horizontalement sur de gros volumes.
- **Sharding** : partitionner les données sur plusieurs serveurs selon une clé (ex: par région, par ID utilisateur).

> **Quand l'utiliser** : dès que les requêtes deviennent le goulot d'étranglement — à surveiller avec `EXPLAIN ANALYZE` en SQL ou les profilers MongoDB.

---

## Mise en cache (Caching)

Le cache stocke en mémoire les données fréquemment accédées, réduisant la charge sur la base de données et améliorant les temps de réponse. Redis et Memcached sont les solutions les plus répandues.

- **Redis** : persistant, supporte les structures de données avancées (sets, hashes, lists), idéal aussi pour les sessions.
- **Memcached** : plus simple, purement en mémoire, très rapide pour du cache clé/valeur basique.

Le cache peut s'appliquer côté serveur (résultats de requêtes DB) et côté client (HTTP cache headers, service workers).

> **Quand l'utiliser** : pour les données lues souvent et modifiées rarement (catalogue produit, résultats d'API tierces, pages rendues). Ne pas cacher des données critiques qui doivent être toujours fraîches.

```js
const express = require('express');
const redis = require('redis');
const app = express();
const port = 3000;

// Création du client Redis
const client = redis.createClient();

// Middleware : vérifie si la donnée est déjà en cache
const checkCache = (req, res, next) => {
  const { id } = req.params;

  // Recherche dans le cache Redis
  client.get(id, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      // Cache hit : réponse directe sans toucher la DB
      res.send(JSON.parse(data));
    } else {
      // Cache miss : on passe au handler suivant
      next();
    }
  });
};

// Route avec vérification du cache avant d'aller en DB
app.get('/api/products/:id', checkCache, (req, res) => {
  const { id } = req.params;

  // Simulation d'une requête DB
  const product = {
    id,
    name: 'Product ' + id
    // ... autres détails produit
  };

  // Stockage en cache avec expiration à 1 heure (3600 secondes)
  client.setex(id, 3600, JSON.stringify(product));

  res.send(product);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## Load Balancing (Répartition de charge)

Le load balancing distribue les requêtes entrantes sur plusieurs serveurs, évitant qu'un seul nœud soit saturé. Trois algorithmes principaux :

- **Round-robin** : chaque requête est envoyée au serveur suivant dans la liste, de façon cyclique. Simple et efficace pour des serveurs homogènes.
- **Least connections** : envoie la requête au serveur ayant le moins de connexions actives. Meilleur pour des requêtes de durée variable.
- **Weighted** : attribue un poids à chaque serveur selon sa capacité (un serveur plus puissant reçoit plus de trafic).

> **Quand l'utiliser** : dès qu'on dépasse une instance unique. Nginx peut faire du load balancing en quelques lignes de config. AWS ELB/ALB est la solution managée sur le cloud.

---

## Files de messages (Message Queues)

Les message queues permettent une communication asynchrone entre les composants d'une application. Les tâches lourdes (envoi d'email, traitement d'image, export PDF) sont déposées dans une file et traitées indépendamment par des workers.

- **RabbitMQ** : broker de messages AMQP, fiable, supporte les patterns pub/sub, routing, dead-letter queues.
- **Apache Kafka** : plateforme de streaming distribuée, conçue pour de très hauts volumes et la rétention de messages dans le temps.

> **Quand l'utiliser** : pour découpler des traitements qui ne nécessitent pas de réponse immédiate — envoi de notifications, génération de rapports, synchronisation entre microservices.

```js
const amqp = require('amqplib');

async function connect() {
  try {
    // Connexion au broker RabbitMQ
    const connection = await amqp.connect('amqp://localhost');

    // Création d'un canal de communication
    const channel = await connection.createChannel();

    // Déclaration de la queue (durable = survit aux redémarrages du broker)
    const queue = 'my_queue';
    await channel.assertQueue(queue, { durable: true });

    // Envoi d'un message dans la queue
    const message = 'Hello, RabbitMQ!';
    channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

    console.log('Message sent to the queue.');

    // Consommation des messages : le worker écoute et traite
    channel.consume(queue, (msg) => {
      const receivedMessage = msg.content.toString();
      console.log('Received message:', receivedMessage);

      // Accusé de réception : le message est retiré de la queue
      channel.ack(msg);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

connect();
```

---

## Scaling horizontal avec la conteneurisation (Docker)

Docker encapsule chaque composant applicatif dans un conteneur léger et isolé. On peut lancer N conteneurs en parallèle pour absorber un pic de trafic, puis les réduire quand la charge baisse.

- **Docker** : crée des images reproductibles et des conteneurs isolés.
- **Kubernetes (K8s)** : orchestrateur qui gère le déploiement, le scaling automatique et la disponibilité des conteneurs.
- **Docker Compose** : pour orchestrer plusieurs services localement (API + DB + Redis + worker).

> **Quand l'utiliser** : dès qu'on veut déployer plusieurs instances d'un service, ou garantir la reproductibilité entre les environnements (dev / staging / prod).

---

## CDN (Content Delivery Network)

Un CDN distribue les assets statiques (images, JS, CSS, vidéos) depuis des serveurs géographiquement proches de l'utilisateur final, réduisant la latence et soulageant le serveur d'origine.

- **Cloudflare** : CDN + protection DDoS + edge computing.
- **AWS CloudFront** : intégré à l'écosystème AWS (S3, Lambda@Edge).
- **Fastly** : CDN haute performance pour du contenu dynamique également.

> **Quand l'utiliser** : pour tout ce qui est statique et servi massivement. Le gain est immédiat sur le Time To First Byte (TTFB) et réduit significativement la charge serveur.

---

## Monitoring et optimisation des performances

Le monitoring continu permet d'identifier les goulots d'étranglement avant qu'ils ne deviennent des incidents. Il faut mesurer : temps de réponse, taux d'erreur, utilisation CPU/RAM, throughput.

- **Prometheus** : collecte de métriques time-series, s'interface avec Grafana pour les dashboards.
- **New Relic** : APM (Application Performance Management) complet, traces distribuées, alertes.
- **Node.js Clinic** : profiling Node.js (flamegraphs, doctor, bubbleprof).

> **Quand l'utiliser** : en permanence en production. Les métriques permettent de décider quand scaler, quoi optimiser, et de diagnostiquer les incidents.

```js
const express = require('express');
const prometheus = require('prom-client');
const clinic = require('clinic');

const app = express();
const port = 3000;

// Active la collecte automatique des métriques système (CPU, mémoire, event loop lag...)
prometheus.collectDefaultMetrics();

// Métrique custom : histogramme des durées de requêtes HTTP
const requestDurationMetric = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  buckets: [0.1, 0.5, 1, 2, 5], // Seuils en secondes pour les buckets
});

// Middleware : mesure la durée de chaque requête
const trackRequestDuration = (req, res, next) => {
  const start = process.hrtime(); // Temps haute résolution

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;

    // Enregistrement de la durée dans l'histogramme Prometheus
    requestDurationMetric.observe(durationInSeconds);
  });

  next();
};

// Application du middleware sur toutes les routes
app.use(trackRequestDuration);

// Endpoint de test avec latence aléatoire simulée
app.get('/api/test', (req, res) => {
  const delay = Math.random() * 1000;
  setTimeout(() => {
    res.send('Test endpoint');
  }, delay);
});

// Exposition des métriques pour Prometheus scraper
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.send(prometheus.register.metrics());
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Lancement du profiling Node.js Clinic
clinic({ command: 'server.js' });
```

---

## Gestion des sessions

Lorsqu'on scale sur plusieurs instances, les sessions ne peuvent plus être stockées en mémoire locale d'un seul processus — chaque requête peut atterrir sur un serveur différent. Il faut une session store partagée.

- **Redis** est la solution standard pour stocker les sessions en mémoire, rapide et centralisé.
- **express-session** avec un store Redis (`connect-redis`) garantit que toutes les instances partagent le même état de session.

> **Quand l'utiliser** : dès qu'on a plusieurs instances ou processus Node.js. Sans store partagé, l'utilisateur se déconnecte à chaque fois que sa requête change d'instance.

```js
const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

// Configuration du middleware de session
// En production : remplacer le store par défaut (mémoire) par Redis
app.use(session({
  secret: 'your-secret-key',   // Clé de signature du cookie de session
  resave: false,               // Ne re-sauvegarde pas si la session n'a pas changé
  saveUninitialized: false,    // Ne crée pas de session pour les requêtes anonymes
}));

// Endpoint pour écrire des données en session
app.get('/set', (req, res) => {
  req.session.username = 'JohnDoe';
  req.session.email = 'johndoe@example.com';
  res.send('Session data set.');
});

// Endpoint pour lire les données de session
app.get('/get', (req, res) => {
  const username = req.session.username;
  const email = req.session.email;
  res.send(`Username: ${username}, Email: ${email}`);
});

// Endpoint de déconnexion : destruction de la session
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Session destroyed.');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## Communication temps réel (Real-time)

La communication temps réel nécessite une connexion persistante entre client et serveur. WebSocket remplace le polling HTTP classique par un canal bidirectionnel permanent.

- **Socket.IO** : abstraction au-dessus de WebSocket avec fallback, rooms, namespaces, et reconnexion automatique.
- **WebSocket natif** : protocole standard, plus léger, sans les features avancées de Socket.IO.

Pour scaler des websockets, il faut un adapter partagé (ex: `socket.io-redis`) pour que les événements émis sur une instance soient diffusés à tous les clients connectés sur les autres instances.

> **Quand l'utiliser** : chat, notifications en temps réel, dashboards live, jeux multi-joueurs, collaboration en temps réel (type Google Docs).

```js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app); // Socket.IO s'attache au serveur HTTP natif
const io = socketIO(server);

// Événement déclenché à chaque nouvelle connexion client
io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  // Écoute des messages de chat envoyés par ce client
  socket.on('chat message', (message) => {
    console.log('Received message:', message);

    // Broadcast : rediffuse le message à TOUS les clients connectés
    io.emit('chat message', message);
  });

  // Nettoyage à la déconnexion
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Servir les fichiers statiques du dossier public (dont le client HTML)
app.use(express.static('public'));

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

## Sécurité à grande échelle

Lorsque l'application scale, la surface d'attaque augmente. Les mesures essentielles :

- **Validation des inputs** : toujours valider et assainir les données entrantes (Joi, Zod, express-validator).
- **Authentification et autorisation** : JWT, OAuth2, RBAC (role-based access control).
- **Protocoles sécurisés** : HTTPS/TLS obligatoire, HSTS, CORS configuré strictement.
- **Rate limiting** : limiter le nombre de requêtes par IP pour se protéger des attaques par force brute (`express-rate-limit`).
- **Secrets management** : ne jamais mettre de secrets en dur dans le code — utiliser des variables d'environnement ou des services comme AWS Secrets Manager.

> **Quand y penser** : dès le début, pas en dernier recours. La sécurité ne doit pas être un ajout tardif sur une architecture scalable.

---

## Infrastructure cloud

Les plateformes cloud (AWS, Azure, Google Cloud) offrent des services managés qui simplifient le scaling :

- **Auto-scaling groups** : augmentent ou réduisent automatiquement le nombre d'instances selon la charge.
- **Bases de données managées** : RDS, Cloud SQL, Cosmos DB — réplication et failover automatiques.
- **Serverless** : AWS Lambda, Google Cloud Functions — scaling à zéro, facturation à l'usage.
- **Kubernetes managé** : EKS (AWS), GKE (Google), AKS (Azure) — orchestration sans gérer le control plane.

> **Quand l'utiliser** : pour des workloads imprévisibles ou avec des pics de trafic. Le serverless est particulièrement adapté aux fonctions rarement appelées ou très variables. Les instances fixes sont mieux pour un trafic stable et prévisible.

---

## Tolérance aux pannes (Fault Tolerance)

Une architecture scalable doit aussi être résiliente — capable de continuer à fonctionner même si un composant tombe.

- **Redondance** : plusieurs instances derrière un load balancer, pas de Single Point of Failure.
- **Circuit breaker** : coupe les appels vers un service défaillant pour éviter les cascades d'erreurs (ex: `opossum`).
- **Graceful degradation** : si un service secondaire est indisponible, l'app continue avec des fonctionnalités réduites plutôt que de planter complètement.
- **Retry avec backoff exponentiel** : réessayer une requête qui a échoué, en augmentant le délai progressivement.
- **Health checks** : endpoints `/health` pour que le load balancer retire automatiquement les instances malades.

> **Quand l'utiliser** : indispensable en production. Tester les pannes volontairement (chaos engineering, ex: Netflix Chaos Monkey).

---

## Tests de charge et benchmarking

Valider la scalabilité d'une application avant de la mettre sous pression réelle. Il faut identifier les limites et les goulots d'étranglement en conditions simulées.

- **Apache JMeter** : outil open source de load testing avec interface graphique, simule des milliers d'utilisateurs.
- **Artillery** : CLI Node.js, scripts YAML, léger et CI-friendly.
- **Mocha + bench** : tests unitaires combinés à du benchmarking de fonctions individuelles.
- **k6** : alternative moderne, scripts en JavaScript, dashboards Grafana intégrables.

> **Quand l'utiliser** : avant chaque mise en production majeure, après des changements d'architecture, et régulièrement en intégration continue pour détecter les régressions de performance.

```js
const assert = require('assert');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const bench = require('bench');
const suite = bench.Suite;

// Tests fonctionnels avec Mocha
describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      assert.strictEqual([1, 2, 3].indexOf(4), -1);
    });
    it('should return the correct index when the value is present', () => {
      assert.strictEqual([1, 2, 3].indexOf(2), 1);
    });
  });
});

// Benchmarks de performance : compare deux implémentations
suite('Array#indexOf()', () => {
  const arr = [1, 2, 3];

  // Sans cache : recalcule l'index à chaque appel
  bench('without cache', () => {
    arr.indexOf(2);
  });

  // Avec cache : précalcule un objet de lookup une seule fois
  bench('with cache', () => {
    const cache = {};
    arr.forEach((num, index) => {
      cache[num] = index;
    });
    cache[2];
  });
});

// Lancement des tests Mocha
mocha.run();
```
