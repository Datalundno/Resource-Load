# DataLund ecosystem contract

**This is the starting point for a unified DataLund visual ecosystem.**

Canonical contract for **existing** suite visuals and **every new visual**. Copy this file into the visual repo (or point the agent at the Website raw URL) before any implementation work.

| | |
| --- | --- |
| **Source of truth** | `Datalundno/Website` → [`ECOSYSTEM.md`](./ECOSYSTEM.md) |
| **Applies to** | Gantt · Resource Load · Task List · **any future DataLund visual** · Website sync |
| **Wins over** | Older `SUITE.md` / per-visual kickoffs when they disagree on fields, density, Color by, or starters |

**Mindset:** one ecosystem, modular visuals. Same inputs, same density language, same starter model — each visual still does **one job** and ships as its own `.pbiviz`.

| Visual | One job |
| --- | --- |
| **Gantt** | *When* — tasks on a timeline |
| **Resource Load** | *Who is busy* — people on tasks over time |
| **Task List** | *What’s in the portfolio* — browse + select to cross-filter |
| **New visuals** | One new question on the same page — never a second way to bind the same columns |

Do **not** merge visuals into one mega-visual. Do **not** invent parallel field names, density presets, or sample column headers.

---

## 0) New visuals (read first)

Before scaffolding a new `.pbiviz`:

1. **Name the one job** in one sentence (*When / Who / What / …*). If it overlaps an existing visual, extend that visual or stop.
2. **Reuse suite field role `name`s** from §1. Only add a new role when no existing role fits — document it here in a follow-up Website PR.
3. **Ship Density** Compact / Comfortable / Large / Custom (§3) from day one.
4. **Timeline / bar visuals:** Format → General → **Color by** (`colorBy`) per §4.
5. **Adopt suite roles when the job needs them** — including `status` (RAG) if status is part of the job. Do not invent a parallel status field; do not add unused wells “just in case.”
6. **Starter / docs** teach the **PM-maintained** columns (§2). Duration and Tooltips are optional later, not default sample columns.
7. **Cross-filter** with the suite so the page feels one; stay modular in packaging (`website-sync/`, own AppSource listing).
8. Open a **focused PR for this visual only**; update `ECOSYSTEM.md` on Website if you introduce a new shared contract.

Paste prompt for a **new** visual: §9.

---

## 1) Shared field roles (mandatory)

Stable `capabilities.json` **`name`** values. Display names may be friendlier; **never rename the role `name`**.

| Role `name` | Typical display | Kind | Notes |
| --- | --- | --- | --- |
| `task` | Task · **Project** (Task List) | Grouping | Row / bar identity |
| `startDate` | Start Date | GroupingOrMeasure | |
| `endDate` | End Date | GroupingOrMeasure | Prefer End Date for PM models |
| `duration` | Duration | Measure | Days; **optional alternative** to End Date |
| `progress` | Progress | Measure | Accept **0–1 or 0–100** |
| `group` | Group | Grouping | Phase / parent |
| `resource` | Resource · **Project lead** (Task List) | Grouping | Person / team |
| `tooltipFields` | Tooltips | Grouping | Extra detail; keep optional |
| `status` | **RAG** (or Status) | Grouping | Optional. Used today by Task List; other visuals may bind it when status is part of their job |

### Display-name rules

- Timeline visuals (Gantt, Resource Load, future timelines): suite defaults (**Task**, **Resource**, **Start Date**, …).
- List / portfolio visuals: Lists / PMO labels are OK (**Project**, **Project lead**, **RAG**) if role `name`s stay as above.
- Do not invent `Start` / `Estimated end` / `Assignee` as role names.

### Value shapes people already use

| Field | Accept |
| --- | --- |
| Progress | `0–1` **or** `0–100` (normalize in converter) |
| RAG / status | `Red` / `Amber` / `Green` and Norwegian `Rød` / `Gul` / `Grønn` |
| End vs Duration | End Date preferred; Duration only when End is absent |
| Milestone | Same Start Date and End Date (zero-length bar) |

### Capabilities binding lesson

For visuals that need **more than one** required well, prefer **max-only** conditions in `dataViewMappings` and enforce required fields in the **converter + landing page**. Dual `min:1` on multiple roles has blocked binding in Power BI (see Resource Load field-binding fix).

---

## 2) Starter model (PM-maintained columns only)

Project managers will only keep a short list of columns current. **Waste columns kill conversion.**

### In the starter Excel (Website)

**Projects** (Task List):

`Project · RAG · Group · Project lead · Progress · Start Date · End Date`

**Tasks** (Gantt + Resource Load):

`Task · Start Date · End Date · Progress · Group · Resource · Project`

### Not in starters (still supported by visuals)

- **Duration** — optional later if someone has days instead of End Date  
- **Tooltips** — optional later (milestones, obstacles, notes)  
- **RAG on the Tasks sheet** — current starter keeps RAG on Projects; add to Tasks only if a visual’s job needs task-level status in the sample  

If you ship or sync sample data from a visual repo, **match this column set** unless you are intentionally extending the starter for a new shared need (update this file). Do not reintroduce unused columns into the default starter.

Source of truth for generated files: `Datalundno/Website` → `scripts/generate-sample-data.py`.

---

## 3) Density presets (mandatory)

Format → **General → Density**. Same names and numbers everywhere.

| Preset | Intent | barHeight | rowGap | fontSize | labelWidth | cornerRadius |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Compact** | Many visuals on one page | 16 | 8 | 10 | 140 | 2 |
| **Comfortable** | Default | 28 | 12 | 12 | 200 | 4 |
| **Large** | Sparse / presenting | 36 | 16 | 14 | 240 | 6 |
| **Custom** | Use that visual’s own size sliders | — | — | — | — | — |

- Do **not** invent Small / Medium / Huge.
- List visuals map density to row height, font, padding, chip radius — keep **preset names** identical.
- Keep `src/suite/density.ts` in sync across repos until a shared package exists.

---

## 4) Format pane: Color by (mandatory for timeline / bar visuals)

Timeline and bar-style visuals use the **same control identity** in Format → General.

| | Contract |
| --- | --- |
| Object | `general` |
| Property **`name`** | `colorBy` |
| Display name | **Color by** |
| Type | Enumeration (preferred) |

**Enum values may differ per visual** (different jobs), but do not invent a second property name (`colorMode`, `colorByResource`, etc.).

| Visual | Suggested values | Intent |
| --- | --- | --- |
| **Gantt** | `default` · `resource` · `group` · `task` | How bars pick their fill |
| **Resource Load** | `single` · `task` · `concurrency` | Single fill, by task name, or concurrency warn |
| **New timeline visuals** | Document values in the visual README; still use `colorBy` | |

**Migration (existing visuals):** if the visual still has `colorByResource` (bool) or `colorMode`, rename to `colorBy` and map old persisted values in settings load so existing reports do not reset silently.

List / status-chip visuals may color from `status` instead of a Color by enum — that is fine. Prefer one clear coloring story per visual; do not invent a second property name for the same idea.

---

## 5) Modular but “one”

### Do

- One job per visual; clear landing page when required fields are missing.
- Reuse chrome language with siblings (today line, weekend shading, bar corners, label pane) where it fits the job.
- Cross-filter / cross-highlight so Task List → Gantt → Resource Load (and future visuals) feel like one page.
- Brand as **DataLund** (`datalund.no`); support → `support@datalund.no`.
- Ship website updates via `website-sync/` (or equivalent) with matching help Fields copy.

### Don’t

- Don’t rename suite roles to be “clearer” for one visual — reuse `name`s from §1.
- Don’t invent a parallel status/RAG field if `status` already fits.
- Don’t invent alternate Format names for Color by (`colorMode`, `colorByResource`, …).
- Don’t add dashboard clutter (stats strips, multi-widgets) inside a single visual.
- Don’t fork sample column names per visual without updating this contract.
- Don’t change Density preset names or table values without updating **all** suite visuals + this file on Website.
- Don’t bind unused wells “for the future” — only what the job needs; the suite can grow later.

---

## 6) Per-visual checklist

Before opening a PR, confirm:

- [ ] Role `name`s match the table in §1 (new roles only with an `ECOSYSTEM.md` update)  
- [ ] Progress accepts 0–1 and 0–100  
- [ ] Density presets match §3  
- [ ] Timeline / bar visuals: Format → General → **Color by** uses property `colorBy` (§4); migrate old keys if needed  
- [ ] Landing / README bind steps use **Start Date** + **End Date** (Duration as optional later)  
- [ ] Sample / website-sync columns match §2 if you touch samples  
- [ ] Help copy (if synced) lists core fields first; Duration / Tooltips as “also supported later”  
- [ ] Focused PR for **this visual only** (Website sync can be a follow-up pack)

---

## 7) Website sync expectations

When behaviour or capabilities change:

1. Update the visual repo (capabilities, converter, README).  
2. Package branded `.pbiviz` (+ white-label if applicable).  
3. Refresh `website-sync/` help HTML + downloads to match **core fields** wording.  
4. Website agent regenerates starters from `scripts/generate-sample-data.py` if column contracts change (they should not change lightly).  
5. If you change a **shared** contract, update this `ECOSYSTEM.md` in the same effort (or a paired Website PR).

Canonical product URLs:

- https://datalund.no/visuals/gantt/  
- https://datalund.no/visuals/resource-load/  
- https://datalund.no/visuals/task-list/  
- https://datalund.no/downloads/DatalundSuiteSample.xlsx  

---

## 8) Prompt — existing visuals (Gantt / Resource Load / Task List)

Paste this to agents on the current suite repos. Point them at this file (or paste the full `ECOSYSTEM.md`).

```
Follow the DataLund ecosystem contract in ECOSYSTEM.md (Website repo: Datalundno/Website).

Goal: stay modular but feel like one suite on a report page. Do not assume the suite is finished — reuse shared roles when the job needs them; do not invent parallels.

Mandatory:
- Do not rename suite field role names (task, startDate, endDate, duration, progress, group, resource, tooltipFields, status). Display names may be friendlier.
- Prefer End Date over Duration in docs and samples. Progress accepts 0–1 or 0–100. If you use status/RAG, accept Red/Amber/Green and Rød/Gul/Grønn.
- Density = Compact / Comfortable / Large / Custom with the suite table values — do not invent other preset names.
- Timeline / bar visuals: Format → General → Color by must use property name `colorBy` (display name "Color by"). Migrate old `colorMode` / `colorByResource` and map persisted settings so reports do not reset.
- Bind only fields this visual’s job needs. Reuse `status` when status is part of the job; do not invent a second status role.
- Starter/sample columns must match the PM-maintained set in ECOSYSTEM.md unless you are extending the shared starter (update ECOSYSTEM.md).
- One job for this visual only. Focused PR for this repo; website-sync if field UX or Format labels change.

Audit this visual against ECOSYSTEM.md §6 checklist and implement any gaps.
```

---

## 9) Prompt — new visuals

Paste this when starting a **new** DataLund visual.

```
You are building a new DataLund Power BI visual. Read and follow ECOSYSTEM.md in Datalundno/Website first — that file is the ecosystem contract. The suite will grow; design for shared inputs, not closed exclusions.

Rules:
- One job only (one sentence). Do not merge into an existing visual.
- Reuse existing suite field role names when they fit. Add a new role only if nothing fits — then document it by updating ECOSYSTEM.md on Website.
- Density presets Compact / Comfortable / Large / Custom from day one (suite table).
- If this is a timeline/bar visual: Format → General → Color by with property `colorBy`.
- If the job needs status/RAG, bind suite role `status` (do not invent a parallel). If it does not, leave it out — unused wells are waste.
- Docs and samples teach PM-maintained columns (see ECOSYSTEM.md §2). Duration and Tooltips are optional later.
- Cross-filter with the suite; ship as its own .pbiviz + website-sync pack.
- Brand: DataLund / datalund.no / support@datalund.no.
- Open a focused PR for this visual only.

First reply with: the one-job sentence, which suite fields you will bind, and any proposed new role names (needs ECOSYSTEM.md update).
```

---

## Related docs

| Doc | Where | Role |
| --- | --- | --- |
| **`ECOSYSTEM.md`** | Website (this file) | **Living ecosystem contract — start here** |
| `SUITE.md` | GANTT repo | Historical density + field-role seed; defer to this file on conflict |
| `DOMAIN.md` | Website | Hosting, downloads, sample generation |
| `RESOURCE_LOAD.md` / `TASK_LIST.md` | Visual kickoffs | Per-visual scope (must not contradict this file) |

If a kickoff brief and this file disagree, **this file wins** for field names, density, Color by, starter columns, and new-visual rules.
