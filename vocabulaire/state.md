# State Management

---

## Redux (et assimilés : Vuex, react-context…)

> Librairie qui centralise les données et les actions, elle structure en 3 principes l'état de l'application, qui est la source unique de vérité, en lecture seule. Les reducers doivent être des fonctions pures. (Reducer + flux = redux)
>
> Un magasin de données envoie une props à un composant, l'action dispatcher envoie l'info au reducer qui met à jour le magasin de données.

### Les 3 principes de Redux

1. **Source unique de vérité** — tout l'état de l'application vit dans un seul store.
2. **État en lecture seule** — on ne modifie jamais le state directement ; on dispatche une action.
3. **Reducers purs** — les reducers sont des fonctions pures : `(state, action) => newState`, sans effets de bord.

### Flux de données

```
Store → props → Composant → dispatch(action) → Reducer → nouveau state → Store
```

### Exemples de code

**Action**

```js
// actions/counter.js
export const INCREMENT = 'INCREMENT';
export const DECREMENT = 'DECREMENT';

export const increment = () => ({ type: INCREMENT });
export const decrement = () => ({ type: DECREMENT });
```

**Reducer**

```js
// reducers/counter.js
import { INCREMENT, DECREMENT } from '../actions/counter';

const initialState = { count: 0 };

export default function counterReducer(state = initialState, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, count: state.count + 1 };
    case DECREMENT:
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}
```

**Store**

```js
// store.js
import { createStore } from 'redux';
import counterReducer from './reducers/counter';

const store = createStore(counterReducer);
export default store;
```

**Connexion avec un composant React (connect)**

```jsx
// Counter.jsx
import React from 'react';
import { connect } from 'react-redux';
import { increment, decrement } from './actions/counter';

function Counter({ count, increment, decrement }) {
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

const mapStateToProps = (state) => ({ count: state.count });
const mapDispatchToProps = { increment, decrement };

export default connect(mapStateToProps, mapDispatchToProps)(Counter);
```

### Quand utiliser Redux

- App de grande taille avec beaucoup de composants partageant le même état.
- Besoin de traçabilité des actions (Redux DevTools, time-travel debugging).
- Logique métier complexe avec de nombreux effets de bord (redux-thunk, redux-saga).
- Équipe importante : Redux impose une structure stricte qui aide à la cohérence.

---

## React Context

Alternative légère à Redux pour les petites et moyennes applications. Intégré nativement dans React, sans dépendance supplémentaire.

### Exemple : createContext, Provider, useContext

```jsx
// ThemeContext.js
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

```jsx
// App.jsx
import { ThemeProvider } from './ThemeContext';
import Page from './Page';

export default function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}
```

```jsx
// Page.jsx
import { useTheme } from './ThemeContext';

export default function Page() {
  const { theme, setTheme } = useTheme();
  return (
    <div className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Basculer le thème
      </button>
    </div>
  );
}
```

### Quand préférer Context vs Redux

| Critère | React Context | Redux |
|---|---|---|
| Taille de l'app | Petite / moyenne | Grande |
| Complexité du state | Simple (thème, user, locale) | Complexe, imbriqué |
| Performances | Re-renders possibles | Optimisé avec selectors |
| Boilerplate | Minimal | Élevé |
| DevTools / debug | Limité | Excellent (Redux DevTools) |
| Effets de bord | useEffect | redux-thunk / redux-saga |

---

## Zustand (bonus)

Alternative moderne et légère à Redux. Pas de boilerplate, API minimaliste, compatible React et Vanilla JS.

### Exemple minimal

```js
// store.js
import { create } from 'zustand';

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

export default useCounterStore;
```

```jsx
// Counter.jsx
import useCounterStore from './store';

export default function Counter() {
  const { count, increment, decrement } = useCounterStore();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

Zustand ne nécessite ni Provider ni connect — le store est directement consommé via un hook.

---

## Vuex

L'équivalent Redux pour Vue.js (remplacé par Pinia dans les nouveaux projets Vue 3, mais Vuex reste très répandu).

### Structure

```
State → Getters → Composant
Composant → dispatch(action) → Action → commit(mutation) → Mutation → State
```

### Exemple

```js
// store/index.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    count: 0,
  },

  getters: {
    doubleCount: (state) => state.count * 2,
  },

  mutations: {
    INCREMENT(state) {
      state.count++;
    },
    DECREMENT(state) {
      state.count--;
    },
  },

  actions: {
    increment({ commit }) {
      commit('INCREMENT');
    },
    decrement({ commit }) {
      commit('DECREMENT');
    },
  },
});
```

```vue
<!-- Counter.vue -->
<template>
  <div>
    <button @click="$store.dispatch('decrement')">-</button>
    <span>{{ $store.state.count }}</span>
    <button @click="$store.dispatch('increment')">+</button>
    <p>Double : {{ $store.getters.doubleCount }}</p>
  </div>
</template>
```

| Concept | Rôle |
|---|---|
| `state` | Source unique de vérité |
| `mutations` | Seule façon de modifier le state (synchrone) |
| `actions` | Logique asynchrone, appellent les mutations |
| `getters` | State dérivé (équivalent des computed properties) |

---

## IndexedDB

> Large scale storage, noSQL, dans le navigateur pour de plus gros volume de data que les cookies et éviter d'utiliser Redux, mais peu conseillé.

Base de données NoSQL intégrée au navigateur, orientée objets, avec support des transactions.

### Cas d'usage

- Stocker de grandes quantités de données côté client (catalogues produits, assets, données offline).
- Applications Progressive Web App (PWA) avec mode hors-ligne.
- Caching de réponses API volumineuses pour éviter des allers-retours réseau.
- Alternative à Redux quand les données sont purement locales et n'ont pas besoin d'être partagées en temps réel entre composants.

### Exemple minimal

```js
// Ouverture / création de la base
const request = indexedDB.open('maBase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  db.createObjectStore('produits', { keyPath: 'id' });
};

request.onsuccess = (event) => {
  const db = event.target.result;

  // Écriture
  const tx = db.transaction('produits', 'readwrite');
  tx.objectStore('produits').add({ id: 1, nom: 'Stylo', prix: 1.5 });

  // Lecture
  const getTx = db.transaction('produits', 'readonly');
  const getRequest = getTx.objectStore('produits').get(1);
  getRequest.onsuccess = () => console.log(getRequest.result);
};
```

> En pratique, on utilise des wrappers comme **idb** (Jake Archibald) pour simplifier l'API callback-heavy.

### Limites

- API native verbeuse et orientée callbacks (difficile à lire sans wrapper).
- Débogage complexe (DevTools insuffisants par rapport à une vraie base de données).
- Peu conseillé pour des projets simples : localStorage suffit dans la majorité des cas.
- Pas de synchronisation automatique avec le serveur.
- Quota variable selon le navigateur et l'espace disque disponible.

### Comparaison des stockages navigateur

| | cookies | localStorage | sessionStorage | IndexedDB |
|---|---|---|---|---|
| Capacité | ~4 Ko | ~5 Mo | ~5 Mo | Plusieurs centaines de Mo |
| Persistance | Configurable (expire) | Permanent | Onglet / session | Permanent |
| Accès serveur | Oui (header HTTP) | Non | Non | Non |
| Type de données | Strings | Strings | Strings | Objets JS structurés |
| Requêtes / index | Non | Non | Non | Oui |
| Complexité API | Faible | Faible | Faible | Elevée |
| Cas d'usage | Auth, session | Préférences UI | Données temporaires | Large volume, offline |

---

## Tableau comparatif — solutions de state management

| Solution | Ecosystème | Taille app | Boilerplate | DevTools | Async natif |
|---|---|---|---|---|---|
| Redux | React | Grande | Elevé | Excellent | Via middleware |
| React Context | React | Petite/moyenne | Minimal | Limité | useEffect |
| Zustand | React | Toutes | Très faible | Partiel | Oui (simple) |
| Vuex | Vue 2/3 | Grande | Moyen | Bon | Actions |
| Pinia | Vue 3 | Toutes | Faible | Bon | Oui (natif) |
| IndexedDB | Navigateur | Données locales | Elevé (API) | Limité | Callbacks / Promises |
