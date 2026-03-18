import { supabase } from './supabase';
import type { HardwareItem, RackConfiguration } from '../types';

// ============================================================
// Hardware Items — Supabase backed
// ============================================================

// Convert DB row (snake_case) → app object (camelCase)
function rowToHardware(row: Record<string, unknown>): HardwareItem {
  return {
    id: row.id as string,
    name: row.name as string,
    model: row.model as string,
    category: row.category as HardwareItem['category'],
    powerWatts: Number(row.power_watts),
    peakPowerWatts: Number(row.peak_power_watts),
    heatOutputBTU: Number(row.heat_output_btu),
    powerSupplyCount: Number(row.power_supply_count),
    powerSupplyType: row.power_supply_type as string,
    rackUnits: Number(row.rack_units),
    weight_kg: Number(row.weight_kg),
    notes: row.notes as string,
    status: row.status as HardwareItem['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// Convert app object → DB row
function hardwareToRow(item: HardwareItem) {
  return {
    id: item.id,
    name: item.name,
    model: item.model,
    category: item.category,
    power_watts: item.powerWatts,
    peak_power_watts: item.peakPowerWatts,
    heat_output_btu: item.heatOutputBTU,
    power_supply_count: item.powerSupplyCount,
    power_supply_type: item.powerSupplyType,
    rack_units: item.rackUnits,
    weight_kg: item.weight_kg,
    notes: item.notes,
    status: item.status,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export async function getHardwareLibrary(): Promise<HardwareItem[]> {
  const { data, error } = await supabase
    .from('hardware_items')
    .select('*')
    .order('name');

  if (error) {
    console.error('Failed to fetch hardware:', error);
    return [];
  }

  return (data || []).map(rowToHardware);
}

export async function upsertHardwareItem(item: HardwareItem): Promise<void> {
  const { error } = await supabase
    .from('hardware_items')
    .upsert(hardwareToRow(item));

  if (error) {
    console.error('Failed to upsert hardware item:', error);
  }
}

export async function deleteHardwareItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('hardware_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete hardware item:', error);
  }
}

export async function bulkUpsertHardware(items: HardwareItem[]): Promise<void> {
  const rows = items.map(hardwareToRow);
  const { error } = await supabase
    .from('hardware_items')
    .upsert(rows);

  if (error) {
    console.error('Failed to bulk upsert hardware:', error);
  }
}

// ============================================================
// Rack Configurations — Supabase backed
// ============================================================

function rowToConfig(row: Record<string, unknown>): RackConfiguration {
  return {
    id: row.id as string,
    name: row.name as string,
    storeName: row.store_name as string,
    region: row.region as RackConfiguration['region'],
    items: row.items as RackConfiguration['items'],
    desiredRuntimeMinutes: Number(row.desired_runtime_minutes),
    includeRedundancy: row.include_redundancy as boolean,
    ambientTempCelsius: Number(row.ambient_temp_celsius),
    notes: row.notes as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function configToRow(config: RackConfiguration) {
  return {
    id: config.id,
    name: config.name,
    store_name: config.storeName,
    region: config.region,
    items: config.items,
    desired_runtime_minutes: config.desiredRuntimeMinutes,
    include_redundancy: config.includeRedundancy,
    ambient_temp_celsius: config.ambientTempCelsius,
    notes: config.notes,
    created_at: config.createdAt,
    updated_at: config.updatedAt,
  };
}

export async function getRackConfigurations(): Promise<RackConfiguration[]> {
  const { data, error } = await supabase
    .from('rack_configurations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch rack configs:', error);
    return [];
  }

  return (data || []).map(rowToConfig);
}

export async function saveRackConfiguration(config: RackConfiguration): Promise<void> {
  const { error } = await supabase
    .from('rack_configurations')
    .upsert(configToRow(config));

  if (error) {
    console.error('Failed to save rack config:', error);
  }
}

export async function deleteRackConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('rack_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete rack config:', error);
  }
}
