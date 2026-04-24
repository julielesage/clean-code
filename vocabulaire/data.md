# Data — Gestion des données

---

## Sommaire

1. [Granularité](#granularité)
2. [Flux data / Delta](#flux-data--delta)
3. [ETL](#etl)
4. [Formats de données](#formats-de-données)
5. [Bases de données — SQL vs NoSQL](#bases-de-données--sql-vs-nosql)

---

## Granularité

> La granularité des données désigne leur niveau de détail. Plus la granularité est fine, plus la donnée est détaillée et son analyse précise. Il est toutefois important de noter que la granularité des données détermine directement l'espace de stockage nécessaire pour la base de données.

La granularité est un curseur entre **précision** et **coût de stockage / performance**.

### Exemples concrets

| Granularité grossière | Granularité fine |
|---|---|
| Chiffre d'affaires par mois | Chiffre d'affaires par transaction (heure, minute) |
| Nombre de visites par jour | Chaque clic avec timestamp précis |
| Stock total par entrepôt | Stock par emplacement exact (rangée, étagère, case) |
| Résumé agrégé par catégorie produit | Ligne individuelle par SKU |

### Exemple : logs de visites

```js
// Granularité JOUR — agrégé
{
  date: "2024-04-24",
  total_visites: 15420,
  taux_rebond: 0.42
}

// Granularité HEURE — plus fine
{
  date: "2024-04-24",
  heure: "14:00",
  total_visites: 1238,
  taux_rebond: 0.38
}

// Granularité ÉVÉNEMENT — maximale
{
  timestamp: "2024-04-24T14:32:07.123Z",
  user_id: "u_9821",
  page: "/produit/chaussures-trail",
  source: "google_ads",
  duree_session: 142
}
```

### Règle pratique

Plus la granularité est fine :
- analyse plus précise
- stockage plus important
- requêtes plus lentes si pas d'indexation adaptée

Il faut donc définir la granularité en fonction du **besoin métier réel**, et souvent conserver plusieurs niveaux (données brutes + agrégats pré-calculés).

---

## Flux data / Delta

> Dans la gestion des flux d'offres en e-commerce, le terme "delta" désigne généralement la différence entre deux versions successives d'un flux d'offres (ou catalogue produit).

### Définitions

**1. Delta = Mise à jour incrémentielle**
Le delta représente uniquement les modifications (ajouts, suppressions, mises à jour) entre deux versions d'un flux. Si un produit change de prix, est supprimé ou qu'un nouveau produit est ajouté, seul ce changement est envoyé dans le delta.

**2. À quoi ça sert ?**
- **Optimisation des ressources** : évite de retransmettre l'intégralité du catalogue
- **Efficacité** : traitement plus rapide côté récepteur
- **Synchronisation** : maintien de la cohérence entre systèmes

**3. Formats courants** : XML, CSV, JSON, APIs REST/GraphQL

**4. Exemple concret**
Supposons un flux initial avec 100 produits. Le lendemain, 2 produits sont mis à jour et 1 est supprimé. Le delta contiendra uniquement ces 3 modifications.

**5. Outils et bonnes pratiques** : Akeneo, Mirakl, ETL (Talend, Informatica). Fréquence adaptée au besoin, validation des données avant intégration.

### Schéma de fonctionnement

```
Flux COMPLET (J-1)         Flux COMPLET (J)
┌─────────────────┐        ┌─────────────────┐
│ Produit A       │        │ Produit A (màj) │
│ Produit B       │   →    │ Produit B       │
│ Produit C       │        │ (supprimé)      │
│ Produit D       │        │ Produit D       │
└─────────────────┘        │ Produit E (new) │
                           └─────────────────┘
                                   ↓
                           DELTA = {
                             updated: [A],
                             deleted: [C],
                             added:   [E]
                           }
```

### Exemple de format XML delta

```xml
<?xml version="1.0" encoding="UTF-8"?>
<delta date="2024-04-24" version="2">

  <!-- Produit modifié -->
  <product action="update">
    <id>SKU-1042</id>
    <name>Chaussures Trail X9</name>
    <price currency="EUR">89.99</price>
    <stock>34</stock>
  </product>

  <!-- Nouveau produit -->
  <product action="add">
    <id>SKU-1099</id>
    <name>Veste Imperméable Pro</name>
    <price currency="EUR">149.00</price>
    <stock>12</stock>
  </product>

  <!-- Produit supprimé -->
  <product action="delete">
    <id>SKU-0887</id>
  </product>

</delta>
```

### Bonnes pratiques

- Horodater chaque delta pour garantir l'ordre de traitement
- Valider le delta avant intégration (contrôle de cohérence, champs obligatoires)
- Conserver un historique des deltas pour pouvoir rejouer une synchronisation
- Définir une fréquence adaptée : toutes les heures pour les stocks, quotidien pour les prix
- Gérer les conflits : que faire si deux deltas simultanés modifient le même produit ?

---

## ETL

> Un ETL (Extract, Transform, Load) est un processus informatique essentiel en gestion de données, notamment en e-commerce, en data science et en business intelligence.

### Définition des 3 étapes

```
┌─────────────┐      ┌─────────────────┐      ┌────────────────┐
│   EXTRACT   │ ───▶ │   TRANSFORM     │ ───▶ │     LOAD       │
│             │      │                 │      │                │
│ Sources :   │      │ Nettoyage       │      │ Destination :  │
│ - CSV       │      │ Enrichissement  │      │ - BDD SQL      │
│ - API       │      │ Structuration   │      │ - Data lake    │
│ - BDD       │      │ Normalisation   │      │ - Fichier      │
│ - ERP/CRM   │      │ Déduplication   │      │ - Dashboard    │
└─────────────┘      └─────────────────┘      └────────────────┘
```

**1. Extraire** — lire depuis des sources hétérogènes
**2. Transformer** — nettoyer, enrichir, structurer la donnée
**3. Charger** — écrire vers la destination finale

**À quoi ça sert ?**
- **Centralisation** : agréger des données dispersées dans un seul endroit
- **Qualité des données** : détecter et corriger les anomalies
- **Automatisation** : pipeline planifié, sans intervention manuelle
- **Analyse** : rendre les données exploitables pour le BI ou le ML

### Exemples d'utilisation en e-commerce

- **Synchronisation des catalogues** : importer les produits d'un ERP vers la plateforme e-commerce
- **Gestion des stocks** : agréger les stocks de plusieurs entrepôts
- **Analyse client** : consolider les données CRM + commandes + navigation

### Exemple de code : CSV → transformation → BDD

```js
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function etl(filePath) {
  // 1. EXTRACT — lecture du CSV
  const raw = fs.readFileSync(filePath, 'utf8')
  const rows = parse(raw, { columns: true, skip_empty_lines: true })

  // 2. TRANSFORM — nettoyage et normalisation
  const cleaned = rows
    .filter(row => row.price && row.sku)               // supprimer lignes incomplètes
    .map(row => ({
      sku: row.sku.trim().toUpperCase(),               // normaliser la clé
      name: row.name.trim(),
      price: parseFloat(row.price.replace(',', '.')), // gérer les virgules décimales
      stock: parseInt(row.stock, 10) || 0,
      updated_at: new Date().toISOString()
    }))
    .filter((row, idx, arr) =>                         // dédupliquer par SKU
      arr.findIndex(r => r.sku === row.sku) === idx
    )

  // 3. LOAD — insertion en base
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const product of cleaned) {
      await client.query(
        `INSERT INTO products (sku, name, price, stock, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (sku) DO UPDATE
           SET name = EXCLUDED.name,
               price = EXCLUDED.price,
               stock = EXCLUDED.stock,
               updated_at = EXCLUDED.updated_at`,
        [product.sku, product.name, product.price, product.stock, product.updated_at]
      )
    }
    await client.query('COMMIT')
    console.log(`ETL terminé : ${cleaned.length} produits chargés`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

etl('./catalogue.csv')
```

### ETL vs ELT

| Critère | ETL | ELT |
|---|---|---|
| Ordre | Extract → Transform → Load | Extract → Load → Transform |
| Transformation | Avant chargement, dans un outil dédié | Après chargement, dans la BDD cible |
| Cas d'usage | Sources hétérogènes, données sensibles | Data warehouses modernes (BigQuery, Snowflake) |
| Performance | Moins adapté aux gros volumes | Tire parti de la puissance du moteur SQL |
| Exemple d'outil | Talend, Informatica | dbt + BigQuery, Snowflake |

### Outils populaires

| Catégorie | Outils |
|---|---|
| Open source | Talend Open Studio, Apache NiFi, Pentaho, Apache Spark |
| Cloud | AWS Glue, Google Dataflow, Azure Data Factory |
| SaaS / no-code | Zapier, Fivetran, Stitch, Airbyte |
| Transformation seule | dbt (data build tool) |

---

## Formats de données

Le choix du format dépend du **cas d'usage** : échange entre services, stockage, analyse, lisibilité humaine.

### JSON

Format texte lisible, idéal pour les APIs et les échanges entre services web.

```json
{
  "sku": "CHAUSSURE-X9",
  "name": "Chaussures Trail X9",
  "price": 89.99,
  "tags": ["trail", "imperméable"],
  "stock": {
    "paris": 12,
    "lyon": 8
  }
}
```

**Usage :** APIs REST, configs, échange front ↔ back, MongoDB.

### XML

Format verbeux mais expressif, encore très présent dans les EDI, flux produit et systèmes legacy.

```xml
<product>
  <sku>CHAUSSURE-X9</sku>
  <name>Chaussures Trail X9</name>
  <price currency="EUR">89.99</price>
  <tags>
    <tag>trail</tag>
    <tag>imperméable</tag>
  </tags>
</product>
```

**Usage :** flux e-commerce (Google Shopping, flux prix/stocks), SOAP, ERP.

### CSV

Format tabulaire simple, facile à générer et à lire dans Excel ou pandas.

```
sku,name,price,stock
CHAUSSURE-X9,Chaussures Trail X9,89.99,34
VESTE-PRO,Veste Imperméable Pro,149.00,12
```

**Usage :** exports BDD, imports de masse, échanges entre équipes, ETL.

### Parquet

Format binaire orienté colonnes, optimisé pour l'analyse de gros volumes.

**Usage :** data lakes (AWS S3, GCS), BigQuery, Spark, Snowflake.

### Tableau comparatif

| Format | Lisible humain | Taille | Vitesse lecture | Cas d'usage principal |
|---|---|---|---|---|
| JSON | Oui | Moyen | Rapide | APIs, configs, NoSQL |
| XML | Oui | Grand | Moyen | Flux produit, EDI, legacy |
| CSV | Oui | Petit | Rapide | Exports, ETL, imports |
| Parquet | Non (binaire) | Très petit | Très rapide (colonnes) | Data warehouse, Big Data |

---

## Bases de données — SQL vs NoSQL

### SQL (relationnel)

Données structurées en tables avec des relations entre elles. Schéma fixe défini à l'avance.

```sql
-- Exemple : table produits liée à une table catégories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  price NUMERIC(10,2),
  category_id INTEGER REFERENCES categories(id)
);

-- Jointure
SELECT p.name, p.price, c.name AS categorie
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.price < 100;
```

**Exemples** : PostgreSQL, MySQL, SQLite, MariaDB, SQL Server.

**Points forts :**
- Intégrité des données (contraintes, clés étrangères, transactions ACID)
- Requêtes complexes avec jointures
- Standard éprouvé, outillage riche

**Limites :**
- Schéma rigide (migration coûteuse si structure évolue)
- Moins adapté aux données très hétérogènes ou non structurées
- Scalabilité horizontale plus complexe

### NoSQL

Pas de schéma fixe. Adapté aux données flexibles, volumineuses ou distribuées.

```js
// MongoDB — document JSON
db.products.insertOne({
  sku: "CHAUSSURE-X9",
  name: "Chaussures Trail X9",
  price: 89.99,
  tags: ["trail", "imperméable"],
  specs: {
    pointure_disponibles: [39, 40, 41, 42, 43, 44],
    poids_grammes: 320
  }
})

// Requête
db.products.find({ price: { $lt: 100 }, tags: "trail" })
```

**Types de NoSQL :**

| Type | Exemples | Usage |
|---|---|---|
| Documents | MongoDB, CouchDB | Catalogues, CMS, profils utilisateurs |
| Clé-valeur | Redis, DynamoDB | Cache, sessions, compteurs |
| Colonnes | Cassandra, HBase | Séries temporelles, IoT, logs |
| Graphes | Neo4j, ArangoDB | Réseaux sociaux, recommandations |

### SQL vs NoSQL — Tableau comparatif

| Critère | SQL | NoSQL |
|---|---|---|
| Schéma | Fixe, défini à l'avance | Flexible, dynamique |
| Transactions | ACID (forte cohérence) | Souvent BASE (cohérence éventuelle) |
| Scalabilité | Verticale (+ de RAM/CPU) | Horizontale (+ de serveurs) |
| Requêtes complexes | Excellent (JOINs, agrégats) | Limité selon le type |
| Données | Structurées, relationnelles | Hétérogènes, volumineuses |
| Exemples | PostgreSQL, MySQL | MongoDB, Redis, Cassandra |

### Quand choisir quoi ?

**SQL si :**
- les relations entre données sont importantes (commandes ↔ clients ↔ produits)
- l'intégrité et la cohérence sont critiques (finance, stock)
- les requêtes sont complexes et variées

**NoSQL si :**
- le schéma varie d'un document à l'autre (catalogue avec attributs hétérogènes)
- les volumes sont massifs et la scalabilité horizontale est nécessaire
- la vitesse de lecture/écriture prime sur la cohérence stricte (cache, sessions, logs)
