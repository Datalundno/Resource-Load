# AppSource checklist — DataLund Resource Load

Follow after the v1 `.pbiviz` packages cleanly. Mirror the Gantt AppSource flow.

## Required assets

| Asset | Spec |
| --- | ---: |
| Icon | 20×20 embedded (`assets/icon.png`) |
| Store logo | 300×300 (`assets/store/logo-300.png`) |
| Screenshots | 1366×768 |
| Sample workbook | `.pbix` or Excel under `downloads/` |

## Certification

```bash
npm install
pbiviz package --certification-audit
```

- Empty `privileges` in `capabilities.json`
- No external network requests
- Landing page + empty states
- Context menu on empty space and data points
- Privacy + Support URLs live on datalund.no

## Listing copy (draft)

**Title:** DataLund Resource Load  
**Short:** See who is busy when — people on tasks over time.  
**Long:** Pair with DataLund Gantt. Resource Load shows assignees as rows, stacks overlapping assignments in swimlanes, and badges peak concurrent load. Same density presets and field-role names as the DataLund suite.

Full website / Help-page copy (meta, features, schema.org, nav): [`WEBSITE.md`](./WEBSITE.md).
