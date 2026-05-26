# Database — Neon Postgres

Schema and seed scripts for the Neon-backed Postgres database.

## First-time setup

1. **Create the Vercel project** (one-time):
   ```bash
   npx vercel link
   ```

2. **Add the Vercel Postgres (Neon) integration**:
   - Vercel dashboard → your project → Storage → Create Database → Postgres (Neon)
   - This populates `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and a handful of `POSTGRES_*` aliases in your project env vars.

3. **Pull env vars locally**:
   ```bash
   npx vercel env pull .env.local
   ```

4. **Apply schema + seed data**:
   ```bash
   npm run db:setup
   ```

   This runs `db/seed.js`, which applies `db/schema.sql` and imports the latest backup from `backups/`.

## Re-running

`db:setup` is idempotent. It uses `CREATE TABLE IF NOT EXISTS` for schema and `INSERT … ON CONFLICT DO UPDATE` for data, so re-running won't lose anything — it'll just bring the DB back to backup state for rows that exist in both.

## Pointing at a specific backup

```bash
node db/seed.js backups/2026-03-25T10-03-16
```

Defaults to the most recent backup directory if no path is given.
