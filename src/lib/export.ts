import type {
  HardwareItem,
  RackItem,
  PowerCalculation,
  UPSRecommendation,
  MainsPowerRequirement,
  CoolingRequirement,
} from '../types';

interface ExportData {
  configName: string;
  storeName: string;
  items: RackItem[];
  hardware: HardwareItem[];
  powerCalc: PowerCalculation;
  upsRec: UPSRecommendation;
  mainsPower: MainsPowerRequirement;
  cooling: CoolingRequirement;
}

function resolveItems(data: ExportData): { hw: HardwareItem; qty: number }[] {
  const result: { hw: HardwareItem; qty: number }[] = [];
  for (const item of data.items) {
    const hw = data.hardware.find(h => h.id === item.hardwareId);
    if (hw) result.push({ hw, qty: item.quantity });
  }
  return result;
}

// ── HTML Table Export ──

export function generateHTMLTable(data: ExportData): string {
  const resolved = resolveItems(data);
  const pc = data.powerCalc;
  const ups = data.upsRec;
  const mp = data.mainsPower;
  const cool = data.cooling;

  const style = `
    <style>
      table { border-collapse: collapse; font-family: 'Montserrat', Arial, sans-serif; font-size: 11px; width: 100%; margin-bottom: 16px; }
      th, td { border: 1px solid #d4e3f5; padding: 6px 10px; text-align: left; }
      th { background-color: #4979ff; color: #ffffff; font-weight: 600; }
      td { background-color: #ffffff; }
      h3 { font-family: 'Montserrat', Arial, sans-serif; color: #1d252c; margin: 16px 0 8px 0; font-size: 13px; }
    </style>
  `.trim();

  let html = style;

  // Title
  html += `<h3>${escapeHtml(data.configName)} — ${escapeHtml(data.storeName)}</h3>`;

  // Section 1: Hardware BOM
  html += '<h3>Hardware Bill of Materials</h3>';
  html += '<table><tr><th>Item</th><th>Model</th><th>Qty</th><th>Power (W)</th><th>Peak Power (W)</th><th>Heat (BTU/hr)</th><th>Rack U</th><th>PSU Connector</th></tr>';
  for (const { hw, qty } of resolved) {
    html += `<tr><td>${escapeHtml(hw.name)}</td><td>${escapeHtml(hw.model)}</td><td>${qty}</td><td>${hw.powerWatts}</td><td>${hw.peakPowerWatts}</td><td>${hw.heatOutputBTU}</td><td>${hw.rackUnits}</td><td>${escapeHtml(hw.powerSupplyType)}</td></tr>`;
  }
  html += '</table>';

  // Section 2: Power Summary
  html += '<h3>Power Summary</h3>';
  html += '<table><tr><th>Metric</th><th>Value</th></tr>';
  html += `<tr><td>Total Power Draw</td><td>${pc.totalWatts} W</td></tr>`;
  html += `<tr><td>Total Peak Power</td><td>${pc.totalPeakWatts} W</td></tr>`;
  html += `<tr><td>Total VA (0.9 PF)</td><td>${Math.round(pc.totalVA)} VA</td></tr>`;
  html += `<tr><td>Total Heat Output</td><td>${Math.round(pc.totalBTU)} BTU/hr</td></tr>`;
  html += `<tr><td>Total Rack Units</td><td>${pc.totalRackUnits} U</td></tr>`;
  html += `<tr><td>Total Weight</td><td>${pc.totalWeight_kg.toFixed(1)} kg</td></tr>`;
  html += '</table>';

  // Section 3: UPS Recommendation
  html += '<h3>UPS Recommendation</h3>';
  html += '<table><tr><th>Specification</th><th>Detail</th></tr>';
  html += `<tr><td>Recommended UPS</td><td>${escapeHtml(ups.manufacturer)} ${escapeHtml(ups.model)}</td></tr>`;
  html += `<tr><td>Recommended KVA</td><td>${ups.recommendedKVA} kVA</td></tr>`;
  html += `<tr><td>Minimum KVA</td><td>${ups.minimumKVA} kVA</td></tr>`;
  html += `<tr><td>Topology</td><td>${escapeHtml(ups.topology)}</td></tr>`;
  html += `<tr><td>Battery Configuration</td><td>${escapeHtml(ups.batteryConfig)}</td></tr>`;
  html += `<tr><td>Estimated Runtime</td><td>${ups.estimatedRuntimeMinutes} minutes</td></tr>`;
  html += `<tr><td>Battery Life Expectancy</td><td>${escapeHtml(ups.batteryLifeYears)}</td></tr>`;
  html += `<tr><td>UPS Form Factor</td><td>${escapeHtml(ups.formFactor)}</td></tr>`;
  html += `<tr><td>Input Connector</td><td>${escapeHtml(ups.inputConnector)}</td></tr>`;
  html += `<tr><td>Output Connectors</td><td>${escapeHtml(ups.outputConnectors)}</td></tr>`;
  html += '</table>';

  // Section 4: Incoming Power Requirements
  html += '<h3>Incoming Power Requirements</h3>';
  html += '<table><tr><th>Specification</th><th>Detail</th></tr>';
  html += `<tr><td>Region</td><td>${mp.region}</td></tr>`;
  html += `<tr><td>Supply Voltage</td><td>${mp.voltage} V / ${mp.frequency} Hz</td></tr>`;
  html += `<tr><td>Phases</td><td>${mp.phases}-phase</td></tr>`;
  html += `<tr><td>Recommended Breaker</td><td>${mp.recommendedAmperage} A</td></tr>`;
  html += `<tr><td>Connector Type</td><td>${escapeHtml(mp.connectorType)}</td></tr>`;
  html += `<tr><td>Connector Description</td><td>${escapeHtml(mp.connectorDescription)}</td></tr>`;
  html += `<tr><td>Wiring Notes</td><td>${escapeHtml(mp.wiringNotes)}</td></tr>`;
  html += '</table>';

  // Section 5: Cooling Requirements
  html += '<h3>Cooling Requirements</h3>';
  html += '<table><tr><th>Specification</th><th>Detail</th></tr>';
  html += `<tr><td>Total Heat Output</td><td>${Math.round(cool.totalBTU)} BTU/hr (${cool.totalKW.toFixed(2)} kW)</td></tr>`;
  html += `<tr><td>Recommended AC Capacity</td><td>${cool.recommendedACTonnage.toFixed(2)} tons / ${cool.recommendedACKW.toFixed(2)} kW</td></tr>`;
  html += `<tr><td>Notes</td><td>${escapeHtml(cool.notes)}</td></tr>`;
  html += '</table>';

  return html;
}

// ── TSV Export ──

export function generateTSV(data: ExportData): string {
  const resolved = resolveItems(data);
  const pc = data.powerCalc;
  const ups = data.upsRec;
  const mp = data.mainsPower;
  const cool = data.cooling;
  const lines: string[] = [];
  const t = '\t';

  lines.push(`${data.configName} — ${data.storeName}`);
  lines.push('');

  // Section 1
  lines.push('Hardware Bill of Materials');
  lines.push(`Item${t}Model${t}Qty${t}Power (W)${t}Peak Power (W)${t}Heat (BTU/hr)${t}Rack U${t}PSU Connector`);
  for (const { hw, qty } of resolved) {
    lines.push(`${hw.name}${t}${hw.model}${t}${qty}${t}${hw.powerWatts}${t}${hw.peakPowerWatts}${t}${hw.heatOutputBTU}${t}${hw.rackUnits}${t}${hw.powerSupplyType}`);
  }
  lines.push('');

  // Section 2
  lines.push('Power Summary');
  lines.push(`Metric${t}Value`);
  lines.push(`Total Power Draw${t}${pc.totalWatts} W`);
  lines.push(`Total Peak Power${t}${pc.totalPeakWatts} W`);
  lines.push(`Total VA (0.9 PF)${t}${Math.round(pc.totalVA)} VA`);
  lines.push(`Total Heat Output${t}${Math.round(pc.totalBTU)} BTU/hr`);
  lines.push(`Total Rack Units${t}${pc.totalRackUnits} U`);
  lines.push(`Total Weight${t}${pc.totalWeight_kg.toFixed(1)} kg`);
  lines.push('');

  // Section 3
  lines.push('UPS Recommendation');
  lines.push(`Specification${t}Detail`);
  lines.push(`Recommended UPS${t}${ups.manufacturer} ${ups.model}`);
  lines.push(`Recommended KVA${t}${ups.recommendedKVA} kVA`);
  lines.push(`Minimum KVA${t}${ups.minimumKVA} kVA`);
  lines.push(`Topology${t}${ups.topology}`);
  lines.push(`Battery Configuration${t}${ups.batteryConfig}`);
  lines.push(`Estimated Runtime${t}${ups.estimatedRuntimeMinutes} minutes`);
  lines.push(`Battery Life Expectancy${t}${ups.batteryLifeYears}`);
  lines.push(`UPS Form Factor${t}${ups.formFactor}`);
  lines.push(`Input Connector${t}${ups.inputConnector}`);
  lines.push(`Output Connectors${t}${ups.outputConnectors}`);
  lines.push('');

  // Section 4
  lines.push('Incoming Power Requirements');
  lines.push(`Specification${t}Detail`);
  lines.push(`Region${t}${mp.region}`);
  lines.push(`Supply Voltage${t}${mp.voltage} V / ${mp.frequency} Hz`);
  lines.push(`Phases${t}${mp.phases}-phase`);
  lines.push(`Recommended Breaker${t}${mp.recommendedAmperage} A`);
  lines.push(`Connector Type${t}${mp.connectorType}`);
  lines.push(`Connector Description${t}${mp.connectorDescription}`);
  lines.push(`Wiring Notes${t}${mp.wiringNotes}`);
  lines.push('');

  // Section 5
  lines.push('Cooling Requirements');
  lines.push(`Specification${t}Detail`);
  lines.push(`Total Heat Output${t}${Math.round(cool.totalBTU)} BTU/hr (${cool.totalKW.toFixed(2)} kW)`);
  lines.push(`Recommended AC Capacity${t}${cool.recommendedACTonnage.toFixed(2)} tons / ${cool.recommendedACKW.toFixed(2)} kW`);
  lines.push(`Notes${t}${cool.notes}`);

  return lines.join('\n');
}

// ── CSV Export ──

export function generateCSV(data: ExportData): string {
  const resolved = resolveItems(data);
  const pc = data.powerCalc;
  const ups = data.upsRec;
  const mp = data.mainsPower;
  const cool = data.cooling;
  const lines: string[] = [];

  lines.push(csvRow([data.configName + ' — ' + data.storeName]));
  lines.push('');

  // Section 1
  lines.push(csvRow(['Hardware Bill of Materials']));
  lines.push(csvRow(['Item', 'Model', 'Qty', 'Power (W)', 'Peak Power (W)', 'Heat (BTU/hr)', 'Rack U', 'PSU Connector']));
  for (const { hw, qty } of resolved) {
    lines.push(csvRow([hw.name, hw.model, String(qty), String(hw.powerWatts), String(hw.peakPowerWatts), String(hw.heatOutputBTU), String(hw.rackUnits), hw.powerSupplyType]));
  }
  lines.push('');

  // Section 2
  lines.push(csvRow(['Power Summary']));
  lines.push(csvRow(['Metric', 'Value']));
  lines.push(csvRow(['Total Power Draw', `${pc.totalWatts} W`]));
  lines.push(csvRow(['Total Peak Power', `${pc.totalPeakWatts} W`]));
  lines.push(csvRow(['Total VA (0.9 PF)', `${Math.round(pc.totalVA)} VA`]));
  lines.push(csvRow(['Total Heat Output', `${Math.round(pc.totalBTU)} BTU/hr`]));
  lines.push(csvRow(['Total Rack Units', `${pc.totalRackUnits} U`]));
  lines.push(csvRow(['Total Weight', `${pc.totalWeight_kg.toFixed(1)} kg`]));
  lines.push('');

  // Section 3
  lines.push(csvRow(['UPS Recommendation']));
  lines.push(csvRow(['Specification', 'Detail']));
  lines.push(csvRow(['Recommended UPS', `${ups.manufacturer} ${ups.model}`]));
  lines.push(csvRow(['Recommended KVA', `${ups.recommendedKVA} kVA`]));
  lines.push(csvRow(['Minimum KVA', `${ups.minimumKVA} kVA`]));
  lines.push(csvRow(['Topology', ups.topology]));
  lines.push(csvRow(['Battery Configuration', ups.batteryConfig]));
  lines.push(csvRow(['Estimated Runtime', `${ups.estimatedRuntimeMinutes} minutes`]));
  lines.push(csvRow(['Battery Life Expectancy', ups.batteryLifeYears]));
  lines.push(csvRow(['UPS Form Factor', ups.formFactor]));
  lines.push(csvRow(['Input Connector', ups.inputConnector]));
  lines.push(csvRow(['Output Connectors', ups.outputConnectors]));
  lines.push('');

  // Section 4
  lines.push(csvRow(['Incoming Power Requirements']));
  lines.push(csvRow(['Specification', 'Detail']));
  lines.push(csvRow(['Region', mp.region]));
  lines.push(csvRow(['Supply Voltage', `${mp.voltage} V / ${mp.frequency} Hz`]));
  lines.push(csvRow(['Phases', `${mp.phases}-phase`]));
  lines.push(csvRow(['Recommended Breaker', `${mp.recommendedAmperage} A`]));
  lines.push(csvRow(['Connector Type', mp.connectorType]));
  lines.push(csvRow(['Connector Description', mp.connectorDescription]));
  lines.push(csvRow(['Wiring Notes', mp.wiringNotes]));
  lines.push('');

  // Section 5
  lines.push(csvRow(['Cooling Requirements']));
  lines.push(csvRow(['Specification', 'Detail']));
  lines.push(csvRow(['Total Heat Output', `${Math.round(cool.totalBTU)} BTU/hr (${cool.totalKW.toFixed(2)} kW)`]));
  lines.push(csvRow(['Recommended AC Capacity', `${cool.recommendedACTonnage.toFixed(2)} tons / ${cool.recommendedACKW.toFixed(2)} kW`]));
  lines.push(csvRow(['Notes', cool.notes]));

  return lines.join('\n');
}

// ── Clipboard ──

export async function copyToClipboard(text: string, isHTML = false): Promise<void> {
  if (isHTML && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    const htmlBlob = new Blob([text], { type: 'text/html' });
    const textBlob = new Blob([stripHtml(text)], { type: 'text/plain' });
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });
    await navigator.clipboard.write([item]);
  } else {
    await navigator.clipboard.writeText(text);
  }
}

// ── File Download ──

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Helpers ──

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function csvEscape(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function csvRow(cells: string[]): string {
  return cells.map(csvEscape).join(',');
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
