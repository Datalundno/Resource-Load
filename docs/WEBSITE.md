# Website agent brief — DataLund Resource Load

**Audience:** Website / marketing agent working in [Datalundno/Website](https://github.com/Datalundno/Website).  
**Goal:** Promote Resource Load on datalund.no next to DataLund Gantt.  
**Ship pack:** [`website-sync/APPLY.md`](../website-sync/APPLY.md) — copy files + deploy steps.

Do **not** invent parallel product names. Brand is **DataLund Resource Load** (publisher **Datalund** / datalund.no).

---

## 1) Positioning (use this)

| | |
| --- | --- |
| **One job** | Show **people (or teams) on tasks over time** — who is busy when. |
| **Vs Gantt** | Gantt = *what happens when*. Resource Load = *who is busy when*. |
| **Audience** | PMO / project leads using Microsoft Lists or Power BI next to DataLund Gantt. |
| **Price** | Free. Sandbox-only. No telemetry. |
| **Version** | `1.0.0.0` |

**Hero line (preferred):**  
See who is busy when.

**Supporting sentence:**  
DataLund Resource Load puts people on a timeline, stacks overlapping assignments, and badges peak load — the companion to DataLund Gantt.

**Avoid:** capacity calendars, FTE %, editing assignments, “AI”, purple-gradient marketing fluff.

**Whitelabel:** Host unbranded **Resource Load** at `/downloads/wl/ResourceLoad.pbiviz` (same hidden folder as Gantt / Task List). **Do not** link it from nav, product page, home, or schema.org. See [`WHITELABEL.md`](./WHITELABEL.md).

---

## 2) URLs to create / wire

| URL | Purpose |
| --- | --- |
| `https://datalund.no/visuals/resource-load/` | Product / AppSource Help page |
| `https://datalund.no/downloads/resourceLoad.pbiviz` | Branded `.pbiviz` download (public) |
| `https://datalund.no/downloads/ResourceLoadSampleData.xlsx` | Sample Excel |
| `https://datalund.no/downloads/wl/ResourceLoad.pbiviz` | Whitelabel `.pbiviz` (**hosted, unlisted**) |
| Support / Privacy | Existing `/support/`, `/privacy/` (already cover sandbox visuals) |

Canonical product path in `pbiviz.json` / docs: `/visuals/resource-load/`.

---

## 3) Ready copy blocks

### Meta

- **Title:** `DataLund Resource Load — Free Power BI visual | Datalund`
- **Description:** `See who is busy when. Free Power BI visual for people on tasks over time — swimlanes, load badges, and the same suite density as DataLund Gantt.`
- **OG title:** `DataLund Resource Load — Free Power BI visual`
- **OG description:** `People on tasks over time. Overlaps stack in swimlanes; a badge shows peak concurrent load.`

### Product page (H1 / lede / features)

- **Eyebrow:** `Power BI visual`
- **H1:** `DataLund Resource Load`
- **Lede:** `See who is busy when. People (or teams) on tasks over a clear timeline.`

**Features (bullet list — keep tight):**

1. One row per person or team
2. Assignment bars with optional progress fill
3. Overlaps stack in swimlanes inside the resource row
4. Load badge = peak concurrent assignments in the visible window
5. Density presets (Compact / Comfortable / Large / Custom) — same suite as Gantt
6. Optional time window from today (3 / 6 / 9 / 12 months)
7. Cross-filter, tooltips, today line, weekend shading
8. No network calls — Power BI sandbox only

**Fields:**

- **Required:** Resource, Task, Start Date, plus End Date or Duration
- **Optional:** Progress, Group, Tooltips

**CTAs:**

- Primary: `Download .pbiviz` → `/downloads/resourceLoad.pbiviz`
- Secondary: `Sample Excel` → `/downloads/ResourceLoadSampleData.xlsx`
- Tertiary: `Support` → `/support/`

### Home / suite card (short)

**Card title:** DataLund Resource Load  
**Card blurb:** Who is busy when — people on tasks with swimlanes and load badges.  
**Card CTA:** View visual → `/visuals/resource-load/`

### Pairing line (home or product)

Use DataLund Gantt for the plan. Use Resource Load for the people.

### Schema.org (`SoftwareApplication`)

```json
{
  "@type": "SoftwareApplication",
  "name": "DataLund Resource Load",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Power BI Desktop",
  "isAccessibleForFree": true,
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "Free Power BI visual that shows people on tasks over time with swimlanes and load badges.",
  "url": "https://datalund.no/visuals/resource-load/",
  "downloadUrl": "https://datalund.no/downloads/resourceLoad.pbiviz",
  "softwareVersion": "1.0.0.0",
  "publisher": { "@type": "Organization", "name": "Datalund", "url": "https://datalund.no/" }
}
```

---

## 4) Nav / IA changes

- Add nav link **Resource Load** (or **DataLund Resource Load**) next to Gantt on product pages and header where Gantt appears.
- Home `#visuals` section: add a second feature block (or card) for Resource Load; do not bury it only in footer.
- Downloads index (if any): list both `ganttChart.pbiviz` and `resourceLoad.pbiviz`.

---

## 5) Assets in this repo

| File | Use |
| --- | --- |
| `website-sync/public/downloads/resourceLoad.pbiviz` | Site download |
| `website-sync/public/downloads/ResourceLoadSampleData.xlsx` | Sample data |
| `website-sync/public/visuals/resource-load/index.html` | Product page draft (match site CSS) |
| `assets/store/logo-300.png` | Store / OG fallback until a dedicated shot exists |
| Screenshots / video | Not yet — add after Desktop smoke test (1366×768) |

Until a real screenshot exists, reuse site chrome and the Gantt page layout; do not fake product UI with stock photos.

---

## 5b) Voice & tone

- Match existing Gantt product page: short sentences, concrete features, no hype.
- Prefer “people / teams / assignments / load” over “resources utilization heatmap”.
- Always say **free** and **sandbox / no network calls** once on the product page.

---

## 6) Acceptance for website ship

- [ ] `/visuals/resource-load/` live with meta + SoftwareApplication JSON-LD (`softwareVersion` `1.0.0.0`)
- [ ] `/downloads/resourceLoad.pbiviz` serves the branded 1.0.0.0 package
- [ ] Sample Excel linked
- [ ] Home or visuals section promotes Resource Load beside Gantt
- [ ] Header/nav discoverable
- [ ] Support + Privacy links present
- [ ] Whitelabel file present at `/downloads/wl/ResourceLoad.pbiviz` with **no** public links or copy mentioning it

---

## 7) Source of truth

| Doc | Role |
| --- | --- |
| This file | Marketing / website agent brief |
| [`website-sync/APPLY.md`](../website-sync/APPLY.md) | Exact copy commands |
| [`../README.md`](../README.md) | Install + field binding |
| [`../RESOURCE_LOAD.md`](../RESOURCE_LOAD.md) | Full product kickoff / behaviour |
| GitHub | https://github.com/Datalundno/Resource-Load |
| Sister | https://datalund.no/visuals/gantt/ |
