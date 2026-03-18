import type {
  HardwareItem,
  RackItem,
  PowerRegion,
  PowerCalculation,
  UPSRecommendation,
  CoolingRequirement,
  MainsPowerRequirement,
} from '../types';
import { findBestUPSModel, estimateRuntime } from '../data/ups-models';

const POWER_FACTOR = 0.9;
const UPS_HEADROOM = 1.25;
const COOLING_OVERHEAD = 1.3;
const STANDARD_KVA_SIZES = [1, 1.5, 2, 3, 5, 6, 8, 10, 15, 20];
const STANDARD_BREAKER_SIZES = [6, 10, 16, 20, 25, 32, 40, 50, 63];

function getRegionVoltage(region: PowerRegion): number {
  switch (region) {
    case 'US': return 120;
    case 'UK': return 230;
    case 'EU': return 230;
  }
}

function getRegionFrequency(region: PowerRegion): number {
  switch (region) {
    case 'US': return 60;
    case 'UK': return 50;
    case 'EU': return 50;
  }
}

function roundUpToStandardKVA(va: number): number {
  const kva = va / 1000;
  for (const size of STANDARD_KVA_SIZES) {
    if (size >= kva) return size;
  }
  return STANDARD_KVA_SIZES[STANDARD_KVA_SIZES.length - 1];
}

function nextStandardBreakerSize(amps: number): number {
  for (const size of STANDARD_BREAKER_SIZES) {
    if (size >= amps) return size;
  }
  return STANDARD_BREAKER_SIZES[STANDARD_BREAKER_SIZES.length - 1];
}

export function calculatePower(
  items: RackItem[],
  hardware: HardwareItem[],
  region: PowerRegion
): PowerCalculation {
  let totalWatts = 0;
  let totalPeakWatts = 0;
  let totalBTU = 0;
  let totalRackUnits = 0;
  let totalWeight_kg = 0;

  // PoE tracking — these devices draw power from their PoE switch,
  // so their wattage is NOT added to the mains total (the switch's
  // peak power already includes its full PoE budget).
  let poeDeviceWatts = 0;
  let poeDevicePeakWatts = 0;
  let poeDeviceCount = 0;

  for (const rackItem of items) {
    const hw = hardware.find(h => h.id === rackItem.hardwareId);
    if (!hw) continue;

    const qty = rackItem.quantity;

    if (hw.poePowered) {
      // Track PoE devices separately — do NOT add to mains totals
      poeDeviceWatts += hw.powerWatts * qty;
      poeDevicePeakWatts += hw.peakPowerWatts * qty;
      poeDeviceCount += qty;
    } else {
      // Mains-powered devices — add to power totals
      totalWatts += hw.powerWatts * qty;
      totalPeakWatts += hw.peakPowerWatts * qty;

      // Use specified BTU or calculate from watts
      const btu = hw.heatOutputBTU > 0 ? hw.heatOutputBTU : hw.powerWatts * 3.412;
      totalBTU += btu * qty;
    }

    // Always count physical space and weight regardless of power source
    totalRackUnits += hw.rackUnits * qty;
    totalWeight_kg += hw.weight_kg * qty;
  }

  const voltage = getRegionVoltage(region);
  const totalVA = totalWatts / POWER_FACTOR;
  const totalPeakVA = totalPeakWatts / POWER_FACTOR;
  const totalAmps = totalPeakWatts / (voltage * POWER_FACTOR);

  return {
    totalWatts,
    totalPeakWatts,
    totalVA,
    totalPeakVA,
    totalAmps,
    totalBTU,
    totalRackUnits,
    totalWeight_kg,
    powerFactor: POWER_FACTOR,
    poeDeviceWatts,
    poeDevicePeakWatts,
    poeDeviceCount,
  };
}

export function calculateUPSSizing(
  calc: PowerCalculation,
  _desiredRuntime: number,
  redundancy: boolean
): { requiredVA: number; recommendedKVA: number; minimumKVA: number } {
  const requiredVA = calc.totalPeakVA * UPS_HEADROOM;
  const minimumKVA = roundUpToStandardKVA(calc.totalPeakVA);
  let recommendedKVA = roundUpToStandardKVA(requiredVA);

  if (redundancy) {
    // N+1: go to the next size up from the recommended
    const idx = STANDARD_KVA_SIZES.indexOf(recommendedKVA);
    if (idx >= 0 && idx < STANDARD_KVA_SIZES.length - 1) {
      recommendedKVA = STANDARD_KVA_SIZES[idx + 1];
    }
  }

  return {
    requiredVA,
    recommendedKVA,
    minimumKVA,
  };
}

export function calculateCooling(
  calc: PowerCalculation,
  ambientTemp: number
): CoolingRequirement {
  const totalBTU = calc.totalBTU;
  const totalKW = totalBTU / 3412.14;
  const acTonnage = totalBTU / 12000;
  const recommendedACTonnage = acTonnage * COOLING_OVERHEAD;
  const recommendedACKW = totalKW * COOLING_OVERHEAD;

  let notes = `Based on ${ambientTemp}\u00B0C ambient temperature.`;
  if (ambientTemp > 30) {
    notes += ' Warning: High ambient temperature may require additional cooling capacity.';
  }
  notes += ' Includes 30% overhead for ambient conditions and system inefficiency.';

  return {
    totalBTU,
    totalKW,
    recommendedACTonnage,
    recommendedACKW,
    notes,
  };
}

export function calculateMainsPower(
  calc: PowerCalculation,
  region: PowerRegion
): MainsPowerRequirement {
  const voltage = getRegionVoltage(region);
  const frequency = getRegionFrequency(region);
  const amps = calc.totalPeakWatts / (voltage * POWER_FACTOR);
  const breakerAmps = nextStandardBreakerSize(amps * 1.25);

  let phases = 1;
  let connectorType = '';
  let connectorDescription = '';
  let wiringNotes = '';

  if (region === 'US') {
    if (calc.totalPeakWatts <= 1920) {
      connectorType = 'NEMA 5-20';
      connectorDescription = 'Standard 20A 120V receptacle';
      wiringNotes = 'Standard 20A branch circuit. 12 AWG minimum wiring.';
    } else if (calc.totalPeakWatts <= 4800) {
      connectorType = 'NEMA L6-30';
      connectorDescription = 'Locking 30A 240V plug';
      wiringNotes = 'Dedicated 30A 240V single-phase circuit required. 10 AWG minimum wiring.';
    } else if (calc.totalPeakWatts <= 7680) {
      connectorType = 'NEMA L6-50';
      connectorDescription = 'Locking 50A 240V plug';
      wiringNotes = 'Dedicated 50A 240V single-phase circuit required. 6 AWG minimum wiring.';
    } else {
      phases = 3;
      connectorType = 'Three-phase — consult electrician';
      connectorDescription = 'Three-phase power distribution required';
      wiringNotes = 'Load exceeds single-phase capacity. Engage a licensed electrician for three-phase installation.';
    }
    // For higher voltage US connectors, recalculate at 240V
    if (calc.totalPeakWatts > 1920) {
      const amps240 = calc.totalPeakWatts / (240 * POWER_FACTOR);
      return {
        region,
        voltage: 240,
        frequency,
        phases,
        recommendedAmperage: nextStandardBreakerSize(amps240 * 1.25),
        connectorType,
        connectorDescription,
        wiringNotes,
      };
    }
  } else if (region === 'UK') {
    if (calc.totalPeakWatts <= 3000) {
      connectorType = 'BS 1363';
      connectorDescription = 'Standard UK 13A plug';
      wiringNotes = 'Standard UK ring main or dedicated radial circuit.';
    } else if (calc.totalPeakWatts <= 3680) {
      connectorType = 'IEC 60309 16A';
      connectorDescription = 'Blue commando 16A single-phase plug';
      wiringNotes = 'Dedicated 16A single-phase circuit with IEC 60309 outlet required.';
    } else if (calc.totalPeakWatts <= 7360) {
      connectorType = 'IEC 60309 32A';
      connectorDescription = 'Blue commando 32A single-phase plug';
      wiringNotes = 'Dedicated 32A single-phase circuit with IEC 60309 outlet required. 6mm\u00B2 minimum cable.';
    } else {
      phases = 3;
      connectorType = 'Three-phase IEC 60309 — consult electrician';
      connectorDescription = 'Three-phase IEC 60309 power distribution required';
      wiringNotes = 'Load exceeds single-phase capacity. Engage a qualified electrician for three-phase installation.';
    }
  } else {
    // EU
    if (calc.totalPeakWatts <= 3680) {
      connectorType = 'CEE 7/7 Schuko';
      connectorDescription = 'Standard European 16A Schuko plug';
      wiringNotes = 'Standard Schuko outlet on dedicated circuit recommended.';
    } else if (calc.totalPeakWatts <= 7360) {
      connectorType = 'IEC 60309 32A';
      connectorDescription = 'Blue commando 32A single-phase plug';
      wiringNotes = 'Dedicated 32A single-phase circuit with IEC 60309 outlet required. 6mm\u00B2 minimum cable.';
    } else {
      phases = 3;
      connectorType = 'Three-phase IEC 60309 — consult electrician';
      connectorDescription = 'Three-phase IEC 60309 power distribution required';
      wiringNotes = 'Load exceeds single-phase capacity. Engage a qualified electrician for three-phase installation.';
    }
  }

  return {
    region,
    voltage,
    frequency,
    phases,
    recommendedAmperage: breakerAmps,
    connectorType,
    connectorDescription,
    wiringNotes,
  };
}

export function recommendUPS(
  sizing: { requiredVA: number; recommendedKVA: number; minimumKVA: number },
  region: PowerRegion,
  desiredRuntime: number,
  calc: PowerCalculation
): UPSRecommendation | null {
  if (calc.totalWatts === 0) return null;

  const model = findBestUPSModel(sizing.recommendedKVA, region);
  if (!model) return null;

  const capacityVA = sizing.recommendedKVA * 1000;
  const loadPercent = Math.min(100, (calc.totalPeakVA / capacityVA) * 100);
  const estimatedRuntime = estimateRuntime(model, loadPercent);

  const regionInput = model.inputOptions.find(io => io.region === region);
  const inputConnector = regionInput ? regionInput.connector : 'Consult manufacturer';

  let batteryConfig = 'Internal batteries';
  if (model.extendedBatteryOption && desiredRuntime > estimatedRuntime) {
    const packsNeeded = Math.ceil(desiredRuntime / estimatedRuntime);
    batteryConfig = `Internal batteries + ${packsNeeded - 1} external battery pack(s)`;
  }

  const topologyLabels: Record<string, string> = {
    'online-double-conversion': 'Online Double Conversion',
    'line-interactive': 'Line Interactive',
    'standby': 'Standby',
  };

  return {
    model: `${model.series} ${sizing.recommendedKVA}kVA`,
    manufacturer: model.manufacturer,
    recommendedKVA: sizing.recommendedKVA,
    minimumKVA: sizing.minimumKVA,
    batteryConfig,
    estimatedRuntimeMinutes: estimatedRuntime,
    batteryLifeYears: `${model.batteryLifeYears} years`,
    formFactor: `${model.formFactor === 'rackmount' ? 'Rackmount' : model.formFactor === 'rack-tower' ? 'Rack/Tower' : 'Tower'} ${model.rackUnits}U`,
    inputConnector,
    outputConnectors: model.outputOptions.join(', '),
    notes: model.notes,
    topology: topologyLabels[model.topology] || model.topology,
  };
}
