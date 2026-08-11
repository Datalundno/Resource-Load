# Whitelabel (unbranded) package

Whitelabel is a **build-time identity overlay**, not a second visual checked into the certification path.

| | **Branded (AppSource / cert)** | **Whitelabel (on-demand)** |
| --- | --- | --- |
| Display name | DataLund Resource Load | Resource Load |
| Output (local) | `downloads/resourceLoad.pbiviz` | `downloads/wl/ResourceLoad.pbiviz` (**gitignored**) |
| GUID | `resourceLoadFCD6BD8A03834A4C870386E3B26B5B8A` | `resourceLoadWL848D396D0B695DE6F58CE0081268A861` |
| Author | DataLund / support@datalund.no | Resource Load / noreply@example.com |
| Support URL | https://datalund.no/support/ | https://example.com |

Branded and whitelabel **must** keep different GUIDs so Power BI treats them as separate visuals. The **certification branch and AppSource submission use only the branded GUID**.

## Build

Working tree stays on the **branded** identity. The script overlays brand files, packages, copies output, then restores.

```bash
npm run package:branded      # → downloads/resourceLoad.pbiviz
npm run package:whitelabel  # → downloads/wl/ResourceLoad.pbiviz (local only; not committed)
```

Brand overlays: [`branding/branded.json`](../branding/branded.json), [`branding/whitelabel.json`](../branding/whitelabel.json).

## Hosting policy

- Ship the **branded** `.pbiviz` publicly (GitHub Releases and/or `datalund.no/downloads/`).
- Whitelabel may be generated for personal/private use. Prefer **not** committing the wl `.pbiviz` in this repo (avoids “multiple visuals in one repo” for certification review).
- If a hidden host copy is needed on the site, copy the built file into the **Website** repo only — see [`WEBSITE.md`](./WEBSITE.md).
- Bump **both** overlays’ `version` together when shipping a new build.
