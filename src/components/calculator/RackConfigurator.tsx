import { useMemo, useState } from 'react';
import { useRack } from '../../context/RackContext';
import { useHardware } from '../../context/HardwareContext';
import {
  calculatePower,
  calculateUPSSizing,
  calculateCooling,
  calculateMainsPower,
  recommendUPS,
} from '../../lib/calculations';
import { RegionSelector } from './RegionSelector';
import { HardwareSelector } from './HardwareSelector';
import { RuntimeSelector } from './RuntimeSelector';
import { PowerSummary } from './PowerSummary';
import { UPSRecommendationCard } from './UPSRecommendation';
import { CoolingSummary } from './CoolingSummary';
import { MainsPowerSummary } from './MainsPowerSummary';
import { ExportTable } from './ExportTable';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function RackConfigurator() {
  const {
    currentConfig,
    savedConfigs,
    updateConfig,
    addItem,
    removeItem,
    updateItemQuantity,
    clearItems,
    saveCurrentConfig,
    loadConfig,
    deleteConfig,
    newConfig,
  } = useRack();

  const { hardware, getActiveHardware } = useHardware();
  const activeHardware = useMemo(() => getActiveHardware(), [getActiveHardware]);

  const [selectedSavedId, setSelectedSavedId] = useState<string>('');
  const [saveToast, setSaveToast] = useState(false);

  // Run all calculations
  const powerCalc = useMemo(
    () => calculatePower(currentConfig.items, hardware, currentConfig.region),
    [currentConfig.items, hardware, currentConfig.region]
  );

  const upsSizing = useMemo(
    () => calculateUPSSizing(powerCalc, currentConfig.desiredRuntimeMinutes, currentConfig.includeRedundancy),
    [powerCalc, currentConfig.desiredRuntimeMinutes, currentConfig.includeRedundancy]
  );

  const upsRec = useMemo(
    () => recommendUPS(upsSizing, currentConfig.region, currentConfig.desiredRuntimeMinutes, powerCalc),
    [upsSizing, currentConfig.region, currentConfig.desiredRuntimeMinutes, powerCalc]
  );

  const cooling = useMemo(
    () => (powerCalc.totalWatts > 0 ? calculateCooling(powerCalc, currentConfig.ambientTempCelsius) : null),
    [powerCalc, currentConfig.ambientTempCelsius]
  );

  const mainsPower = useMemo(
    () => (powerCalc.totalWatts > 0 ? calculateMainsPower(powerCalc, currentConfig.region) : null),
    [powerCalc, currentConfig.region]
  );

  // Resolve rack items for the selected items table
  const resolvedRackItems = useMemo(() => {
    return currentConfig.items
      .map((ri) => {
        const hw = hardware.find((h) => h.id === ri.hardwareId);
        return hw ? { ...ri, hw } : null;
      })
      .filter(Boolean) as { hardwareId: string; quantity: number; hw: (typeof hardware)[0] }[];
  }, [currentConfig.items, hardware]);

  function handleSave() {
    saveCurrentConfig();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  }

  function handleLoad() {
    if (selectedSavedId) {
      loadConfig(selectedSavedId);
      setSelectedSavedId('');
    }
  }

  function handleDelete() {
    if (selectedSavedId) {
      deleteConfig(selectedSavedId);
      setSelectedSavedId('');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Save/Load Controls */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="load-config" className="text-sm font-semibold text-aifi-black">
              Saved Configurations
            </label>
            <div className="relative mt-1.5">
              <select
                id="load-config"
                value={selectedSavedId}
                onChange={(e) => setSelectedSavedId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-aifi-gray bg-white px-3 py-2.5 pr-10 text-sm text-aifi-black transition-colors focus:border-aifi-blue focus:outline-none focus:ring-2 focus:ring-aifi-blue"
              >
                <option value="">Select a saved configuration...</option>
                {savedConfigs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || 'Untitled'} {c.storeName ? `- ${c.storeName}` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-aifi-black-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLoad} disabled={!selectedSavedId}>
            Load
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={!selectedSavedId}>
            Delete
          </Button>
          <div className="border-l border-aifi-gray pl-4 flex gap-2">
            <div className="relative">
              <Button variant="primary" size="sm" onClick={handleSave}>
                <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v4h8V3M7 21v-8h10v8" />
                </svg>
                Save
              </Button>
              {saveToast && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Saved!
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={newConfig}>
              New
            </Button>
          </div>
        </div>
      </Card>

      {/* Configuration Details */}
      <Card title="Configuration Details">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px] flex-1">
            <Input
              label="Configuration Name"
              placeholder="e.g. Standard Edge Rack"
              value={currentConfig.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <Input
              label="Store Name"
              placeholder="e.g. Morrisons Leeds"
              value={currentConfig.storeName}
              onChange={(e) => updateConfig({ storeName: e.target.value })}
            />
          </div>
          <div className="shrink-0">
            <RegionSelector
              region={currentConfig.region}
              onChange={(region) => updateConfig({ region })}
            />
          </div>
          <div className="w-24 shrink-0">
            <Input
              label="Ambient Temp"
              type="number"
              min={10}
              max={50}
              value={currentConfig.ambientTempCelsius}
              onChange={(e) => updateConfig({ ambientTempCelsius: Number(e.target.value) })}
            />
          </div>
        </div>
      </Card>

      {/* Hardware Selection + Running Totals */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: Hardware selector + selected items */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card title="Hardware Selection">
            <HardwareSelector
              activeHardware={activeHardware}
              rackItems={currentConfig.items}
              onAddItem={addItem}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItem}
            />
          </Card>

          {/* Selected Items Table */}
          {resolvedRackItems.length > 0 && (
            <Card title="Selected Hardware">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-aifi-gray">
                      <th className="px-4 py-2.5 text-left font-semibold text-aifi-black">Item</th>
                      <th className="px-4 py-2.5 text-center font-semibold text-aifi-black">Qty</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-aifi-black">Power (W)</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-aifi-black">Peak (W)</th>
                      <th className="px-4 py-2.5 text-right font-semibold text-aifi-black">U</th>
                      <th className="px-4 py-2.5 text-center font-semibold text-aifi-black">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resolvedRackItems.map((item) => (
                      <tr key={item.hardwareId} className="border-b border-aifi-gray/50 hover:bg-aifi-blue-10/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-semibold text-aifi-black">{item.hw.name}</div>
                          <div className="text-xs text-aifi-black-60">{item.hw.model}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.hardwareId, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-aifi-gray-50 text-aifi-black hover:bg-aifi-gray transition-colors"
                              aria-label={`Decrease ${item.hw.name}`}
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-6 text-center font-bold tabular-nums">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.hardwareId, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-aifi-blue text-white hover:bg-blue-600 transition-colors"
                              aria-label={`Increase ${item.hw.name}`}
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {item.hw.powerWatts * item.quantity}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {item.hw.peakPowerWatts * item.quantity}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {item.hw.rackUnits * item.quantity}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.hardwareId)}
                            className="text-aifi-black-60 hover:text-red-500 transition-colors"
                            aria-label={`Remove ${item.hw.name}`}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {resolvedRackItems.length > 0 && (
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearItems}>
                    Clear All Items
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right: Running totals sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card title="Running Totals">
              {currentConfig.items.length === 0 ? (
                <p className="text-sm text-aifi-black-60 text-center py-4">
                  Add hardware items to see running totals
                </p>
              ) : (
                <PowerSummary calculation={powerCalc} compact />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* UPS Options */}
      <Card title="UPS Options">
        <RuntimeSelector
          runtimeMinutes={currentConfig.desiredRuntimeMinutes}
          includeRedundancy={currentConfig.includeRedundancy}
          onRuntimeChange={(minutes) => updateConfig({ desiredRuntimeMinutes: minutes })}
          onRedundancyChange={(include) => updateConfig({ includeRedundancy: include })}
        />
      </Card>

      {/* Results Section */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-aifi-black">Results</h2>

        {currentConfig.items.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="h-16 w-16 text-aifi-gray"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
              <p className="mt-4 text-lg font-semibold text-aifi-black-60">
                No hardware selected yet
              </p>
              <p className="mt-1 text-sm text-aifi-black-60">
                Add hardware items above to see power, UPS, mains, and cooling calculations
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Full Power Summary */}
            <PowerSummary calculation={powerCalc} />

            {/* UPS + Mains + Cooling grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <UPSRecommendationCard recommendation={upsRec} />
              <MainsPowerSummary mains={mainsPower} />
              <CoolingSummary cooling={cooling} />
            </div>

            {/* Warnings */}
            {(powerCalc.totalRackUnits > 42 || powerCalc.totalWeight_kg > 800) && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <svg className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="text-sm text-amber-800">
                  {powerCalc.totalRackUnits > 42 && (
                    <p>
                      <span className="font-semibold">Rack space warning:</span> Total of {powerCalc.totalRackUnits}U exceeds standard 42U rack height. Consider splitting across multiple racks.
                    </p>
                  )}
                  {powerCalc.totalWeight_kg > 800 && (
                    <p className={powerCalc.totalRackUnits > 42 ? 'mt-1' : ''}>
                      <span className="font-semibold">Weight warning:</span> Total weight of {powerCalc.totalWeight_kg.toFixed(1)}kg exceeds typical rack load limit of 800kg.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Export */}
            <ExportTable
              configName={currentConfig.name || 'Untitled Configuration'}
              storeName={currentConfig.storeName || 'Unknown Store'}
              items={currentConfig.items}
              hardware={hardware}
              powerCalc={powerCalc}
              upsRec={upsRec}
              mainsPower={mainsPower}
              cooling={cooling}
            />
          </div>
        )}
      </div>
    </div>
  );
}
