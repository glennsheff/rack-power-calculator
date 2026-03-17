import type { PowerRegion } from '../../types';

interface RegionSelectorProps {
  region: PowerRegion;
  onChange: (region: PowerRegion) => void;
}

const REGIONS: { value: PowerRegion; label: string; flag: string }[] = [
  { value: 'US', label: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { value: 'UK', label: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
  { value: 'EU', label: 'Europe', flag: '\u{1F1EA}\u{1F1FA}' },
];

export function RegionSelector({ region, onChange }: RegionSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-aifi-black">Region</label>
      <div className="flex gap-2">
        {REGIONS.map((r) => {
          const isActive = region === r.value;
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => onChange(r.value)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-aifi-blue focus:ring-offset-2 ${
                isActive
                  ? 'bg-aifi-blue text-white'
                  : 'bg-aifi-gray-50 text-aifi-black hover:bg-aifi-gray'
              }`}
              aria-pressed={isActive}
            >
              <span className="text-base">{r.flag}</span>
              <span>{r.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
