# AiFi Rack Power Calculator

Internal AiFi tool for the Solutions team — calculates UPS sizing, mains power, and cooling requirements for comms/server racks deployed in retail stores and venues.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7 (BrowserRouter)
- Neon Postgres (via Vercel Postgres integration)
- Deployed on Vercel

## Local development

```bash
# Install
npm install --legacy-peer-deps

# Pull env vars from Vercel (one-time, requires `vercel link` first)
npx vercel env pull .env.local

# Dev server (Vite only — API functions don't run)
npm run dev

# Dev server with API functions
npx vercel dev
```

Use `vercel dev` when you need to exercise the `/api/*` endpoints; plain `vite` is faster for UI-only work.

## Database setup

First-time setup of the Neon database (creates tables and seeds data from the latest `backups/` snapshot):

```bash
npm run db:setup
```

See [`db/README.md`](db/README.md) for the full setup walkthrough.

## Deployment

Pushed branches deploy automatically to Vercel previews. Merges to `main` go to production. There is no manual deploy step.

## Project structure

```
api/                  Vercel Functions (Neon Postgres-backed CRUD)
db/                   Schema + seed script
src/
  components/         UI components (calculator, hardware, layout, ui)
  context/            React Context providers
  data/               Static data (UPS models, power connectors, default hardware)
  lib/                Calculations, storage client, export, hash
  pages/              Top-level pages
  types/              Shared TypeScript types
backups/              JSON snapshots of the Neon DB
public/assets/        AiFi logos
```

See [`CLAUDE.md`](CLAUDE.md) for the full project brief, design system, and calculation logic.
