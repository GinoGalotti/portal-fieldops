# P.O.R.T.A.L — Project Backlog

Prioritised pending work. Update as tasks are completed or reprioritised.

---

## RECENTLY DONE ✅

### Playbook data architecture refactor — feed move filtering (2026-03-14)
- `data/playbook-moves.json` — 42 moves updated: `"playbook": null` → correct playbook id (action-scientist / changeling / sidekick / monstrous / flake). `"hunter"` field kept as fallback.
- `feed.html` — `hunters_meta` loaded from `hunters.json`; move filter now matches by `playbook` field (via `hunters_meta` lookup) with `hunter === hunterId` fallback. 3 edits: state var, Promise.all fetch + assignment, filter predicate.
- `tests/TESTING-NOTES.md` — added backlog item for move-panel playbook-filter test coverage.

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

## RECENTLY DONE ✅

### Auth system + tests (2026-03-20)
- `functions/api/v1/_auth.js` — shared JWT utilities: `signJWT`, `validateAuth`, `unauthorized`, `forbidden`. Web Crypto API (HS256 HMAC), no npm dependencies.
- `functions/api/auth/login.js` — `POST /api/auth/login`; validates against `AUTH_PASSWORDS` env secret; returns 30-day HS256 JWT.
- `auth.js` (root) — `window.portalAuth` client module: `getUser`, `isLoggedIn`, `getHunterId`, `canWrite`, `fetch` wrapper, `login`, `logout`. Injects LOG IN button (unauthenticated) or user dropdown (authenticated) into page `<header>`. Loaded dynamically by `player-nav.js`. Fires `portalAuthReady` event synchronously.
- 12 write endpoints auth-gated: `hunters/*` (owner or admin), `reports/*` (admin), `player-reports/*` (owner or admin), `incidents/*` + `team/playbook` (any auth), `messages` (any auth; structured types admin-only; sender override), `maps/*` + `session/active` (admin only).
- `hunters/hunter.js` — `_authFetch`, `_canEdit`, `_applyAuthGating` added. Save/reset gated. Non-owners see "NOT AUTHORISED" notice + disabled inputs + hidden save buttons.
- `reports/player-report.html` — save button gated by `canWrite('report', currentHunter)`; logged-in player's hunter auto-selected via `tryAutoSelect()`.
- `feed.html` — keeper mode activated by `applyAuthState()` (admin auto-activates); all write fetches use `authFetch` pattern.
- `the-lab.html`, `lab-incidents.html` — write paths use `_labAuthFetch` / `authFetch`.
- `hunters/hunter.js` — **keeper trigger moved** from invisible top-right overlay div to 5 rapid clicks on `.hero-eyebrow` (fixes conflict with auth LOG IN button in top-right corner).
- `.gitignore` — added `.dev.vars` (local env secrets for wrangler dev).
- `tests/auth.spec.js` — 24 tests (all passing): unauthenticated UI, player gating (own vs. others), admin access, login/logout flow, server 401 handling. No real passwords needed — fake JWT tokens injected via `addInitScript`.
- Total: **615 tests across 24 files** (591 + 24 new auth tests).

### Connection map rendering — feed.html (2026-03-18)
- `feed.html` — `_findMapById`, `_findMapForSession` search both `maps[]` and `connection_maps[]; `_findAllLocs`, `_findMapLoc` handle `map.type === 'connection'`; `_renderAnyMap` dispatcher routes to `_renderConnectionMap` or `_renderMapGrid`; `_renderConnectionMap` — 3-col CSS grid, locked/unlocked nodes, keeper order+route badges, NPC pills, REVEAL ALL / RESET MAP only; `_buildConnDetail` — player_desc + edges (both directions, unlocked only); `keeperSelectMapSession` now resets `selectedMapLoc`
- CSS — `.conn-map-grid`, `.conn-node`, `.conn-route-badge` (A/B/C), `.conn-order-badge`, `.conn-detail-edges`
- `tests/map.spec.js` — +14 tests (38 total): player M03 locked/unlocked/detail/edges; keeper M03 all nodes, order/route badges, NPC pills, bulk buttons, click toggle, REVEAL ALL, RESET MAP

## NEXT UP

### ~~Auth — feed keeper mode auto-activate for admin~~ — ✅ DONE (2026-03-21)
- `tests/feed.spec.js` — added `injectAdminToken()` helper (base64url-encoded JWT, no real server needed); updated all keeper-mode tests to use JWT injection instead of 5-click logo. Deleted obsolete "keeper mode activates after 5 logo clicks" test. 53 feed tests all pass.

### Auth — token revocation [OPTIONAL / LOW]
- Current logout is client-side only (removes token from localStorage). Server has no blacklist — a stolen token remains valid until expiry (30 days).
- If ever needed: add a `revoked_tokens` table in D1; `validateAuth` checks it; add `POST /api/auth/logout` endpoint that writes to D1. Not critical for a small private campaign site.

### ~~Hunter tests — keeper trigger update~~ — ✅ DONE (2026-03-21)
- Verified `tests/hunters.spec.js` has no `#keeper-trigger` or `dblclick` references. Already clean — no changes needed.

### ~~Hunter page — harm status marker + pending improvements counter~~ — ✅ DONE (2026-03-21)
- `hunters/hunter.js` — `injectHarmStatusUI()` + `updateHarmStatus()` appended to harm track row; `injectPendingImprovementsUI()` inserted after XP row. XP overflow: fill last pip → reset to 0 + increment `pendingImprovements`. `−` button spends. All serialised in D1 sheet state as `pendingImprovements`. Both called at boot, wired into `applySheet`, `resetAll`, auth gating.
- `hunters/hunter.css` — `.harm-status` (`.okay`/`.unstable`/`.dying`) + `.pending-improvements` amber bar + `.pi-label`/`.pi-count`/`.pi-use-btn`.

615 tests passing across 24 files. Suite: `smoke` (5) · `nav` (32) · `contacts` (7) · `incidents` (41) · `feed` (53) · `bestiary` (15) · `arcs` (24) · `artefacts` (15) · `missions` (23) · `lab` (20) · `entities` (36) · `hunters` (29) · `briefings` (12) · `player-report` (29) · `d1-round-trip` (9) · `map` (38) · `report` (15) · `index-session` (16) · `evidence` (41) · `threads` (30) · `campbell-logs` (37) · `keeper-review` (11) · `post-session-integrity` (23) · `auth` (24).

---

## BACKLOG

### ~~Campaign thread + clock tracker~~ — ✅ DONE (2026-03-14)
`missions/threads.html`, `data/portal-threads.json`, `data/portal-clocks.json` all built and tested.

### ~~Playbook data architecture refactor (phase 1)~~ — ✅ DONE (2026-03-14)

`playbook-moves.json` 42 campaign-hunter moves now have `playbook` populated; `feed.html` filters by `playbook` via `hunters.json` lookup with `hunter` fallback.

**Future enhancement (non-urgent):** full refactor to playbook-keyed moves so any new hunter with an existing MoTW playbook needs no manual move entries. Only matters when adding a 6th hunter whose playbook isn't already in `playbook-moves.json`. All reference data exists (`motw-playbooks.json`, `motw-playbook-arcs.json`) — it's a data-path change in `hunter.js` + `feed.html` when needed.

---

### ~~Adding John Johnson (Flake)~~ — ✅ DONE

### ~~Connection map rendering — feed.html~~ — ✅ DONE (2026-03-18)

Player + keeper connection map tab for M03 theatre investigation board. See RECENTLY DONE above.

---

### ~~Minor / polish~~ — ✅ ALL DONE
- ~~John Johnson hunter page~~ — `hunters/john.html`, arcs in `hunter-arcs.json`, Flake moves wired.
- ~~Nav breakpoint~~ — raised to 900px, hamburger shows at ≤900px.
- ~~The Lab removed from player nav~~ — lab lore + team playbook link remain on `index.html` after `#operatives`.
