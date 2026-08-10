# Whitelabel (unbranded) package

Dual packaging mirrors DataLund Gantt: **branded for public pages**, **unbranded hosted but hidden**.

| | **Branded** | **Whitelabel** |
| --- | --- | --- |
| Display name | DataLund Resource Load | Resource Load |
| File | `downloads/resourceLoad.pbiviz` | `downloads/wl/ResourceLoad.pbiviz` |
| GUID | `resourceLoadFCD6BD8A03834A4C870386E3B26B5B8A` | `resourceLoadWL848D396D0B695DE6F58CE0081268A861` |
| Author | DataLund | Resource Load |
| Support URL | https://datalund.no/support/ | https://example.com |
| Website | Public download + product page | Hosted at `/downloads/wl/` — **no public links** |

Both packages can be imported side-by-side in Power BI Desktop (different GUIDs).

## Build

Working tree stays on the **branded** identity. The script overlays brand files, packages, copies output, then restores.

```bash
npm run package:branded      # → downloads/ + website-sync/public/downloads/
npm run package:whitelabel  # → downloads/wl/ + website-sync/public/downloads/wl/
```

Brand overlays: [`branding/branded.json`](../branding/branded.json), [`branding/whitelabel.json`](../branding/whitelabel.json).

## Website rules

- **Do** ship `public/downloads/wl/ResourceLoad.pbiviz` (same pattern as Gantt / Task List under `/downloads/wl/`).
- **Do not** link whitelabel from home, nav, product page, CTAs, schema.org, or downloads lists.
- Direct URL (unlisted): `https://datalund.no/downloads/wl/ResourceLoad.pbiviz`
- Keep landing / string resources free of “DataLund” / datalund.no in the whitelabel overlay.
- Bump **both** overlays’ `version` together when shipping a new build.
