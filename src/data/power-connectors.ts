import type { PowerConnector } from '../types';

export const POWER_CONNECTORS: PowerConnector[] = [
  // ── United States ──
  {
    region: 'US',
    name: 'NEMA 5-20',
    description: 'Standard 20A 120V receptacle',
    maxAmps: 20,
    voltage: 120,
    phases: 1,
    frequency: 60,
    usableWatts: 1920, // 20 * 120 * 0.8
    wiringNotes: 'Standard 20A branch circuit. 12 AWG minimum wiring. Dedicated circuit recommended for IT loads.',
    commonUse: 'Small loads under 1920W, single server or small switch',
  },
  {
    region: 'US',
    name: 'NEMA L5-20',
    description: 'Locking 20A 120V plug',
    maxAmps: 20,
    voltage: 120,
    phases: 1,
    frequency: 60,
    usableWatts: 1920,
    wiringNotes: 'Locking connector prevents accidental disconnection. 12 AWG minimum wiring.',
    commonUse: 'Small UPS units (1-1.5 kVA) on 120V circuits',
  },
  {
    region: 'US',
    name: 'NEMA L6-20',
    description: 'Locking 20A 240V plug',
    maxAmps: 20,
    voltage: 240,
    phases: 1,
    frequency: 60,
    usableWatts: 3840, // 20 * 240 * 0.8
    wiringNotes: 'Dedicated 20A 240V single-phase circuit required. 12 AWG minimum wiring.',
    commonUse: 'Standard for 2-3 kVA UPS on 240V',
  },
  {
    region: 'US',
    name: 'NEMA L6-30',
    description: 'Locking 30A 240V plug',
    maxAmps: 30,
    voltage: 240,
    phases: 1,
    frequency: 60,
    usableWatts: 5760, // 30 * 240 * 0.8
    wiringNotes: 'Dedicated 30A 240V single-phase circuit required. 10 AWG minimum wiring.',
    commonUse: 'Standard for 3-5 kVA UPS and medium rack deployments',
  },
  {
    region: 'US',
    name: 'NEMA L6-50',
    description: 'Locking 50A 240V plug',
    maxAmps: 50,
    voltage: 240,
    phases: 1,
    frequency: 60,
    usableWatts: 9600, // 50 * 240 * 0.8
    wiringNotes: 'Dedicated 50A 240V single-phase circuit required. 6 AWG minimum wiring.',
    commonUse: 'Standard for 6-10 kVA UPS and larger rack deployments',
  },

  // ── United Kingdom ──
  {
    region: 'UK',
    name: 'BS 1363',
    description: 'Standard UK 13A plug (3-pin fused)',
    maxAmps: 13,
    voltage: 230,
    phases: 1,
    frequency: 50,
    usableWatts: 3000, // Practical limit ~3000W with 13A fuse
    wiringNotes: 'Standard UK ring main or dedicated radial circuit. 2.5mm\u00B2 minimum cable.',
    commonUse: 'Small loads under 3000W, small UPS units up to 1.5 kVA',
  },
  {
    region: 'UK',
    name: 'IEC 60309 16A (Blue)',
    description: 'Blue commando 16A single-phase plug',
    maxAmps: 16,
    voltage: 230,
    phases: 1,
    frequency: 50,
    usableWatts: 3680, // 16 * 230
    wiringNotes: 'Dedicated 16A single-phase circuit with IEC 60309 outlet required. 2.5mm\u00B2 minimum cable.',
    commonUse: 'Standard for 2-3 kVA UPS and small-medium rack deployments',
  },
  {
    region: 'UK',
    name: 'IEC 60309 32A (Blue)',
    description: 'Blue commando 32A single-phase plug',
    maxAmps: 32,
    voltage: 230,
    phases: 1,
    frequency: 50,
    usableWatts: 7360, // 32 * 230
    wiringNotes: 'Dedicated 32A single-phase circuit with IEC 60309 outlet required. 6mm\u00B2 minimum cable.',
    commonUse: 'Standard for 5-10 kVA UPS and medium-large rack deployments',
  },
  {
    region: 'UK',
    name: 'IEC 60309 63A (Red)',
    description: 'Red commando 63A three-phase plug',
    maxAmps: 63,
    voltage: 400,
    phases: 3,
    frequency: 50,
    usableWatts: 43000, // 63 * 400 * 1.73 * 0.8 approx
    wiringNotes: 'Three-phase supply required. Engage a qualified electrician. 16mm\u00B2 minimum cable.',
    commonUse: 'Large deployments exceeding 7.3 kW single-phase capacity',
  },

  // ── European Union ──
  {
    region: 'EU',
    name: 'CEE 7/7 Schuko',
    description: 'Standard European 16A Schuko plug',
    maxAmps: 16,
    voltage: 230,
    phases: 1,
    frequency: 50,
    usableWatts: 3680, // 16 * 230
    wiringNotes: 'Standard Schuko outlet on dedicated circuit recommended. 2.5mm\u00B2 minimum cable.',
    commonUse: 'Small loads under 3680W, small UPS units up to 2 kVA',
  },
  {
    region: 'EU',
    name: 'IEC 60309 16A (Blue)',
    description: 'Blue commando 16A single-phase plug (CEE)',
    maxAmps: 16,
    voltage: 230,
    phases: 1,
    frequency: 50,
    usableWatts: 3680,
    wiringNotes: 'Dedicated 16A single-phase circuit with IEC 60309 outlet required. 2.5mm\u00B2 minimum cable.',
    commonUse: 'Standard for 2-3 kVA UPS and small-medium rack deployments',
  },
  {
    region: 'EU',
    name: 'IEC 60309 32A (Blue)',
    description: 'Blue commando 32A single-phase plug (CEE)',
    maxAmps: 32,
    voltage: 230,
    phases: 1,
    frequency: 50,
    usableWatts: 7360,
    wiringNotes: 'Dedicated 32A single-phase circuit with IEC 60309 outlet required. 6mm\u00B2 minimum cable.',
    commonUse: 'Standard for 5-10 kVA UPS and medium-large rack deployments',
  },
  {
    region: 'EU',
    name: 'IEC 60309 63A (Red)',
    description: 'Red commando 63A three-phase plug (CEE)',
    maxAmps: 63,
    voltage: 400,
    phases: 3,
    frequency: 50,
    usableWatts: 43000,
    wiringNotes: 'Three-phase supply required. Engage a qualified electrician. 16mm\u00B2 minimum cable.',
    commonUse: 'Large deployments exceeding 7.3 kW single-phase capacity',
  },
];

/**
 * Get all power connectors for a given region.
 */
export function getConnectorsByRegion(region: string): PowerConnector[] {
  return POWER_CONNECTORS.filter(c => c.region === region);
}

/**
 * Find the smallest suitable connector for a given wattage and region.
 */
export function findSuitableConnector(
  totalPeakWatts: number,
  region: string
): PowerConnector | null {
  const regional = getConnectorsByRegion(region)
    .filter(c => c.phases === 1) // Prefer single-phase first
    .sort((a, b) => a.usableWatts - b.usableWatts);

  for (const connector of regional) {
    if (connector.usableWatts >= totalPeakWatts) {
      return connector;
    }
  }

  // If no single-phase connector is sufficient, return three-phase option
  const threePhase = getConnectorsByRegion(region).find(c => c.phases === 3);
  return threePhase || null;
}
