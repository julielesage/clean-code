# Plugins & Outils de build

---

## Webpack

**Module bundler** : outil qui analyse le graphe de dépendances d'un projet (JS, CSS, images, fonts…) et les regroupe en un ou plusieurs fichiers optimisés pour le navigateur.

**Ce que Webpack fait :**

| Fonctionnalité | Description |
|---|---|
| **Bundling** | Regroupe tous les modules JS en un seul fichier (ou plusieurs chunks) |
| **Minification** | Supprime espaces, commentaires, raccourcit les noms de variables |
| **Optimisation CSS** | Extrait et minifie les feuilles de style via `MiniCssExtractPlugin` |
| **Optimisation images** | Compresse les images via `image-webpack-loader` |
| **Tree shaking** | Supprime le code mort (modules importés mais non utilisés) |
| **Code splitting** | Découpe le bundle en chunks chargés à la demande (`import()`) |
| **Hot Module Replacement** | Recharge uniquement le module modifié sans recharger la page entière |
| **Dev server** | Serveur local avec auto-refresh (`webpack-dev-server`) |
| **Exclude à la compilation** | Exclure des fichiers/dossiers via `exclude: /node_modules/` dans les règles de loader |

**Fichier de config minimal — `webpack.config.js` :**

```js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'styles.[contenthash].css' }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
  },
};
```

**Gestion des modules :** Webpack comprend les modules CommonJS (`require`) et ES Modules (`import/export`). Il résout automatiquement les chemins et construit le graphe de dépendances depuis le point d'entrée (`entry`).

**Exclude à la compilation :** la propriété `exclude` dans une règle de loader empêche Webpack de transformer certains fichiers (ex. `node_modules` est toujours exclu du transpilage Babel pour des raisons de performance).

```js
// Exclure node_modules ET un dossier spécifique
{
  test: /\.js$/,
  exclude: [/node_modules/, /legacy/],
  use: 'babel-loader',
}
```

---

## Babel

**Transpileur** : compilateur JavaScript qui convertit du code ES2015+ (et JSX) en JavaScript compatible avec les navigateurs cibles.

**Problème résolu :** les navigateurs anciens ne comprennent pas les fonctionnalités JS modernes (`async/await`, classes, arrow functions, optional chaining…). Babel traduit ce code en une version plus ancienne que tous les navigateurs peuvent exécuter.

**Ce que Babel compile :**

| Syntaxe source | Sortie |
|---|---|
| JSX (`<Component />`) | `React.createElement(Component, null)` |
| Arrow function (`() => {}`) | `function() {}` |
| `async/await` | Chaîne de Promises |
| Classes ES6 | Fonctions constructeurs |
| Modules `import/export` | `require` / `module.exports` (si nécessaire) |
| Optional chaining (`?.`) | Ternaire avec vérification `null` |

**Fichier de config `.babelrc` :**

```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.25%, not dead",
      "useBuiltIns": "usage",
      "corejs": 3
    }],
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-optional-chaining"
  ]
}
```

**Ou en `babel.config.js` (recommandé pour les monorepos) :**

```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: '> 0.25%, not dead' }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};
```

**Presets courants :**

| Preset | Rôle |
|---|---|
| `@babel/preset-env` | Transpile ES2015+ selon les navigateurs cibles |
| `@babel/preset-react` | Transpile JSX en `React.createElement` |
| `@babel/preset-typescript` | Supprime les types TypeScript (sans vérification) |

Babel ne fait **pas** de vérification de types — c'est le rôle de TypeScript (`tsc`).

---

## Polyfill

**Implémentation de méthode manquante** : code JavaScript qui reproduit une fonctionnalité native absente dans certains navigateurs, en la définissant si elle n'existe pas.

**Principe :** on vérifie si la méthode existe sur le prototype ou l'objet global. Si non, on la définit manuellement avec une implémentation compatible.

**Vérification de compatibilité :** utiliser [caniuse.com](https://caniuse.com) pour savoir si une API est supportée sur les navigateurs cibles avant de décider si un polyfill est nécessaire.

**Exemple — polyfill pour `Array.prototype.includes` :**

```js
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
    if (this == null) throw new TypeError('"this" is null or not defined');

    const o = Object(this);
    const len = o.length >>> 0;

    if (len === 0) return false;

    const n = fromIndex | 0;
    let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (o[k] === searchElement) return true;
      k++;
    }

    return false;
  };
}
```

**Exemple — polyfill pour `fetch` avec la librairie `whatwg-fetch` :**

```js
// installation
// npm install whatwg-fetch

// dans le point d'entrée de l'app
import 'whatwg-fetch';

// fetch est maintenant disponible partout, même sur IE11
fetch('/api/data').then(res => res.json());
```

**Polyfills automatiques avec Babel + core-js :**

```json
// .babelrc — Babel injecte uniquement les polyfills nécessaires
{
  "presets": [[
    "@babel/preset-env",
    {
      "useBuiltIns": "usage",
      "corejs": 3
    }
  ]]
}
```

| Approche | Avantage | Inconvénient |
|---|---|---|
| Polyfill manuel | Léger, ciblé | Maintenance à la charge du dev |
| `core-js` via Babel | Automatique, précis | Augmente la taille du bundle |
| CDN polyfill.io | Ciblé par User-Agent | Dépendance externe, latence |

---

## PartyTown

**Bibliothèque de lazy loading de scripts tiers** : déplace l'exécution des scripts tiers (analytics, publicité, chat…) dans un **Web Worker**, libérant ainsi le thread principal pour l'interface utilisateur.

**Problème résolu :** les scripts tiers (Google Analytics, Intercom, HubSpot…) bloquent le thread principal de JavaScript, ralentissant le TTI (Time to Interactive) et dégradant les métriques Core Web Vitals.

**Ce que PartyTown fait :**

- Intercepte les scripts tiers en les redirigeant vers un Web Worker
- Le thread principal reste libre pour les interactions utilisateur
- **Démarrage plus rapide** de la page (amélioration du FID / INP)
- Compatible avec les scripts qui accèdent à `window`, `document`, etc. (via proxy synchrone)

**Intégration avec Next.js :**

```jsx
import { Html, Head, Main, NextScript } from 'next/document';
import { createScriptURL } from '@builder.io/partytown/integration';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* PartyTown copie les fichiers dans /~partytown */}
        <script
          data-partytown-config
          dangerouslySetInnerHTML={{
            __html: `partytown = { lib: '/_next/static/~partytown/' }`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Script tiers déplacé dans le Web Worker */}
        <script
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
      </body>
    </Html>
  );
}
```

**Résumé :**

| Sans PartyTown | Avec PartyTown |
|---|---|
| Scripts tiers sur le thread principal | Scripts tiers dans un Web Worker |
| Bloque l'UI pendant l'exécution | Thread principal libre |
| TTI plus lent | Démarrage plus rapide |

---

## Forest Admin

**Création de backoffices** : outil SaaS et open-source qui génère automatiquement un panneau d'administration (backoffice) à partir d'une base de données ou d'une API existante.

**Cas d'usage :**

- Gestion des utilisateurs, commandes, contenus sans développer d'interface admin from scratch
- Actions personnalisées sur les données (approuver une commande, envoyer un email…)
- Contrôle d'accès par rôles (RBAC)
- Visualisation et filtrage avancé des données

**Fonctionnement :**

1. Forest Admin se connecte à la base de données (PostgreSQL, MySQL, MongoDB, etc.)
2. Il génère automatiquement les vues CRUD pour chaque collection/table
3. L'interface est configurable via un éditeur visuel ou du code (Forest Admin Agent)
4. Les données restent dans l'infrastructure du client (Forest Admin n'héberge pas les données)

**Avantages :**

| Critère | Détail |
|---|---|
| Rapidité | Backoffice opérationnel en quelques heures |
| Personnalisation | Actions, champs calculés, vues personnalisées |
| Sécurité | SSO, RBAC, audit log des actions |
| Souveraineté | Les données restent chez le client |

---

## React Profiler

**Outil de mesure des performances de rendu** : composant React et outil DevTools qui collecte des informations sur le temps de rendu de chaque composant afin d'identifier les goulets d'étranglement.

**Deux usages :**

### 1. DevTools Profiler (onglet "Profiler" dans React DevTools)

- Enregistre les rendus pendant une session d'interaction
- Affiche un flame graph : chaque barre = un composant, la largeur = le temps de rendu
- Identifie les composants qui rendent trop souvent ou trop lentement
- Indique la raison du re-rendu (`props changed`, `state changed`, `hooks changed`, `parent rendered`)

### 2. `<Profiler>` composant (programmatique)

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id,           // identifiant du Profiler
  phase,        // "mount" ou "update"
  actualDuration, // temps de rendu du sous-arbre (ms)
  baseDuration,   // temps estimé sans mémoïsation
  startTime,      // heure de début du rendu
  commitTime      // heure de commit dans le DOM
) {
  console.log(`[${id}] ${phase} — ${actualDuration.toFixed(2)}ms`);
}

function App() {
  return (
    <Profiler id="Navigation" onRender={onRenderCallback}>
      <Navigation />
    </Profiler>
  );
}
```

**Métriques clés :**

| Métrique | Description |
|---|---|
| `actualDuration` | Temps réel passé à rendre le composant et ses enfants |
| `baseDuration` | Temps estimé sans optimisation (`React.memo`, etc.) |
| `phase` | `mount` (premier rendu) ou `update` (re-rendu) |

**Workflow d'optimisation :**

1. Lancer le Profiler sur une interaction lente
2. Identifier le composant le plus lent dans le flame graph
3. Vérifier si le re-rendu est justifié (props/state ont-ils vraiment changé ?)
4. Appliquer `React.memo`, `useMemo` ou `useCallback` si nécessaire
5. Re-profiler pour vérifier l'amélioration

```jsx
// Avant optimisation — ListItem re-rend à chaque fois
function ListItem({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
}

// Après optimisation — mémoïsation du composant et du callback
const ListItem = React.memo(function ListItem({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

// Dans le parent
const handleSelect = useCallback((id) => {
  setSelected(id);
}, []);
```

Le Profiler n'est disponible qu'en **mode développement**. En production, il est désactivé automatiquement pour ne pas impacter les performances.
