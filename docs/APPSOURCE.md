# AppSource checklist — DataLund Resource Load

Follow after the v1 `.pbiviz` packages cleanly. Mirror the Gantt AppSource flow.

## Required assets

| Asset | Spec |
| --- | ---: |
| Icon | 20×20 embedded (`assets/icon.png`) |
| Store logo | 300×300 (`assets/store/logo-300.png`) — present |
| Screenshots | 1366×768 (`assets/store/screenshot-placeholder-1366x768.png` until real shots) |
| Sample workbook | Excel under `downloads/` (prefer a `.pbix` before Partner Center submit) |

## Certification

```bash
npm install
npm run lint
npx pbiviz package --certification-audit
npm run package:branded
```

See [`CERTIFICATION.md`](./CERTIFICATION.md) for the verified Section D checklist.

- Empty `privileges` in `capabilities.json`
- No external network requests
- Landing page + empty states
- Context menu on empty space and data points
- Author email: `support@datalund.no`
- Privacy + Support URLs live on datalund.no
- Lowercase `certification` branch matches the submitted branded package (one GUID)

## Listing copy (draft)

**Title:** DataLund Resource Load  
**Short:** See who is busy when — people on tasks over time.  
**Long:** Pair with DataLund Gantt. Resource Load shows assignees as rows, stacks overlapping assignments in swimlanes, and badges peak concurrent load. Same density presets and field-role names as the DataLund suite.

Full website / Help-page copy (meta, features, schema.org, nav): [`WEBSITE.md`](./WEBSITE.md).
