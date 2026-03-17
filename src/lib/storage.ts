import type { HardwareItem, RackConfiguration } from '../types';

const KEYS = {
  HARDWARE_LIBRARY: 'aifi-rack-hardware-library',
  RACK_CONFIGURATIONS: 'aifi-rack-configurations',
  SEEDED: 'aifi-rack-seeded',
} as const;

export function getHardwareLibrary(): HardwareItem[] {
  try {
    const raw = localStorage.getItem(KEYS.HARDWARE_LIBRARY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HardwareItem[];
  } catch {
    return [];
  }
}

export function setHardwareLibrary(items: HardwareItem[]): void {
  localStorage.setItem(KEYS.HARDWARE_LIBRARY, JSON.stringify(items));
}

export function getRackConfigurations(): RackConfiguration[] {
  try {
    const raw = localStorage.getItem(KEYS.RACK_CONFIGURATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RackConfiguration[];
  } catch {
    return [];
  }
}

export function setRackConfigurations(configs: RackConfiguration[]): void {
  localStorage.setItem(KEYS.RACK_CONFIGURATIONS, JSON.stringify(configs));
}

export function saveRackConfiguration(config: RackConfiguration): void {
  const configs = getRackConfigurations();
  const existingIndex = configs.findIndex(c => c.id === config.id);
  if (existingIndex >= 0) {
    configs[existingIndex] = config;
  } else {
    configs.push(config);
  }
  setRackConfigurations(configs);
}

export function deleteRackConfiguration(id: string): void {
  const configs = getRackConfigurations();
  setRackConfigurations(configs.filter(c => c.id !== id));
}

export function isSeeded(): boolean {
  return localStorage.getItem(KEYS.SEEDED) === 'true';
}

export function markSeeded(): void {
  localStorage.setItem(KEYS.SEEDED, 'true');
}
