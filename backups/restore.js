#!/usr/bin/env node
/**
 * Restore Supabase database from a backup.
 *
 * Usage:
 *   node backups/restore.js                          # restores latest backup
 *   node backups/restore.js backups/2026-03-25T10-03-16  # restores specific backup
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://rlqnqohexqewsmcrztvp.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscW5xb2hleHFld3NtY3J6dHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4Mjk2NjIsImV4cCI6MjA4OTQwNTY2Mn0.C3zquCZlwloc4IE-BBu2JdGilJ9AeNDgBpHRypP6yjk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const backupsDir = path.join(__dirname);

async function restore(backupPath) {
  // Find the backup directory
  if (!backupPath) {
    const dirs = fs
      .readdirSync(backupsDir)
      .filter((d) => fs.statSync(path.join(backupsDir, d)).isDirectory())
      .sort()
      .reverse();
    if (dirs.length === 0) {
      console.error('No backup directories found in', backupsDir);
      process.exit(1);
    }
    backupPath = path.join(backupsDir, dirs[0]);
    console.log('Using latest backup:', backupPath);
  }

  const fullBackup = path.join(backupPath, 'full-backup.json');
  if (!fs.existsSync(fullBackup)) {
    console.error('full-backup.json not found in', backupPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(fullBackup, 'utf-8'));
  console.log(`Backup from: ${data.backed_up_at}`);
  console.log(`  hardware_items: ${data.hardware_items.length} rows`);
  console.log(`  rack_configurations: ${data.rack_configurations.length} rows`);

  // Restore hardware_items (upsert in batches of 50)
  const hwRows = data.hardware_items;
  for (let i = 0; i < hwRows.length; i += 50) {
    const batch = hwRows.slice(i, i + 50);
    const { error } = await supabase.from('hardware_items').upsert(batch);
    if (error) {
      console.error(`hardware_items batch ${i} error:`, error);
      process.exit(1);
    }
  }
  console.log(`Restored ${hwRows.length} hardware items.`);

  // Restore rack_configurations
  const cfgRows = data.rack_configurations;
  if (cfgRows.length > 0) {
    const { error } = await supabase.from('rack_configurations').upsert(cfgRows);
    if (error) {
      console.error('rack_configurations error:', error);
      process.exit(1);
    }
  }
  console.log(`Restored ${cfgRows.length} rack configurations.`);

  console.log('Restore complete.');
}

const arg = process.argv[2];
restore(arg ? path.resolve(arg) : null).catch((e) => {
  console.error(e);
  process.exit(1);
});
