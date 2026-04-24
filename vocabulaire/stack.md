# Stack — Frameworks & Environnements

## NODE.JS

Environnement d'exécution JavaScript **cross-plateforme** basé sur le moteur V8 de Chrome. Permet d'exécuter du JS côté serveur, en dehors du navigateur. Repose sur un modèle **non-bloquant** et orienté événements, ce qui le rend particulièrement performant pour les applications I/O intensives (API, temps réel, streaming).

**Frameworks et librairies associés :**

| Catégorie | Exemples |
|---|---|
| Serveur web | Express, Koa, Fastify, Hapi |
| Temps réel | Socket.io |
| Full-stack / meta | Meteor, Nest.js |
| CMS headless | Strapi |
| Mobile hybride | React Native |

**Avantages :** même langage front et back, grande communauté npm, adapté aux architectures microservices.  
**Inconvénients :** peu adapté aux calculs CPU intensifs (monothread), gestion des erreurs asynchrones parfois complexe.

---

## React

Bibliothèque JavaScript **libre** développée par Facebook (Meta) en 2013. Facilite la création d'interfaces web via :

- **JSX** : syntaxe qui ressemble à du HTML dans du JS. `JSX` est transpilé en `React.createElement(…)` qui retourne un objet décrivant le nœud.
- **Composants réutilisables** : avec leur propre état (`state`) et leurs propriétés (`props`).
- **DOM virtuel** : React maintient une représentation en mémoire du DOM. À chaque mise à jour, il compare les `keys` de l'arbre précédent et du nouvel arbre (algorithme de _diffing_), puis n'applique que les différences au vrai DOM — ce qui optimise les performances.

```jsx
// Composant fonctionnel simple
function Salutation({ nom }) {
  return <h1>Bonjour, {nom} !</h1>;
}
```

**Avantages :** performances, modularité, écosystème riche.  
**Inconvénients :** bibliothèque uniquement (pas de routing ou state management intégré), courbe d'apprentissage liée à JSX et hooks.

---

## React — Hooks under the hood

Les hooks React reposent sur l'architecture interne appelée **Fiber** (moteur de réconciliation depuis React 16).

**Concepts clés :**

- **Fiber** : unité de travail représentant un composant. Chaque fiber possède un champ `memoizedState` qui stocke la liste chaînée des hooks appelés dans le composant.
- **Dispatcher** : objet qui expose les fonctions `useState`, `useEffect`, etc. Il change selon le contexte (premier rendu vs mise à jour), ce qui explique pourquoi l'ordre des hooks doit rester stable.
- **`useEffect`** : injecte dans `fiber.updateQueue.lastEffect.next` un objet de forme `{ tag, next, create, destroy, inputs }`. La fonction `create` est la callback, `destroy` est le retour (cleanup), `inputs` sont les dépendances.
- **`useState` = `useReducer`** : en interne, `useState` est simplement un `useReducer` avec un reducer par défaut qui retourne le nouvel état.

```js
// useState est du sucre syntaxique sur useReducer
const [count, setCount] = useState(0);
// équivaut conceptuellement à :
const [count, dispatch] = useReducer((state, newState) => newState, 0);
```

**Règle des hooks (conséquence directe de l'architecture) :**  
Ne jamais appeler un hook dans une condition ou une boucle — l'ordre doit être identique à chaque rendu pour que React retrouve le bon état dans la liste chaînée.

---

## React Native

Framework mobile **hybride** maintenu par Meta, basé sur React.

**Architecture (Bridge — historique) :**

```
Native Side  <-->  Bridge  <-->  JS Side
(UI natifs)   (JSON async)   (logique React)
```

- **JS Side** : logique applicative, composants React, gestion d'état.
- **Bridge** : couche de communication asynchrone qui sérialise/désérialise les messages JSON entre les deux mondes.
- **Native Side** : rendu des composants natifs iOS/Android réels (pas une WebView).

**Nouvelle architecture (JSI — depuis React Native 0.68+) :** supprime le Bridge au profit d'une interface JavaScript directe avec le code natif, réduisant la latence et améliorant les performances.

**Avantages :** rendu natif (fluide), partage de code entre iOS et Android, écosystème React.  
**Inconvénients :** plus lourd à configurer, certaines fonctionnalités nécessitent du code natif spécifique par plateforme.

---

## MERN Stack

Stack full-stack JavaScript populaire pour construire des applications web modernes.

| Technologie | Rôle |
|---|---|
| **M**ongoDB | Base de données orientée documents (NoSQL) |
| **E**xpress.js | Framework web minimaliste pour Node.js |
| **R**eact.js | Bibliothèque UI côté client |
| **N**ode.js | Environnement d'exécution serveur |

**Cas d'usage :** applications CRUD, dashboards, MVP — tout le code est en JavaScript/JSON, ce qui simplifie le développement et le recrutement.

---

## MEVN Stack

Variante de la MERN Stack où React est remplacé par Vue.js.

| Technologie | Rôle |
|---|---|
| **M**ongoDB | Base de données orientée documents (NoSQL) |
| **E**xpress.js | Framework web minimaliste pour Node.js |
| **V**ue.js | Framework UI progressif côté client |
| **N**ode.js | Environnement d'exécution serveur |

**Comparatif MERN vs MEVN :**

| Critère | MERN (React) | MEVN (Vue) |
|---|---|---|
| Courbe d'apprentissage | Moyenne (JSX, hooks) | Douce (templates HTML) |
| Flexibilité | Très haute (bibliothèque) | Haute (framework progressif) |
| Communauté | Très large | Large |
| Rendu conditionnel | JSX + opérateurs JS | Directives `v-if`, `v-for` |
| Cas d'usage typique | Grandes applis complexes | Applis rapides à prototyper |

---

## Apache Cordova

Framework mobile **hybride** open-source (anciennement PhoneGap). Permet de créer des applications mobiles à partir de technologies web (HTML, CSS, JS) emballées dans une **WebView** native.

**Caractéristiques :**

- Packages légers, build rapide.
- Architecture **plug-in** : on ajoute les fonctionnalités natives (caméra, GPS, etc.) via des plugins Cordova.
- Moins performant qu'une app native car tout s'exécute dans une WebView.
- Compatible iOS, Android, Windows Phone.

**Avantages :** simple d'accès pour les développeurs web, large catalogue de plugins, multiplateforme.  
**Inconvénients :** performances limitées (WebView), expérience utilisateur moins fluide, accès natif parfois restreint.

---

## React Native vs Apache Cordova

| Critère | React Native | Apache Cordova |
|---|---|---|
| Rendu | Composants UI natifs réels | WebView (HTML/CSS/JS) |
| Performances | Proches du natif | Moins bonnes (WebView) |
| Poids / complexité | Plus lourd, plus de setup | Plus léger, setup rapide |
| Accès aux APIs natives | Natif via Bridge / JSI | Via plugins JavaScript |
| Courbe d'apprentissage | Moyenne (React requis) | Faible (HTML/CSS/JS suffisent) |
| Expérience utilisateur | Fluide, look natif | Peut sembler "web" |
| Cas d'usage | Applis performantes et durables | Prototypes, applis simples |

---

## Next.js / Nuxt.js

Frameworks **SSR (Server-Side Rendering)** qui permettent de rendre des SPA côté serveur avant de les envoyer au navigateur.

**Problème des SPA classiques :**  
Les Single Page Applications sont rapides et dynamiques, mais le serveur n'envoie qu'un `index.html` vide — le contenu est généré par JavaScript côté client. Résultat : mauvais SEO (les robots crawlent du HTML vide) et temps de premier affichage élevé.

**Ce que Next.js / Nuxt.js apportent :**

- **SSR** : le premier rendu est généré côté serveur et envoyé en HTML complet — le crawler voit le contenu, le SEO s'améliore.
- **Code splitting** : le code est découpé en chunks par page (`/pages` ou `/components`). On ne charge que ce qui est nécessaire.
- **Routing simple** : chaque fichier dans `/pages` (Next) ou `/pages` (Nuxt) devient automatiquement une route.
- **Exportation statique** : possibilité de pré-générer toutes les pages en HTML statique (SSG — Static Site Generation) pour un déploiement sur un CDN, sans serveur.
- **Hydratation** : après le chargement du HTML serveur, React/Vue prend le relais côté client pour rendre l'app interactive.

```js
// Next.js — SSR à chaque requête (getServerSideProps)
export async function getServerSideProps(context) {
  const res = await fetch(`https://api.example.com/data`);
  const data = await res.json();
  return { props: { data } };
}

// Next.js — SSG à la compilation (getStaticProps)
export async function getStaticProps() {
  const res = await fetch(`https://api.example.com/data`);
  const data = await res.json();
  return { props: { data } };
}
```

| | Next.js | Nuxt.js |
|---|---|---|
| Basé sur | React | Vue.js |
| SSR | Oui | Oui |
| SSG (exportation statique) | Oui | Oui |
| File-based routing | Oui | Oui |
| Edge rendering | Oui (Edge Runtime) | Oui (Nitro) |

---

## Design System

Ensemble de **règles, composants et ressources visuelles** partagés pour garantir la cohérence d'une interface sur l'ensemble d'un produit.

**Exemples de Design Systems populaires :**

| Design System | Éditeur | Technologie |
|---|---|---|
| Material UI (MUI) | Google | React |
| Ant Design | Alibaba | React |
| Chakra UI | Open-source | React |
| Vuetify | Open-source | Vue |

**UI Kits marque blanche (white-label) :**  
Des kits d'interface génériques, sans identité visuelle forte, que des équipes ou agences peuvent personnaliser et distribuer sous leur propre marque — souvent fournis en tant que **plugins** (Figma, Sketch) ou bibliothèques de composants npm.

**Avantages d'un Design System :**
- Cohérence visuelle sur l'ensemble du produit.
- Productivité accrue (composants réutilisables, pas de réinvention de la roue).
- Collaboration facilitée entre designers et développeurs.
- Maintenance centralisée : corriger un composant le corrige partout.

---

## Tooltip

**Infobulle** — petit élément d'interface qui apparaît au survol (hover) ou au focus d'un élément, pour afficher une information contextuelle courte sans encombrer l'interface principale.

```jsx
// Exemple React : tooltip simple via CSS
function Tooltip({ texte, children }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className="tooltip-content" role="tooltip">{texte}</span>
    </div>
  );
}

// Utilisation
<Tooltip texte="Supprimer cet élément">
  <button aria-describedby="tooltip-delete">Supprimer</button>
</Tooltip>
```

**Bonnes pratiques :**
- Ne pas mettre d'informations essentielles uniquement dans un tooltip (accessibilité).
- Toujours accessible au clavier (focus) et non seulement au hover.
- Contenu court et précis (quelques mots maximum).
- Éviter les tooltips sur mobile (pas de hover) — préférer des labels visibles ou des modales.
