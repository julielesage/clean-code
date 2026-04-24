# SASS — Préprocesseur CSS

SASS (Syntactically Awesome Style Sheets) est un préprocesseur CSS : il étend le CSS avec des fonctionnalités avancées (variables, fonctions, boucles, imbrication…) et compile le tout en CSS standard compris par les navigateurs.

---

## Variables

Les variables SASS commencent par `$`. Elles permettent de centraliser des valeurs réutilisées partout (couleurs, tailles, breakpoints…).

```scss
$color-primary: #3498db;
$font-size-base: 16px;
$spacing-md: 1rem;

.button {
  background-color: $color-primary;
  font-size: $font-size-base;
  padding: $spacing-md;
}
```

CSS compilé :

```css
.button {
  background-color: #3498db;
  font-size: 16px;
  padding: 1rem;
}
```

### Portée des variables

Une variable déclarée à l'intérieur d'un bloc `{}` est locale à ce bloc. Le mot-clé `!global` permet de forcer une portée globale depuis l'intérieur d'un bloc (à éviter).

```scss
$color: red; // globale

.card {
  $color: blue; // locale au bloc .card
  color: $color; // blue
}

.title {
  color: $color; // red
}
```

---

## Nesting (imbrication)

Le nesting permet d'imbriquer des sélecteurs pour refléter la structure HTML et éviter la répétition.

```scss
.nav {
  background: #fff;

  ul {
    list-style: none;
  }

  li {
    display: inline-block;
  }

  a {
    color: $color-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

CSS compilé :

```css
.nav { background: #fff; }
.nav ul { list-style: none; }
.nav li { display: inline-block; }
.nav a { color: #3498db; text-decoration: none; }
.nav a:hover { text-decoration: underline; }
```

Le `&` fait référence au sélecteur parent courant.

> **Attention** : ne pas dépasser 3 niveaux d'imbrication. Un nesting trop profond génère des sélecteurs CSS très spécifiques, difficiles à surcharger et à maintenir.

---

## Opérateurs

SASS supporte les opérations mathématiques directement dans le code.

```scss
$container-width: 960px;
$columns: 12;

.column {
  width: $container-width / $columns; // 80px
  margin: 10px * 2;                   // 20px
  padding: (1rem + 0.5rem);           // 1.5rem
}
```

CSS compilé :

```css
.column {
  width: 80px;
  margin: 20px;
  padding: 1.5rem;
}
```

> Avec les versions récentes de SASS, préférer la fonction `math.div()` du module `sass:math` plutôt que `/` pour les divisions, car `/` est ambigu en CSS (ex. `font: 12px/1.5`).

```scss
@use 'sass:math';

.column {
  width: math.div($container-width, $columns);
}
```

---

## Mixin

Un mixin est un bloc de styles réutilisable qui peut accepter des paramètres. Il génère **plusieurs lignes de CSS** une fois compilé.

```scss
@mixin flex-center($direction: row) {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: $direction;
}

.hero {
  @include flex-center();
}

.sidebar {
  @include flex-center(column);
}
```

CSS compilé :

```css
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}

.sidebar {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
```

Les mixins sont idéales pour les patterns répétitifs avec variations : media queries, prefixes vendor, reset de listes, etc.

---

## Function

Une fonction SASS retourne **une seule valeur** (nombre, couleur, chaîne…). Elle ne génère pas de CSS directement — elle est utilisée dans une déclaration de propriété.

```scss
@function rem($px, $base: 16) {
  @return math.div($px, $base) * 1rem;
}

.title {
  font-size: rem(24);   // 1.5rem
  margin-bottom: rem(8); // 0.5rem
}
```

CSS compilé :

```css
.title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
```

### Function vs Mixin — différence fondamentale

| | Mixin (`@mixin` / `@include`) | Function (`@function` / `@return`) |
|---|---|---|
| Retourne | Plusieurs règles CSS | Une seule valeur |
| S'utilise | Comme un bloc de styles | Dans une valeur de propriété |
| Cas d'usage | Patterns de styles, vendor prefixes | Calculs, conversions d'unités |

```scss
// Mixin → génère plusieurs propriétés CSS
@mixin button-style($bg) {
  background: $bg;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
}

// Function → retourne une valeur unique
@function darken-custom($color, $amount) {
  @return mix(black, $color, $amount);
}

.btn-primary {
  @include button-style(darken-custom(#3498db, 10%));
}
```

> **Règle simple** : si tu as besoin de générer du CSS (plusieurs propriétés), utilise un mixin. Si tu as besoin d'une valeur calculée à injecter dans une propriété, utilise une function.

---

## @extend

`@extend` permet à un sélecteur d'hériter des styles d'un autre sélecteur, sans dupliquer les règles CSS.

```scss
.message {
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.message--error {
  @extend .message;
  background: #e74c3c;
  color: #fff;
}

.message--success {
  @extend .message;
  background: #2ecc71;
  color: #fff;
}
```

CSS compilé :

```css
.message, .message--error, .message--success {
  padding: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.message--error {
  background: #e74c3c;
  color: #fff;
}

.message--success {
  background: #2ecc71;
  color: #fff;
}
```

SASS regroupe les sélecteurs qui partagent les mêmes styles — le CSS généré est compact.

### @extend vs Mixin

| | `@extend` | `@mixin` |
|---|---|---|
| CSS généré | Sélecteurs groupés (compact) | Styles dupliqués dans chaque classe |
| Paramètres | Non | Oui |
| Flexibilité | Faible (couplage entre classes) | Forte |
| Recommandé si | Styles identiques sans variation | Styles avec variations / paramètres |

> **Attention** : `@extend` peut produire des sélecteurs CSS inattendus si utilisé dans des contextes imbriqués ou avec des media queries. Préférer un mixin sans paramètre dans les cas complexes.

Le placeholder `%` (`%message`) est une variante de `@extend` qui ne génère pas de classe CSS seule — uniquement les sélecteurs qui l'étendent.

```scss
%visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.sr-only {
  @extend %visually-hidden;
}
```

---

## Partials et @use / @import

### Partials

Un partial est un fichier SASS dont le nom commence par `_`. Il n'est pas compilé seul — il est destiné à être importé dans d'autres fichiers.

```
styles/
  _variables.scss
  _mixins.scss
  _buttons.scss
  main.scss
```

### @use (méthode moderne)

`@use` charge un fichier et crée un namespace pour éviter les collisions de noms.

```scss
// main.scss
@use 'variables';   // importe _variables.scss
@use 'mixins';
@use 'buttons';

.hero {
  color: variables.$color-primary;  // accès via namespace
  @include mixins.flex-center();
}
```

### @import (méthode historique — dépréciée)

```scss
// main.scss
@import 'variables';
@import 'mixins';
@import 'buttons';

.hero {
  color: $color-primary;  // accès direct, sans namespace
}
```

> **Préférer `@use`** : `@import` est déprécié depuis SASS 1.23 et sera supprimé dans une future version. `@use` évite les conflits de noms, charge chaque fichier une seule fois et améliore les performances de compilation.

`@forward` complète `@use` pour ré-exporter des variables/mixins depuis un fichier index.

```scss
// _index.scss
@forward 'variables';
@forward 'mixins';

// main.scss
@use 'index' as *;
// ou avec namespace : @use 'index';
```
