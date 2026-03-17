import type { UPSRecommendation as UPSRec } from '../../types';
import { Card } from '../ui/Card';

interface UPSRecommendationProps {
  recommendation: UPSRec | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-aifi-gray/50 py-3 last:border-0">
      <span className="text-sm text-aifi-black-60 shrink-0 whitespace-nowrap">{label}</span>
      <span className="text-sm font-semibold text-aifi-black text-right break-words min-w-0">{value}</span>
    </div>
  );
}

export function UPSRecommendationCard({ recommendation }: UPSRecommendationProps) {
  if (!recommendation) {
    return (
      <Card title="UPS Recommendation">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg
            className="h-12 w-12 text-aifi-gray"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
            />
          </svg>
          <p className="mt-3 text-sm text-aifi-black-60">
            Add hardware to see UPS recommendations
          </p>
        </div>
      </Card>
    );
  }

  const r = recommendation;

  return (
    <Card title="UPS Recommendation">
      <div className="mb-4 rounded-lg bg-aifi-blue-10 p-4">
        <div className="text-xs font-semibold text-aifi-blue uppercase tracking-wide">Recommended Unit</div>
        <div className="mt-1 text-lg font-bold text-aifi-black">
          {r.manufacturer} {r.model}
        </div>
        <div className="mt-1 text-sm text-aifi-black-60">{r.topology}</div>
      </div>
      <div className="flex flex-col">
        <DetailRow label="Recommended KVA" value={`${r.recommendedKVA} kVA`} />
        <DetailRow label="Minimum KVA" value={`${r.minimumKVA} kVA`} />
        <DetailRow label="Battery Configuration" value={r.batteryConfig} />
        <DetailRow label="Estimated Runtime" value={`${r.estimatedRuntimeMinutes} minutes`} />
        <DetailRow label="Battery Life Expectancy" value={r.batteryLifeYears} />
        <DetailRow label="Form Factor" value={r.formFactor} />
        <DetailRow label="Input Connector" value={r.inputConnector} />
        <DetailRow label="Output Connectors" value={r.outputConnectors} />
      </div>
      {r.notes && (
        <div className="mt-4 rounded-lg bg-aifi-gray-50 p-3 text-xs text-aifi-black-60">
          {r.notes}
        </div>
      )}
    </Card>
  );
}
