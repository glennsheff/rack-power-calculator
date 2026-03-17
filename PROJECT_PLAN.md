# AiFi Rack Power Calculator — Project Plan

## Purpose

The Solutions team currently has no standardised tool for calculating power, UPS, and cooling requirements when speccing out comms racks for store deployments. This leads to inconsistent specifications, over- or under-provisioned UPS units, and frequent back-and-forth with engineering. This tool gives them a self-service way to produce accurate, presentation-ready specs.

---

## Target Users

**Primary:** AiFi Solutions / Solutioning team (non-technical, client-facing)
**Secondary:** AiFi Engineering team (for validation and hardware library maintenance)

---

## Build Phases

### Phase 1 — Foundation (Priority: Do First)

The skeleton of the app with routing, auth, branding, and the hardware library.

**Deliverables:**
- Vite + React + TypeScript project scaffolding
- Tailwind CSS configured with AiFi brand tokens
- AiFi branded layout shell (sidebar nav, header with logo, main content area)
- Password gate page (SHA-256 hash, sessionStorage persistence)
- Hash-based routing for all pages
- Hardware Library page with full CRUD (add/edit/delete items)
- Hardware data model with localStorage persistence
- JSON import/export for the hardware catalogue
- Seed data pre-loaded on first visit (common AiFi hardware)

**Acceptance:** Can log in, add/edit hardware, export the library as JSON, and import it back.

---

### Phase 2 — Calculator Engine (Priority: Core Value)

The actual calculation logic and the rack configurator interface.

**Deliverables:**
- Rack Configurator page — configuration details form (name, store, region, ambient temp)
- Hardware selector — searchable/filterable list, add items with quantity controls
- Running totals sidebar showing watts, VA, BTU, rack U in real time
- Runtime selector (slider, 5–60 min, default 15)
- Redundancy toggle (N+1)
- Region selector (US / UK / EU) with flag icons or clear labels
- Calculation engine (`calculations.ts`) covering: power totals, UPS sizing, cooling, mains power
- Results display: Power Summary, UPS Recommendation, Cooling, Mains Power cards

**Acceptance:** Can select hardware, set options, and see correct calculated results for all three regions.

---

### Phase 3 — UPS Database & Recommendations (Priority: Core Value)

Intelligent UPS model matching based on load requirements.

**Deliverables:**
- UPS product database (`ups-models.ts`) with real specs for APC, Eaton, Vertiv, CyberPower lines
- Matching algorithm: given requiredKVA + region + formFactor, return ranked UPS options
- Runtime estimation from each model's load-vs-runtime curve
- Extended battery pack recommendations where runtime target exceeds base battery
- Regional input connector matching (the UPS recommendation changes by region)
- Display of top 2–3 UPS options with key specs

**Acceptance:** For a given rack load and runtime requirement, the tool recommends appropriate UPS models with correct regional connectors.

---

### Phase 4 — Export & Polish (Priority: Completes the Loop)

The export table and final fit-and-finish.

**Deliverables:**
- Export table component matching the spec in CLAUDE.md (5 sections)
- Copy as HTML table (for PowerPoint paste)
- Copy as TSV (for Excel/PowerPoint table insert)
- Download as CSV
- Visual preview of the export table before copying
- Save/load rack configurations to localStorage
- Dashboard page with quick stats and recent configurations
- Help & Guide page with glossary, calculation explanations, connector visuals
- Final branding pass — ensure all pages match the AiFi style guide
- Error states, warnings (rack height, weight, power limits)
- Favicon and page title

**Acceptance:** Can produce a complete exportable table, paste it into PowerPoint, and it looks professional with all required fields populated.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Static hosting | GitHub Pages | No server to maintain, free, version controlled |
| Password approach | Client-side SHA-256 | Good enough for internal low-stakes tool; no backend required |
| Data persistence | localStorage + JSON export | No database; team can share catalogue via repo commits |
| Routing | Hash-based (`/#/calculator`) | GitHub Pages doesn't support SPA history fallback |
| UPS data | Hardcoded TS module | Small dataset, changes rarely, easy to update via PR |
| Regional scope | US, UK, EU only | Covers 95%+ of AiFi deployments; rare countries handled manually |
| Export format | HTML table + TSV + CSV | HTML table preserves formatting in PowerPoint; TSV/CSV as fallback |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Password visible in source | Low — internal tool, not sensitive data | Acceptable trade-off vs. hosting complexity. Document in README. |
| UPS data goes stale | Medium — new models released | UPS database is a single file; easy to update via PR. Add a "last updated" date. |
| Hardware library drift across team | Medium — each person's localStorage is isolated | JSON export/import is the workaround. The repo stores a canonical `default-hardware.json`. |
| Solutions team enters wrong specs | Medium — garbage in, garbage out | Seed data covers the most common items; add validation warnings for unusual values. |

---

## Future Enhancements (Out of Scope for V1)

- **Saved configurations in the repo** — commit configs as JSON files so the whole team can access them
- **Multi-rack support** — some larger venues have 2+ racks
- **PDF export** — branded PDF report instead of just table paste
- **Rack elevation diagram** — visual U-by-U layout of what goes where
- **Additional regions** — Japan, Middle East, etc.
- **Supabase or similar backend** — if the team grows and localStorage becomes limiting
- **Cost estimation** — approximate hardware + UPS + installation costs
