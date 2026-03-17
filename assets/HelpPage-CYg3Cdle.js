import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";var r=e(t(),1),i=n(),a=[{title:`Getting Started`,content:`
**1. Hardware Library** — Start by reviewing the pre-loaded hardware catalogue. You can add custom items or modify existing ones from the Hardware Library page.

**2. Create a Configuration** — Go to the Rack Calculator, give your configuration a name and store/venue, then select the region (US, UK, or EU).

**3. Add Hardware** — Search and add items from the library. Set quantities for each item in the rack.

**4. Set UPS Options** — Choose your desired UPS backup runtime (5–60 minutes) and whether you need N+1 redundancy.

**5. Review Results** — The calculator instantly shows power totals, UPS recommendations, mains power requirements, and cooling needs.

**6. Export** — Copy the results as an HTML table (for PowerPoint), TSV (for Excel), or download as CSV.
    `},{title:`Understanding the Calculations`,content:`
**Power Totals**
- **Total Watts** — Sum of each item's typical power draw multiplied by its quantity
- **Peak Watts** — Sum of maximum power draw (used for UPS and breaker sizing)
- **VA (Volt-Amperes)** — Watts divided by power factor (0.9 for modern IT equipment)
- **BTU/hr** — Heat output, either specified per item or auto-calculated (Watts × 3.412)

**UPS Sizing**
- Required VA = Peak VA × 1.25 (25% safety margin)
- The tool rounds up to the next standard UPS size: 1, 1.5, 2, 3, 5, 6, 8, 10, 15, or 20 kVA
- With N+1 redundancy enabled, it selects one size larger than the minimum
- Runtime is estimated from the UPS model's load-vs-runtime curve

**Cooling**
- Cooling capacity (kW) = Total BTU/hr ÷ 3,412
- Recommended AC tonnage = BTU/hr ÷ 12,000
- A 30% overhead is applied for ambient temperature and inefficiency

**Mains Power**
- Amperage = Peak Watts ÷ (Voltage × Power Factor)
- Breaker size = next standard size above (Amps × 1.25) per NEC/IEC rules
- Connector type is determined by region and total load
    `},{title:`Glossary`,content:`
| Term | Definition |
|------|-----------|
| **W (Watts)** | Unit of electrical power. Measures actual energy consumption. |
| **VA (Volt-Amperes)** | Apparent power. VA = Watts ÷ Power Factor. |
| **kVA** | Kilowatt volt-amperes (VA ÷ 1000). Standard unit for UPS sizing. |
| **PF (Power Factor)** | Ratio of real power to apparent power. 0.9 is typical for IT loads. |
| **BTU/hr** | British Thermal Units per hour. Measures heat output for cooling calculations. |
| **N+1 Redundancy** | One additional UPS unit beyond what's needed, so if one fails the other handles the load. |
| **PDU** | Power Distribution Unit. Distributes power from UPS to rack equipment. |
| **PoE (Power over Ethernet)** | Technology that delivers power through network cables to devices like cameras. |
| **IEC C13 / C14** | Standard power connectors used on most IT equipment (10A). |
| **IEC C19 / C20** | Heavy-duty power connectors for high-draw equipment (16A). |
| **NEMA** | National Electrical Manufacturers Association. US power connector standards. |
| **IEC 60309** | International standard for industrial power connectors ("commando" plugs). |
| **Rack Unit (U)** | Standard unit of rack height. 1U = 1.75 inches (44.45 mm). Standard rack = 42U. |
| **Online Double Conversion** | UPS topology that constantly converts power through batteries, providing cleanest output. |
| **Line Interactive** | UPS topology that conditions power and switches to battery when needed. Good for most IT loads. |
    `},{title:`Regional Power Reference`,content:`
**United States (US)**
- Voltage: 120V (small loads) / 208–240V (larger loads)
- Frequency: 60 Hz
- Common connectors: NEMA 5-20 (120V/20A), NEMA L6-30 (240V/30A), NEMA L6-50 (240V/50A)
- Three-phase available for loads over ~7.7 kW

**United Kingdom (UK)**
- Voltage: 230V
- Frequency: 50 Hz
- Common connectors: BS 1363 (13A standard), IEC 60309 16A/32A (blue commando)
- Three-phase available for loads over ~7.4 kW

**European Union (EU)**
- Voltage: 230V
- Frequency: 50 Hz
- Common connectors: CEE 7/7 Schuko (16A), IEC 60309 16A/32A (blue commando)
- Three-phase available for loads over ~7.4 kW
    `},{title:`Tips & Best Practices`,content:`
- **Always use peak power** for UPS and breaker sizing, not typical power draw
- **PoE switches** can have very different typical vs. peak power — peak assumes all ports at maximum PoE load
- **Leave headroom** — the calculator already adds 25% for UPS and 30% for cooling, but round up if in doubt
- **Check with the store's electrician** before specifying power connections — existing infrastructure may limit options
- **Battery runtime** is an estimate — actual runtime depends on battery age, temperature, and load profile
- **Save configurations** using the save button, so you can revisit them later or use them as templates
- **Export the hardware library** as JSON periodically as a backup — localStorage can be cleared by the browser
    `},{title:`Need Help?`,content:`
For questions about specific hardware specs or unusual deployment requirements, contact the AiFi Engineering team.

For issues with the calculator tool itself, raise a ticket or contact the development team.

**Email:** glenn.faulkner@aifi.com
    `}];function o(){let[e,t]=(0,r.useState)(0);return(0,i.jsxs)(`div`,{className:`max-w-3xl mx-auto`,children:[(0,i.jsxs)(`div`,{className:`mb-6`,children:[(0,i.jsx)(`h2`,{className:`text-2xl font-bold text-aifi-black mb-2`,children:`Help & Guide`}),(0,i.jsx)(`p`,{className:`text-aifi-black-60`,children:`Everything you need to know about using the Rack Power Calculator.`})]}),(0,i.jsx)(`div`,{className:`space-y-2`,children:a.map((n,r)=>(0,i.jsxs)(`div`,{className:`bg-white rounded-xl border border-aifi-gray/30 overflow-hidden`,children:[(0,i.jsxs)(`button`,{onClick:()=>t(e===r?-1:r),className:`w-full flex items-center justify-between px-5 py-4 text-left hover:bg-aifi-gray-50/50 transition-colors`,children:[(0,i.jsx)(`span`,{className:`font-semibold text-aifi-black`,children:n.title}),(0,i.jsx)(`svg`,{width:`20`,height:`20`,viewBox:`0 0 20 20`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,className:`text-aifi-black-60 transition-transform ${e===r?`rotate-180`:``}`,children:(0,i.jsx)(`path`,{d:`M5 7.5l5 5 5-5`})})]}),e===r&&(0,i.jsx)(`div`,{className:`px-5 pb-5 prose prose-sm max-w-none`,children:(0,i.jsx)(s,{content:n.content})})]},r))})]})}function s({content:e}){let t=e.trim().split(`
`),n=[],r=!1,a=[],o=e=>{let t=[],n=e,r=0;for(;n.length>0;){let e=n.match(/\*\*(.+?)\*\*/);if(e&&e.index!==void 0)e.index>0&&t.push(n.slice(0,e.index)),t.push((0,i.jsx)(`strong`,{className:`font-semibold text-aifi-black`,children:e[1]},r++)),n=n.slice(e.index+e[0].length);else{t.push(n);break}}return t},s=()=>{if(a.length>1){let e=a[0],t=a.slice(1).filter(e=>!e.every(e=>/^[-|]+$/.test(e)));n.push((0,i.jsx)(`div`,{className:`overflow-x-auto my-3`,children:(0,i.jsxs)(`table`,{className:`w-full text-sm border-collapse`,children:[(0,i.jsx)(`thead`,{children:(0,i.jsx)(`tr`,{children:e.map((e,t)=>(0,i.jsx)(`th`,{className:`text-left px-3 py-2 bg-aifi-gray-50/50 font-semibold text-aifi-black-80 border-b border-aifi-gray/30`,children:o(e.trim())},t))})}),(0,i.jsx)(`tbody`,{children:t.map((e,t)=>(0,i.jsx)(`tr`,{className:`border-b border-aifi-gray/20`,children:e.map((e,t)=>(0,i.jsx)(`td`,{className:`px-3 py-2 text-aifi-black-60`,children:o(e.trim())},t))},t))})]})},n.length))}a=[],r=!1};for(let e of t){let t=e.trim();if(t.startsWith(`|`)){r=!0;let e=t.split(`|`).filter(Boolean);a.push(e);continue}r&&s(),t&&(t.startsWith(`- `)?n.push((0,i.jsx)(`li`,{className:`ml-4 text-sm text-aifi-black-60 mb-1 list-disc`,children:o(t.slice(2))},n.length)):n.push((0,i.jsx)(`p`,{className:`text-sm text-aifi-black-60 mb-2 leading-relaxed`,children:o(t)},n.length)))}return r&&s(),(0,i.jsx)(i.Fragment,{children:n})}export{o as default};