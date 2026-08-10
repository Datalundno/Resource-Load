# Whitelabel (unbranded) package

Dual packaging mirrors DataLund Gantt: **branded for the website / AppSource**, **unbranded for personal use only**.

| | **Branded** | **Whitelabel** |
| --- | --- | --- |
| Display name | DataLund Resource Load | Resource Load |
| File | `downloads/resourceLoad.pbiviz` | `downloads/wl/ResourceLoad.pbiviz` |
| GUID | `resourceLoadFCD6BD8A03834A4C870386E3B26B5B8A` | `resourceLoadWL848D396D0B695DE6F58CE0081268A861` |
| Author | DataLund | Resource Load |
| Support URL | https://datalund.no/support/ | https://example.com |
| Website | Ship via `website-sync/` | **Do not** add to datalund.no |

Both packages can be imported side-by-side in Power BI Desktop (different GUIDs).

## Build

Working tree stays on the **branded** identity. The script overlays brand files, packages, copies output, then restores.

```bash
npm run package:branded      # → downloads/resourceLoad.pbiviz (+ website-sync copy)
npm run package:whitelabel  # → downloads/wl/ResourceLoad.pbiviz
```

Brand overlays: [`branding/branded.json`](../branding/branded.json), [`branding/whitelabel.json`](../branding/whitelabel.json).

## Rules

- Never put the whitelabel `.pbiviz` under `website-sync/` or link it from datalund.no.
- Keep landing / string resources free of “DataLund” / datalund.no in the whitelabel overlay.
- Bump **both** overlays’ `version` together when shipping a new build.
- Personal release tag pattern (optional, same as Gantt): `whitelabel-1.0.0.0` with asset `ResourceLoad.pbiviz`.
