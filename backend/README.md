# SuguChap Backend (Sprint 1)

## Prerequis
- Node.js 18+
- PostgreSQL

## Configuration
- Copier `.env.example` vers `.env` et ajuster `MONGO_URI` et `JWT_SECRET`.

## Base de donnees
- MongoDB Atlas (URI via `MONGO_URI`).

## Seed (marches/produits)
```bash
npm run seed
```

## Lancer l'API
```bash
npm install
npm run start:dev
```

## Swagger
- `http://localhost:3000/api/docs`

## Endpoints Sprint 1
- Auth: `POST /api/v1/auth/otp/request`, `POST /api/v1/auth/otp/verify`
- Users: `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- Markets (admin): `POST /api/v1/markets`, `GET /api/v1/markets`, `PATCH /api/v1/markets/:id`, `DELETE /api/v1/markets/:id`
- Products (admin): `POST /api/v1/products`, `GET /api/v1/products?market_id=`, `PATCH /api/v1/products/:id`, `DELETE /api/v1/products/:id`
- Orders: `POST /api/v1/orders`, `GET /api/v1/orders/:id`, `GET /api/v1/orders?me=1`, `POST /api/v1/orders/:id/cancel`, `POST /api/v1/orders/:id/mark-failed`
