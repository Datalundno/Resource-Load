# DataLund Resource Load

Free Power BI custom visual by **DataLund** ([datalund.no](https://datalund.no)).

**One job:** show **people (or teams) on tasks over time** — who is loaded, when, and with how many overlapping assignments.

Gantt answers *what happens when*. Resource Load answers *who is busy when*.

## Downloads

| Build | Link |
| --- | --- |
| **Branded** — DataLund Resource Load 1.0.0.0 | [`downloads/resourceLoad.pbiviz`](downloads/resourceLoad.pbiviz) |
| Sample Excel | [`downloads/ResourceLoadSampleData.xlsx`](downloads/ResourceLoadSampleData.xlsx) |

Website deploy pack: [`website-sync/APPLY.md`](website-sync/APPLY.md) · copy brief: [`docs/WEBSITE.md`](docs/WEBSITE.md).

## Install (Power BI Desktop)

1. Download [`downloads/resourceLoad.pbiviz`](downloads/resourceLoad.pbiviz).
2. **Get more visuals → Import a visual from a file**.
3. Bind sample data from [`downloads/ResourceLoadSampleData.xlsx`](downloads/ResourceLoadSampleData.xlsx).

## Field binding

Role `name` values match the DataLund suite (same columns as Gantt where shared):

| Field well | Role `name` | Required |
| --- | --- | --- |
| Resource (person / team) | `resource` | Yes |
| Task (assignment / project) | `task` | Yes |
| Start Date | `startDate` | Yes |
| End Date | `endDate` | End **or** Duration |
| Duration (days) | `duration` | End **or** Duration |
| Progress | `progress` | Optional |
| Group | `group` | Optional |
| Tooltips | `tooltipFields` | Optional (≤8) |

Typical Microsoft Lists mapping: Project lead → Resource, Project name → Task, Start / Estimated end → dates.

**Model tip:** one row per assignment. If a project has multiple leads, expand to multiple rows.

## How load is shown (v1)

- **Swimlanes:** overlapping assignments on the same resource stack in small vertical lanes inside that resource’s row.
- **Load badge:** numeric badge on the resource label = max concurrent assignments in the visible time window.
- **Colors (format pane):** single suite fill (default), color by task, or warn fill when concurrency > 1.

## Density

Format → **General → Density** — suite presets **Compact / Comfortable / Large / Custom** (same numbers as DataLund Gantt). See [`RESOURCE_LOAD.md`](RESOURCE_LOAD.md).

## Website

**https://github.com/Datalundno/Website** → [datalund.no](https://datalund.no)

- Product page (after website agent ships): https://datalund.no/visuals/resource-load/
- Agent brief with ready marketing copy: [`docs/WEBSITE.md`](docs/WEBSITE.md)
- File sync instructions: [`website-sync/APPLY.md`](website-sync/APPLY.md)

## Develop

```bash
npm install
npm run lint
npx pbiviz package
cp dist/*.pbiviz downloads/resourceLoad.pbiviz
cp downloads/resourceLoad.pbiviz website-sync/public/downloads/resourceLoad.pbiviz
```

Requires Node.js ≥ 20.19 and `powerbi-visuals-tools` 7.2.x.

## Docs

| Doc | Purpose |
| --- | --- |
| [`RESOURCE_LOAD.md`](RESOURCE_LOAD.md) | Full agent kickoff / behaviour |
| [`docs/WEBSITE.md`](docs/WEBSITE.md) | Website / promo copy for Website repo agent |
| [`docs/PRIVACY.md`](docs/PRIVACY.md) | Privacy (sandbox-only) |
| [`docs/SUPPORT.md`](docs/SUPPORT.md) | Support |
| [`docs/APPSOURCE.md`](docs/APPSOURCE.md) | AppSource checklist |

## Sister visual

Reference implementation: [Datalundno/GANTT](https://github.com/Datalundno/GANTT) (`ganttChart/`) · [Product page](https://datalund.no/visuals/gantt/).
