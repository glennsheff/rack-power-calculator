import type { CoolingRequirement } from '../../types';
import { Card } from '../ui/Card';

interface CoolingSummaryProps {
  cooling: CoolingRequirement | null;
}

export function CoolingSummary({ cooling }: CoolingSummaryProps) {
  if (!cooling) {
    return (
      <Card title="Cooling Requirements">
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
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636"
            />
          </svg>
          <p className="mt-3 text-sm text-aifi-black-60">
            Add hardware to see cooling requirements
          </p>
        </div>
      </Card>
    );
  }

  const c = cooling;

  return (
    <Card title="Cooling Requirements">
      <div className="mb-4 flex flex-col gap-3">
        <div className="rounded-lg bg-aifi-gray-50 p-4">
          <div className="text-xs font-semibold text-aifi-black-60 uppercase tracking-wide">
            Heat Output
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-xl font-bold text-aifi-black tabular-nums">
              {Math.round(c.totalBTU)}
              <span className="ml-1 text-sm font-normal text-aifi-black-60">BTU/hr</span>
            </span>
            <span className="text-sm text-aifi-black-60 tabular-nums">
              ({c.totalKW.toFixed(2)} kW)
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-aifi-blue-10 p-4">
          <div className="text-xs font-semibold text-aifi-blue uppercase tracking-wide">
            Recommended AC Capacity
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-xl font-bold text-aifi-black tabular-nums">
              {c.recommendedACTonnage.toFixed(2)}
              <span className="ml-1 text-sm font-normal text-aifi-black-60">tons</span>
            </span>
            <span className="text-sm text-aifi-black-60 tabular-nums">
              ({c.recommendedACKW.toFixed(2)} kW)
            </span>
          </div>
        </div>
      </div>
      {c.notes && (
        <div className="rounded-lg bg-aifi-gray-50 p-3 text-xs text-aifi-black-60">
          {c.notes}
        </div>
      )}
    </Card>
  );
}
