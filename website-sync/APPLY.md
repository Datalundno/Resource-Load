# Website agent — ship DataLund Resource Load **1.0.0.0**

Apply in **`Datalundno/Website`**, push to `main` so Pages deploys.

Full copy brief: [`../docs/WEBSITE.md`](../docs/WEBSITE.md).

## What to ship

| Asset | Site path | Visibility |
| --- | --- | --- |
| Branded visual | `public/downloads/resourceLoad.pbiviz` | Public (linked) |
| Sample Excel | `public/downloads/ResourceLoadSampleData.xlsx` | Public (linked) |
| Product / Help page | `public/visuals/resource-load/index.html` | Public |
| Whitelabel visual | `public/downloads/wl/ResourceLoad.pbiviz` | **Hosted, hidden** — no UI links |

Also update home / nav so Resource Load is discoverable next to Gantt (see `docs/WEBSITE.md` §4). Ready-made copy blocks are in that brief — do not invent a second product name.

## Branded vs unbranded

| | **Branded — public** | **Unbranded — hidden host** |
| --- | --- | --- |
| Name | DataLund Resource Load | Resource Load |
| File | `resourceLoad.pbiviz` | `ResourceLoad.pbiviz` |
| Site path | `/downloads/resourceLoad.pbiviz` | `/downloads/wl/ResourceLoad.pbiviz` |
| Link on site | Yes (product page, home) | **No** — file only, same as other `/downloads/wl/` visuals |

## Copy from `website-sync/` (Resource-Load `main`)

```bash
SYNC=<path-to-Resource-Load>/website-sync
mkdir -p public/downloads/wl public/visuals/resource-load
cp "$SYNC/public/downloads/resourceLoad.pbiviz" public/downloads/resourceLoad.pbiviz
cp "$SYNC/public/downloads/ResourceLoadSampleData.xlsx" public/downloads/ResourceLoadSampleData.xlsx
cp "$SYNC/public/downloads/wl/ResourceLoad.pbiviz" public/downloads/wl/ResourceLoad.pbiviz
cp "$SYNC/public/visuals/resource-load/index.html" public/visuals/resource-load/index.html
# Then edit Website index.html / nav / #visuals section using docs/WEBSITE.md copy blocks.
# Do NOT add nav/CTA links to the wl file.
git add public/downloads/resourceLoad.pbiviz \
        public/downloads/ResourceLoadSampleData.xlsx \
        public/downloads/wl/ResourceLoad.pbiviz \
        public/visuals/resource-load/index.html \
        index.html   # if home/nav updated
git commit -m "Ship DataLund Resource Load 1.0.0.0 (+ hidden wl)"
git push origin main
```

## Verify

- https://datalund.no/downloads/resourceLoad.pbiviz → DataLund Resource Load **1.0.0.0**
- https://datalund.no/downloads/wl/ResourceLoad.pbiviz → Resource Load **1.0.0.0** (direct URL only)
- https://datalund.no/visuals/resource-load/ → product page, `softwareVersion` = `1.0.0.0`
- Home / visuals section links to branded Resource Load only
- No public mention of the whitelabel download
