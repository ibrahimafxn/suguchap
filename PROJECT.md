# SuguChap — Document de suivi

## 1) Vision du produit
Application mobile de gestion de commandes au marché.
Les clientes commandent des articles, valident le prix, et reçoivent une estimation du délai selon leur localisation par rapport au marché.
Livraison assurée par des coursiers au départ, avec possibilité d’intégrer les vendeurs plus tard.

## 2) MVP (Sprint 0 cible)
Fonctionnalités essentielles :
- Commande d’articles d’un marché unique.
- Validation du prix avant paiement.
- Estimation du délai (distance + temps d’achat + marge trafic).
- Livraison par coursiers.
- Suivi du statut de commande.

### Parcours cliente
1. Onboarding avec ville, adresse, téléphone.
2. Choix du marché.
3. Recherche/ajout d’articles au panier.
4. Validation du prix estimé.
5. Paiement.
6. Suivi livraison.

### Écrans essentiels
1. Onboarding (ville, adresse, téléphone)
2. Liste de marchés
3. Catalogue produits
4. Panier
5. Validation prix
6. Paiement
7. Suivi commande

### Rôles et mini‑apps
- Cliente : commande, paye, suit.
- Coursier : accepte, achète au marché, livre.
- Admin : gère marchés, produits, commandes, prix réels.

### Données de base
- Utilisateur : nom, téléphone, adresse, ville
- Marché : nom, localisation, horaires
- Produit : nom, catégorie, prix estimé, unité
- Commande : cliente, items, prix estimé, prix réel, statut
- Livraison : coursier, distance, temps estimé, statut

### Statuts clés
- nouvelle -> prix_validé -> payée -> en_achat -> en_livraison -> livrée

## 3) Stack recommandée
- Mobile : React Native (Expo)
- Backend : Node.js (NestJS)
- Base de données : MongoDB (Atlas)
- Auth : JWT + OTP SMS
- Maps & ETA : Google Maps Platform
- Notifications : Firebase Cloud Messaging
- Admin : React (Vite)

Alternative rapide :
- Mobile : Flutter
- Backend : Supabase (Postgres + Auth + Realtime)
- Admin : Supabase Studio + React léger

## 3.1) Stack retenue (décision)
- Mobile : Flutter
- Backend : Node.js (NestJS)
- Base de données : MongoDB (Atlas)
- Auth : JWT + OTP SMS
- Maps & ETA : Google Maps Platform
- Paiement : CinetPay Collect (Orange/MTN/Wave/Moov)
- SMS : Sendberry (CI)

## 3.2) Setup local (Flutter)
- Flutter SDK installé dans `/home/coulibaly/flutter`
- JDK 17 configuré pour Flutter
- Android SDK : OK
- `PATH` : ajouter `/home/coulibaly/flutter/bin` dans `~/.bashrc`
- Dev mobile : OTP auto‑valide en local (`devSkipOtpCode = true`, code fixe `123456` dans `sugu_chap/lib/main.dart`)

## 4) Stratégie de sprints
Chaque sprint = objectifs clairs, livrables, critères d’acceptation, et démo.
On documentera l’avancement ici.

---

# Sprints

Cadence proposée : sprints de 2 semaines (ajustable).

## Sprint 0 — Cadrage et préparation
Objectifs :
- Définir le MVP et les flux principaux.
- Valider la stack.
- Lister les dépendances externes (SMS, Maps, Paiement).

Livrables :
- Roadmap MVP.
- Schéma de données initial.
- Maquettes low‑fi (si possible).

Critères d’acceptation :
- MVP cadré et validé.
- Backlog initial prêt.

Notes / décisions :
- Livraison via coursiers au départ.
- Extension future : vendeurs + multi‑villes.

### Dépendances externes (options + coûts)
SMS (OTP) :
- Twilio (global, facile à intégrer) — Coût : TBD par pays
- MessageBird (global, bon en Afrique) — Coût : TBD par pays
- Africa’s Talking (Afrique) — Coût : TBD par pays

Maps & ETA :
- Google Maps Platform (précis, complet) — Coût : TBD par pays
- Mapbox (souvent moins cher) — Coût : TBD par pays
- OpenStreetMap + OSRM (open source, moins cher) — Coût : infra à estimer

Paiement :
- Stripe (global) — Coût : TBD par pays
- Paystack (Afrique) — Coût : TBD par pays
- Flutterwave (Afrique) — Coût : TBD par pays
- Mobile Money (agrégateurs locaux) — Coût : TBD par pays

Notes :
- Les coûts dépendent fortement du pays et du volume.
- À confirmer après choix du pays cible.

### Côte d’Ivoire — décisions verrouillées + coûts (MVP 1k SMS/mois)
Paiement (verrouillé) : CinetPay Collect
- Orange Money CI : 3,5% par transaction
- MTN Money CI : 3,5% par transaction
- Wave CI : 3,5% par transaction
- Moov Money CI : 3,5% par transaction
- Note : CinetPay indique un intervalle 1,5% à 3,5% selon volume.

SMS (verrouillé) : Sendberry
- Côte d’Ivoire : 0,084 € / SMS (~84 € / 1k SMS)
- Note : tarif publié par pays, à reconfirmer contractuellement.

Maps & ETA (verrouillé) : Google Maps Platform
- Modèle : pay‑as‑you‑go avec appels gratuits par SKU mensuels.
- Option abonnement possible (Starter/Essentials/Pro) selon volume.

---

## Sprint 1 — Fondations produit (backend + données) — 2 semaines
Objectifs :
- Initialiser le backend et la base de données.
- Créer les modèles de base (utilisateur, marché, produit, commande, livraison).
- Mettre en place l’authentification.

Livrables :
- API skeleton + docs minimales.
- Schéma DB + migrations.
- Auth par OTP SMS (mock ou provider).

Critères d’acceptation :
- CRUD minimal marchés/produits via admin.
- Auth fonctionnelle (inscription + connexion).

Notes / décisions :
- Provider SMS à confirmer.

Backlog détaillé (user stories) :
- En tant que cliente, je peux créer un compte avec numéro de téléphone et OTP, afin d’accéder à l’app.
- En tant que cliente, je peux me connecter via OTP, afin de retrouver mon historique.
- En tant qu’admin, je peux créer/modifier/supprimer un marché, afin de gérer les lieux disponibles.
- En tant qu’admin, je peux créer/modifier/supprimer un produit, afin d’alimenter le catalogue.
- En tant que système, je peux créer une commande avec items, afin d’enregistrer une intention d’achat.
- En tant que coursier, je peux voir une liste de commandes à venir, afin de me préparer.

Critères d’acceptation (Sprint 1) :
- Inscription + connexion OTP fonctionnelles en environnement de test (provider réel ou mock).
- Endpoints CRUD marchés/produits protégés par un rôle admin.
- Création et lecture d’une commande possible via API.
- Documentation minimale des endpoints (README ou Swagger).

### Détails techniques Sprint 1

Schéma DB (PostgreSQL, proposition minimale) :
- users
  - id (uuid, pk)
  - phone (varchar, unique, not null)
  - name (varchar, null)
  - city (varchar, null)
  - address (text, null)
  - role (enum: client, courier, admin; default client)
  - created_at, updated_at
- markets
  - id (uuid, pk)
  - name (varchar, not null)
  - city (varchar, not null)
  - location_lat (decimal, not null)
  - location_lng (decimal, not null)
  - opening_hours (jsonb, null)
  - is_active (boolean, default true)
  - created_at, updated_at
- products
  - id (uuid, pk)
  - market_id (uuid, fk -> markets.id)
  - name (varchar, not null)
  - category (varchar, null)
  - unit (varchar, null)
  - price_estimated (numeric, not null)
  - is_active (boolean, default true)
  - created_at, updated_at
- orders
  - id (uuid, pk)
  - user_id (uuid, fk -> users.id)
  - market_id (uuid, fk -> markets.id)
  - status (enum: nouvelle, prix_validé, payée, en_achat, en_livraison, livrée, annulée, échec_paiement)
  - payment_method (enum: mobile_money, cash_on_delivery)
  - cancel_reason (text, null)
  - failed_reason (text, null)
  - price_estimated_total (numeric, not null)
  - price_real_total (numeric, null)
  - delivery_address (text, not null)
  - delivery_city (varchar, not null)
  - created_at, updated_at
- order_items
  - id (uuid, pk)
  - order_id (uuid, fk -> orders.id)
  - product_id (uuid, fk -> products.id)
  - quantity (numeric, not null)
  - price_estimated (numeric, not null)
  - price_real (numeric, null)
  - created_at, updated_at
- deliveries
  - id (uuid, pk)
  - order_id (uuid, fk -> orders.id)
  - courier_id (uuid, fk -> users.id)
  - status (enum: assignée, en_achat, en_livraison, livrée)
  - distance_km (numeric, null)
  - eta_minutes (integer, null)
  - created_at, updated_at

Endpoints API (REST, v1) :
- Auth
  - POST /api/v1/auth/otp/request  (phone) -> code envoyé
  - POST /api/v1/auth/otp/verify   (phone, code) -> token JWT
- Users
  - GET /api/v1/users/me
  - PATCH /api/v1/users/me
- Markets (admin)
  - POST /api/v1/markets
  - GET /api/v1/markets
  - PATCH /api/v1/markets/:id
  - DELETE /api/v1/markets/:id
- Products (admin)
  - POST /api/v1/products
  - GET /api/v1/products?market_id=
  - PATCH /api/v1/products/:id
  - DELETE /api/v1/products/:id
- Orders
  - POST /api/v1/orders
  - GET /api/v1/orders/:id
  - GET /api/v1/orders?me=1
  - POST /api/v1/orders/:id/cancel
  - POST /api/v1/orders/:id/mark-failed

Règles & sécurité :
- Auth JWT obligatoire pour endpoints non publics.
- Rôle admin requis pour CRUD marchés/produits.
- Validation d’entrées stricte (prix, quantités, coordonnées).
 - payment_method obligatoire à la création de commande.
 - Annulation possible par cliente si statut = nouvelle|prix_validé et < 10 min après création.
 - Annulation possible par admin à tout moment (audit).
 - Échec paiement déclenché uniquement par système/admin.

Livrables techniques :
- Migrations DB (Prisma/TypeORM).
- OpenAPI/Swagger minimal.
- Environnements : dev + staging.

### Sprint 1 — DDL SQL (PostgreSQL)

```sql
-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'courier', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('nouvelle', 'prix_validé', 'payée', 'en_achat', 'en_livraison', 'livrée', 'annulée', 'échec_paiement');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('mobile_money', 'cash_on_delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('assignée', 'en_achat', 'en_livraison', 'livrée');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone varchar(32) UNIQUE NOT NULL,
  name varchar(120),
  city varchar(120),
  address text,
  role user_role NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Markets
CREATE TABLE IF NOT EXISTS markets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(160) NOT NULL,
  city varchar(120) NOT NULL,
  location_lat decimal(9,6) NOT NULL,
  location_lng decimal(9,6) NOT NULL,
  opening_hours jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  name varchar(160) NOT NULL,
  category varchar(120),
  unit varchar(40),
  price_estimated numeric(12,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'nouvelle',
  payment_method payment_method NOT NULL DEFAULT 'mobile_money',
  cancel_reason text,
  failed_reason text,
  price_estimated_total numeric(12,2) NOT NULL,
  price_real_total numeric(12,2),
  delivery_address text NOT NULL,
  delivery_city varchar(120) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric(10,2) NOT NULL,
  price_estimated numeric(12,2) NOT NULL,
  price_real numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Deliveries
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  courier_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status delivery_status NOT NULL DEFAULT 'assignée',
  distance_km numeric(10,2),
  eta_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_market_id ON products(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_market_id ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
```

### Sprint 1 — Contrats d’API (JSON)

Auth
```json
POST /api/v1/auth/otp/request
{ "phone": "+2250700000000" }
-> { "success": true }

POST /api/v1/auth/otp/verify
{ "phone": "+2250700000000", "code": "123456" }
-> { "token": "jwt", "user": { "id": "...", "phone": "...", "role": "client" } }
```

Users
```json
GET /api/v1/users/me
-> { "id": "...", "phone": "...", "name": "...", "city": "...", "address": "...", "role": "client" }

PATCH /api/v1/users/me
{ "name": "Aminata", "city": "Abidjan", "address": "..." }
-> { "id": "...", "name": "Aminata", "city": "Abidjan", "address": "..." }
```

Markets (admin)
```json
POST /api/v1/markets
{ "name": "Marché Cocody", "city": "Abidjan", "location_lat": 5.3532, "location_lng": -3.9874 }
-> { "id": "...", "name": "...", "is_active": true }

GET /api/v1/markets
-> [ { "id": "...", "name": "...", "city": "Abidjan" } ]

PATCH /api/v1/markets/:id
{ "name": "Marché Cocody 2" }
-> { "id": "...", "name": "Marché Cocody 2" }
```

Products (admin)
```json
POST /api/v1/products
{ "market_id": "...", "name": "Tomate", "category": "Légumes", "unit": "kg", "price_estimated": 1200 }
-> { "id": "...", "name": "Tomate" }

GET /api/v1/products?market_id=...
-> [ { "id": "...", "name": "Tomate", "price_estimated": 1200 } ]

PATCH /api/v1/products/:id
{ "price_estimated": 1000 }
-> { "id": "...", "price_estimated": 1000 }
```

Orders
```json
POST /api/v1/orders
{
  "market_id": "...",
  "delivery_address": "Cocody Angré, ...",
  "delivery_city": "Abidjan",
  "payment_method": "cash_on_delivery",
  "items": [
    { "product_id": "...", "quantity": 2, "price_estimated": 1200 },
    { "product_id": "...", "quantity": 1, "price_estimated": 800 }
  ]
}
-> { "id": "...", "status": "nouvelle", "price_estimated_total": 3200 }

GET /api/v1/orders/:id
-> { "id": "...", "status": "nouvelle", "items": [ ... ] }

GET /api/v1/orders?me=1
-> [ { "id": "...", "status": "payée" } ]

POST /api/v1/orders/:id/cancel
{ "reason": "Changement d'avis" }
-> { "id": "...", "status": "annulée" }

POST /api/v1/orders/:id/mark-failed
{ "reason": "Paiement échoué" }
-> { "id": "...", "status": "échec_paiement" }
```

### Sprint 1 — Architecture backend (NestJS)

Modules :
- AuthModule (OTP, JWT)
- UsersModule (profil, rôles)
- MarketsModule (CRUD admin)
- ProductsModule (CRUD admin)
- OrdersModule (création, lecture)
- DeliveriesModule (préparation pour sprint 4)
- CommonModule (validators, guards, pipes, config)

Services clés :
- OtpService (envoi/validation code)
- TokenService (JWT)
- PricingService (calcul total estimé)
- OrderService (création, lecture)

Sécurité :
- AuthGuard JWT sur endpoints.
- RolesGuard pour admin.
- ValidationPipe global + DTO.

### Sprint 1 — Règles de validation (DTO)

Users
- phone : format E.164, obligatoire, unique
- name : 2-120 caractères
- city : 2-120 caractères
- address : 5-250 caractères

Markets
- name : 2-160 caractères, obligatoire
- city : 2-120 caractères, obligatoire
- location_lat : -90 à 90
- location_lng : -180 à 180
- opening_hours : JSON (optionnel)

Products
- market_id : uuid, obligatoire
- name : 2-160 caractères, obligatoire
- category : 2-120 caractères (optionnel)
- unit : 1-40 caractères (optionnel, ex: kg, botte, pièce)
- price_estimated : >= 0

Orders
- market_id : uuid, obligatoire
- delivery_address : 5-250 caractères, obligatoire
- delivery_city : 2-120 caractères, obligatoire
- payment_method : enum mobile_money|cash_on_delivery
- items : 1..50 items
- item.product_id : uuid
- item.quantity : > 0
- item.price_estimated : >= 0

Deliveries
- courier_id : uuid, obligatoire
- status : enum assignée|en_achat|en_livraison|livrée
- distance_km : >= 0 (optionnel)
- eta_minutes : >= 0 (optionnel)

Règles globales
- `price_estimated_total` = somme(items.quantity * items.price_estimated)
- Rejet si produits inactifs
- Rejet si marché inactif

### Sprint 1 — Workflow statuts (transitions)

Commande
- Règle générale (mobile_money) :
  - nouvelle -> prix_validé -> payée -> en_achat -> en_livraison -> livrée
- Règle cash_on_delivery :
  - nouvelle -> prix_validé -> en_achat -> en_livraison -> livrée
  - La commande passe à payée uniquement après livraison confirmée
- Exceptions :
  - Échec paiement : prix_validé -> échec_paiement
  - Annulation : nouvelle|prix_validé -> annulée
  - Annulation tardive : gérée par admin uniquement
- Retours arrière interdits (sauf admin en cas d’erreur)

Livraison
- assignée -> en_achat -> en_livraison -> livrée
- Une livraison doit être liée à une commande payée

---

## Sprint 2 — App cliente (MVP core) — 2 semaines
Objectifs :
- Écrans essentiels cliente.
- Création de commande avec panier.
- Validation du prix estimé.

Livrables :
- Onboarding, liste marchés, catalogue, panier.
- Création de commande côté API.

Critères d’acceptation :
- Une cliente peut créer une commande valide.

Notes / décisions :
- Catalogue initial géré par admin.

Backlog détaillé (user stories) :
- En tant que cliente, je peux renseigner ma ville et mon adresse, afin de recevoir une livraison.
- En tant que cliente, je peux voir la liste des marchés disponibles, afin de choisir un marché.
- En tant que cliente, je peux parcourir le catalogue par catégorie, afin de trouver rapidement un article.
- En tant que cliente, je peux ajouter des articles à mon panier, afin de préparer ma commande.
- En tant que cliente, je peux modifier les quantités du panier, afin d’ajuster mon achat.
- En tant que cliente, je peux confirmer mon panier, afin de créer une commande.

Critères d’acceptation (Sprint 2) :
- Onboarding + sélection marché + catalogue fonctionnels.
- Panier avec ajout, modification, suppression.
- Création de commande depuis le panier via API.

---

## Sprint 3 — Paiement + statut commande — 2 semaines
Objectifs :
- Intégrer paiement (ou mock si nécessaire).
- Gérer le cycle de statuts.
- Suivi simple côté cliente.
- Ajouter une option paiement à la réception.

Livrables :
- Paiement branché.
- Statuts `nouvelle -> prix_validé -> payée`.
- Écran suivi commande basique.

Critères d’acceptation :
- Une commande peut être payée et suivie.

Notes / décisions :
- Provider paiement à confirmer.

Backlog détaillé (user stories) :
- En tant que cliente, je peux voir un récapitulatif du prix estimé, afin de décider de payer.
- En tant que cliente, je peux payer ma commande, afin de lancer le traitement.
- En tant que cliente, je peux choisir “payer à la réception”, afin de payer à la livraison.
- En tant que cliente, je peux suivre le statut de la commande, afin de savoir où elle en est.
- En tant que système, je peux appliquer un workflow de statuts, afin de sécuriser le process.

Critères d’acceptation (Sprint 3) :
- Paiement réel ou mock branché et fonctionnel.
- Statuts `nouvelle -> prix_validé -> payée` appliqués.
- Écran de suivi simple côté cliente.
- Option “payer à la réception” disponible et tracée en commande.

---

## Sprint 4 — App coursier (MVP core) — 2 semaines
Objectifs :
- Écrans coursier.
- Assignation/acceptation de commandes.
- Passage en `en_achat` puis `en_livraison`.

Livrables :
- App coursier : liste, détail, acceptation.
- API coursier + statuts.

Critères d’acceptation :
- Un coursier peut prendre et livrer une commande.

Notes / décisions :
- Stratégie d’assignation à valider.

Backlog détaillé (user stories) :
- En tant que coursier, je peux voir la liste des commandes disponibles, afin d’en accepter une.
- En tant que coursier, je peux accepter une commande, afin d’être assigné.
- En tant que coursier, je peux marquer “en achat”, afin d’indiquer le début d’exécution.
- En tant que coursier, je peux marquer “en livraison” puis “livrée”, afin de clôturer.

Critères d’acceptation (Sprint 4) :
- App coursier basique fonctionnelle.
- API d’assignation et de changement de statuts disponible.
- Une commande peut être entièrement exécutée par un coursier.

---

## Sprint 5 — Estimation délai (ETA) — 2 semaines
Objectifs :
- Calcul ETA basé distance + temps d’achat.
- Affichage ETA côté cliente.

Livrables :
- Intégration Maps.
- Service ETA côté backend.

Critères d’acceptation :
- ETA affiché avant paiement et cohérent.

Notes / décisions :
- Provider Maps à confirmer.

Backlog détaillé (user stories) :
- En tant que cliente, je peux voir un ETA avant paiement, afin d’évaluer le délai.
- En tant que système, je calcule un ETA basé sur distance + temps d’achat, afin d’être cohérent.
- En tant qu’admin, je peux configurer un temps d’achat moyen, afin d’ajuster l’ETA.

Critères d’acceptation (Sprint 5) :
- Service ETA côté backend opérationnel.
- ETA affiché côté cliente et stocké avec la commande.

---

## Sprint 6 — Admin & Ops — 2 semaines
Objectifs :
- Consolider l’admin.
- Gestion commandes + ajustement prix réel.
- Gestion marchés/produits.

Livrables :
- Dashboard admin.
- Écrans d’édition produits/marchés.
- Ajustement prix + validation.

Critères d’acceptation :
- Admin peut gérer données et corriger prix.

Notes / décisions :
- Rôles admin à préciser.

Backlog détaillé (user stories) :
- En tant qu’admin, je peux voir toutes les commandes, afin de superviser l’activité.
- En tant qu’admin, je peux ajuster le prix réel, afin de valider la commande.
- En tant qu’admin, je peux gérer les catégories, afin d’organiser le catalogue.
- En tant qu’admin, je peux activer/désactiver des produits, afin de refléter la disponibilité.

Critères d’acceptation (Sprint 6) :
- Dashboard admin avec commandes et produits.
- Ajustement prix et validation possibles.

---

## Sprint 7 — Qualité, sécurité, préparation lancement — 2 semaines
Objectifs :
- Tests critiques.
- Sécurité basique.
- Monitoring & logs.

Livrables :
- Tests E2E clés.
- Limites de sécurité (rate limit, validation).
- Observabilité minimale.

Critères d’acceptation :
- Parcours client complet stable.

Notes / décisions :
- Outils monitoring à choisir.

Backlog détaillé (user stories) :
- En tant que système, je valide les entrées utilisateur, afin de réduire les erreurs.
- En tant que système, je limite les abus (rate limit), afin de sécuriser l’API.
- En tant qu’équipe, je peux suivre les erreurs, afin de corriger rapidement.
- En tant que QA, je peux tester un parcours complet, afin d’assurer la stabilité.

Critères d’acceptation (Sprint 7) :
- Tests E2E critiques disponibles.
- Rate limiting + validation d’API en place.
- Monitoring basique actif.

---

## Sprint 8 — Lancement pilote — 2 semaines
Objectifs :
- Déployer en prod.
- Onboard premier marché + coursiers.
- Support client.

Livrables :
- App en production.
- Process support.
- Rapport post‑lancement.

Critères d’acceptation :
- Commandes réelles livrées avec succès.

Notes / décisions :
- Ville pilote à confirmer.

Backlog détaillé (user stories) :
- En tant qu’admin, je peux onboard un marché pilote, afin de lancer l’activité.
- En tant que coursier, je peux recevoir des commandes réelles, afin de livrer.
- En tant que support, je peux suivre et résoudre les incidents, afin d’améliorer l’expérience.
- En tant que fondateur, je peux analyser les commandes, afin de préparer l’extension.

Critères d’acceptation (Sprint 8) :
- Déploiement production OK.
- Au moins un marché et des coursiers actifs.
- Premières commandes réelles livrées.
