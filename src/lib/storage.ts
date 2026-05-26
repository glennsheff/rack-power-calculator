import type { HardwareItem, RackConfiguration } from '../types';

// ============================================================
// API client — talks to /api/hardware and /api/configurations
// (Vercel Functions backed by Neon Postgres)
// ============================================================

// snake_case row → camelCase app object
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
    poePowered: row.poe_powered === true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

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
    poe_powered: item.poePowered,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

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

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} → ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// ============================================================
// Hardware Items
// ============================================================

export async function getHardwareLibrary(): Promise<HardwareItem[]> {
  try {
    const rows = await request<Record<string, unknown>[]>('/api/hardware');
    return rows.map(rowToHardware);
  } catch (err) {
    console.error('Failed to fetch hardware:', err);
    return [];
  }
}

export async function upsertHardwareItem(item: HardwareItem): Promise<void> {
  try {
    await request<{ ok: true }>('/api/hardware', {
      method: 'POST',
      body: JSON.stringify(hardwareToRow(item)),
    });
  } catch (err) {
    console.error('Failed to upsert hardware item:', err);
  }
}

export async function deleteHardwareItem(id: string): Promise<void> {
  try {
    await request<{ ok: true }>(`/api/hardware?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Failed to delete hardware item:', err);
  }
}

export async function bulkUpsertHardware(items: HardwareItem[]): Promise<void> {
  if (items.length === 0) return;
  try {
    await request<{ ok: true }>('/api/hardware', {
      method: 'POST',
      body: JSON.stringify(items.map(hardwareToRow)),
    });
  } catch (err) {
    console.error('Failed to bulk upsert hardware:', err);
  }
}

// ============================================================
// Rack Configurations
// ============================================================

export async function getRackConfigurations(): Promise<RackConfiguration[]> {
  try {
    const rows = await request<Record<string, unknown>[]>('/api/configurations');
    return rows.map(rowToConfig);
  } catch (err) {
    console.error('Failed to fetch rack configs:', err);
    return [];
  }
}

export async function saveRackConfiguration(config: RackConfiguration): Promise<void> {
  try {
    await request<{ ok: true }>('/api/configurations', {
      method: 'POST',
      body: JSON.stringify(configToRow(config)),
    });
  } catch (err) {
    console.error('Failed to save rack config:', err);
  }
}

export async function deleteRackConfiguration(id: string): Promise<void> {
  try {
    await request<{ ok: true }>(`/api/configurations?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Failed to delete rack config:', err);
  }
}
