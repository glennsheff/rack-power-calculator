# AiFi Rack Power Calculator — CLAUDE.md

## Project Overview

An internal AiFi tool hosted on GitHub Pages that enables the non-technical Solutions team to correctly spec out power, UPS, and cooling requirements for comms/server racks deployed in retail stores and venues. The tool calculates UPS sizing (with model recommendations), mains power connection requirements, and air conditioning needs based on the hardware selected for a given deployment.

**Live URL:** `https://aifi.github.io/rack-power-calculator/` (or similar org-level GitHub Pages URL)

---

## Tech Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3 (with AiFi brand tokens as CSS custom properties)
- **State Management:** React Context + useReducer (no external state library needed)
- **Persistence:** localStorage for hardware library + JSON import/export for sharing
- **Routing:** React Router v6 (hash-based routing for GitHub Pages compatibility)
- **Deployment:** GitHub Pages via `gh-pages` branch (Vite build output)
- **Password Gate:** Client-side SHA-256 hash comparison (acceptable for internal low-stakes use)
- **Font:** Montserrat (Google Fonts) — AiFi brand typeface
- **Icons:** Ionicons (outlined) — AiFi brand icon set

---

## AiFi Brand Design System

All UI must follow the AiFi Brand Style Guide. Key tokens:

### Colours
```css
:root {
  --aifi-blue: #4979ff;        /* Primary accent — use sparingly for CTAs, highlights */
  --aifi-gray: #d4e3f5;        /* Cool gray — backgrounds, cards, subtle fills */
  --aifi-black: #1d252c;       /* Cool black — primary text, dark backgrounds */
  --aifi-white: #ffffff;        /* Pure white — backgrounds, cards */
  
  /* Tints (derived from brand guide) */
  --aifi-blue-10: #edf1ff;
  --aifi-blue-20: #d4e0ff;
  --aifi-gray-50: #e9f1fa;
  --aifi-black-80: #3a4650;
  --aifi-black-60: #5c6b78;
}
```

### Typography
- **Font Family:** `'Montserrat', sans-serif`
- **Headings:** Montserrat Bold (700)
- **Subheadings:** Montserrat SemiBold (600)
- **Body:** Montserrat Regular (400)
- **Labels/Captions:** Montserrat Regular at reduced opacity
- **Buttons:** Montserrat Bold with increased letter-spacing (0.05em)
- **Line spacing:** Minimum 130% for body text
- **NO ALL CAPS** except in logo-text lockups

### Logo Usage
- Horizontal lockup (logomark + wordmark) is the preferred version
- Place logo in **top-left** or **bottom-right** corners
- On white/light backgrounds: use `AiFi-LogoH-Main.svg` (blue mark + dark wordmark)
- On dark backgrounds: use `AiFi-LogoH-Inverted.svg` (blue mark + white wordmark)
- Logo SVG files are in `/public/assets/`

### Graphic Style
- Large solid rectangular shapes + thin lines
- Rounded buttons (echoing the fluid logomark)
- Solid colour fills — **no patterns, no gradients** (except dark gradients over photos)
- Ample whitespace / breathing room
- Blue used sparingly for elements that need to stand out

### Icons
- Use Ionicons (outlined variant) from `https://ionic.io/ionicons`
- Match stroke weight proportionally when scaling

---

## Architecture & File Structure

```
rack-power-calculator/
├── public/
│   ├── assets/
│   │   ├── AiFi-LogoH-Main.svg
│   │   ├── AiFi-LogoH-Inverted.svg
│   │   └── AiFi-LogoH-Main-PoweredBy.svg
│   └── data/
│       └── default-hardware.json        # Seed catalogue of common AiFi hardware
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Main layout with sidebar nav + header
│   │   │   ├── Sidebar.tsx              # Navigation menu
│   │   │   ├── Header.tsx               # Top bar with logo + current page title
│   │   │   └── PasswordGate.tsx         # Password entry screen
│   │   ├── hardware/
│   │   │   ├── HardwareLibrary.tsx      # Main hardware management page
│   │   │   ├── HardwareForm.tsx         # Add/edit hardware item form
│   │   │   ├── HardwareTable.tsx        # Sortable table of all hardware
│   │   │   └── HardwareImportExport.tsx # JSON import/export controls
│   │   ├── calculator/
│   │   │   ├── RackConfigurator.tsx      # Main calculator page
│   │   │   ├── HardwareSelector.tsx      # Pick items + quantities for a rack
│   │   │   ├── RuntimeSelector.tsx       # Desired UPS runtime slider/input
│   │   │   ├── RegionSelector.tsx        # USA / UK / EU toggle
│   │   │   ├── PowerSummary.tsx          # Calculated power totals
│   │   │   ├── UPSRecommendation.tsx     # Recommended UPS with specs
│   │   │   ├── CoolingSummary.tsx        # AC/cooling requirements
│   │   │   ├── MainsPowerSummary.tsx     # Incoming power connector details
│   │   │   └── ExportTable.tsx           # Final exportable summary table
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── Table.tsx
│   ├── context/
│   │   ├── HardwareContext.tsx           # Hardware library state
│   │   ├── RackContext.tsx               # Current rack configuration state
│   │   └── AuthContext.tsx               # Password gate state
│   ├── data/
│   │   ├── ups-models.ts                # UPS product database
│   │   ├── power-connectors.ts          # Regional power connector specs
│   │   └── default-hardware.ts          # Fallback seed data
│   ├── lib/
│   │   ├── calculations.ts             # All power/UPS/cooling calculation logic
│   │   ├── export.ts                   # Table export utilities
│   │   ├── storage.ts                  # localStorage wrapper
│   │   └── hash.ts                     # SHA-256 password hashing
│   ├── types/
│   │   └── index.ts                    # All TypeScript interfaces
│   ├── pages/
│   │   ├── DashboardPage.tsx           # Landing page after auth
│   │   ├── HardwarePage.tsx            # Hardware library management
│   │   ├── CalculatorPage.tsx          # Rack configurator + results
│   │   └── HelpPage.tsx               # Usage guide / documentation
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                       # Tailwind directives + brand tokens
├── CLAUDE.md                           # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── index.html
```

---

## Data Models (TypeScript Interfaces)

```typescript
// === Hardware Library ===

interface HardwareItem {
  id: string;                    // UUID
  name: string;                  // e.g. "AiFi Edge Server"
  model: string;                 // e.g. "Lenovo ThinkSystem SE350"
  category: HardwareCategory;
  powerWatts: number;            // Typical power draw in Watts
  peakPowerWatts: number;        // Peak/max power draw in Watts
  heatOutputBTU: number;         // Heat output in BTU/hr (auto-calculated from watts if not specified)
  powerSupplyCount: number;      // Number of PSUs (for redundancy info)
  powerSupplyType: string;       // e.g. "IEC C14", "IEC C20"
  rackUnits: number;             // Height in U
  weight_kg: number;             // Weight in kg
  notes: string;                 // Free text for any caveats
  isActive: boolean;             // Soft delete / hide from selector
  createdAt: string;             // ISO date
  updatedAt: string;             // ISO date
}

type HardwareCategory = 
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

// === Rack Configuration ===

interface RackItem {
  hardwareId: string;            // References HardwareItem.id
  quantity: number;
}

interface RackConfiguration {
  id: string;                    // UUID
  name: string;                  // e.g. "Morrisons Leeds - Standard"
  storeName: string;             // e.g. "Morrisons Leeds"
  region: PowerRegion;
  items: RackItem[];
  desiredRuntimeMinutes: number; // Desired UPS backup runtime
  includeRedundancy: boolean;    // N+1 UPS redundancy
  ambientTempCelsius: number;    // Expected ambient temperature
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type PowerRegion = 'US' | 'UK' | 'EU';

// === Calculation Results ===

interface PowerCalculation {
  totalWatts: number;            // Sum of all item powerWatts * quantity
  totalPeakWatts: number;        // Sum of all item peakPowerWatts * quantity
  totalVA: number;               // totalWatts / power factor
  totalPeakVA: number;           // totalPeakWatts / power factor
  totalAmps: number;             // At regional voltage
  totalBTU: number;              // Total heat output
  totalRackUnits: number;        // Total U height consumed
  totalWeight_kg: number;        // Total weight
  powerFactor: number;           // Assumed 0.9 for modern IT equipment
}

interface UPSRecommendation {
  model: string;                 // e.g. "APC Smart-UPS SRT"
  manufacturer: string;
  recommendedKVA: number;        // Recommended KVA rating
  minimumKVA: number;            // Absolute minimum KVA
  batteryConfig: string;         // e.g. "2x APCRBC140"
  estimatedRuntimeMinutes: number;
  batteryLifeYears: string;      // e.g. "3-5 years"
  formFactor: string;            // e.g. "Rackmount 3U" or "Tower"
  inputConnector: string;        // Regional input connector
  outputConnectors: string;      // Available output connector types
  notes: string;
}

interface CoolingRequirement {
  totalBTU: number;
  totalKW: number;               // BTU / 3412
  recommendedACTonnage: number;  // BTU / 12000
  recommendedACKW: number;       // AC cooling capacity in kW
  notes: string;                 // e.g. "Assumes enclosed rack in 25°C ambient"
}

interface MainsPowerRequirement {
  region: PowerRegion;
  voltage: number;               // 120/230/240
  frequency: number;             // 50/60 Hz
  phases: number;                // 1 or 3
  recommendedAmperage: number;   // Breaker size
  connectorType: string;         // e.g. "IEC 60309 32A" or "NEMA L6-30"
  connectorDescription: string;  // Human-readable description
  wiringNotes: string;           // Any notes for electricians
}
```

---

## Calculation Logic (`src/lib/calculations.ts`)

### Power Totals
```
totalWatts = Σ (item.powerWatts × quantity)
totalPeakWatts = Σ (item.peakPowerWatts × quantity)
powerFactor = 0.9 (industry standard for modern IT loads)
totalVA = totalWatts / powerFactor
totalPeakVA = totalPeakWatts / powerFactor
totalBTU = Σ (item.heatOutputBTU × quantity)
  — If heatOutputBTU not set: heatOutputBTU = powerWatts × 3.412
```

### UPS Sizing
```
requiredVA = totalPeakVA × 1.25 (25% headroom for safety margin)
recommendedKVA = round up to nearest standard UPS size:
  [1, 1.5, 2, 3, 5, 6, 8, 10, 15, 20] kVA

If includeRedundancy = true:
  recommendedKVA = next size up from requiredVA (N+1 approach)
```

### UPS Runtime Estimation
```
Runtime is estimated based on UPS battery capacity vs load:
- Each UPS model in the database has a runtime curve (load% → minutes)
- loadPercent = totalVA / (recommendedKVA × 1000)
- Interpolate runtime from the model's curve
- Battery packs can be added to extend runtime
```

### Cooling
```
totalBTU_hr = Σ (item.heatOutputBTU × quantity)
coolingKW = totalBTU_hr / 3412.14
acTonnage = totalBTU_hr / 12000
recommendedACCapacity = acTonnage × 1.3 (30% overhead for ambient + inefficiency)
```

### Mains Power (by region)
```
US:
  voltage = 120V (single phase ≤20A) or 208V/240V (single/three phase for larger loads)
  For loads ≤ 1920W: NEMA 5-20 (20A @ 120V)
  For loads ≤ 4800W: NEMA L6-30 (30A @ 240V single phase)
  For loads ≤ 7680W: NEMA L6-50 (50A @ 240V single phase)
  For loads > 7680W: Three-phase required — consult electrician
  
UK:
  voltage = 230V, 50Hz
  For loads ≤ 3000W: BS 1363 (13A standard plug)
  For loads ≤ 3680W: IEC 60309 16A (blue commando)
  For loads ≤ 7360W: IEC 60309 32A (blue commando)
  For loads > 7360W: Three-phase IEC 60309 — consult electrician

EU:
  voltage = 230V, 50Hz
  For loads ≤ 3680W: CEE 7/7 Schuko (16A)
  For loads ≤ 3680W: IEC 60309 16A (blue commando)  
  For loads ≤ 7360W: IEC 60309 32A (blue commando)
  For loads > 7360W: Three-phase IEC 60309 — consult electrician
```

### Amperage Calculation
```
amps = totalPeakWatts / (voltage × powerFactor)
recommendedBreakerAmps = next standard breaker size above (amps × 1.25)
Standard breaker sizes: [6, 10, 16, 20, 25, 32, 40, 50, 63] A
```

---

## UPS Product Database (`src/data/ups-models.ts`)

Include a curated list of commonly used rack-mount UPS models. For each model store:

```typescript
interface UPSModel {
  id: string;
  manufacturer: string;           // APC, Eaton, Vertiv, CyberPower
  series: string;                 // e.g. "Smart-UPS SRT"
  kvaRatings: number[];           // Available KVA sizes in this series
  formFactor: 'rackmount' | 'tower' | 'rack-tower';
  rackUnits: number;              // U height (for rackmount)
  topology: 'online-double-conversion' | 'line-interactive' | 'standby';
  inputOptions: {
    region: PowerRegion;
    connector: string;
    maxAmps: number;
  }[];
  outputOptions: string[];        // e.g. ["IEC C13 ×8", "IEC C19 ×4"]
  runtimeCurve: {                 // Load% → minutes at base battery
    loadPercent: number;
    runtimeMinutes: number;
  }[];
  extendedBatteryOption: boolean;
  batteryLifeYears: string;
  warrantyYears: number;
  notes: string;
}
```

**Seed the database with these common models:**
- APC Smart-UPS SRT (1kVA, 1.5kVA, 2.2kVA, 3kVA, 5kVA, 6kVA, 8kVA, 10kVA)
- APC Smart-UPS On-Line (1kVA, 1.5kVA, 2.2kVA, 3kVA)
- Eaton 5PX Gen 2 (1kVA, 1.5kVA, 2.2kVA, 3kVA)
- Eaton 9PX (1kVA, 1.5kVA, 2.2kVA, 3kVA, 5kVA, 6kVA, 8kVA, 10kVA, 11kVA)
- Vertiv Liebert GXT5 (1kVA, 1.5kVA, 2kVA, 3kVA, 5kVA, 6kVA, 8kVA, 10kVA)
- CyberPower OL Series (1kVA, 1.5kVA, 2kVA, 3kVA, 5kVA, 6kVA, 8kVA, 10kVA)

---

## Power Connector Database (`src/data/power-connectors.ts`)

Detailed connector specifications for each region:

```typescript
interface PowerConnector {
  region: PowerRegion;
  name: string;                  // e.g. "NEMA L6-30"
  description: string;           // e.g. "Locking 30A 250V plug"
  maxAmps: number;
  voltage: number;
  phases: number;
  frequency: number;
  usableWatts: number;          // maxAmps × voltage × 0.8 (80% NEC rule)
  wiringNotes: string;
  commonUse: string;            // e.g. "Standard for 3-5kVA UPS"
}
```

---

## Password Gate Implementation

- On first visit, show a full-screen password entry page with AiFi branding
- Password is hashed with SHA-256 and compared against a stored hash
- On success, set a flag in sessionStorage (clears when browser tab closes)
- The hash should be stored in an environment variable or config constant
- Default password for initial deployment: `AiFi-Rack-2024` (document this in README, change before real use)
- The password gate should be clean and branded — AiFi logo centred, single password field, branded button

---

## Export Functionality

### PowerPoint-Ready Table Export
The export table must be formatted for easy paste into PowerPoint. Provide two export options:

1. **Copy as HTML Table** — Copies a styled HTML table to clipboard. When pasted into PowerPoint, it preserves structure and basic formatting.

2. **Copy as Tab-Separated Values** — Plain text that pastes cleanly into PowerPoint's table insert or Excel.

3. **Download as CSV** — Fallback for offline use.

### Export Table Structure

The exported table should contain these sections:

**Section 1: Hardware Bill of Materials**
| Item | Model | Qty | Power (W) | Peak Power (W) | Heat (BTU/hr) | Rack U | PSU Connector |
|------|-------|-----|-----------|-----------------|---------------|--------|---------------|

**Section 2: Power Summary**
| Metric | Value |
|--------|-------|
| Total Power Draw | X W |
| Total Peak Power | X W |
| Total VA (0.9 PF) | X VA |
| Total Heat Output | X BTU/hr |
| Total Rack Units | X U |

**Section 3: UPS Recommendation**
| Specification | Detail |
|---------------|--------|
| Recommended UPS | [Manufacturer] [Model] |
| Recommended KVA | X kVA |
| Battery Configuration | [Description] |
| Estimated Runtime | X minutes at Y% load |
| Battery Life Expectancy | X-Y years |
| UPS Form Factor | Rackmount XU |

**Section 4: Incoming Power Requirements**
| Specification | Detail |
|---------------|--------|
| Region | [US/UK/EU] |
| Supply Voltage | X V / Y Hz |
| Required Amperage | X A |
| Recommended Breaker | X A |
| Connector Type | [Name + description] |
| Wiring Notes | [Any special requirements] |

**Section 5: Cooling Requirements**
| Specification | Detail |
|---------------|--------|
| Total Heat Output | X BTU/hr (Y kW) |
| Recommended AC Capacity | X tons / Y kW |
| Notes | [Ambient temp assumptions etc.] |

---

## Pages & Navigation

### Sidebar Navigation
```
[AiFi Logo]
─────────────
📊  Dashboard
🖥️  Hardware Library
⚡  Rack Calculator
📖  Help & Guide
─────────────
v1.0.0
```

### Page: Dashboard
- Welcome message with brief tool description
- Quick stats: number of hardware items in library, recent configurations
- Quick-start buttons to jump into the calculator or hardware library

### Page: Hardware Library
- Full CRUD for hardware items
- Sortable, filterable table view
- Category filter tabs/dropdown
- Add New / Edit modal form
- Import/Export JSON buttons
- Bulk actions (activate/deactivate)

### Page: Rack Calculator
- **Step 1 — Configuration Details:** Name, store name, region selector (US/UK/EU), ambient temperature
- **Step 2 — Hardware Selection:** Browse/search library, add items with quantities. Running totals shown in a sidebar summary
- **Step 3 — UPS Options:** Desired runtime slider (5-60 min, default 15min), redundancy toggle (N+1)
- **Step 4 — Results:** Full breakdown with Power Summary, UPS Recommendation, Mains Power, Cooling. Export button prominently placed.
- Allow saving configurations to localStorage for re-use

### Page: Help & Guide
- How to use the tool (brief walkthrough)
- Explanation of calculations (so solutions team understands the output)
- Glossary of terms (VA, kVA, BTU, PF, N+1, etc.)
- Regional power connector visual reference
- Contact info for engineering support

---

## Default Hardware Seed Data

Pre-populate the hardware library with common AiFi deployment hardware:

```json
[
  {
    "name": "AiFi Edge Server",
    "model": "Lenovo ThinkSystem SE350",
    "category": "server",
    "powerWatts": 300,
    "peakPowerWatts": 450,
    "heatOutputBTU": 1024,
    "powerSupplyCount": 2,
    "powerSupplyType": "IEC C14",
    "rackUnits": 1,
    "weight_kg": 4.5,
    "notes": "Standard edge compute server for stores up to 3000 sq ft"
  },
  {
    "name": "AiFi GPU Server",
    "model": "Lenovo ThinkSystem SR655 V3",
    "category": "server",
    "powerWatts": 750,
    "peakPowerWatts": 1200,
    "heatOutputBTU": 2559,
    "powerSupplyCount": 2,
    "powerSupplyType": "IEC C20",
    "rackUnits": 2,
    "weight_kg": 28,
    "notes": "GPU inference server for larger stores and venues"
  },
  {
    "name": "Network Switch 24-Port PoE",
    "model": "Cisco Catalyst C9200L-24P",
    "category": "switch",
    "powerWatts": 370,
    "peakPowerWatts": 740,
    "heatOutputBTU": 1263,
    "powerSupplyCount": 1,
    "powerSupplyType": "IEC C14",
    "rackUnits": 1,
    "weight_kg": 5.2,
    "notes": "PoE switch for cameras — peak includes full PoE load"
  },
  {
    "name": "Network Switch 48-Port PoE",
    "model": "Cisco Catalyst C9200L-48P",
    "category": "switch",
    "powerWatts": 500,
    "peakPowerWatts": 1480,
    "heatOutputBTU": 1706,
    "powerSupplyCount": 2,
    "powerSupplyType": "IEC C14",
    "rackUnits": 1,
    "weight_kg": 6.8,
    "notes": "PoE switch for cameras — peak includes full PoE load"
  },
  {
    "name": "Patch Panel 24-Port",
    "model": "Generic Cat6A",
    "category": "accessory",
    "powerWatts": 0,
    "peakPowerWatts": 0,
    "heatOutputBTU": 0,
    "powerSupplyCount": 0,
    "powerSupplyType": "N/A",
    "rackUnits": 1,
    "weight_kg": 1.5,
    "notes": "Passive — no power required"
  },
  {
    "name": "Rack PDU - Metered",
    "model": "APC AP8858",
    "category": "pdu",
    "powerWatts": 10,
    "peakPowerWatts": 10,
    "heatOutputBTU": 34,
    "powerSupplyCount": 0,
    "powerSupplyType": "IEC C20 input",
    "rackUnits": 0,
    "weight_kg": 4.1,
    "notes": "0U vertical mount. Power shown is PDU overhead only, not pass-through."
  },
  {
    "name": "Cable Management - 1U",
    "model": "Generic Horizontal",
    "category": "accessory",
    "powerWatts": 0,
    "peakPowerWatts": 0,
    "heatOutputBTU": 0,
    "powerSupplyCount": 0,
    "powerSupplyType": "N/A",
    "rackUnits": 1,
    "weight_kg": 0.5,
    "notes": "Passive — no power required"
  },
  {
    "name": "Fibre Media Converter",
    "model": "TP-Link MC220L",
    "category": "gateway",
    "powerWatts": 5,
    "peakPowerWatts": 5,
    "heatOutputBTU": 17,
    "powerSupplyCount": 1,
    "powerSupplyType": "DC barrel",
    "rackUnits": 0.5,
    "weight_kg": 0.3,
    "notes": "Typically shelved, uses tray mount"
  },
  {
    "name": "Firewall/Router",
    "model": "Cisco Meraki MX67",
    "category": "gateway",
    "powerWatts": 30,
    "peakPowerWatts": 40,
    "heatOutputBTU": 102,
    "powerSupplyCount": 1,
    "powerSupplyType": "DC barrel",
    "rackUnits": 1,
    "weight_kg": 1.0,
    "notes": "Cloud-managed firewall/SD-WAN"
  },
  {
    "name": "4G/5G Cellular Gateway",
    "model": "Cradlepoint E300",
    "category": "gateway",
    "powerWatts": 25,
    "peakPowerWatts": 30,
    "heatOutputBTU": 85,
    "powerSupplyCount": 1,
    "powerSupplyType": "DC barrel",
    "rackUnits": 1,
    "weight_kg": 0.9,
    "notes": "Failover cellular connectivity"
  },
  {
    "name": "Raspberry Pi Controller",
    "model": "Raspberry Pi 4B 8GB",
    "category": "camera-controller",
    "powerWatts": 10,
    "peakPowerWatts": 15,
    "heatOutputBTU": 34,
    "powerSupplyCount": 1,
    "powerSupplyType": "USB-C",
    "rackUnits": 0.5,
    "weight_kg": 0.3,
    "notes": "Peripheral controller — typically shelved with tray mount"
  },
  {
    "name": "NVR / Video Recorder",
    "model": "Synology RS1221+",
    "category": "storage",
    "powerWatts": 110,
    "peakPowerWatts": 160,
    "heatOutputBTU": 375,
    "powerSupplyCount": 2,
    "powerSupplyType": "IEC C14",
    "rackUnits": 2,
    "weight_kg": 15.5,
    "notes": "Local recording / buffering for video pipeline"
  }
]
```

---

## Implementation Notes

### GitHub Pages Considerations
- Use `HashRouter` (not `BrowserRouter`) — GitHub Pages doesn't support SPA fallback routing
- Set `base` in `vite.config.ts` to the repo name: `base: '/rack-power-calculator/'`
- Add a `deploy` script: `"deploy": "vite build && gh-pages -d dist"`

### Responsive Design
- Primary target: desktop/laptop browsers (this is an office tool)
- Minimum supported width: 1024px
- Should still be usable on iPad landscape (1024px)
- Mobile is not a priority but shouldn't be completely broken

### Accessibility
- All form inputs must have labels
- Color is never the sole indicator of state (use icons too)
- Focus management on modal open/close
- Keyboard navigable

### Error Handling
- Form validation with clear error messages
- Warn if rack exceeds 42U (standard rack height)
- Warn if total weight exceeds typical rack load limits (~800kg)
- Warn if power draw exceeds safe limits for selected region/connector

### Performance
- All calculations run client-side — should be instant
- No API calls (pure static site)
- Lazy load the Help page content

---

## Development Workflow

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Testing Checklist

Before deployment, verify:
- [ ] Password gate works (correct password grants access, incorrect is rejected)
- [ ] Hardware CRUD: add, edit, delete, toggle active
- [ ] Hardware import/export JSON round-trips correctly
- [ ] Calculator produces correct power totals for a known configuration
- [ ] UPS recommendation matches expected sizing
- [ ] Regional power connectors are correct for US, UK, EU
- [ ] Cooling calculation is correct (BTU → tonnage)
- [ ] Export table copies correctly to clipboard
- [ ] Pasted table renders properly in PowerPoint
- [ ] All pages render correctly in Chrome, Firefox, Safari
- [ ] Logo and branding are consistent across all pages
- [ ] No console errors in production build
