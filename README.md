# DataLund Resource Load

Free Power BI custom visual by **DataLund** ([datalund.no](https://datalund.no)).

**One job:** show **people (or teams) on tasks over time** — who is loaded, when, and with how many overlapping assignments.

Gantt answers *what happens when*. Resource Load answers *who is busy when*.

## Downloads

| Build | Link |
| --- | --- |
| **Branded** — DataLund Resource Load 1.0.0.0 | [`downloads/resourceLoad.pbiviz`](downloads/resourceLoad.pbiviz) |
| Sample Excel | [`downloads/ResourceLoadSampleData.xlsx`](downloads/ResourceLoadSampleData.xlsx) |

Whitelabel is **build-on-demand** (different GUID, not committed). See [`docs/WHITELABEL.md`](docs/WHITELABEL.md).

Website deploy: [`docs/WEBSITE.md`](docs/WEBSITE.md). Certification notes: [`docs/CERTIFICATION.md`](docs/CERTIFICATION.md).

## Install (Power BI Desktop)

1. Download [`downloads/resourceLoad.pbiviz`](downloads/resourceLoad.pbiviz).
2. **Get more visuals → Import a visual from a file** (re-import after updating the file).
3. Bind sample data from [`downloads/ResourceLoadSampleData.xlsx`](downloads/ResourceLoadSampleData.xlsx).

Field wells accept fields one at a time. Required roles are validated in the visual (landing page / message), not locked by capability `min` rules.

## Field binding

Role `name` values match the DataLund suite (same columns as Gantt where shared):

| Field well | Role `name` | Required |
| --- | --- | --- |
| Resource (person / team) | `resource` | Yes |
| Task (assignment / project) | `task` | Yes |
| Start Date | `startDate` | Yes |
| End Date | `endDate` | Yes (prefer) |
| Duration (days) | `duration` | Optional later if End Date is absent |
| Progress | `progress` | Optional |
| Group | `group` | Optional |
| Tooltips | `tooltipFields` | Optional later (≤8) |

Starter / sample columns match the suite **Tasks** sheet: `Task · Start Date · End Date · Progress · Group · Resource · Project`.

Typical Microsoft Lists mapping: Project lead → Resource, Project name → Task, Start / Estimated end → dates.

**Model tip:** one row per assignment. If a project has multiple leads, expand to multiple rows.

## How load is shown (v1)

- **Swimlanes:** overlapping assignments on the same resource stack in small vertical lanes inside that resource’s row.
- **Load badge:** numeric badge on the resource label = max concurrent assignments in the visible time window.
- **Color by (Format → General):** single suite fill (default), by task, or warn fill when concurrency > 1.

## Density

Format → **General → Density** — suite presets **Compact / Comfortable / Large / Custom** (same numbers as DataLund Gantt). See [`RESOURCE_LOAD.md`](RESOURCE_LOAD.md).

## Website

**https://github.com/Datalundno/Website** → [datalund.no](https://datalund.no)

- Product page: https://datalund.no/visuals/resource-load/
- Agent brief: [`docs/WEBSITE.md`](docs/WEBSITE.md)
- Suite contract (canonical): [ECOSYSTEM.md on Website](https://raw.githubusercontent.com/Datalundno/Website/main/ECOSYSTEM.md)

## Develop

```bash
npm install
npm run lint
npm run package:branded      # downloads/resourceLoad.pbiviz
npm run package:whitelabel  # downloads/wl/ (local only; gitignored)
npx pbiviz package --certification-audit
```

Requires Node.js ≥ 20.19 and `powerbi-visuals-tools` 7.2.x.

## Docs

| Doc | Purpose |
| --- | --- |
| [`RESOURCE_LOAD.md`](RESOURCE_LOAD.md) | Full agent kickoff / behaviour |
| [`docs/CERTIFICATION.md`](docs/CERTIFICATION.md) | AppSource / Section D checklist |
| [`docs/WEBSITE.md`](docs/WEBSITE.md) | Website / promo copy for Website repo agent |
| [`docs/WHITELABEL.md`](docs/WHITELABEL.md) | Unbranded on-demand package |
| [`docs/PRIVACY.md`](docs/PRIVACY.md) | Privacy (sandbox-only) |
| [`docs/SUPPORT.md`](docs/SUPPORT.md) | Support |
| [`docs/APPSOURCE.md`](docs/APPSOURCE.md) | AppSource checklist |

## Sister visual

Reference implementation: [Datalundno/GANTT](https://github.com/Datalundno/GANTT) (`ganttChart/`) · [Product page](https://datalund.no/visuals/gantt/).
