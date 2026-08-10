# DataLund Resource Load — agent kickoff

Copy this file into the new Resource Load repo (or point the agent at it). Implement a **separate** Power BI custom visual that ships as an uploadable `.pbiviz`. Do **not** add Resource Load into the Gantt visual.

**Reference implementation:** [Datalundno/GANTT](https://github.com/Datalundno/GANTT) → `ganttChart/` (DataLund Gantt 1.8.x).  
**Suite contracts:** follow the density table and field-role names below (same as Gantt `SUITE.md`).

---

## 1) One job

**Resource Load** shows **people (or teams) on tasks over time** — who is loaded, when, and with how many overlapping assignments.

| | |
| --- | --- |
| **Display name** | DataLund Resource Load |
| **Publisher** | DataLund (`datalund.no`) |
| **Offer ID (example)** | `datalund-resource-load` |
| **Primary audience** | Project / PMO reports next to DataLund Gantt |
| **Output** | Importable `.pbiviz` (+ later AppSource) |

Gantt answers *what happens when*. Resource Load answers *who is busy when*.

---

## 2) Suite contracts (mandatory)

### Density presets

Format → **General → Density**. Use **exactly** these names and numbers. Do not invent Small/Medium/Huge.

| Preset | Intent | barHeight | rowGap | fontSize | labelWidth | cornerRadius |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Compact** | Many visuals on one page | 16 | 8 | 10 | 140 | 2 |
| **Comfortable** | Default | 28 | 12 | 12 | 200 | 4 |
| **Large** | Sparse pages / presenting | 36 | 16 | 14 | 240 | 6 |
| **Custom** | Use each visual’s own size sliders | — | — | — | — | — |

Copy `ganttChart/src/suite/density.ts` into this repo (e.g. `src/suite/density.ts`). Prefer a shared module later; for v1 a copy is fine if kept in sync.

### Shared field role **names**

Keep role `name` values identical to the suite so reports can reuse the same columns:

| Role | `name` | Kind | Notes |
| --- | --- | --- | --- |
| Resource | `resource` | Grouping | **Required.** Person / team (Y-axis rows). |
| Task | `task` | Grouping | **Required.** Assignment / project name. |
| Start Date | `startDate` | GroupingOrMeasure | **Required.** |
| End Date | `endDate` | GroupingOrMeasure | Optional if Duration supplied. |
| Duration | `duration` | Measure | Days; used when End Date absent. |
| Progress | `progress` | Measure | Optional; 0–1 or 0–100. |
| Group | `group` | Grouping | Optional; phase / arena for tooltip or secondary label. |
| Tooltips | `tooltipFields` | Grouping | Optional; up to ~8 extra fields. |

**Do not rename** these role names. Display names in the field well can be friendlier (“Project lead”, “Project”) but `capabilities.json` `name` must stay as above.

---

## 3) Visual behaviour (v1 scope)

### Layout

Mirror Gantt’s chrome so the suite feels like one family:

- Left **label pane** = resource names (one row per resource).
- Right **plot** = time axis (shared patterns with Gantt: today line, weekend shading optional, axis granularity).
- Sticky / synced scroll (labels vertical ↔ plot; axis horizontal ↔ plot).
- Landing page when required fields are missing (branded DataLund, short bind steps).
- Empty / error message states.

### Encoding

For each **resource** row:

1. Collect all tasks assigned to that resource with valid start/end (or start+duration).
2. Draw **assignment bars** on the time scale (same bar language as Gantt: rounded rects, optional progress overlay).
3. Detect **overlap** within a resource (two+ tasks whose date ranges intersect).
4. Surface load:
   - **v1 (required):** stack or lane overlapping bars within the row, **or** thicken/color by concurrent count — pick one clear approach and document it in the README.
   - **Recommended v1:** small vertical lanes inside the resource row for concurrent tasks (swimlane-per-resource), plus a numeric **load badge** (max concurrent in visible window) on the label.
5. Color:
   - Default: single suite fill (format pane).
   - Optional toggle: color by task (category colors from host) **or** color by concurrency (e.g. 1 = calm, 2+ = warn). Prefer one default; keep the other as a format option if time allows.

### Interaction

- Click task bar → Power BI selection / cross-filter (selectionIds like Gantt).
- Click resource label → select all tasks for that resource (if straightforward; otherwise defer).
- Tooltips: resource, task, start, end, duration, progress, tooltipFields.
- Context menu on empty space and on bars (AppSource expectation).
- Optional toolbar (nice-to-have, not blocking v1): time window 3/6/9/12 months **from today** (same semantics as Gantt 1.8 — not centered).

### Out of scope for v1

- Full capacity calendars / FTE % / working-hours engines.
- Editing assignments inside the visual.
- Multi-resource assignment on one task row (if a task has multiple resources, expect **one row per resource–task** from the data model / Lists expansion).
- Cockpit / multi-panel lab UI.
- Whitelabel dual-brand packaging (can add later like Gantt).

---

## 4) Architecture (clone from Gantt, then adapt)

Suggested folder layout:

```text
resourceLoad/
  pbiviz.json
  capabilities.json
  package.json
  src/
    visual.ts
    settings.ts
    suite/density.ts
    data/types.ts
    data/converter.ts
    data/load.ts          # group by resource + overlap / lanes
    render/layout.ts
    render/axis.ts        # reuse Gantt date/axis ideas
    render/bars.ts
    utils/dates.ts
    utils/tooltips.ts
    utils/contrast.ts
  style/visual.less
  stringResources/en-US/resources.resjson
  assets/icon.png
  assets/store/logo-300.png
  downloads/              # packaged .pbiviz + sample xlsx
  docs/PRIVACY.md
  docs/SUPPORT.md
  docs/APPSOURCE.md
  README.md
```

### Toolchain (match Gantt)

| Requirement | Version |
| --- | --- |
| Node.js | >= 20.19.0 |
| `powerbi-visuals-tools` | 7.2.1 |
| `powerbi-visuals-api` | 5.11.1 |
| `d3` | 7.9.0 |
| Formatting model | `powerbi-visuals-utils-formattingmodel` 7.x |

### Patterns to copy

From [Datalundno/GANTT](https://github.com/Datalundno/GANTT) `ganttChart/`:

- Table `dataViewMappings` + role index converter
- Date parsing, duration fallback, milestone handling (zero-length → diamond **optional** for Resource Load)
- Density resolve in `update()` before layout
- Formatting settings cards aligned 1:1 with `capabilities.json` objects
- High-contrast color helpers
- `supportsLandingPage`, `supportsHighlight`, tooltips roles, no `privileges` / no external requests

### Identity (new visual — generate once, never change)

| Field | Value |
| --- | --- |
| `visual.name` | `resourceLoad` (or similar camelCase) |
| `displayName` | `DataLund Resource Load` |
| `guid` | **Generate a new GUID** (do not reuse Gantt’s) |
| `version` | Start at `1.0.0.0` |
| `supportUrl` | `https://datalund.no/support/` |
| Help / product URL | `https://datalund.no/visuals/resource-load/` (Website repo can add page later) |
| Author | DataLund / same email as Gantt `pbiviz.json` |

---

## 5) Capabilities sketch

Minimum conditions:

- `resource` min 1, max 1  
- `task` min 1, max 1  
- `startDate` max 1  
- `endDate` max 1  
- `duration` max 1  
- `progress` max 1  
- `group` max 1  
- `tooltipFields` max 8  

Require **Start** and (**End** or **Duration**) in the converter; show a clear landing/error if missing.

Format objects (v1):

- **General:** density, showTodayLine, todayLineColor, axisGranularity, weekendShading, optional showTimeWindow  
- **Bars:** barHeight, cornerRadius, fill, progressFill (and/or load/warn color)  
- **Labels:** fontSize, fontFamily, width  

---

## 6) Sample data & Lists mapping

Ship a small Excel sample (like Gantt’s `GanttSampleData.xlsx`) with columns the visual binds to.

Typical Microsoft Lists → roles:

| Lists field | Role |
| --- | --- |
| Project lead | `resource` |
| Project name | `task` |
| Start date | `startDate` |
| Estimated end | `endDate` |
| Progress (%) | `progress` |
| Phase / Type / Domain | `group` or tooltips |
| RAG, milestone, obstacles | `tooltipFields` |

Model tip for report authors: one row per project (or per assignment). If a project has multiple leads, expand to multiple rows.

---

## 7) Packaging & acceptance criteria

```bash
cd resourceLoad   # or repo root if visual lives at root
npm install
npm run lint
pbiviz package
pbiviz package --certification-audit   # no external requests
cp dist/*.pbiviz downloads/resourceLoad.pbiviz
```

**Done when:**

- [ ] `.pbiviz` imports into Power BI Desktop without errors  
- [ ] Landing page shows until Resource + Task + dates are bound  
- [ ] Multiple resources render as separate rows  
- [ ] Overlapping tasks on one resource are visibly distinct (lanes and/or load encoding)  
- [ ] Today line + axis work; density presets change sizes as in the suite table  
- [ ] Selection on a bar cross-filters other visuals  
- [ ] Tooltips show bound fields  
- [ ] No network calls; empty `privileges`  
- [ ] README explains field binding and density  
- [ ] Privacy + Support markdown exist (sandbox-only, no telemetry)  

AppSource polish (logo 300×300, 1366×768 screenshots, sample `.pbix`) can follow v1 package — mirror Gantt `docs/APPSOURCE.md`.

---

## 8) Implementation order

1. Scaffold `pbiviz` project + package metadata + icon stub  
2. `capabilities.json` + settings + density module  
3. Converter → view model (tasks with resource)  
4. Aggregate by resource + compute overlap / lanes  
5. Render labels + bars + axis  
6. Selection, tooltips, context menu, landing page  
7. Sample Excel + README  
8. `pbiviz package` and smoke-test checklist above  

---

## 9) Agent rules

- Follow this file and the density/role contracts; do not invent parallel naming.  
- One visual, one job — no Gantt clone with a load panel bolted on.  
- Prefer copying proven Gantt utilities over rewriting date/axis logic from scratch.  
- Keep code structured (`data/`, `render/`, `suite/`, `utils/`) like Gantt.  
- Free visual; branded **DataLund Resource Load**.  
- When the package builds, place a stable copy under `downloads/` for website/release mirroring.

---

## 10) Reference links

- Gantt source: https://github.com/Datalundno/GANTT  
- Website: https://github.com/Datalundno/Website → https://datalund.no  
- Gantt product page pattern: https://datalund.no/visuals/gantt/  
- Power BI custom visuals: https://learn.microsoft.com/en-us/power-bi/developer/visuals/  
