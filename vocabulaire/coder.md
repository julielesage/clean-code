# Coder — Concepts de programmation

---

## Fonction asynchrone — Synchrone vs Asynchrone

**Synchrone** : le code s'exécute ligne par ligne, dans l'ordre. Chaque instruction attend que la précédente soit terminée avant de s'exécuter. Si une ligne lève une exception, le programme s'arrête.

**Asynchrone** : les fonctions sont indépendantes. Elles retournent une promesse (`Promise`) et ne bloquent pas l'exécution des lignes suivantes. Le mot-clé `await` permet d'attendre le résultat d'une promesse avant de continuer.

```js
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data;
}
```

| Synchrone | Asynchrone |
|---|---|
| Bloquant | Non-bloquant |
| Simple à lire | Nécessite `async/await` ou `.then()` |
| Risque de bloquer l'UI | Idéal pour I/O, requêtes réseau |
| Exécution linéaire | Exécution en parallèle possible |

---

## Event Loop

L'**event loop** est le mécanisme central de JavaScript pour gérer l'asynchronisme dans un environnement mono-thread. C'est le fondement du fonctionnement non-bloquant de Node.js.

Elle surveille en permanence deux files d'attente :

- **Message Queue** (aussi appelée Callback Queue / Task Queue) : contient les callbacks issus de `setTimeout`, `setInterval`, les événements DOM. Traités après que la pile d'appels est vide.
- **Job Queue** (aussi appelée Microtask Queue) : contient les callbacks issus des `Promise.resolve` et `Promise.reject`. **Prioritaire** sur la Message Queue : les microtâches sont traitées avant les macrotâches.

```
Call Stack → vide → Job Queue (microtasks) → Message Queue (macrotasks)
```

```js
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Résultat : 1, 4, 3, 2
```

---

## Recherche dichotomique

La **recherche dichotomique** (ou recherche binaire) est un algorithme efficace pour trouver une valeur dans une liste **triée**.

**Principe** : on divise l'espace de recherche par deux à chaque étape en comparant la valeur cible au milieu du tableau. On recommence sur la moitié pertinente jusqu'à trouver la valeur ou épuiser les candidats.

**Complexité** : O(log n) — bien plus rapide que la recherche linéaire O(n).

```js
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}
```

Exemple : chercher 731 dans un tableau de 1 à 1000 → en 10 étapes maximum au lieu de 731.

---

## Acronymes essentiels

| Acronyme | Signification | Description |
|---|---|---|
| **ES6** | ECMAScript 2015 | Version majeure de JavaScript introduisant `let/const`, arrow functions, classes, modules, destructuring, etc. |
| **IIFE** | Immediately Invoked Function Expression | Fonction déclarée et exécutée immédiatement. Crée un scope isolé. `( () => { ... } )();` |
| **HOF** | High Order Function | Fonction qui prend une autre fonction en argument ou qui en retourne une. |
| **HOC** | High Order Component | Fonction React qui prend un composant et retourne un nouveau composant enrichi. |
| **POO** | Programmation Orientée Objet | Paradigme basé sur des classes, objets, héritage, encapsulation. |
| **RDBMS** | Relational DataBase Management System | Système de gestion de bases de données relationnelles (MySQL, PostgreSQL...). |
| **SSL** | Secure Sockets Layer | Protocole standard de chiffrement des données entre deux systèmes. |
| **TLS** | Transport Layer Security | Successeur plus sécurisé du SSL. Utilisé aujourd'hui dans HTTPS. |
| **HTTPS** | HyperText Transfer Protocol Secure | HTTP sécurisé via TLS/SSL. Indiqué dans l'URL par le cadenas. |

---

## Hissage — Hoisting

Le **hoisting** (hissage) est le comportement de JavaScript qui remonte les **déclarations** en haut du scope lors de la phase de compilation, avant l'exécution.

**Ce qui est hissé :**
- Les déclarations de fonctions (avec leur corps complet)
- Les déclarations `var` (hissées mais initialisées à `undefined`)

**Ce qui n'est PAS hissé :**
- `let` et `const` (en Temporal Dead Zone jusqu'à leur déclaration)
- Les expressions de fonctions (`const fn = () => {}`)

```js
bonjour(); // fonctionne grâce au hoisting

function bonjour() {
  console.log('Bonjour !');
}

console.log(x); // undefined (var hissée mais pas encore assignée)
var x = 5;

console.log(y); // ReferenceError
let y = 10;
```

---

## Gestion des tableaux — .map, .forEach, FlatList

| Méthode | Comportement | Valeur retournée | Cas d'usage |
|---|---|---|---|
| `.map()` | Itère et **transforme** | Nouveau tableau | Transformer chaque élément |
| `.forEach()` | Itère et **exécute** | `undefined` | Effets de bord (log, mutation) |
| `FlatList` | Composant React Native | Rendu virtuel | Listes longues sur mobile |

```js
const nombres = [1, 2, 3];

const doubles = nombres.map(n => n * 2);
// [2, 4, 6] — tableau original intact

nombres.forEach(n => console.log(n));
// Affiche 1, 2, 3 — rien retourné
```

**FlatList** (React Native) est préférable à `.map()` dans les listes longues car elle ne rend que les éléments visibles à l'écran (virtualisation), améliorant les performances.

---

## Dispatch Table — Pattern Strategy

La **dispatch table** est un objet qui mappe des clés (souvent des identifiants de stratégie) à des fonctions. C'est une alternative propre aux longues chaînes `if/else` ou `switch`.

```js
const applyDiscount = {
  [DiscountPolicies.Simple]: applyDiscountSimple,
  [DiscountPolicies.FixedPrice]: applyDiscountFixedPrice,
  [DiscountPolicies.OnRevenue]: applyDiscountOnRevenue,
  [DiscountPolicies.Quantitative]: applyDiscountQuantitative,
}[context.policy];

return applyDiscount(context);
```

**Avantages** :
- Code plus lisible et extensible (Open/Closed Principle)
- Facile à tester chaque stratégie indépendamment
- Évite les `switch` à rallonge

---

## DOM — Document Object Model

Le **DOM** est une API qui représente la structure d'une page HTML sous forme d'un arbre d'objets (Node Tree) manipulable par JavaScript.

**Composants du rendu :**

| Objet | Rôle |
|---|---|
| **DOM** | Conversion du HTML en arbre de nœuds (Node Tree) |
| **CSSOM** | Arbre des styles CSS appliqués |
| **Render Tree** | Fusion DOM + CSSOM = ce qui est réellement affiché (viewport) |
| **Devtools** | Représentation DOM + CSSOM dans les outils de développement |

**Caractéristiques du DOM :**
- Peut corriger du HTML invalide (ajoute `<head>` manquant par exemple)
- Ne contient pas les pseudo-éléments CSS (`::before`, `::after`)
- N'inclut pas les éléments cachés (`display: none`)
- Peut être modifié par JavaScript sans toucher au fichier HTML source
- Ressource vivante et dynamique

```js
const titre = document.querySelector('h1');
titre.textContent = 'Nouveau titre';
titre.style.color = 'red';
```

---

## Fonction pure

Une **fonction pure** est une fonction qui :
1. Retourne toujours le même résultat pour les mêmes arguments
2. N'a aucun **effet de bord** (ne modifie pas l'état extérieur)
3. Ne dépend d'aucune variable globale ou externe

```js
const add = (a, b) => a + b;

const tax = (price, rate) => price * (1 + rate);
```

**Avantages :**
- Plus facile à tester (résultat prévisible)
- Plus facile à déboguer (pas d'interaction avec l'environnement)
- Composable (peut être combinée avec d'autres fonctions)
- Compatible avec la mémoïsation

---

## Programmation fonctionnelle

La **programmation fonctionnelle** est un paradigme déclaratif qui privilégie :
- L'application de fonctions plutôt que la mutation d'état
- Les **fonctions pures** (sans effets de bord)
- L'**immutabilité** des données
- La composition de fonctions

Elle s'oppose à la programmation impérative (instructions pas à pas) et à la POO (objets avec état).

En JavaScript, les méthodes `.map()`, `.filter()`, `.reduce()` sont des exemples de programmation fonctionnelle.

```js
const toDos = [{ text: 'Acheter du pain', done: false }, { text: 'Coder', done: true }];

const doneItems = toDos
  .filter(todo => todo.done)
  .map(todo => todo.text);
```

---

## HOF — High Order Function

Une **High Order Function** est une fonction qui :
- Prend une ou plusieurs fonctions en argument, **et/ou**
- Retourne une fonction

Cela permet de créer des fonctions réutilisables et composables.

```js
let filterByDate = (date) => (toDo) => toDo.date === date;

let forToday = filterByDate(new Date());

toDos.filter(forToday);
```

Ici, `filterByDate` retourne une fonction — c'est une HOF. Elle est aussi curried (voir section Curried Function).

Les méthodes natives `.map()`, `.filter()`, `.reduce()` sont des HOF : elles prennent des fonctions en argument.

---

## HOC — High Order Component

Un **High Order Component** est une fonction React qui :
- Accepte un composant en argument
- Retourne un nouveau composant enrichi

C'est un pattern de réutilisation de logique entre composants (avant l'apparition des hooks).

```jsx
class NewRoute extends Component {
  render() {
    const { component: Component, ...otherProps } = this.props;

    return (
      <Route
        render={props =>
          this.props.user ? (
            <Component {...otherProps} />
          ) : (
            <Redirect to="/" />
          )
        }
      />
    );
  }
}

<NewRoute path="/foo" component={Foo} />

export default Foo(Bar);
```

Dans cet exemple, `NewRoute` est un HOC : il conditionne l'affichage du composant passé en prop selon l'état de connexion de l'utilisateur.

---

## Curried Function

Le **currying** transforme une fonction qui prend N arguments en une chaîne de N fonctions prenant chacune un seul argument.

```
(a, b, c) => result  →  a => b => c => result
```

```js
const combineFunctions = (fn1, fn2) => (toDo) => fn1(toDo) && fn2(toDo);

const byDateAndUser = combineFunctions(byDate, byUser);

toDos.filter(byDateAndUser);
```

**Avantages :**
- Application partielle : créer des fonctions spécialisées à partir d'une générique
- Composabilité accrue
- Utile en programmation fonctionnelle avec des HOF

```js
const multiply = (a) => (b) => a * b;

const double = multiply(2);
const triple = multiply(3);

double(5); // 10
triple(5); // 15
```

---

## Closure

Une **closure** (fermeture) est une fonction qui capture son **environnement lexical** — c'est-à-dire qu'elle conserve l'accès aux variables de la fonction parente, même après que celle-ci ait terminé son exécution.

```js
function bonjour(nom) {
  var texte = 'Bonjour ' + nom;

  var dire = function() {
    alert(texte);
  };

  dire();
}

bonjour('Pierre-Antoine');
```

Ici, `dire` est une closure : elle accède à `texte` qui appartient au scope de `bonjour`.

**Cas d'usage courants :**
- Encapsuler un état privé
- Créer des compteurs
- Mémoïsation

```js
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.value();     // 2
```

---

## POO — Programmation Orientée Objet

La **POO** est un paradigme qui organise le code autour d'**objets** regroupant données (propriétés) et comportements (méthodes).

**4 piliers :**
- **Encapsulation** : les données sont regroupées et protégées dans un objet
- **Héritage** : un objet peut hériter des propriétés et méthodes d'un autre
- **Polymorphisme** : un même nom de méthode peut avoir des comportements différents selon l'objet
- **Abstraction** : exposer uniquement ce qui est nécessaire

```js
class Animal {
  constructor(nom) {
    this.nom = nom;
  }

  parler() {
    return `${this.nom} fait un son.`;
  }
}

class Chien extends Animal {
  parler() {
    return `${this.nom} aboie.`;
  }
}

const rex = new Chien('Rex');
rex.parler(); // "Rex aboie."
```

En React, les composants `class` utilisent la POO avec constructeur, état (`this.state`) et méthodes de cycle de vie.

---

## Event Bubbling

L'**event bubbling** (bouillonnement d'événements) est le mécanisme par lequel un événement déclenché sur un élément enfant remonte vers ses parents dans l'arbre DOM.

**Ordre des phases :**
1. **Phase de capture** : l'événement descend de la racine vers la cible
2. **Phase cible** : l'événement atteint l'élément ciblé
3. **Phase de bouillonnement** : l'événement remonte vers la racine

```
document → html → body → div → p → span  (capture)
span → p → div → body → html → document  (bouillonnement)
```

Par défaut (depuis la normalisation W3C), le clic sur un mot (`<span>`) se déclenche avant celui du paragraphe (`<p>`).

Pour écouter en phase de capture plutôt qu'en bouillonnement :

```js
element.addEventListener('click', handler, true);
```

Pour stopper la propagation :

```js
element.addEventListener('click', (e) => {
  e.stopPropagation();
});
```

---

## Code Natif

Le **code natif** désigne un langage machine directement compris et exécuté par le processeur, sans couche d'abstraction ou d'interprétation.

- iOS utilise Swift / Objective-C compilés en code natif
- Android utilise Kotlin / Java compilés en bytecode natif

**Par opposition :**
- JavaScript est interprété (ou compilé JIT)
- React Native traduit du JS en composants UI natifs via un bridge
- Cordova encapsule une WebView — moins performant que le natif pur

Les applications natives ont généralement de meilleures performances et un accès direct aux API système.

---

## Scripts externes — Placement dans le HTML

Les scripts externes (`<script src="...">`) doivent être placés **à la fin du `<body>`**, juste avant `</body>`, pour deux raisons :

1. Ne pas bloquer le rendu du HTML (le navigateur parse de haut en bas)
2. S'assurer que le DOM est chargé avant l'exécution du script

```html
<body>
  <h1>Mon site</h1>

  <script src="app.js"></script>
</body>
```

**Alternatives modernes :**
- `defer` : charge le script en parallèle et l'exécute après le parsing HTML (dans l'ordre)
- `async` : charge et exécute dès que possible, sans ordre garanti

```html
<head>
  <script src="analytics.js" defer></script>
</head>
```

**Règle importante** : un élément `<script>` avec un attribut `src` ne doit pas contenir de code inline. Le contenu inline serait ignoré.

---

## SPA vs PWA

| | SPA | PWA |
|---|---|---|
| **Signification** | Single Page Application | Progressive Web App |
| **Nature** | Architecture de navigation | Ensemble de fonctionnalités |
| **Chargement** | Une seule fois, navigation côté client (JS) | Peut fonctionner offline |
| **Rendu** | Dynamique, sans rechargement complet | Peut être hybride (SSR + client) |
| **Installation** | Non installable | Installable sur l'écran d'accueil |
| **Notifications** | Non | Oui (Push API) |
| **SEO** | Difficile (pas de HTML serveur) | Meilleur (avec SSR ou prerender) |
| **Technologies clés** | React, Vue, Angular, routing JS | Service Worker, Cache API, Web Manifest |

**Relation entre les deux :** une app peut être SPA sans être PWA, ou SPA + PWA en même temps. Ce ne sont pas des notions exclusives.

- **SPA** répond à *comment on navigue* dans l'application
- **PWA** répond à *comment l'app se comporte* côté système (offline, push, installation)

```
SPA seule    → Gmail (navigation rapide, pas installable en natif)
SPA + PWA    → Twitter Lite (navigation rapide + offline + installable)
PWA sans SPA → Blog statique avec service worker
```
