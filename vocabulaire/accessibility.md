# Accessibilité & SEO

---

## Accessibilité

### Checklist des bonnes pratiques

| Catégorie | Bonne pratique |
|-----------|----------------|
| Images | Toujours renseigner l'attribut `alt` (vide `alt=""` si l'image est décorative) |
| Images | Utiliser TwicPics ou Cloudinary pour redimensionner et optimiser les images |
| Texte | Lisible même sans interaction (ne pas cacher une information uniquement via `::hover`) |
| Navigation clavier | Navigation 100 % clavier possible (Tab, Shift+Tab, Enter, Espace, flèches) |
| Ancres | Textes d'ancrage explicites (`En savoir plus sur X`, pas juste `Cliquez ici`) |
| Skip-link | Lien "Aller au contenu" en première position dans le DOM (exemple : Amazon) |
| Titres | Hiérarchie correcte `h1 → h2 → h3` sans sauter de niveau |
| Titres de page | `<title>` précis et unique par page |
| Boutons | Texte visible ou `aria-label` explicite sur chaque bouton |
| Vidéos | Transcription textuelle et/ou sous-titres disponibles |
| Couleurs | Ratio de contraste minimum : 4.5:1 pour le texte normal, 3:1 pour le grand texte (WCAG AA) |
| Formulaires | Labels associés via `for`/`id` ou `aria-label`, messages d'erreur explicites |
| Focus | Indicateur de focus visible, jamais supprimé sans alternative (`outline: none` interdit sans remplacement) |
| Chargement | Rapidité de chargement optimisée (impacte les utilisateurs avec connexion lente) |
| Sitemap | Fichier `sitemap.xml` présent pour aider à l'exploration |

---

### WCAG — Niveaux de conformité

Les **Web Content Accessibility Guidelines (WCAG)** définissent 3 niveaux :

| Niveau | Description | Obligation |
|--------|-------------|------------|
| **A** | Exigences minimales | Indispensable |
| **AA** | Standard recommandé (légal dans de nombreux pays) | Cible habituelle |
| **AAA** | Conformité maximale | Idéal mais difficile à atteindre globalement |

Les 4 principes WCAG (acronyme **POUR**) :
- **Perceptible** — l'information est présentable à tous les sens
- **Opérable** — l'interface est navigable sans souris
- **Understandable (Compréhensible)** — le contenu et le comportement sont prévisibles
- **Robuste** — compatible avec les technologies d'assistance (lecteurs d'écran, etc.)

---

### ARIA — Rôles et attributs clés

ARIA (Accessible Rich Internet Applications) complète le HTML natif pour les composants dynamiques.

```html
<!-- Bouton sans texte visible -->
<button aria-label="Fermer la modale">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Région de navigation -->
<nav aria-label="Navigation principale">...</nav>

<!-- Message d'alerte dynamique -->
<div role="alert" aria-live="assertive">
  Votre session va expirer dans 2 minutes.
</div>

<!-- Modale -->
<div role="dialog" aria-modal="true" aria-labelledby="titre-modale">
  <h2 id="titre-modale">Confirmer la suppression</h2>
</div>
```

Rôles ARIA courants :

| Rôle | Usage |
|------|-------|
| `alert` | Message urgent lu immédiatement par le lecteur d'écran |
| `dialog` | Fenêtre modale |
| `navigation` | Zone de navigation (équivalent `<nav>`) |
| `main` | Contenu principal (équivalent `<main>`) |
| `banner` | En-tête du site (équivalent `<header>` au niveau page) |
| `contentinfo` | Pied de page (équivalent `<footer>` au niveau page) |
| `complementary` | Contenu secondaire (équivalent `<aside>`) |

---

### Skip-link (lien d'évitement)

```html
<!-- Premier élément du <body> -->
<a href="#main-content" class="skip-link">Aller au contenu principal</a>

<main id="main-content">
  ...
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 9999;
}

.skip-link:focus {
  top: 0; /* visible uniquement au focus clavier */
}
```

---

### Contraste des couleurs

| Type de texte | Ratio minimum (AA) | Ratio renforcé (AAA) |
|---------------|--------------------|----------------------|
| Texte normal (< 18px) | 4.5:1 | 7:1 |
| Grand texte (≥ 18px ou 14px gras) | 3:1 | 4.5:1 |
| Composants UI (icônes, bordures de champ) | 3:1 | — |

---

### Outils d'audit accessibilité

| Outil | Type | Usage |
|-------|------|-------|
| **Lighthouse** (Chrome DevTools) | Automatique | Rapport global, score accessibilité, Mobile First |
| **axe** (Deque) | Extension navigateur / CI | Détection d'erreurs WCAG, intégrable dans les tests |
| **SiteImprove Accessibility Checker** | Extension navigateur | Analyse page par page, niveaux A/AA/AAA |
| **onCrawl** | Crawler | Analyse la structure du site à grande échelle |
| **WAVE** (WebAIM) | Extension navigateur | Visualisation des erreurs directement sur la page |
| **Colour Contrast Analyser** | Application desktop | Vérification manuelle du ratio de contraste |

> Conseil : toujours tester en **Mobile First** avec Lighthouse. Le score mobile est souvent plus bas et plus représentatif des conditions réelles.

---

### Référence légale — ADA / Section 508

- **Section 508** (États-Unis) : oblige les agences fédérales à rendre leurs systèmes d'information accessibles. Norme de référence : WCAG 2.1 niveau AA.
- **ADA (Americans with Disabilities Act)** : les tribunaux américains ont étendu son application aux sites web des entreprises privées.
- **EN 301 549** (Europe) : norme européenne d'accessibilité numérique, alignée sur WCAG 2.1 AA.
- **RGAA** (France) : Référentiel Général d'Amélioration de l'Accessibilité, obligatoire pour les services publics français.

---

## SEO

### Crawler — définition

Un **crawler** (ou robot d'exploration) est un programme automatisé qui visite les pages d'un site en suivant les liens hypertexte. Il analyse la structure du site (URLs, balises, temps de réponse, redirections, contenu dupliqué…) pour :
- aider les moteurs de recherche à indexer les pages,
- permettre aux équipes SEO de détecter les problèmes techniques.

Outils de crawl courants : **Screaming Frog**, **onCrawl**, **Botify**, **Sitebulb**.

---

### robots.txt

Le fichier `robots.txt` est placé à la racine du domaine (`https://example.com/robots.txt`). Il indique aux robots d'exploration les URLs autorisées ou interdites.

```txt
# Autoriser tous les robots sur tout le site
User-agent: *
Allow: /

# Interdire l'accès aux pages d'administration
Disallow: /admin/
Disallow: /api/private/

# Indiquer l'emplacement du sitemap
Sitemap: https://example.com/sitemap.xml
```

> Attention : `robots.txt` est une directive, pas une protection. Une URL bloquée ne sera pas indexée mais reste accessible publiquement.

---

### sitemap.xml

Fichier XML listant toutes les URLs à indexer. Il accélère la découverte des pages par les moteurs de recherche.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-04-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/blog/</loc>
    <lastmod>2026-04-20</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

### Balises meta importantes

```html
<!-- Titre de la page (≤ 60 caractères) -->
<title>Nom de la page — Nom du site</title>

<!-- Description (≤ 160 caractères) -->
<meta name="description" content="Description claire et incitative de la page.">

<!-- Open Graph (partage réseaux sociaux) -->
<meta property="og:title" content="Nom de la page">
<meta property="og:description" content="Description pour les réseaux sociaux.">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:url" content="https://example.com/ma-page">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Nom de la page">
<meta name="twitter:description" content="Description pour Twitter.">
<meta name="twitter:image" content="https://example.com/image.jpg">

<!-- Canonical (évite le contenu dupliqué) -->
<link rel="canonical" href="https://example.com/ma-page">

<!-- Langue -->
<html lang="fr">
```

---

### Bonnes pratiques SEO pour les SPA (Single Page Applications)

Les SPA (React, Vue, Angular…) sont difficiles à indexer car le contenu est généré côté client.

| Problème | Solution |
|----------|----------|
| Contenu non visible sans JS | Server Side Rendering (SSR) avec **Next.js** ou **Nuxt.js** |
| URLs non indexables | Utiliser de vraies URLs avec `history.pushState` (pas de hash `#`) |
| Balises meta dynamiques | Mettre à jour `<title>` et `<meta>` à chaque changement de route |
| Tracking | GTM (Google Tag Manager) + Datalayer Google Analytics |
| Redirections avec user-agent | Détecter les bots (Googlebot) côté serveur et servir le HTML pré-rendu |

---

### Données structurées — JSON-LD

Les données structurées aident Google à comprendre le contenu et à l'afficher dans les **rich snippets**.

Champs obligatoires dans toutes les pages (selon les recommandations Google) : champ de recherche, URL, logo.

```html
<!-- Dans le <head> ou avant </body> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mon Entreprise",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/monentreprise",
    "https://www.linkedin.com/company/monentreprise"
  ]
}
</script>

<!-- Champ de recherche (Sitelinks Searchbox) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```

Types schema.org courants : `Article`, `Product`, `BreadcrumbList`, `FAQPage`, `LocalBusiness`, `Event`.

---

### Redirections 301

Une redirection **301** (Moved Permanently) transfère le "jus SEO" (link equity) de l'ancienne URL vers la nouvelle.

```nginx
# Nginx : rediriger une ancienne URL
rewrite ^/ancien-chemin$ /nouveau-chemin permanent;

# Rediriger www vers non-www
server {
    listen 80;
    server_name www.example.com;
    return 301 https://example.com$request_uri;
}
```

```js
// Next.js — next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/ancien-chemin',
        destination: '/nouveau-chemin',
        permanent: true, // 301
      },
    ]
  },
}
```

> Éviter les chaînes de redirections (301 → 301 → 301). Chaque saut perd du jus SEO et ralentit le crawl.

---

### Core Web Vitals

Métriques Google mesurant l'expérience utilisateur, intégrées au classement depuis 2021.

| Métrique | Mesure | Objectif |
|----------|--------|----------|
| **LCP** (Largest Contentful Paint) | Temps d'affichage du plus grand élément visible | ≤ 2.5 s |
| **INP** (Interaction to Next Paint) | Réactivité aux interactions utilisateur | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | Stabilité visuelle (éléments qui bougent) | ≤ 0.1 |

Outils de mesure : Lighthouse, **PageSpeed Insights**, **Search Console** (rapport Core Web Vitals), **web-vitals** (npm).
