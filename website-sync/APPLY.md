# Website agent — ship DataLund Resource Load **1.0.0.0**

Apply in **`Datalundno/Website`**, push to `main` so Pages deploys.

Full copy brief: [`../docs/WEBSITE.md`](../docs/WEBSITE.md).

## What to ship

| Asset | Site path |
| --- | --- |
| Branded visual | `public/downloads/resourceLoad.pbiviz` |
| Sample Excel | `public/downloads/ResourceLoadSampleData.xlsx` |
| Product / Help page | `public/visuals/resource-load/index.html` |

Also update home / nav so Resource Load is discoverable next to Gantt (see `docs/WEBSITE.md` §4). Ready-made copy blocks are in that brief — do not invent a second product name.

## Copy from `website-sync/` (Resource-Load `main`)

```bash
SYNC=<path-to-Resource-Load>/website-sync
mkdir -p public/downloads public/visuals/resource-load
cp "$SYNC/public/downloads/resourceLoad.pbiviz" public/downloads/resourceLoad.pbiviz
cp "$SYNC/public/downloads/ResourceLoadSampleData.xlsx" public/downloads/ResourceLoadSampleData.xlsx
cp "$SYNC/public/visuals/resource-load/index.html" public/visuals/resource-load/index.html
# Then edit Website index.html / nav / #visuals section using docs/WEBSITE.md copy blocks.
git add public/downloads/resourceLoad.pbiviz \
        public/downloads/ResourceLoadSampleData.xlsx \
        public/visuals/resource-load/index.html \
        index.html   # if home/nav updated
git commit -m "Ship DataLund Resource Load 1.0.0.0"
git push origin main
```

## Verify

- https://datalund.no/downloads/resourceLoad.pbiviz → DataLund Resource Load **1.0.0.0**
- https://datalund.no/visuals/resource-load/ → product page, `softwareVersion` = `1.0.0.0`
- Home / visuals section links to Resource Load
- Download + sample Excel buttons work
