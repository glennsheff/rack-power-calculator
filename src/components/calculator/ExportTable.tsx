import { useState } from 'react';
import type {
  HardwareItem,
  RackItem,
  PowerCalculation,
  UPSRecommendation,
  MainsPowerRequirement,
  CoolingRequirement,
} from '../../types';
import {
  generateHTMLTable,
  generateTSV,
  generateCSV,
  copyToClipboard,
  downloadFile,
} from '../../lib/export';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ExportTableProps {
  configName: string;
  storeName: string;
  items: RackItem[];
  hardware: HardwareItem[];
  powerCalc: PowerCalculation;
  upsRec: UPSRecommendation | null;
  mainsPower: MainsPowerRequirement | null;
  cooling: CoolingRequirement | null;
}

type CopyStatus = 'idle' | 'success' | 'error';

function CopyFeedback({ status }: { status: CopyStatus }) {
  if (status === 'idle') return null;
  return (
    <span
      className={`ml-2 text-xs font-semibold ${
        status === 'success' ? 'text-emerald-600' : 'text-red-500'
      }`}
    >
      {status === 'success' ? 'Copied!' : 'Failed to copy'}
    </span>
  );
}

export function ExportTable({
  configName,
  storeName,
  items,
  hardware,
  powerCalc,
  upsRec,
  mainsPower,
  cooling,
}: ExportTableProps) {
  const [copyHTMLStatus, setCopyHTMLStatus] = useState<CopyStatus>('idle');
  const [copyTSVStatus, setCopyTSVStatus] = useState<CopyStatus>('idle');

  const canExport = upsRec && mainsPower && cooling && items.length > 0;

  if (!canExport) {
    return (
      <Card title="Export">
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
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          <p className="mt-3 text-sm text-aifi-black-60">
            Complete your rack configuration to enable export
          </p>
        </div>
      </Card>
    );
  }

  const exportData = {
    configName,
    storeName,
    items,
    hardware,
    powerCalc,
    upsRec: upsRec!,
    mainsPower: mainsPower!,
    cooling: cooling!,
  };

  const resolvedItems = items
    .map((ri) => {
      const hw = hardware.find((h) => h.id === ri.hardwareId);
      return hw ? { hw, qty: ri.quantity } : null;
    })
    .filter(Boolean) as { hw: HardwareItem; qty: number }[];

  async function handleCopyHTML() {
    try {
      const html = generateHTMLTable(exportData);
      await copyToClipboard(html, true);
      setCopyHTMLStatus('success');
      setTimeout(() => setCopyHTMLStatus('idle'), 2000);
    } catch {
      setCopyHTMLStatus('error');
      setTimeout(() => setCopyHTMLStatus('idle'), 2000);
    }
  }

  async function handleCopyTSV() {
    try {
      const tsv = generateTSV(exportData);
      await copyToClipboard(tsv, false);
      setCopyTSVStatus('success');
      setTimeout(() => setCopyTSVStatus('idle'), 2000);
    } catch {
      setCopyTSVStatus('error');
      setTimeout(() => setCopyTSVStatus('idle'), 2000);
    }
  }

  function handleDownloadCSV() {
    const csv = generateCSV(exportData);
    const filename = `${configName || 'rack-config'}-${storeName || 'export'}.csv`
      .replace(/\s+/g, '-')
      .toLowerCase();
    downloadFile(csv, filename, 'text/csv');
  }

  return (
    <Card title="Export">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center">
          <Button variant="primary" size="sm" onClick={handleCopyHTML}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy as HTML
          </Button>
          <CopyFeedback status={copyHTMLStatus} />
        </div>
        <div className="flex items-center">
          <Button variant="secondary" size="sm" onClick={handleCopyTSV}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            Copy as TSV
          </Button>
          <CopyFeedback status={copyTSVStatus} />
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownloadCSV}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download CSV
        </Button>
      </div>

      {/* Preview table */}
      <div className="overflow-x-auto rounded-lg border border-aifi-gray">
        <div className="p-3 bg-aifi-gray-50 border-b border-aifi-gray">
          <h4 className="text-xs font-semibold text-aifi-black-60 uppercase tracking-wide">Preview</h4>
        </div>

        {/* Hardware BOM */}
        <div className="p-3 border-b border-aifi-gray">
          <h5 className="text-xs font-semibold text-aifi-black mb-2">Hardware Bill of Materials</h5>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-aifi-blue text-white">
                <th className="px-2 py-1.5 text-left font-semibold">Item</th>
                <th className="px-2 py-1.5 text-left font-semibold">Model</th>
                <th className="px-2 py-1.5 text-right font-semibold">Qty</th>
                <th className="px-2 py-1.5 text-right font-semibold">Power (W)</th>
                <th className="px-2 py-1.5 text-right font-semibold">Peak (W)</th>
                <th className="px-2 py-1.5 text-right font-semibold">BTU/hr</th>
                <th className="px-2 py-1.5 text-right font-semibold">U</th>
                <th className="px-2 py-1.5 text-left font-semibold">PSU</th>
              </tr>
            </thead>
            <tbody>
              {resolvedItems.map(({ hw, qty }) => (
                <tr key={hw.id} className="border-t border-aifi-gray/30">
                  <td className="px-2 py-1.5">{hw.name}</td>
                  <td className="px-2 py-1.5 text-aifi-black-60">{hw.model}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{qty}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{hw.powerWatts}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{hw.peakPowerWatts}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{hw.heatOutputBTU}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{hw.rackUnits}</td>
                  <td className="px-2 py-1.5 text-aifi-black-60">{hw.powerSupplyType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Power Summary */}
        <div className="p-3 border-b border-aifi-gray">
          <h5 className="text-xs font-semibold text-aifi-black mb-2">Power Summary</h5>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-aifi-black-60">Total: </span>
              <span className="font-semibold">{powerCalc.totalWatts} W</span>
            </div>
            <div>
              <span className="text-aifi-black-60">Peak: </span>
              <span className="font-semibold">{powerCalc.totalPeakWatts} W</span>
            </div>
            <div>
              <span className="text-aifi-black-60">VA: </span>
              <span className="font-semibold">{Math.round(powerCalc.totalVA)} VA</span>
            </div>
            <div>
              <span className="text-aifi-black-60">BTU/hr: </span>
              <span className="font-semibold">{Math.round(powerCalc.totalBTU)}</span>
            </div>
            <div>
              <span className="text-aifi-black-60">Rack: </span>
              <span className="font-semibold">{powerCalc.totalRackUnits} U</span>
            </div>
            <div>
              <span className="text-aifi-black-60">Weight: </span>
              <span className="font-semibold">{powerCalc.totalWeight_kg.toFixed(1)} kg</span>
            </div>
          </div>
        </div>

        {/* UPS + Mains + Cooling summary line */}
        <div className="p-3 text-xs">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h5 className="font-semibold text-aifi-black mb-1">UPS</h5>
              <div className="text-aifi-black-60">{upsRec!.manufacturer} {upsRec!.model}</div>
              <div className="text-aifi-black-60">{upsRec!.recommendedKVA} kVA / {upsRec!.estimatedRuntimeMinutes} min</div>
            </div>
            <div>
              <h5 className="font-semibold text-aifi-black mb-1">Mains Power</h5>
              <div className="text-aifi-black-60">{mainsPower!.connectorType}</div>
              <div className="text-aifi-black-60">{mainsPower!.voltage}V / {mainsPower!.recommendedAmperage}A breaker</div>
            </div>
            <div>
              <h5 className="font-semibold text-aifi-black mb-1">Cooling</h5>
              <div className="text-aifi-black-60">{Math.round(cooling!.totalBTU)} BTU/hr</div>
              <div className="text-aifi-black-60">{cooling!.recommendedACTonnage.toFixed(2)} tons AC</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
