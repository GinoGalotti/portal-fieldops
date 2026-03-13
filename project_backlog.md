# P.O.R.T.A.L — Project Backlog

Prioritised pending work. Update as tasks are completed or reprioritised.

---

## RECENTLY DONE ✅

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

188 tests passing. Suite: `smoke` (5) · `nav` (10) · `contacts` (7) · `incidents` (18) · `feed` (15) · `bestiary` (15) · `arcs` (24) · `artefacts` (15) · `missions` (23) · `lab` (20) · `entities` (36).

**1. Hunter pages (`hunters/*.html`) — HIGH, zero coverage**
- New file: `tests/hunters.spec.js`
- Sheet stat pips render (Cool/Tough/Sharp/Charm/Weird)
- Harm/luck/xp tracks render and pip click updates state
- Save button writes to D1; sheet restores on reload (D1 round-trip)
- Arc beats/status visible per hunter
- Test on reed.html + rex.html (share `hunter.js`)

**2. Feed hunter panel — HIGH, partial gap**
- Hunter picker dropdown renders; selecting a hunter loads sheet + move cards
- Tracks render as clickable pips; ROLL button posts to feed; composer name auto-fills

**3. CAMPBELL briefings (`missions/campbell-briefings.html`) — MEDIUM**
- Tab switcher renders; active week selected by default; closed weeks distinct

**4. Player field report (`reports/player-report.html`) — MEDIUM**
- Week + hunter selectors; rating pips clickable; SAVE button; D1 round-trip

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

**`data/portal-missions.json`** — HIGH
- `index.html` hub cards and `missions/missions.html` archive both hardcode the same mission data. One JSON file eliminates the duplication.

**`the-lab.html`** — MEDIUM / BUG
- Team moves + assets are hardcoded but `data/motw-teambooks.json` already has the Research Lab entry. Fix: render from JSON at load time. Player choices (D1) unaffected.

### Minor / polish
- Map handout in feed.html — shows "COMING SOON" instead of POST button (one-line fix: remove map special-case in `renderKeeperHandoutsTab`)
- John Johnson hunter page — no page, no D1 stats, no Flake moves in `playbook-moves.json` yet
