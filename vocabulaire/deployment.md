# Déploiement & Architecture

---

## Feature Flipping

Le feature flipping constitue un ensemble d'outils et méthodes permettant d'activer et désactiver des fonctionnalités d'une application, sans relivraison de code pour des populations distinctes. Il s'opère avec un feature flag pour activer/desactiver une fonctionnalité.

**Avantages :**
- Déploiement en continu
- Sécurisation des processus de déploiement
- Améliorer l'expérience utilisateur par l'expérimentation A/B testing
- Une plus grande réactivité en cas de cyberattaque du Système d'information (SI)

**Synonymes :** feature flagging, débrayabilité, feature toggling

### Implémentation simple (objet de config JS)

```js
// featureFlags.js
const featureFlags = {
  newDashboard: true,
  betaCheckout: false,
  darkMode: true,
};

export function isEnabled(flag) {
  return !!featureFlags[flag];
}
```

```js
// utilisation dans un composant
import { isEnabled } from './featureFlags';

if (isEnabled('newDashboard')) {
  renderNewDashboard();
} else {
  renderLegacyDashboard();
}
```

### Implémentation avec LaunchDarkly

```js
import * as LaunchDarkly from 'launchdarkly-js-client-sdk';

const client = LaunchDarkly.initialize('your-client-side-id', {
  key: 'user-123',
  email: 'user@example.com',
});

client.on('ready', () => {
  const showNewFeature = client.variation('new-feature-flag', false);

  if (showNewFeature) {
    console.log('Nouvelle fonctionnalité activée');
  }
});
```

### Bonnes pratiques

| Pratique | Description |
|---|---|
| Nettoyage des flags | Supprimer les flags obsolètes après le rollout complet pour éviter la dette technique |
| Rollout progressif | Activer la feature pour 5% → 20% → 50% → 100% des utilisateurs |
| Nommage explicite | `enable_new_checkout` plutôt que `flag_v2` |
| Durée de vie courte | Un flag ne doit pas rester indéfiniment dans le code |
| Tests avec les deux états | Tester le comportement flag ON et flag OFF |

---

## CI/CD

### Définitions

**CI — Continuous Integration (Intégration Continue)**
Pratique consistant à intégrer les modifications de code fréquemment (à chaque push ou pull request). Chaque intégration déclenche automatiquement une série de tests pour détecter les régressions rapidement.

**CD — Continuous Delivery vs Continuous Deployment**

| | Continuous Delivery | Continuous Deployment |
|---|---|---|
| Définition | Le code est automatiquement prêt à être livré en production après les tests | Le code est automatiquement déployé en production sans intervention humaine |
| Validation humaine | Oui (déclenchement manuel du déploiement) | Non (déploiement entièrement automatisé) |
| Risque | Plus contrôlé | Plus rapide, nécessite une couverture de tests solide |

### Pipeline typique

```
push → lint → test → build → deploy
```

1. **Lint** : vérification de la qualité du code
2. **Test** : tests unitaires, tests d'intégration
3. **Build** : compilation, bundling
4. **Deploy** : mise en production (staging ou production)

### Outils CI/CD

| Outil | Type | Points forts |
|---|---|---|
| GitHub Actions | Cloud (GitHub) | Intégration native GitHub, gratuit pour les projets publics |
| GitLab CI | Cloud / Self-hosted | Intégré à GitLab, très complet |
| CircleCI | Cloud | Rapide, bonne gestion du cache |
| Jenkins | Self-hosted | Très configurable, open-source, nombreux plugins |

### Exemple de workflow GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: echo "Déploiement en production..."
      # Remplacer par les commandes de déploiement réelles
```

---

## Linting

### Définition

Le linting est l'analyse statique du code source visant à détecter :
- Les erreurs de syntaxe avant l'exécution
- Les mauvaises pratiques et patterns problématiques
- Les problèmes de style et de formatage
- Les variables non utilisées, les imports manquants, etc.

### Outils principaux

| Outil | Langage cible | Rôle |
|---|---|---|
| ESLint | JavaScript / TypeScript | Analyse statique, règles personnalisables |
| Prettier | JS, TS, CSS, HTML, JSON… | Formatage automatique du code |
| Stylelint | CSS / SCSS | Analyse statique des feuilles de style |

> **ESLint vs Prettier** : ESLint détecte les erreurs logiques et de style ; Prettier reformate le code automatiquement. Les deux sont complémentaires et souvent utilisés ensemble.

### Exemple de configuration ESLint

```json
// .eslintrc.json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "eqeqeq": "error",
    "semi": ["error", "always"]
  }
}
```

### Intégration dans le pipeline CI

```yaml
# Étape lint dans GitHub Actions
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '20'
    - run: npm ci
    - run: npx eslint . --ext .js,.ts
    - run: npx prettier --check .
    - run: npx stylelint "**/*.css"
```

Le lint est placé en **première étape** du pipeline : si le code ne respecte pas les règles, les étapes suivantes (test, build, deploy) ne s'exécutent pas.

---

## Micro Frontend

### Définition

L'architecture micro frontend consiste à découper une application front-end monolithique en **modules indépendants**, chacun développé, déployé et maintenu par une équipe distincte. Chaque module expose une interface et peut être intégré dans une application hôte.

Analogie avec les microservices côté back-end : chaque équipe possède son propre périmètre fonctionnel de bout en bout.

### Avantages

| Avantage | Description |
|---|---|
| Indépendance des équipes | Chaque équipe déploie son module sans coordination globale |
| Technologies hétérogènes | Un module peut être en React, un autre en Vue.js |
| Scalabilité organisationnelle | Adapté aux grandes équipes et aux monorepos |
| Déploiement indépendant | Mise à jour d'un module sans relivraison de l'application entière |
| Réduction du couplage | Les modules communiquent via des contrats d'interface définis |

### Module Federation (Webpack 5)

Module Federation permet à plusieurs applications webpack de **partager du code à l'exécution**, sans bundler ensemble au moment du build.

```js
// webpack.config.js — application hôte (shell)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // "header" est exposé par une autre application
        header: 'header@http://localhost:3001/remoteEntry.js',
        cart: 'cart@http://localhost:3002/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

```js
// webpack.config.js — micro frontend "header"
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'header',
      filename: 'remoteEntry.js',
      exposes: {
        './Header': './src/components/Header',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
};
```

```js
// utilisation dans le shell
const Header = React.lazy(() => import('header/Header'));

function App() {
  return (
    <React.Suspense fallback="Chargement...">
      <Header />
    </React.Suspense>
  );
}
```

---

## Architecture Hexagonale

### Définition (Ports & Adapters)

L'architecture hexagonale, proposée par Alistair Cockburn, organise le code autour du **domaine métier** (le cœur de l'application). Le domaine est isolé de l'infrastructure (base de données, API externes, UI) grâce à des **ports** (interfaces) et des **adapters** (implémentations concrètes).

- **Port** : interface définie par le domaine (ce dont il a besoin)
- **Adapter** : implémentation concrète d'un port (ex. : une vraie BDD, un mock, une API REST)

### Séparation domaine / infrastructure

```
┌─────────────────────────────────────────────┐
│               Infrastructure                │
│  ┌──────────┐              ┌─────────────┐  │
│  │  REST API│              │  PostgreSQL  │  │
│  │ (adapter)│              │  (adapter)  │  │
│  └────┬─────┘              └──────┬──────┘  │
│       │                           │         │
│  ════════════════════════════════════════   │
│  ║           DOMAINE MÉTIER              ║  │
│  ║  ┌─────────────────────────────────┐ ║  │
│  ║  │  Services / Entités / Use Cases │ ║  │
│  ║  └─────────────────────────────────┘ ║  │
│  ║     Port entrant    Port sortant     ║  │
│  ════════════════════════════════════════   │
└─────────────────────────────────────────────┘
```

### Exemple en JS/TS

```ts
// Port (interface définie par le domaine)
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// Domaine : use case indépendant de l'infrastructure
class GetUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }
}

// Adapter PostgreSQL (infrastructure)
class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // requête SQL réelle
    return db.query('SELECT * FROM users WHERE id = $1', [id]);
  }

  async save(user: User): Promise<void> {
    await db.query('INSERT INTO users ...', [user.id, user.name]);
  }
}

// Adapter mémoire (pour les tests)
class InMemoryUserRepository implements UserRepository {
  private store: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }
}
```

### Bénéfices

| Bénéfice | Description |
|---|---|
| Testabilité | Le domaine peut être testé sans base de données ni serveur |
| Interchangeabilité | Changer de BDD ne touche pas au domaine |
| Lisibilité | La logique métier est claire et centralisée |
| Indépendance technologique | Le domaine ne dépend d'aucun framework |
