# P.O.R.T.A.L — Project Backlog

Prioritised pending work. Update as tasks are completed or reprioritised.

---

## RECENTLY DONE ✅

### Lab hardcoded bug fix + entity JSON schema normalisation (2026-03-13)
- `data/motw-teambooks.json` — `tagline` added to all 7 Research Lab allies; `campbell-team-ally` id → `campbell`
- `the-lab.html` — `renderAdvancements(lab)` + `renderAlly(lab)` data-driven from JSON; advancement items → counter UI (`−/count/+`); ally dropdown background fixed to solid `--bg2`; counters serialised as numeric values in `s.checked['adv-N']`
- `data/portal-db-deck.json` — 53 entries normalised from `tags[]`/`columns[]` → semantic keys: `type`, `harm`, `armour`, `motivation`, `powers`, `attacks[]`, `weakness`, `custom_moves[]`, `description`
- `data/portal-db-custom.json` — Shōjō normalised from `stat_block[]` → semantic fields + `extra_tags[]`, `type_detail`, `harm_color`, `harm_note`, `armour_detail`, `origin`, `notes[]`
- `missions/entities.html` — removed `buildStatItem()` helper; replaced both DB renderers with semantic-field functions; `DECK_TYPE_COLORS` lookup table
- `tests/lab.spec.js` — +7 tests: advancement counter DOM, +/−/floor behaviour, ally select count + values
- Total: **329 tests across 18 files**

### Interactive district map + map tests (2026-03-13)
- `data/portal-maps.json` — explicit grid map for Aldermoor (M02); `"order"` (1-7 narrative progression), `"npcs"` arrays per location
- `workers/migrations/011_map_state.sql` — `map_state` table; applied local + remote
- `functions/api/v1/maps/[id]/state.js` — GET + PUT map state endpoint
- `feed.html` — player MAP tab (mission selector, locked/unlocked cells, detail card, SYNC MAP); keeper MAP tab (order badges, NPC pills, visited state, REVEAL ALL / RESET MAP / ALL VISITED / CLEAR VISITED bulk actions); panel resize handle (drag to resize, saved to localStorage); scrollbar theming; S01/S02 → M01/M02 rename throughout; keeper tab scroll overflow; ref + map font size bumps
- Map state schema: `{ u: { loc_id: true }, v: { loc_id: true } }` — `u` = player-visible, `v` = keeper visited. Legacy flat format migrated automatically.
- `tests/map.spec.js` — 24 tests: player tab (mission selector, locked/unlocked, detail card, order hidden from players); keeper tab (order numbers, NPC pills, unlock toggle, visited button, stopPropagation, all 4 bulk actions)
- `tests/d1-round-trip.spec.js` — +2 tests: map unlock round-trip, map visited round-trip (7 total)
- Total: **276 tests across 16 files**

### Player report keeper debrief recap (2026-03-13)
- `reports/player-report.html` — `// KEEPER DEBRIEF` section at bottom; fetches keeper field report for each week; outcome badge + directive + summary; pending placeholder
- `tests/player-report.spec.js` — +10 recap tests (29 total)
- Total: **329 tests across 18 files**

### index.html session gating refactor + tests (2026-03-13)
- `session-state.js` — exposed `window.PORTAL_APPLY_SESSION`; removed 3 duplicate inline apply functions from `index.html`
- `tests/index-session.spec.js` — 16 tests: missions grid gating (w1/w2), oracle-readout, lore-classified, card counts
- Total: **319 tests across 18 files**

### Keeper review page + COPY FOR CLAUDE fix (2026-03-13)
- `reports/keeper-review.html` — new keeper page, W01/W02 tabs, 5-col responsive card grid, fetches all hunter reports in `Promise.all`, filed/not-filed badge, rating pips, text fields, scene notes
- `missions/report.html` — `loadOperativeReports()` returns its Promise; `ensureOperativeReports(sid)` helper; COPY FOR CLAUDE awaits reports before copying (fixes race condition on fast click)

### Playwright test suite expansion — nav + keeper report (2026-03-13)
- `tests/nav.spec.js` — +12 subdirectory path tests: all 11 nav labels present on hunters/reed.html, missions/missions.html, reports/player-report.html; subdir pages use `../` prefix; root pages don't
- `tests/report.spec.js` — 15 tests: session tabs (S01/S02, default active, title update), save buttons (top + bottom), COPY FOR CLAUDE, PUT to D1 + flash feedback, outcome buttons, scene textareas, thread tags
- Total: **303 tests across 17 files**

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

## NEXT UP

329 tests passing across 18 files. Suite: `smoke` (5) · `nav` (22) · `contacts` (7) · `incidents` (18) · `feed` (~25) · `bestiary` (15) · `arcs` (24) · `artefacts` (15) · `missions` (23) · `lab` (27) · `entities` (36) · `hunters` (19) · `briefings` (12) · `player-report` (29) · `d1-round-trip` (7) · `map` (24) · `report` (15) · `index-session` (16).

**1. Campaign thread + clock tracker — `missions/threads.html`** [MEDIUM] — see Post-Session Workflow section below.

---

## BACKLOG

### Post-Session Workflow Improvements — HIGH

Four related features that close gaps in the current session-summary → next-session-prep pipeline.

#### 1. Campaign thread + clock tracker — `missions/threads.html` [MEDIUM]
**Problem:** Threads and clocks are tracked per session in the field report, but there's no continuous view across sessions. The arc tracker (`missions/arcs.html`) does this beautifully for hunter arcs — nothing equivalent exists for campaign-level threads.
**Goal:** A keeper-facing page showing all named threads (PROJECT VEIL, MESA, CAMPBELL, etc.) and all countdown clocks with their current status, last-updated session, and any notes — the campaign's shape at a glance.
**Implementation:**
- New `data/portal-threads.json` — thread registry: `id`, `name`, `category` (faction/personal/mystery), `status` (active/resolved/dormant), `sessions[]` (per-session notes/state)
- New `data/portal-clocks.json` — clock registry: `id`, `label`, `max_ticks`, `ticks`, `status`, `notes`
- Both rendered as a keeper dashboard — threads grouped by category, clocks as visual pip tracks
- State saved to D1 (new migration) or to these JSON files directly (simpler if clocks don't change mid-session)
**Why now:** Makes campaign structure visible. Directly feeds into next-session prep and the COPY FOR CLAUDE export.

---

### Playbook data architecture refactor — MEDIUM

**Problem:** `playbook-moves.json` has moves keyed to specific hunters (rex, alan, reed, sven) rather than to playbooks (Action Scientist, Sidekick, etc.). Meanwhile `motw-playbooks.json` has 5 playbooks (action-scientist, sidekick, changeling, monstrous, flake) with full reference data. These two layers don't connect cleanly.

**Current state:**
- `motw-playbooks.json` — 5 playbooks from the book: full stat options, moves list, gear, improvements, `"hunter": "rex"` field tying it to a specific campaign hunter
- `playbook-moves.json` — 34 moves keyed by `data-check-key`, each with `"hunter": "rex"` etc. — hunter-specific, not playbook-generic
- `hunters.json` — 5 hunters with identity data, each references a playbook implicitly

**The problem in practice:** When John Johnson (Flake playbook) needs a hunter page, his moves aren't in `playbook-moves.json`. You'd have to add them manually. If another group wanted to use the site, every hunter would need manual move entries.

**Proposed two-layer architecture:**

*Layer 1 — Reference (playbook-generic):*
- `motw-playbooks.json` — already exists, keep as canonical playbook definitions. Remove `"hunter"` field (it's campaign-specific, not book data). Each playbook has `id`, `name`, `moves[]` with full text.
- `playbook-moves.json` — refactor to be playbook-keyed, not hunter-keyed. Each move entry: `playbook_id`, `move_id`, `name`, `roll`, `description`. The `data-check-key` becomes `{playbook_id}-{move_id}`.

*Layer 2 — Campaign (hunter-specific):*
- `hunters.json` — add `playbook_id` field linking each hunter to their playbook. Already has `"hunter": "rex"` → `"playbook_id": "action-scientist"`.
- D1 `hunter_sheets` — unchanged. Stores which move keys are checked (`checks{}`), plus stats/harm/luck/xp.

*How hunter pages work after refactor:*
1. Load hunter identity from `hunters.json` → get `playbook_id`
2. Load playbook definition from `motw-playbooks.json` by `playbook_id` → get move list
3. Load sheet state from D1 → get which moves are checked
4. Render only checked moves as active cards in the panel (same as now, different data path)

**Adding John Johnson (Flake):**
- Flake playbook already exists in `motw-playbooks.json`
- Add John to `hunters.json` with `"playbook_id": "flake"`
- Create `hunters/john.html` pointing to `hunters/hunter.js`
- Flake moves render automatically — no manual move entries needed

**Scope:** `data/hunters.json`, `data/playbook-moves.json`, `data/motw-playbooks.json`, `hunters/hunter.js` (move lookup path), `feed.html` (move card render), tests.

**Why this matters beyond John Johnson:** Makes the site genuinely reusable for any MoTW group. The reference layer is the book data; the campaign layer is your group's choices. Clean separation.

**Reference data is now available** (2026-03-13 migration complete):
- `motw-playbooks.json` — 24 playbooks (4 PORTAL + 20 generic, including Flake)
- `playbook-moves.json` — 177 moves across all playbooks; `always_active_moves` preserved
- `motw-playbook-arcs.json` — 33 playbooks × 2 arcs including Flake arcs
- `motw-teambooks.json` — all 9 team playbooks

The refactor above is now unblocked. All reference data exists; it's just a matter of connecting the layers.

---

### Adding John Johnson (Flake) — new hunter onboarding exercise — MEDIUM

**Goal:** Add John Johnson as a fully playable hunter. Use this as a worked end-to-end exercise documenting *exactly* what it takes to add a new hunter to the site — useful reference for any future new players.

**What we now have for Flake:**
- `motw-playbooks.json` — Flake playbook entry (`hunter: null`, generic)
- `playbook-moves.json` — Flake moves included in the 177-move set
- `motw-playbook-arcs.json` — Flake arcs I ("Deeper Conspiracy") and II ("The Benign Conspiracy")
- `data/hunters.json` — John Johnson entry exists (john-johnson), in feed dropdown already

**What needs doing:**

1. **`data/hunters.json`** — confirm John's entry is complete (playbook, accent colour, luck_special, area_of_study, lore, keeper notes)
2. **`data/playbook-moves.json`** — Flake moves are in the file but keyed to playbook, not `"hunter": "john-johnson"`. Update the `hunter` field on Flake moves (or defer to the playbook architecture refactor above — these two tasks are linked)
3. **`hunters/john.html`** — create hunter page following `hunters/reed.html` as template; link `hunter.js` + `hunter.css`
4. **`data/hunter-arcs.json`** — add John's selected arc(s) (pick from `motw-playbook-arcs.json` Flake entries, adapt to campaign context)
5. **D1** — no migration needed; `hunter_sheets` table accepts any hunter_id. John's sheet starts empty (no D1 record until first save).
6. **`player-nav.js`** — confirm John appears in Operatives nav (driven by `hunters.json`, check auto-detection)
7. **Tests** — add john.html to `tests/hunters.spec.js` (structure, stat pips, arcs, save)

**Why do this now:** Flake reference data just landed. John is already in the feed dropdown. This exercise will surface any gaps in the "add a hunter" path and produce a reusable checklist for future new players.

---

### Minor / polish
- John Johnson hunter page — blocked on playbook architecture refactor OR can be done manually as the exercise above (hunter field on Flake moves, explicit john entry)
