interface RuntimeSelectorProps {
  runtimeMinutes: number;
  includeRedundancy: boolean;
  onRuntimeChange: (minutes: number) => void;
  onRedundancyChange: (include: boolean) => void;
}

export function RuntimeSelector({
  runtimeMinutes,
  includeRedundancy,
  onRuntimeChange,
  onRedundancyChange,
}: RuntimeSelectorProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-12">
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <label htmlFor="runtime-slider" className="text-sm font-semibold text-aifi-black">
            Desired UPS Runtime
          </label>
          <span className="text-lg font-bold text-aifi-blue tabular-nums">
            {runtimeMinutes} min
          </span>
        </div>
        <input
          id="runtime-slider"
          type="range"
          min={5}
          max={60}
          step={5}
          value={runtimeMinutes}
          onChange={(e) => onRuntimeChange(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-aifi-gray accent-aifi-blue"
        />
        <div className="mt-1 flex justify-between text-xs text-aifi-black-60">
          <span>5 min</span>
          <span>15 min</span>
          <span>30 min</span>
          <span>45 min</span>
          <span>60 min</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="redundancy-toggle" className="text-sm font-semibold text-aifi-black cursor-pointer">
          N+1 Redundancy
        </label>
        <button
          id="redundancy-toggle"
          type="button"
          role="switch"
          aria-checked={includeRedundancy}
          onClick={() => onRedundancyChange(!includeRedundancy)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-aifi-blue focus:ring-offset-2 ${
            includeRedundancy ? 'bg-aifi-blue' : 'bg-aifi-gray'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              includeRedundancy ? 'translate-x-5.5' : 'translate-x-0.5'
            } mt-0.5`}
          />
        </button>
      </div>
    </div>
  );
}
