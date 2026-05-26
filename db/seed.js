#!/usr/bin/env node
// Apply schema + import latest backup into Neon Postgres.
//
// Usage:
//   DATABASE_URL=postgres://... node db/seed.js
//   DATABASE_URL=postgres://... node db/seed.js backups/2026-03-25T10-03-16
//
// Reads the latest backup directory if no path is given.
// Idempotent — safe to re-run (upserts by id).

import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL (or DATABASE_URL_UNPOOLED). Run `vercel env pull` first, or set it in your shell.');
  process.exit(1);
}

function findLatestBackup() {
  const backupsDir = join(repoRoot, 'backups');
  const dirs = readdirSync(backupsDir)
    .filter((d) => statSync(join(backupsDir, d)).isDirectory())
    .sort()
    .reverse();
  if (dirs.length === 0) {
    throw new Error(`No backup directories found in ${backupsDir}`);
  }
  return join(backupsDir, dirs[0]);
}

async function main() {
  const arg = process.argv[2];
  const backupPath = arg ? resolve(arg) : findLatestBackup();
  console.log(`Using backup: ${backupPath}`);

  const full = JSON.parse(readFileSync(join(backupPath, 'full-backup.json'), 'utf8'));
  console.log(`  hardware_items:      ${full.hardware_items.length} rows`);
  console.log(`  rack_configurations: ${full.rack_configurations.length} rows`);

  const sql = neon(DATABASE_URL);

  // 1. Schema
  const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  // neon's tagged template doesn't accept multi-statement strings directly,
  // so split on `;` at end of line. Comments and blank statements are skipped.
  const statements = schemaSql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('--'));
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log('Schema applied.');

  // 2. Hardware items (upsert)
  for (const row of full.hardware_items) {
    await sql`
      INSERT INTO hardware_items (
        id, name, model, category,
        power_watts, peak_power_watts, heat_output_btu,
        power_supply_count, power_supply_type,
        rack_units, weight_kg, notes, status, poe_powered,
        created_at, updated_at
      ) VALUES (
        ${row.id}, ${row.name}, ${row.model}, ${row.category},
        ${row.power_watts}, ${row.peak_power_watts}, ${row.heat_output_btu},
        ${row.power_supply_count}, ${row.power_supply_type},
        ${row.rack_units}, ${row.weight_kg}, ${row.notes ?? ''}, ${row.status}, ${row.poe_powered ?? false},
        ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        name               = EXCLUDED.name,
        model              = EXCLUDED.model,
        category           = EXCLUDED.category,
        power_watts        = EXCLUDED.power_watts,
        peak_power_watts   = EXCLUDED.peak_power_watts,
        heat_output_btu    = EXCLUDED.heat_output_btu,
        power_supply_count = EXCLUDED.power_supply_count,
        power_supply_type  = EXCLUDED.power_supply_type,
        rack_units         = EXCLUDED.rack_units,
        weight_kg          = EXCLUDED.weight_kg,
        notes              = EXCLUDED.notes,
        status             = EXCLUDED.status,
        poe_powered        = EXCLUDED.poe_powered,
        updated_at         = EXCLUDED.updated_at
    `;
  }
  console.log(`Imported ${full.hardware_items.length} hardware items.`);

  // 3. Rack configurations (upsert)
  for (const row of full.rack_configurations) {
    await sql`
      INSERT INTO rack_configurations (
        id, name, store_name, region, items,
        desired_runtime_minutes, include_redundancy, ambient_temp_celsius,
        notes, created_at, updated_at
      ) VALUES (
        ${row.id}, ${row.name ?? ''}, ${row.store_name ?? ''}, ${row.region}, ${JSON.stringify(row.items ?? [])}::jsonb,
        ${row.desired_runtime_minutes}, ${row.include_redundancy}, ${row.ambient_temp_celsius},
        ${row.notes ?? ''}, ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        name                    = EXCLUDED.name,
        store_name              = EXCLUDED.store_name,
        region                  = EXCLUDED.region,
        items                   = EXCLUDED.items,
        desired_runtime_minutes = EXCLUDED.desired_runtime_minutes,
        include_redundancy      = EXCLUDED.include_redundancy,
        ambient_temp_celsius    = EXCLUDED.ambient_temp_celsius,
        notes                   = EXCLUDED.notes,
        updated_at              = EXCLUDED.updated_at
    `;
  }
  console.log(`Imported ${full.rack_configurations.length} rack configurations.`);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
