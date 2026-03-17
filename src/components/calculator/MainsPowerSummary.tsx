import type { MainsPowerRequirement } from '../../types';
import { Card } from '../ui/Card';

interface MainsPowerSummaryProps {
  mains: MainsPowerRequirement | null;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-aifi-gray/50 py-3 last:border-0">
      <span className="text-sm text-aifi-black-60 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-aifi-black text-right">{value}</span>
    </div>
  );
}

const REGION_LABELS: Record<string, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  EU: 'Europe',
};

export function MainsPowerSummary({ mains }: MainsPowerSummaryProps) {
  if (!mains) {
    return (
      <Card title="Mains Power Requirements">
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
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a7.5 7.5 0 01-3 0"
            />
          </svg>
          <p className="mt-3 text-sm text-aifi-black-60">
            Add hardware to see power requirements
          </p>
        </div>
      </Card>
    );
  }

  const m = mains;
  const isThreePhase = m.phases === 3;

  return (
    <Card title="Mains Power Requirements">
      {isThreePhase && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span>
            Load exceeds single-phase capacity. Three-phase power installation required — engage a qualified electrician.
          </span>
        </div>
      )}
      <div className="mb-4 rounded-lg bg-aifi-gray-50 p-4">
        <div className="text-xs font-semibold text-aifi-black-60 uppercase tracking-wide">Connector</div>
        <div className="mt-1 text-lg font-bold text-aifi-black">{m.connectorType}</div>
        <div className="mt-0.5 text-sm text-aifi-black-60">{m.connectorDescription}</div>
      </div>
      <div className="flex flex-col">
        <DetailRow label="Region" value={REGION_LABELS[m.region] || m.region} />
        <DetailRow label="Supply Voltage" value={`${m.voltage} V / ${m.frequency} Hz`} />
        <DetailRow label="Phases" value={`${m.phases}-phase`} />
        <DetailRow label="Recommended Breaker" value={`${m.recommendedAmperage} A`} />
      </div>
      {m.wiringNotes && (
        <div className="mt-4 rounded-lg bg-aifi-gray-50 p-3 text-xs text-aifi-black-60">
          {m.wiringNotes}
        </div>
      )}
    </Card>
  );
}
