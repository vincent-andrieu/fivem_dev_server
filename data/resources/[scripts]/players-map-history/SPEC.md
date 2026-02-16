# Players Map History — Cahier des charges

## 1. Contexte & Objectif

Script FiveM de **modération** permettant de visualiser l'historique des déplacements des joueurs sur une carte interactive de GTA V. L'outil permet aux modérateurs de vérifier les trajectoires, positions et états d'un ou plusieurs joueurs sur une période donnée.

Le projet se compose de **trois parties** :

- **Resource FiveM** (TypeScript) : collecte et stocke les données des joueurs
- **Serveur web** (Express) : API REST + WebSocket pour servir les données
- **Client web** (Angular v19) : interface de visualisation avec carte Leaflet

---

## 2. Architecture globale

```
┌─────────────────────┐     ┌─────────────────────┐
│   Serveur FiveM     │     │   Serveur Web        │
│                     │     │   (Express)          │
│  ┌───────────────┐  │     │                      │
│  │ players-map-  │  │     │  API REST            │
│  │ history       │──┼──►  │  WebSocket (live)    │
│  │ (resource)    │  │  DB │  Change Streams      │
│  └───────────────┘  │     │                      │
│                     │     └──────────┬───────────┘
│  Client FiveM       │               │
│  (données client)   │               ▼
└─────────────────────┘     ┌─────────────────────┐
                            │   Client Angular     │
                            │   (Leaflet map)      │
                            │   Port configurable  │
                            └─────────────────────┘
                                      │
                            ┌─────────▼───────────┐
                            │      MongoDB        │
                            │  (base partagée)    │
                            └─────────────────────┘
```

- La resource FiveM écrit les données dans MongoDB
- Le serveur Express lit MongoDB et expose une API REST + WebSocket
- Pour le **live tracking**, le serveur Express utilise les **MongoDB Change Streams** pour détecter les nouvelles entrées et les pousser aux clients via WebSocket
- Les deux se connectent à la même base MongoDB mais avec des **configurations séparées** (la resource utilise `@shared/server`, le serveur Express a son propre `.env`)

---

## 3. Resource FiveM — Collecte de données

> **Organisation du code** : Le code doit être bien compartimenté et organisé. Chaque fonction fait **une seule chose**. Créer des fonctions helpers pour isoler les responsabilités. Répartir le code dans **plusieurs fichiers** nommés de manière explicite (pas de `index.ts`). Chaque fichier a un rôle clair reflété par son nom. Cela s'applique autant au **client FiveM** qu'au **serveur FiveM** : chaque côté peut (et devrait) avoir plusieurs fichiers source pour mieux séparer les responsabilités.
>
> **Référence FiveM** : Pour plus de détails sur le fonctionnement de FiveM (manifests, événements, convars, NUI, state bags…) et les signatures des natives GTA V / CFX, se référer aux skills `fivem-docs` et `fivem-natives`.

### 3.1. Stack technique

- **TypeScript**, même structure que `player-spawn` (Rollup, `@shared/core`, `@shared/server`)
- Types partagés entre client et serveur FiveM dans `@shared/core`
- Modèles Mongoose et types serveur-only dans `@shared/server`
- Collecte **entièrement côté client FiveM** : le client collecte toutes les données (coords, heading, état, véhicule, arme, visée, skin) et les envoie au serveur via `TriggerServerEvent`
- Le **serveur FiveM** n'a aucun timer — il reçoit les données du client, résout l'identité joueur (ObjectId via `PlayersModel`), et stocke en base

### 3.2. Données collectées par snapshot

Les champs optionnels n'existent pas en base s'il n'y a pas de donnée (jamais de `null`).

| Donnée        | Type                     | Requis | Source  | Description                                                                                                                               |
| ------------- | ------------------------ | ------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `player`      | `ObjectId`               | oui    | Serveur | Réf. vers la collection `players` (résolu via `PlayersModel`)                                                                             |
| `sessionId`   | `number`                 | oui    | Serveur | ID temporaire sur le serveur FiveM (`source`)                                                                                             |
| `coords`      | `{ x, y, z, heading }`   | oui    | Client  | Position et orientation du joueur                                                                                                         |
| `vehicle`     | `{ model, plate, seat }` | non    | Client  | Modèle, plaque et siège (-1 = conducteur, 0+ = passagers). Absent si à pied                                                               |
| `playerState` | `enum`                   | oui    | Client  | `on_foot`, `walking`, `running`, `sprinting`, `swimming`, `diving`, `parachuting`, `climbing`, `falling`, `in_vehicle`, `ragdoll`, `dead` |
| `skin`        | `ComponentData[]`        | non    | Client  | Composants vestimentaires complets (drawable + texture par slot). Données volumineuses, pas affichées en premier plan côté UI             |
| `weapon`      | `string`                 | non    | Client  | Hash/nom de l'arme en main. **Absent si le joueur est désarmé** (`WEAPON_UNARMED` — jamais stocké en base)                                |
| `isAiming`    | `boolean`                | non    | Client  | Présent et `true` uniquement si le joueur est en train de viser                                                                           |

Les champs `createdAt` et `updatedAt` sont gérés automatiquement par Mongoose (`timestamps: true`). Le `createdAt` sert de date du snapshot.

### 3.3. Fréquence d'enregistrement adaptative

Le **client FiveM** exécute **deux boucles** parallèles pour la collecte de données. Tous les paramètres sont configurables via **convars FiveM** (voir Section 7).

**1. Tick rapide (~1s)** — vérifie en continu les déclencheurs de snapshot immédiat (chaque trigger est activable/désactivable via convar) :

- **Déclencheur par distance** (`pmh_trigger_distance`, en mètres ; `<= 0` = désactivé) : snapshot immédiat si le joueur a parcouru plus de X mètres (distance 3D) depuis le dernier snapshot
- **Déclencheur par changement d'état** (`pmh_trigger_state`, liste d'états séparés par virgule ; `''` = désactivé) : snapshot immédiat quand le joueur passe **vers** l'un des états configurés
- **Déclencheur par changement de véhicule** (`pmh_trigger_vehicle`, bool) : snapshot immédiat quand le joueur monte, descend ou **change de siège** dans un véhicule
- **Déclencheur par changement d'arme** (`pmh_trigger_weapon`, bool) : snapshot immédiat quand le joueur sort, range ou change d'arme
- **Déclencheur par visée** (`pmh_trigger_aiming`, bool) : snapshot immédiat quand le joueur commence ou arrête de viser
- **Reset du timer** : quand un snapshot est déclenché par un trigger, le timer périodique est remis à zéro

**2. Timer périodique (30s par défaut, min 1s)** (`pmh_default_interval`) :

- Snapshot garanti même si rien n'a changé
- **Exception** : pas de ré-enregistrement si le joueur est immobile et qu'aucun état n'a changé, **sauf** si ça fait plus de 5 minutes (`pmh_idle_timeout`, configurable)

Le **serveur FiveM** n'a pas de timer : il traite les données à réception de l'événement client.

### 3.4. Identification des joueurs

- Le **Session ID** correspond à `source`, l'ID temporaire du joueur sur le serveur FiveM
- L'identité persistante du joueur est le lien vers la **collection `players`** existante (via `PlayersModel` de `@shared/server`)
- Le **nom du joueur** affiché dans l'UI est récupéré dynamiquement depuis la collection `players` (nom actuel)

CFX natives serveur utilisées (PascalCase) :

```typescript
GetPlayers(); // string[] — Liste des source IDs connectés
GetPlayerName(source); // string — Nom du joueur
GetPlayerIdentifiers(source); // string[] — Identifiants (steam:xxx, discord:xxx, license:xxx...)
GetNumPlayerIdentifiers(source); // number — Nombre d'identifiants
```

Types d'identifiants disponibles : `steam`, `discord`, `xbl`, `live`, `license`, `license2`, `fivem`, `ip`.

### 3.5. Événements et convention de nommage

**Convention** : Tous les noms d'événements custom doivent être préfixés par le nom de la resource : `players-map-history:`.

**Événements custom :**

| Événement                      | Direction        | Usage                         |
| ------------------------------ | ---------------- | ----------------------------- |
| `players-map-history:snapshot` | Client → Serveur | Envoi des données de snapshot |

**Événements FiveM natifs écoutés :**

| Événement       | Usage                                |
| --------------- | ------------------------------------ |
| `playerJoining` | Initialiser le tracking côté serveur |
| `playerDropped` | Arrêter le tracking, snapshot final  |

`playerConnecting` n'est pas utilisé (source pas encore stable).

### 3.6. Référence des natives (PascalCase JS/TS)

Toutes les natives GTA V de collecte de données sont **client-side only**. Seules les CFX natives (section 3.4) fonctionnent côté serveur.

#### Coordonnées & Heading

```typescript
const ped = PlayerPedId();
const coords = GetEntityCoords(ped, false); // vector3 {x, y, z}
const heading = GetEntityHeading(ped); // float (degrés)
```

#### État du joueur — Ordre de priorité

Le premier état `true` gagne :

| État          | Native PascalCase               | Note                                                    |
| ------------- | ------------------------------- | ------------------------------------------------------- |
| `dead`        | `IsPedDeadOrDying(ped, false)`  |                                                         |
| `ragdoll`     | `IsPedRagdoll(ped)`             |                                                         |
| `parachuting` | `IsPedInParachuteFreeFall(ped)` | + `GetPedParachuteState(ped)` pour détails (int -1 à 3) |
| `diving`      | `IsPedSwimmingUnderWater(ped)`  | Sous l'eau (prioritaire sur `swimming`)                 |
| `swimming`    | `IsPedSwimming(ped)`            |                                                         |
| `climbing`    | `IsPedClimbing(ped)`            |                                                         |
| `falling`     | `IsPedFalling(ped)`             |                                                         |
| `in_vehicle`  | `IsPedInAnyVehicle(ped, false)` |                                                         |
| `sprinting`   | `IsPedSprinting(ped)`           |                                                         |
| `running`     | `IsPedRunning(ped)`             |                                                         |
| `walking`     | `IsPedWalking(ped)`             |                                                         |
| `on_foot`     | fallback                        | Si aucun autre état détecté                             |

**Note** : `IsPedRunning`, `IsPedSprinting`, `IsPedWalking`, `IsPedStill` sont dans la catégorie `TASK/` des natives.

#### Véhicule

```typescript
const vehicle = GetVehiclePedIsIn(ped, false); // Vehicle handle (0 si aucun)
const modelHash = GetEntityModel(vehicle); // Hash du modèle
const modelName = GetDisplayNameFromVehicleModel(modelHash); // Label (ex: "SULTAN")
const plate = GetVehicleNumberPlateText(vehicle); // Plaque (8 chars max)
// Siège : itérer avec GetPedInVehicleSeat(vehicle, seatIndex) et comparer avec le ped local
// Sièges : -1 = conducteur, 0 = passager avant, 1+ = arrière
```

#### Arme

```typescript
const weaponHash = GetSelectedPedWeapon(ped);
// Hash 0xA2719263 = WEAPON_UNARMED → ne PAS stocker en base
// Conversion hash → nom via lookup table statique (pas de native de conversion)
```

**Règle** : Si le joueur est désarmé (`WEAPON_UNARMED`), le champ `weapon` est **absent** du snapshot.

#### Visée

```typescript
const isAiming = IsPlayerFreeAiming(PlayerId());
// Attention : prend un Player index (pas un Ped)
```

#### Skin/Vêtements

```typescript
// 12 composants (componentId 0-11) :
// 0=Head, 1=Beard, 2=Hair, 3=Torso, 4=Legs, 5=Hands,
// 6=Foot, 7=Scarfs, 8=Accessories1, 9=Accessories2, 10=Decals, 11=Auxiliary
for (let compId = 0; compId <= 11; compId++) {
    const drawable = GetPedDrawableVariation(ped, compId);
    const texture = GetPedTextureVariation(ped, compId);
}
```

#### Distance (calcul mathématique)

Calcul en **3D** via arithmétique vectorielle (plus performant que les natives `Vdist`) :

```typescript
const dx = current.x - last.x;
const dy = current.y - last.y;
const dz = current.z - last.z;
const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
```

### 3.7. Flux de données

```
Client FiveM                                Serveur FiveM
────────────                                ──────────────
Tick rapide (~1s)
├─ Vérifie distance (3D)
├─ Vérifie changement d'état
├─ Vérifie changement véhicule/siège
├─ Vérifie changement arme/visée
└─ Si trigger → collecte données

Timer périodique (30s)
└─ Collecte données

Collecte (toutes les données) :
├─ coords + heading
├─ playerState
├─ vehicle (si applicable)
├─ weapon (si pas unarmed)
├─ isAiming (si true)
└─ skin
    │
    ▼
TriggerServerEvent('players-map-history:snapshot')
    ─────────────────────────────────────►   Réception données client
                                             ├─ Résout player ObjectId (PlayersModel)
                                             ├─ sessionId = source
                                             └─ Insère snapshot en MongoDB
```

---

## 4. Modèle de données (MongoDB)

### Collection `players_map_history`

```typescript
{
  _id: ObjectId,
  player: ObjectId,            // Réf. vers collection players
  sessionId: number,           // ID temporaire sur le serveur FiveM (source ID)
  coords: {
    x: number,
    y: number,
    z: number,
    heading: number
  },
  vehicle?: {                  // Absent si à pied
    model: string,
    plate: string,
    seat: number               // -1 = conducteur, 0+ = passagers
  },
  playerState: string,         // enum: on_foot, walking, running, sprinting, swimming, diving, parachuting, climbing, falling, in_vehicle, ragdoll, dead
  skin?: ComponentData[],      // Composants vestimentaires complets
  weapon?: string,             // Hash de l'arme en main, absent si désarmé (WEAPON_UNARMED jamais stocké)
  isAiming?: boolean,          // Présent et true uniquement si le joueur vise
  createdAt: Date,             // Mongoose timestamp — sert de date du snapshot
  updatedAt: Date              // Mongoose timestamp
}
```

- **Index TTL** sur le champ `createdAt` avec expiration configurable (défaut : 30 jours)
- **Index composé** sur `player` + `createdAt` pour les requêtes de plage temporelle
- **Index** sur `sessionId` pour filtrer par session
- Tous les schémas Mongoose utilisent `timestamps: true` (comportement standard du projet via `TemplateObject`)
- Les champs optionnels ne sont tout simplement pas présents en base quand il n'y a pas de donnée

---

## 5. Serveur Web (Express)

### 5.1. Stack technique

- **Express** avec architecture inspirée du template `vincent-andrieu/server-template`
- Architecture : middlewares → routes API → modèles
- **Pas de framework de routing supplémentaire** (pas de NestJS)
- Préparé pour Passport.js (authentification Discord ajoutée plus tard)
- Dossier situé dans `players-map-history/web/server/`

### 5.2. Middleware stack

- `express.json()` — parsing JSON
- Logger — log des requêtes HTTP
- CORS — configuré pour autoriser le client Angular
- (Futur) Passport + session pour l'authentification Discord

### 5.3. API REST

| Méthode | Route          | Description                                                               |
| ------- | -------------- | ------------------------------------------------------------------------- |
| `GET`   | `/health`      | Health check                                                              |
| `GET`   | `/points`      | Points d'historique (filtres : player, sessionId, date range, pagination) |
| `GET`   | `/players`     | Liste des joueurs ayant des points d'historique                           |
| `GET`   | `/points/live` | Points en cours des joueurs connectés                                     |

### 5.4. WebSocket (live tracking)

- Connexion WebSocket pour le live tracking des joueurs connectés
- Le serveur écoute les **MongoDB Change Streams** sur la collection `players_map_history`
- Chaque nouveau point inséré est poussé aux clients WebSocket connectés

---

## 6. Client Angular

### 6.1. Stack technique

- **Angular v19** (dernière version stable)
- **Standalone components**, **Signals**, nouvelle syntaxe de templates
- **Pas de SSR** — SPA classique (outil interne, pas de besoin SEO)
- **Design moderne** (UI épurée, composants Material Design, thème cohérent)
- **Leaflet** pour la carte interactive
- **Angular Material** pour les composants UI
- Intégré au **monorepo yarn** du projet FiveM
- Dossier situé dans `players-map-history/web/client/`

### 6.2. Carte interactive

**Fond de carte :**

- Tuiles GTA V style **Atlas** (comme l'image de référence `gta5_map.jpg`)
- **Système de coordonnées personnalisé** basé sur `L.CRS.Simple` avec transformation :

    ```typescript
    const CUSTOM_CRS = L.extend({}, L.CRS.Simple, {
        projection: L.Projection.LonLat,
        transformation: new L.Transformation(0.02072, 117.3, -0.0205, 172.8),

        // Distance entre deux points sur la carte
        distance: function (latlng1: L.LatLng, latlng2: L.LatLng): number {
            const dx = latlng2.lng - latlng1.lng;
            const dy = latlng2.lat - latlng1.lat;
            return Math.sqrt(dx * dx + dy * dy);
        },

        // Conversion de l'échelle vers le niveau de zoom
        zoom: function (scale: number): number {
            return Math.log(scale) / Math.LN2;
        },

        scale: function (zoom: number): number {
            return Math.pow(2, zoom);
        }
    });
    ```

- **Tuiles Atlas** :
    - **Pattern d'URL** : `assets/tiles/atlas/{z}/{x}/{y}.jpg`
    - **Paramètres** :
        - `minZoom: 0`
        - `maxZoom: 5`
        - `noWrap: true`
        - `continuousWorld: false`
        - `bounds: L.latLngBounds([[-4000, -4000], [8000, 8000]])`
    - Les tuiles sont incluses dans les assets Angular (`src/assets/tiles/`) et servies directement par le client

- **Initialisation de la carte** :

    ```typescript
    const map = L.map("map", {
        crs: CUSTOM_CRS,
        minZoom: 1,
        maxZoom: 5,
        zoom: 3,
        center: [0, 0],
        preferCanvas: true,
        attributionControl: false
    });

    L.tileLayer("assets/tiles/atlas/{z}/{x}/{y}.jpg", {
        minZoom: 0,
        maxZoom: 5,
        noWrap: true,
        continuousWorld: false,
        bounds: L.latLngBounds([
            [-4000, -4000],
            [8000, 8000]
        ])
    }).addTo(map);
    ```

- **Conversion de coordonnées GTA V → Leaflet** :

    ```typescript
    // GTA V : X = est/ouest, Y = nord/sud, origine au centre
    // Leaflet : [lat, lng] = [Y, X] avec coordonnées inversées
    function gtaToLeaflet(x: number, y: number): [number, number] {
        // Inverser X et Y : dans Leaflet, lat = Y et lng = X
        // Note : le CRS personnalisé gère la transformation
        return [y, x];
    }

    function leafletToGta(lat: number, lng: number): { x: number; y: number } {
        return { x: lng, y: lat };
    }
    ```

- **Sources des tuiles** :
    - **Utiliser le projet [meesvrh/GTAV-Map-Tiles](https://github.com/meesvrh/GTAV-Map-Tiles)** (recommandé)
        - Clone le repository : `git clone https://github.com/meesvrh/GTAV-Map-Tiles.git`
        - Contient des tuiles pré-générées pour les styles **Atlas** et **Satellite**
        - Structure : `tiles/atlas/{z}/{x}/{y}.jpg` (zoom 0-5)
        - Format : JPG
        - Taille : ~32 MB
        - Copier le dossier `tiles/atlas/` vers `players-map-history/web/client/src/assets/tiles/atlas/`
        - **Note** : Le repo n'a pas de licence explicite, à considérer pour un usage en production

- **Installation des tuiles** :

    **Étape 1 : Récupérer les tuiles**

    ```bash
    # Cloner le repository GTAV-Map-Tiles
    git clone https://github.com/meesvrh/GTAV-Map-Tiles.git

    # Copier les tuiles Atlas dans les assets du client Angular
    cp -r GTAV-Map-Tiles/tiles/atlas players-map-history/web/client/src/assets/tiles/
    ```

    **Étape 2 : Configuration nginx (production)**

    Les tuiles dans `src/assets/` sont automatiquement copiées dans le build Angular. En production, nginx les sert directement avec cache long :

    ```nginx
    # Configuration nginx (dans le Dockerfile Angular)
    location /assets/tiles/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    ```

    En développement, `ng serve` sert les assets nativement sans configuration supplémentaire.

    **Étape 3 : Vérification**
    - Vérifier que les tuiles sont accessibles : `http://localhost:4200/assets/tiles/atlas/0/0/0.jpg`
    - Tester les différents niveaux de zoom (0 à 5)

**Marqueurs et trajectoires :**

- Chaque joueur a une **couleur unique** attribuée automatiquement
- Les points d'un même joueur sont reliés par un **trait (polyline)** de la même couleur
- **Icônes des marqueurs** varient selon l'état du joueur :
    - À pied : icône piéton
    - En véhicule : icône voiture
    - En train de viser : icône crosshair
    - Autres états : icônes adaptées
    - Icônes de librairie (Material Icons / Font Awesome) en priorité ; SVG custom ou images si les icônes de librairie ne sont pas adaptées
- **Clustering automatique** au dézoom : les points proches sont regroupés, les traits restent visibles. Au zoom, les points se séparent

**Interaction :**

- **Clic sur un point** → popup Leaflet avec les détails : coords, véhicule (modèle, plaque, siège), arme, état, date. Le skin/clothes est disponible mais discret (détail secondaire)

### 6.3. Interface utilisateur

**Layout :**

- **Carte** : zone principale occupant la majorité de l'écran
- **Panel latéral** : contrôles et filtres

**Panel latéral — Filtres :**

1. **Liste des joueurs** : checkboxes pour afficher/masquer individuellement chaque joueur sur la carte. Nom récupéré dynamiquement depuis la collection `players`
2. **Slider temporel interactif** : barre de timeline avec deux poignées (début/fin) pour ajuster la plage horaire affichée en glissant
3. **Bouton "Sessions courantes"** : raccourci pour filtrer uniquement les sessions en cours des joueurs connectés (bascule vers le mode live)
4. **Recherche** : champ de recherche pour trouver un joueur par nom ou identifiant

**Mode live :**

- Quand activé (bouton sessions courantes ou manuellement), la carte se met à jour en temps réel via WebSocket
- Les nouveaux points apparaissent et les polylines s'étendent au fur et à mesure

---

## 7. Configuration

La configuration de la resource FiveM utilise des **convars FiveM** (configurables dans `server.cfg` sans rebuild), mappées dans des fichiers `config.ts` avec des valeurs par défaut. Les ports et `corsOrigin` du serveur web ne sont **pas** des convars — ils sont dans le `.env` du serveur Express.

Le config est **séparé en deux fichiers** selon le contexte d'exécution, car certains convars ne doivent pas être exposés au client :

**Client** (`client/src/config.ts`) — utilise des convars **répliquées** (`setr`) :

```typescript
export const clientConfig = {
    // Timing
    defaultInterval: GetConvarInt("pmh_default_interval", 30000), // Timer périodique (ms), min 1000
    idleTimeout: GetConvarInt("pmh_idle_timeout", 5 * 60 * 1000), // 5 min idle max

    // Triggers instantanés
    triggerDistance: GetConvarInt("pmh_trigger_distance", 50), // Distance 3D en mètres ; <= 0 = désactivé
    triggerState: parseStateList(GetConvar("pmh_trigger_state", "dead, ragdoll, parachuting, swimming, diving, climbing, falling, in_vehicle")),
    triggerVehicle: GetConvar("pmh_trigger_vehicle", "true") === "true",
    triggerWeapon: GetConvar("pmh_trigger_weapon", "true") === "true",
    triggerAiming: GetConvar("pmh_trigger_aiming", "true") === "true"
};

// Helper pour parser la liste d'états (gère les espaces)
function parseStateList(value: string): string[] {
    if (!value.trim()) return [];
    return value
        .split(",")
        .map((state) => state.trim())
        .filter(Boolean);
}
```

**Serveur** (`server/src/config.ts`) — utilise des convars **non-répliquées** (`set`) :

Les convars ne sont **pas définies** dans `server.cfg` par défaut (les valeurs par défaut s'appliquent). Elles sont **documentées** dans `server.cfg` via des commentaires :

```cfg
# === Players Map History ===
# -- Convars répliquées (accessibles par le client FiveM) --
# setr pmh_default_interval 30000       # Intervalle snapshot périodique en ms (min: 1000)
# setr pmh_idle_timeout 300000          # Timeout idle en ms (défaut: 5 min)
# setr pmh_trigger_distance 50          # Distance 3D en mètres pour snapshot immédiat (<= 0 = désactivé)
# setr pmh_trigger_state "dead, ragdoll, parachuting, swimming, diving, climbing, falling, in_vehicle"  # États déclencheurs ('' = désactivé)
# setr pmh_trigger_vehicle "true"       # Trigger monter/descendre/changer de siège véhicule
# setr pmh_trigger_weapon "true"        # Trigger changement d'arme
# setr pmh_trigger_aiming "true"        # Trigger début/fin de visée
```

---

## 8. Infrastructure & Déploiement

- **2 Dockerfiles** :
    - `players-map-history/web/server/Dockerfile` — Serveur Express
    - `players-map-history/web/client/Dockerfile` — Client Angular (build + nginx pour servir)
- **Docker Compose** à la racine du projet (`docker-compose.yml`), à côté du Dockerfile FiveM existant
- Le serveur Express et le client Angular sont ajoutés comme services dans le Docker Compose

---

## 9. Structure des dossiers

Structure de base de la resource `players-map-history` voué à évoluer en fonction du développement et de la convention évoquée en introduction de la Section 3.

```
data/resources/[scripts]/players-map-history/
├── SPEC.md
├── gta5_map.jpg                    # Image de référence
├── fxmanifest.lua                  # Manifest de la resource FiveM
├── package.json                    # Package de la resource FiveM
├── server/                         # Côté serveur FiveM (resource)
│   ├── src/
│   │   ├── server.ts              # Point d'entrée serveur
│   │   └── config.ts              # Configuration serveur (convars non-répliquées)
│   ├── rollup.config.js
│   └── tsconfig.json
├── client/                         # Côté client FiveM (resource)
│   ├── src/
│   │   ├── client.ts              # Point d'entrée client
│   │   └── config.ts              # Configuration client (convars répliquées)
│   ├── rollup.config.js
│   └── tsconfig.json
├── build/                          # Build FiveM compilé
│   ├── server/server.js
│   └── client/client.js
└── web/                            # Application web (modération)
    ├── server/                     # Serveur Express (API)
    │   ├── src/
    │   │   ├── main.ts
    │   │   ├── init/               # Express, MongoDB
    │   │   ├── middlewares/        # Logger, (futur) auth
    │   │   ├── api/                # Routes REST
    │   │   └── websocket/         # WebSocket + Change Streams
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── Dockerfile
    │   └── .env
    └── client/                     # Client Angular
        ├── src/
        │   ├── app/
        │   │   ├── map/            # Composant carte Leaflet
        │   │   ├── sidebar/        # Panel latéral (filtres, liste joueurs)
        │   │   └── shared/         # Services, interfaces
        │   ├── environments/
        │   ├── main.ts
        │   └── index.html
        ├── angular.json
        ├── package.json
        ├── tsconfig.json
        └── Dockerfile
```

---

## 10. Évolutions futures (hors scope initial)

- **Authentification Discord OAuth2** : connexion via Discord, vérification des rôles pour restreindre l'accès
- **Accès In-Game (NUI)** : interface accessible directement depuis le jeu via NUI FiveM
- **Mode playback** : animation chronologique des déplacements (lecture vidéo-like)
- **Export** : export des données d'un joueur/session en format exploitable
