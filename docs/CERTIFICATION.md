# Certification notes — DataLund Resource Load

AppSource / Partner Center prerequisites for this repo. Keep the lowercase **`certification`** branch aligned with the submitted branded package.

## Section D — code status (verified in `src/`)

| Item | Status |
| --- | --- |
| Rendering Events (`renderingStarted` / `Finished` / `Failed`) | Present in `src/visual.ts` `update()` |
| Selection (`createSelectionIdBuilder`, `ISelectionManager`, multi-select, clear-on-blank, bookmarks callback, context menu) | Present |
| Tooltips (`ITooltipService` + `tooltipFields`) | Present |
| Formatting model (`getFormattingModel` + `FormattingSettingsService`) | Present (not `enumerateObjectInstances`) |
| High contrast (`colorPalette.isHighContrast`) | Present via `src/utils/contrast.ts` |
| Localization manager | Present; locales: `en-US`, `nb-NO` |
| Landing page / empty data | Present; required roles validated in converter |
| DOM text | User strings use d3 `.text()` / text nodes — no `innerHTML` |
| Network / eval | No `fetch` / XHR / `eval` / WebSocket in `src/` or `style/` |
| Privileges | `capabilities.json` → `"privileges": []` |
| API | `apiVersion` / `powerbi-visuals-api` **5.11.1** |
| GUID (branded only on cert path) | `resourceLoadFCD6BD8A03834A4C870386E3B26B5B8A` |

## Package hygiene

- Single `visual.version` in `pbiviz.json` (no duplicate top-level `version`)
- Author contact: `support@datalund.no`
- Privacy: https://datalund.no/privacy/ (`visual.privacyPolicyUrl`)
- Whitelabel is build-on-demand with a **different** GUID; wl `.pbiviz` is gitignored and not part of certification
- Suite contract: link to Website [`ECOSYSTEM.md`](https://raw.githubusercontent.com/Datalundno/Website/main/ECOSYSTEM.md) — no local full copy

## Commands

```bash
npm install
npm run lint
npx pbiviz package --certification-audit
npm run package:branded
```

## npm audit

- `npm audit --omit=dev` → **0** vulnerabilities (what ships in the `.pbiviz`).
- Full `npm audit` may report moderate issues only under `powerbi-visuals-tools` → `webpack-dev-server` → `uuid` (dev tooling). Do **not** `npm audit fix --force` (it downgrades tools). Re-check after tools upgrades.
