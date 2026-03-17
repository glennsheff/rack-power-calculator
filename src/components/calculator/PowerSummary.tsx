import type { PowerCalculation } from '../../types';
import { Card } from '../ui/Card';

interface PowerSummaryProps {
  calculation: PowerCalculation;
  compact?: boolean;
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  warning?: string;
}

function MetricCard({ label, value, unit, warning }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-aifi-gray-50 p-4">
      <div className="text-xs font-semibold text-aifi-black-60 uppercase tracking-wide">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-aifi-black tabular-nums">{value}</span>
        <span className="text-sm text-aifi-black-60">{unit}</span>
      </div>
      {warning && (
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {warning}
        </div>
      )}
    </div>
  );
}

export function PowerSummary({ calculation, compact = false }: PowerSummaryProps) {
  const c = calculation;

  const rackWarning = c.totalRackUnits > 42 ? 'Exceeds standard 42U rack' : undefined;
  const weightWarning = c.totalWeight_kg > 800 ? 'Exceeds typical rack weight limit' : undefined;

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-aifi-black-60">Total Power</span>
          <span className="text-sm font-bold text-aifi-black tabular-nums">{c.totalWatts} W</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-aifi-black-60">Peak Power</span>
          <span className="text-sm font-bold text-aifi-black tabular-nums">{c.totalPeakWatts} W</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-aifi-black-60">VA (0.9 PF)</span>
          <span className="text-sm font-bold text-aifi-black tabular-nums">{Math.round(c.totalVA)} VA</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-aifi-black-60">Heat Output</span>
          <span className="text-sm font-bold text-aifi-black tabular-nums">{Math.round(c.totalBTU)} BTU/hr</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-aifi-black-60">Rack Units</span>
          <span className={`text-sm font-bold tabular-nums ${c.totalRackUnits > 42 ? 'text-amber-600' : 'text-aifi-black'}`}>
            {c.totalRackUnits} U
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-aifi-black-60">Weight</span>
          <span className={`text-sm font-bold tabular-nums ${c.totalWeight_kg > 800 ? 'text-amber-600' : 'text-aifi-black'}`}>
            {c.totalWeight_kg.toFixed(1)} kg
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card title="Power Summary">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Total Power" value={String(c.totalWatts)} unit="W" />
        <MetricCard label="Peak Power" value={String(c.totalPeakWatts)} unit="W" />
        <MetricCard label="Total VA" value={String(Math.round(c.totalVA))} unit="VA" />
        <MetricCard label="Heat Output" value={String(Math.round(c.totalBTU))} unit="BTU/hr" />
        <MetricCard
          label="Rack Units"
          value={String(c.totalRackUnits)}
          unit="U"
          warning={rackWarning}
        />
        <MetricCard
          label="Total Weight"
          value={c.totalWeight_kg.toFixed(1)}
          unit="kg"
          warning={weightWarning}
        />
      </div>
    </Card>
  );
}
