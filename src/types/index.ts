export interface HardwareItem {
  id: string;
  name: string;
  model: string;
  category: HardwareCategory;
  powerWatts: number;
  peakPowerWatts: number;
  heatOutputBTU: number;
  powerSupplyCount: number;
  powerSupplyType: string;
  rackUnits: number;
  weight_kg: number;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HardwareCategory =
  | 'server'
  | 'switch'
  | 'camera-controller'
  | 'ups'
  | 'pdu'
  | 'storage'
  | 'gateway'
  | 'display'
  | 'accessory'
  | 'other';

export const HARDWARE_CATEGORIES: { value: HardwareCategory; label: string }[] = [
  { value: 'server', label: 'Server' },
  { value: 'switch', label: 'Network Switch' },
  { value: 'camera-controller', label: 'Camera Controller' },
  { value: 'ups', label: 'UPS' },
  { value: 'pdu', label: 'PDU' },
  { value: 'storage', label: 'Storage' },
  { value: 'gateway', label: 'Gateway / Router' },
  { value: 'display', label: 'Display' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'other', label: 'Other' },
];

export interface RackItem {
  hardwareId: string;
  quantity: number;
}

export interface RackConfiguration {
  id: string;
  name: string;
  storeName: string;
  region: PowerRegion;
  items: RackItem[];
  desiredRuntimeMinutes: number;
  includeRedundancy: boolean;
  ambientTempCelsius: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type PowerRegion = 'US' | 'UK' | 'EU';

export interface PowerCalculation {
  totalWatts: number;
  totalPeakWatts: number;
  totalVA: number;
  totalPeakVA: number;
  totalAmps: number;
  totalBTU: number;
  totalRackUnits: number;
  totalWeight_kg: number;
  powerFactor: number;
}

export interface UPSRecommendation {
  model: string;
  manufacturer: string;
  recommendedKVA: number;
  minimumKVA: number;
  batteryConfig: string;
  estimatedRuntimeMinutes: number;
  batteryLifeYears: string;
  formFactor: string;
  inputConnector: string;
  outputConnectors: string;
  notes: string;
  topology: string;
}

export interface CoolingRequirement {
  totalBTU: number;
  totalKW: number;
  recommendedACTonnage: number;
  recommendedACKW: number;
  notes: string;
}

export interface MainsPowerRequirement {
  region: PowerRegion;
  voltage: number;
  frequency: number;
  phases: number;
  recommendedAmperage: number;
  connectorType: string;
  connectorDescription: string;
  wiringNotes: string;
}

export interface UPSModel {
  id: string;
  manufacturer: string;
  series: string;
  kvaRatings: number[];
  formFactor: 'rackmount' | 'tower' | 'rack-tower';
  rackUnits: number;
  topology: 'online-double-conversion' | 'line-interactive' | 'standby';
  inputOptions: { region: PowerRegion; connector: string; maxAmps: number }[];
  outputOptions: string[];
  runtimeCurve: { loadPercent: number; runtimeMinutes: number }[];
  extendedBatteryOption: boolean;
  batteryLifeYears: string;
  warrantyYears: number;
  notes: string;
}

export interface PowerConnector {
  region: PowerRegion;
  name: string;
  description: string;
  maxAmps: number;
  voltage: number;
  phases: number;
  frequency: number;
  usableWatts: number;
  wiringNotes: string;
  commonUse: string;
}
