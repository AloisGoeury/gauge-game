# Gauge Game

Petit jeu web full-stack mobile-first avec React, Vite, Express, Socket.IO et PostgreSQL.

## Prérequis

- Node.js 22 LTS
- PostgreSQL
- npm

## Installation

```bash
npm install
cp .env.example .env
```

Renseignez `DATABASE_URL` dans `.env`.

## Base de données

```bash
npm run db:migrate
npm run db:seed
```

Les thèmes aléatoires utilisent seulement les thèmes `is_public = true` et `is_approved = true`.
Les thèmes proposés publics par les joueurs sont enregistrés avec `is_approved = false`.

## Développement

```bash
npm run dev
```

- Client Vite : `http://localhost:5173`
- Serveur Express/Socket.IO : `http://localhost:3000`

Le client proxifie `/api` et `/socket.io` vers le serveur local.

## Production

```bash
npm run build
npm start
```

En production, Express sert `client/dist` et écoute `process.env.PORT`.

## Railway

Créez une application Node et ajoutez un service PostgreSQL.
Variables nécessaires :

- `DATABASE_URL`
- `NODE_ENV=production`
- `PORT` fourni par Railway
- `CLIENT_URL` optionnel en développement seulement

Commande de build :

```bash
npm run build
```

Commande de start :

```bash
npm start
```

Lancez les migrations et le seed depuis Railway ou localement avec la `DATABASE_URL` Railway :

```bash
npm run db:migrate
npm run db:seed
```

## Scripts

- `npm run dev` : client + serveur en parallèle
- `npm run dev:client` : Vite seulement
- `npm run dev:server` : Express/Socket.IO seulement
- `npm run build` : build shared, client et serveur
- `npm start` : serveur production
- `npm run lint` : ESLint
- `npm run typecheck` : TypeScript
- `npm test` : Vitest unitaires et composants
- `npm run test:e2e` : Playwright
- `npm run db:migrate` : migrations SQL
- `npm run db:seed` : thèmes mock approuvés

## Notes MVP

- Deux joueurs maximum.
- Le serveur génère la cible, calcule le score et filtre l'état envoyé à chaque joueur.
- Le joueur qui devine ne reçoit pas la cible avant la révélation.
- Les rôles changent par blocs de 3 manches par défaut.
- `DISABLE_DB=true` permet de lancer le serveur en mémoire pour les tests E2E.
