# P.O.R.T.A.L — Project Backlog

Prioritised pending work. Update as tasks are completed or reprioritised.

---

## IN PROGRESS / RECENTLY DONE

### Data-Driven Bestiary + Hunter Arcs ✅
- `data/portal-entities.json` — added `bestiary` object to Eszter + Cartographer (2 phases each, session-gated)
- `data/hunter-arcs.json` — created; 4 hunters × 3 arcs + 6 intersections
- `index.html` bestiary section — replaced hardcoded cards with data-driven render + `applyBestiarySession()` after fetch
- `missions/arcs.html` — replaced hardcoded HTML with async render; `initArcInteractivity()` called post-render

---

## NEXT UP — entities.html Data-Driven Conversion

**Goal:** Make `missions/entities.html` (currently 2827 lines, fully hardcoded) data-driven across all three sections. Adds new entries by editing JSON only. Unlocks feed Threats tab integration.

### What's already done (today)
- `data/portal-entity-types.json` created — all 8 theoretical type cards (T-001 → T-008) extracted from Section II

### Schema reference

#### `data/portal-entities.json` — campaign entity instances
Already contains: Eszter, Cartographer, Volunteer, Recorder, Inheritance, Understudies, Hollow.
Each entry has: `id`, `designation`, `name`, `classification`, `case`, `status`, `player_description`, `keeper_description`, `powers[]`, `harm`, `weakness`, `keeper_moves[]`, and optionally `bestiary{}` (player-facing phases).

**Fields to add for Section I render** (the rich ecard format):
```json
{
  "display": {
    "num": "001",
    "eyebrow": "// CONFIRMED · RESOLVED · SESSION 01",
    "sub": "KELLER UNIVERSITY · CAMPBELL REPORT #0047-C · EXECUTIONER",
    "tags": [
      { "label": "RESOLVED — PEACEFUL DISPERSAL", "color": "green" },
      { "label": "EXECUTIONER", "color": "grey" },
      { "label": "ASH ORIGIN — HUNGARIAN", "color": "grey" },
      { "label": "PROJECT VEIL FLAG", "color": "purple" }
    ],
    "stat_block": [
      { "label": "// TYPE", "value": "<strong>Executioner</strong> — spirit anchored to a promise...", "full": false },
      { "label": "// HARM CAPACITY", "value": "<harm-num>10</harm-num> // WILL NOT KILL BY CHOICE", "full": false }
    ],
    "named_moves": [
      { "name": "Move Name", "text": "Move description..." }
    ],
    "notes": [
      { "label": "// RESOLUTION PATHS — SESSION 01", "text": "..." },
      { "label": "// PROJECT VEIL FLAG", "text": "..." }
    ]
  }
}
```

#### `data/portal-entity-types.json` — classification type cards (Section II) ✅
Schema: `id`, `title`, `class_badge` (c1/c2/c3/cx), `class_label`, `subtitle`, `tags[]`, `active_case` (FK to portal-entities.json), `sections[]` (label + content HTML + optional blurred + blur_notice).

Adding new theoretical type: edit `portal-entity-types.json`, append to `types[]`. That's it.

#### Section III — Gathered Database
Currently: Shōjō (custom) + 52 Deck of Monsters entries, all hardcoded in entities.html.
The MoTW deck data already exists in `data/motw-*.json` files (read-only reference).

**Proposed new file:** `data/portal-db-custom.json` — PORTAL custom entries only (Shōjō + future customs).
Section III render: iterate `portal-db-custom.json` (custom class) + pull from `motw-*.json` (deck entries).

### Implementation plan for the conversion

#### Phase 1 — Section II (easiest, data already extracted)
1. Add render script to `entities.html`: fetch `portal-entity-types.json` → replace hardcoded `.tcard-grid` content
2. The existing toggle JS (`toggleTheory()`) needs to run after render — same pattern as arcs.html `initArcInteractivity()`
3. Section II blurred content: renderer checks `section.blurred` → wraps content in `<strong class="t-blurred">` + appends blur-notice span

#### Phase 2 — Section I (confirmed entities)
1. Add `display{}` fields to the two confirmed entities in `portal-entities.json` (Eszter, Cartographer)
2. Render script replaces `.entity-list` content — iterates entities where `display` exists and `keeper_only !== true`
3. The stat_block needs a special harm-row render for harm capacity (the big number + sub-label)
4. Named moves render as `.moves-block` > `.move-item` entries
5. Notes render as `.notes-block` > `.notes-col` entries

#### Phase 3 — Section III (database)
1. Create `data/portal-db-custom.json` with Shōjō (full stat block, custom moves, notes)
2. Render script: custom entries from `portal-db-custom.json` first (with `custom` class), then deck entries from motw JSON
3. Filter bar (`filterDB()`) works on `data-type` attribute — already functional, just needs to apply to rendered elements
4. The filter/toggle JS (`filterDB()`, `toggleDB()`) moves to post-render init function

#### Feed Threats tab integration (bonus, once Phase 1-2 done)
- Feed already reads `portal-entities.json` for the Threats tab
- After Phase 2, `display.named_moves` enables richer feed threat cards (named moves, not just raw `keeper_moves[]`)
- `portal-entity-types.json` can be linked from threat cards via `active_case` FK — "VIEW TYPE CARD ↗" link

### Verification checklist
- [ ] Section II: all 8 type cards render with correct class badges, tags, blurred content
- [ ] Section II: toggle expand/collapse works after async render
- [ ] Section I: Eszter + Cartographer render with full stat blocks, moves, notes
- [ ] Section I: toggle works; The Cartographer's session-gating still applies
- [ ] Section III: filter bar functions on rendered cards; custom + deck entries both present
- [ ] Shōjō custom entry survives the conversion (all 4 custom moves + notes intact)
- [ ] Feed Threats tab unaffected by changes to portal-entities.json

---

## BACKLOG

### Testing
- Hunter sheet save/restore cycle (D1 persistence)
- CAMPBELL briefings tab switching
- Player + keeper report pages
- entities.html (no tests exist — add after data-driven conversion)

### Minor / polish
- `missions/entities.html` stat pills (Confirmed/Resolved/Active/Theoretical counts) — currently hardcoded; update when Section I becomes data-driven
- Map handout type in feed.html — currently shows "COMING SOON" instead of POST button (one-line fix: remove map special-case in `renderKeeperHandoutsTab`)
- John Johnson hunter page — no page, no stats in D1, no Flake moves in playbook-moves.json yet
