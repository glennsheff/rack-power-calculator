import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(DATABASE_URL);

export interface HardwareRow {
  id: string;
  name: string;
  model: string;
  category: string;
  power_watts: number;
  peak_power_watts: number;
  heat_output_btu: number;
  power_supply_count: number;
  power_supply_type: string;
  rack_units: number;
  weight_kg: number;
  notes: string;
  status: string;
  poe_powered: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigRow {
  id: string;
  name: string;
  store_name: string;
  region: string;
  items: Array<{ hardwareId: string; quantity: number }>;
  desired_runtime_minutes: number;
  include_redundancy: boolean;
  ambient_temp_celsius: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
