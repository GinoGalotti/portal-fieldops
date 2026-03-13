# P.O.R.T.A.L — Project Backlog

Prioritised pending work. Update as tasks are completed or reprioritised.

---

## RECENTLY DONE ✅

### Interactive district map + map tests (2026-03-13)
- `data/portal-maps.json` — explicit grid map for Aldermoor (M02); `"order"` (1-7 narrative progression), `"npcs"` arrays per location
- `workers/migrations/011_map_state.sql` — `map_state` table; applied local + remote
- `functions/api/v1/maps/[id]/state.js` — GET + PUT map state endpoint
- `feed.html` — player MAP tab (mission selector, locked/unlocked cells, detail card, SYNC MAP); keeper MAP tab (order badges, NPC pills, visited state, REVEAL ALL / RESET MAP / ALL VISITED / CLEAR VISITED bulk actions); panel resize handle (drag to resize, saved to localStorage); scrollbar theming; S01/S02 → M01/M02 rename throughout; keeper tab scroll overflow; ref + map font size bumps
- Map state schema: `{ u: { loc_id: true }, v: { loc_id: true } }` — `u` = player-visible, `v` = keeper visited. Legacy flat format migrated automatically.
- `tests/map.spec.js` — 24 tests: player tab (mission selector, locked/unlocked, detail card, order hidden from players); keeper tab (order numbers, NPC pills, unlock toggle, visited button, stopPropagation, all 4 bulk actions)
- `tests/d1-round-trip.spec.js` — +2 tests: map unlock round-trip, map visited round-trip (7 total)
- Total: **276 tests across 16 files**

### Map handout fix (2026-03-13)
- Removed `map` special-case from `renderKeeperHandoutsTab` in `feed.html` — maps now get standard ▶ POST / ↺ RE-POST button like all other handout types

### portal-missions.json refactor (already complete — backlog item stale)
- Both `index.html` and `missions/missions.html` already read from `data/portal-missions.json`
- JSON fully populated: 2 real missions + Mission 03 placeholder

### Full D1 round-trip tests (2026-03-13)
- `tests/d1-round-trip.spec.js` — 5 tests: harm track, arc choice, incident choice, player report rating pip + textarea (no mocking, real local D1)
- Total: 250 tests across 15 files

### Playwright test suite expansion (2026-03-13)
- `tests/hunters.spec.js` — 19 tests: reed.html + rex.html structure, stat pips, track interaction, arc beats, save/restore
- `tests/briefings.spec.js` — 12 tests: tab switching, active week, case card count, priority badges
- `tests/player-report.spec.js` — 15 tests: selectors, form unlock, textareas, save states, flash messages
- `tests/feed.spec.js` — +10 hunter panel tests: picker, move cards, track pips, ROLL button, POST assertion
- Total: 245 tests across 14 files

### entities.html — full data-driven conversion
- `missions/entities.html` reduced from 2827 → ~982 lines
- Section I: `display{}` blocks added to `portal-entities.json` for Eszter + Cartographer; stat pills update dynamically
- Section II: rendered from `portal-entity-types.json` (8 theoretical types, blurred keeper notes)
- Section III: Shōjō extracted to `portal-db-custom.json`; all 53 Deck of Monsters entries extracted to `portal-db-deck.json`; both rendered via `Promise.all`
- `tests/entities.spec.js` — 36 tests covering all three sections, toggles, filter bar, stat pills, DOM order (188/188 suite)

### Earlier
- `data/portal-entities.json` — bestiary phases for Eszter + Cartographer (session-gated)
- `data/hunter-arcs.json` — 4 hunters × 3 arcs + 6 intersections; `missions/arcs.html` data-driven
- `index.html` bestiary — data-driven render + session gating
- `tests/bestiary.spec.js`, `tests/arcs.spec.js`, `tests/nav.spec.js` — mobile hamburger added

---

## NEXT UP — Playwright Tests

276 tests passing across 16 files. Suite: `smoke` (5) · `nav` (10) · `contacts` (7) · `incidents` (18) · `feed` (~25) · `bestiary` (15) · `arcs` (24) · `artefacts` (15) · `missions` (23) · `lab` (20) · `entities` (36) · `hunters` (19) · `briefings` (12) · `player-report` (15) · `d1-round-trip` (7) · `map` (24).

**1. Keeper field report (`missions/report.html`) — MEDIUM**
- New file: `tests/report.spec.js`
- Session selector renders; save button; "COPY FOR CLAUDE" button exists

**2. Nav subdirectory paths — MEDIUM**
- All player-facing pages inject nav with same links; links resolve correctly from `hunters/`, `missions/`, `reports/` subdirs

---

## BACKLOG

### Entity JSON schema normalisation — MEDIUM
**Problem:** `portal-db-custom.json` and `portal-db-deck.json` use a generic `{ "label": "...", "value": "..." }` column pattern that mirrors HTML layout rather than data semantics. This is inconsistent with the clean field-keyed style of `portal-entities.json` (which uses `name`, `harm`, `powers[]`, `keeper_moves[]` etc.).

**Goal:** Normalise to semantic keys so the JSON describes *what* the data is, not *how* it's displayed. The renderer maps fields to layout — the JSON stays layout-agnostic.

**Proposed deck entry schema:**
```json
{
  "id": "db001", "name": "Arbiter Spirit",
  "type": "executioner", "harm": "15 harm", "armour": "Spectral mail: 1-armour.",
  "motivation": "to bring justice at the request of its summoner",
  "powers": "Incorporeal. Phases through walls...",
  "attacks": [ { "name": "Spectral Blade", "value": "2-harm balanced close holy." } ],
  "weakness": "Can only be summoned to kill the guilty...",
  "custom_moves": [ { "name": "Soul Judgement", "text": "..." } ],
  "description": "A spirit of justice and revenge..."
}
```

**Scope:** Update `portal-db-deck.json` (53 entries), `portal-db-custom.json` (Shōjō), `renderDeckDB()` + `buildCustomDBCard()` in `entities.html`, and `entities.spec.js` assertions. No visual change.

### Data-driven migrations (upcoming)

**`the-lab.html`** — MEDIUM / BUG
- Team moves + assets are hardcoded but `data/motw-teambooks.json` already has the Research Lab entry. Fix: render from JSON at load time. Player choices (D1) unaffected.

### Minor / polish
- John Johnson hunter page — no page, no D1 stats, no Flake moves in `playbook-moves.json` yet
