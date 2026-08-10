# DataLund Resource Load

Free Power BI custom visual by **DataLund** ([datalund.no](https://datalund.no)).

**One job:** show **people (or teams) on tasks over time** — who is loaded, when, and with how many overlapping assignments.

Gantt answers *what happens when*. Resource Load answers *who is busy when*.

## Install

1. Download [`downloads/resourceLoad.pbiviz`](downloads/resourceLoad.pbiviz) (after packaging).
2. In Power BI Desktop: **Get more visuals → Import a visual from a file**.
3. Bind sample data from [`downloads/ResourceLoadSampleData.xlsx`](downloads/ResourceLoadSampleData.xlsx) (or CSV).

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
- **Colors (format pane):** single suite fill (default), color by task, or warn fill when concurrency &gt; 1.

## Density

Format → **General → Density** — suite presets **Compact / Comfortable / Large / Custom** (same numbers as DataLund Gantt). See `RESOURCE_LOAD.md`.

## Develop

```bash
npm install
npm run lint
npx pbiviz package
cp dist/*.pbiviz downloads/resourceLoad.pbiviz
```

Requires Node.js ≥ 20.19 and `powerbi-visuals-tools` 7.2.x.

## Docs

- Agent kickoff: [`RESOURCE_LOAD.md`](RESOURCE_LOAD.md)
- Privacy: [`docs/PRIVACY.md`](docs/PRIVACY.md)
- Support: [`docs/SUPPORT.md`](docs/SUPPORT.md)
- AppSource: [`docs/APPSOURCE.md`](docs/APPSOURCE.md)

## Sister visual

Reference implementation: [Datalundno/GANTT](https://github.com/Datalundno/GANTT) (`ganttChart/`).
