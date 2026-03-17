import type { UPSModel } from '../types';

export const UPS_MODELS: UPSModel[] = [
  // ── APC Smart-UPS SRT ──
  {
    id: 'apc-srt',
    manufacturer: 'APC',
    series: 'Smart-UPS SRT',
    kvaRatings: [1, 1.5, 2.2, 3, 5, 6, 8, 10],
    formFactor: 'rackmount',
    rackUnits: 3,
    topology: 'online-double-conversion',
    inputOptions: [
      { region: 'US', connector: 'NEMA L6-30', maxAmps: 30 },
      { region: 'UK', connector: 'IEC 60309 16A', maxAmps: 16 },
      { region: 'EU', connector: 'IEC 60309 16A', maxAmps: 16 },
    ],
    outputOptions: ['IEC C13 x8', 'IEC C19 x4'],
    runtimeCurve: [
      { loadPercent: 25, runtimeMinutes: 60 },
      { loadPercent: 50, runtimeMinutes: 27 },
      { loadPercent: 75, runtimeMinutes: 14 },
      { loadPercent: 100, runtimeMinutes: 8 },
    ],
    extendedBatteryOption: true,
    batteryLifeYears: '3-5',
    warrantyYears: 3,
    notes: 'Online double-conversion topology. Extended battery packs (SRT72/96/192BP) available for longer runtime.',
  },

  // ── APC Smart-UPS On-Line ──
  {
    id: 'apc-srt-online',
    manufacturer: 'APC',
    series: 'Smart-UPS On-Line',
    kvaRatings: [1, 1.5, 2.2, 3],
    formFactor: 'rackmount',
    rackUnits: 2,
    topology: 'online-double-conversion',
    inputOptions: [
      { region: 'US', connector: 'NEMA L5-20', maxAmps: 20 },
      { region: 'UK', connector: 'IEC 60309 16A', maxAmps: 16 },
      { region: 'EU', connector: 'IEC 60309 16A', maxAmps: 16 },
    ],
    outputOptions: ['IEC C13 x6', 'IEC C19 x2'],
    runtimeCurve: [
      { loadPercent: 25, runtimeMinutes: 48 },
      { loadPercent: 50, runtimeMinutes: 20 },
      { loadPercent: 75, runtimeMinutes: 11 },
      { loadPercent: 100, runtimeMinutes: 6 },
    ],
    extendedBatteryOption: true,
    batteryLifeYears: '3-5',
    warrantyYears: 3,
    notes: 'Compact online double-conversion UPS for small rack deployments.',
  },

  // ── Eaton 5PX Gen 2 ──
  {
    id: 'eaton-5px-g2',
    manufacturer: 'Eaton',
    series: '5PX Gen 2',
    kvaRatings: [1, 1.5, 2.2, 3],
    formFactor: 'rackmount',
    rackUnits: 2,
    topology: 'line-interactive',
    inputOptions: [
      { region: 'US', connector: 'NEMA L5-20', maxAmps: 20 },
      { region: 'UK', connector: 'IEC 60309 16A', maxAmps: 16 },
      { region: 'EU', connector: 'CEE 7/7 Schuko', maxAmps: 16 },
    ],
    outputOptions: ['IEC C13 x8', 'IEC C19 x1'],
    runtimeCurve: [
      { loadPercent: 25, runtimeMinutes: 55 },
      { loadPercent: 50, runtimeMinutes: 22 },
      { loadPercent: 75, runtimeMinutes: 12 },
      { loadPercent: 100, runtimeMinutes: 7 },
    ],
    extendedBatteryOption: true,
    batteryLifeYears: '3-5',
    warrantyYears: 3,
    notes: 'High-efficiency line-interactive UPS with Energy Star certification. Eaton ABM battery management extends battery life.',
  },

  // ── Eaton 9PX ──
  {
    id: 'eaton-9px',
    manufacturer: 'Eaton',
    series: '9PX',
    kvaRatings: [1, 1.5, 2.2, 3, 5, 6, 8, 10, 11],
    formFactor: 'rackmount',
    rackUnits: 3,
    topology: 'online-double-conversion',
    inputOptions: [
      { region: 'US', connector: 'NEMA L6-30', maxAmps: 30 },
      { region: 'UK', connector: 'IEC 60309 32A', maxAmps: 32 },
      { region: 'EU', connector: 'IEC 60309 32A', maxAmps: 32 },
    ],
    outputOptions: ['IEC C13 x8', 'IEC C19 x4'],
    runtimeCurve: [
      { loadPercent: 25, runtimeMinutes: 62 },
      { loadPercent: 50, runtimeMinutes: 28 },
      { loadPercent: 75, runtimeMinutes: 15 },
      { loadPercent: 100, runtimeMinutes: 9 },
    ],
    extendedBatteryOption: true,
    batteryLifeYears: '3-5',
    warrantyYears: 3,
    notes: 'Online double-conversion with up to 99% efficiency in Energy Saver System mode. Hot-swappable batteries.',
  },

  // ── Vertiv Liebert GXT5 ──
  {
    id: 'vertiv-gxt5',
    manufacturer: 'Vertiv',
    series: 'Liebert GXT5',
    kvaRatings: [1, 1.5, 2, 3, 5, 6, 8, 10],
    formFactor: 'rack-tower',
    rackUnits: 2,
    topology: 'online-double-conversion',
    inputOptions: [
      { region: 'US', connector: 'NEMA L6-30', maxAmps: 30 },
      { region: 'UK', connector: 'IEC 60309 16A', maxAmps: 16 },
      { region: 'EU', connector: 'IEC 60309 16A', maxAmps: 16 },
    ],
    outputOptions: ['IEC C13 x6', 'IEC C19 x2'],
    runtimeCurve: [
      { loadPercent: 25, runtimeMinutes: 52 },
      { loadPercent: 50, runtimeMinutes: 23 },
      { loadPercent: 75, runtimeMinutes: 13 },
      { loadPercent: 100, runtimeMinutes: 7 },
    ],
    extendedBatteryOption: true,
    batteryLifeYears: '3-5',
    warrantyYears: 2,
    notes: 'Online double-conversion with 0.9 output power factor. Convertible rack/tower form factor. Hot-swappable batteries.',
  },

  // ── CyberPower OL Series ──
  {
    id: 'cyberpower-ol',
    manufacturer: 'CyberPower',
    series: 'OL Series',
    kvaRatings: [1, 1.5, 2, 3, 5, 6, 8, 10],
    formFactor: 'rackmount',
    rackUnits: 2,
    topology: 'online-double-conversion',
    inputOptions: [
      { region: 'US', connector: 'NEMA L6-20', maxAmps: 20 },
      { region: 'UK', connector: 'IEC 60309 16A', maxAmps: 16 },
      { region: 'EU', connector: 'IEC 60309 16A', maxAmps: 16 },
    ],
    outputOptions: ['IEC C13 x6', 'IEC C19 x2'],
    runtimeCurve: [
      { loadPercent: 25, runtimeMinutes: 46 },
      { loadPercent: 50, runtimeMinutes: 19 },
      { loadPercent: 75, runtimeMinutes: 10 },
      { loadPercent: 100, runtimeMinutes: 6 },
    ],
    extendedBatteryOption: true,
    batteryLifeYears: '3-5',
    warrantyYears: 3,
    notes: 'Online double-conversion topology with LCD management panel. PowerPanel Business software included.',
  },
];

/**
 * Find the best-matching UPS model for a given KVA requirement and region.
 */
export function findBestUPSModel(
  requiredKVA: number,
  region: string
): UPSModel | null {
  // Prefer online double-conversion topology
  const candidates = UPS_MODELS.filter(
    m =>
      m.topology === 'online-double-conversion' &&
      m.kvaRatings.some(r => r >= requiredKVA) &&
      m.inputOptions.some(io => io.region === region)
  );

  if (candidates.length === 0) {
    // Fall back to any topology
    const fallback = UPS_MODELS.filter(
      m =>
        m.kvaRatings.some(r => r >= requiredKVA) &&
        m.inputOptions.some(io => io.region === region)
    );
    return fallback.length > 0 ? fallback[0] : null;
  }

  // Prefer APC Smart-UPS SRT as default recommendation, then Eaton 9PX
  const preferred = candidates.find(m => m.id === 'apc-srt') ||
    candidates.find(m => m.id === 'eaton-9px') ||
    candidates[0];
  return preferred;
}

/**
 * Estimate runtime for a given UPS model at a specific load percentage.
 * Uses linear interpolation between runtime curve data points.
 */
export function estimateRuntime(model: UPSModel, loadPercent: number): number {
  const curve = model.runtimeCurve;
  if (curve.length === 0) return 0;

  // Clamp load to 0-100
  const load = Math.max(0, Math.min(100, loadPercent));

  // Below the lowest data point, extrapolate linearly
  if (load <= curve[0].loadPercent) {
    return curve[0].runtimeMinutes;
  }

  // Above the highest data point
  if (load >= curve[curve.length - 1].loadPercent) {
    return curve[curve.length - 1].runtimeMinutes;
  }

  // Find the two surrounding data points and interpolate
  for (let i = 0; i < curve.length - 1; i++) {
    const lower = curve[i];
    const upper = curve[i + 1];
    if (load >= lower.loadPercent && load <= upper.loadPercent) {
      const ratio = (load - lower.loadPercent) / (upper.loadPercent - lower.loadPercent);
      return Math.round(lower.runtimeMinutes + ratio * (upper.runtimeMinutes - lower.runtimeMinutes));
    }
  }

  return curve[curve.length - 1].runtimeMinutes;
}
