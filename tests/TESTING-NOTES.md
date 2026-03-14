# P.O.R.T.A.L — E2E Testing Notes

## Principles

- **Data-driven, not content-driven**: read source JSON files at test time rather than hardcoding content strings. If the app reads `data/incidents.json`, so should the tests.
- **Anchor on structure, not counts**: assert that elements *exist* and *work*, not that there are exactly N of them. Exception: exact-count assertions are fine when the count is architecturally fixed (e.g., "3 choice buttons on S01-I01 which always has 3 choices").
- **Old content stays**: when new sessions are added, existing incident/NPC IDs don't get removed. Tests anchored to S01-I01, S01-I02, CAMPBELL etc. will remain valid indefinitely.
- **networkidle on data-driven pages**: all pages that fetch JSON before rendering need `waitForLoadState('networkidle')` before asserting.

## Current Coverage

| Page | File | Tests | Status |
|------|------|-------|--------|
| `lab-incidents.html` | `tests/incidents.spec.js` | 18 | ✅ |
| `contacts.html` | `tests/contacts.spec.js` | 7 | ✅ |
| All key pages | `tests/smoke.spec.js` | 5 | ✅ |
| Nav injection + hamburger | `tests/nav.spec.js` | 22 | ✅ |
| `feed.html` | `tests/feed.spec.js` | ~25 | ✅ |
| `index.html` bestiary | `tests/bestiary.spec.js` | 15 | ✅ |
| `missions/arcs.html` | `tests/arcs.spec.js` | 24 | ✅ |
| `missions/entities.html` | `tests/entities.spec.js` | 36 | ✅ |
| `hunters/*.html` | `tests/hunters.spec.js` | 29 | ✅ |
| `missions/threads.html` (threads, clocks, prep export) | `tests/threads.spec.js` | 30 | ✅ |
| `missions/campbell-briefings.html` | `tests/briefings.spec.js` | ~12 | ✅ |
| `reports/player-report.html` | `tests/player-report.spec.js` | ~15 | ✅ |
| D1 round-trip (hunter sheet, arc, incident, player report, map) | `tests/d1-round-trip.spec.js` | 7 | ✅ |
| `feed.html` MAP tab (player + keeper) | `tests/map.spec.js` | 24 | ✅ |
| `missions/report.html` | `tests/report.spec.js` | 15 | ✅ |

## ⬆ Next Up (recommended order)

1. **Hunter page D1 round-trip for John** [L] — add john to `d1-round-trip.spec.js` once John's sheet is confirmed stable in play.

---

## Test Backlog — Not Yet Covered

Priority: **H** = high (core features, likely to break), **M** = medium, **L** = low (nice to have).

### `feed.html` — Live Session Feed [H]
- [x] Page loads, feed-entries area and composer present
- [x] Roll entries from API render in the feed
- [x] Message entries from API render in the feed
- [x] Feed entry expands on click (adds .expanded)
- [x] Clicking expanded entry collapses it (removes .expanded)
- [x] Clicking a second entry collapses the first (exclusive expansion)
- [x] Keeper mode activates on 5× logo click (keeper tabs appear)
- [x] Keeper HANDOUTS tab visible and renders handout list (S02)
- [x] Keeper handout POST buttons default to ▶ POST (not RE-POST)
- [x] Clear handouts immediately resets RE-POST buttons to POST (no reload)
- [x] Clear handouts removes .feed-image entries from feed DOM
- [x] Clear feed view removes all entries from DOM immediately
- [x] On reload, messages before clear sentinel are discarded
- [x] Clear sentinel received via polling wipes the visible feed
- [x] Feed composer sends POST with correct sender and body
- [x] Posting image after PDA does not remove PDA from feed DOM (regression — image covers PDA visually if too tall; fixed with max-height: 560px on .feed-image-card img)
- [ ] **Known issue (not tested):** posting multiple handouts in rapid succession (faster than the 6s poll interval) may cause ordering issues — repost or clear to recover
- [x] Hunter picker dropdown renders and selecting a hunter loads their data
- [x] Move cards render after hunter selection (at least one visible)
- [x] Roll button exists on move cards
- [x] ROLL button sends a roll entry to the feed
- [x] Feed composer: name auto-fills from selected hunter
- [x] Track pips (.track-mini-pip) render when sheet has stats
- [x] Move card expands on click (no-hover mode — adds .expanded)
- [x] Clicking a second move card collapses the first (exclusive)
- [x] Playbook moves filter by `playbook` field (via `hunters.json` lookup) — not just `hunter` field — so future hunters without hardcoded `hunter` tags still work
- [ ] Tracks (harm/luck/xp) render as clickable pips in feed panel
- [ ] Keeper mode CONTACTS tab shows NPC visibility toggles
- [ ] Keeper mode REFERENCES tab shows MoTW cheat sheet content
- [ ] Keeper mode THREATS tab shows entity data
- [ ] `?mouseover=true` restores CSS :hover behaviour (hover not testable in headless)

### `hunters/*.html` — Hunter Pages [H]
- [ ] Hunter page loads and renders playbook name
- [ ] Arc section is visible
- [ ] Arc state saves on beat click (D1 write + localStorage)
- [ ] Arc state restores on reload (D1 read)
- [ ] Sheet stat pips render (Cool/Tough/Sharp etc)
- [ ] Harm track renders and clicking a pip updates state
- [ ] Luck track renders
- [ ] XP track renders and +N badge appears on overflow
- [ ] Save button persists sheet to D1
- [ ] Sheet restores from D1 on reload

### `missions/campbell-briefings.html` — CAMPBELL Queue [M]
- [ ] Week tab switcher renders (same pattern as incidents, needs same data-driven treatment)
- [ ] Active week tab is selected by default
- [ ] Briefing content fragment loads inside the iframe/embed
- [ ] Closed weeks are visually distinct from active week

### `reports/player-report.html` — Operative Field Report [M]
- [ ] Week + hunter selectors render
- [ ] Rating pips (5 per scene) render and are clickable
- [ ] SAVE REPORT button exists
- [ ] State persists to D1 and restores on reload

### `missions/report.html` — Keeper Field Report [M] ✅ covered in `report.spec.js`
- [x] Session selector renders (S01, S02 tabs)
- [x] S01 active by default; switching tab updates title
- [x] SAVE REPORT button exists (top + bottom)
- [x] COPY FOR CLAUDE button exists
- [x] Save triggers PUT to D1 and shows feedback
- [x] Outcome buttons render and toggle correctly
- [x] Scene textareas render per session
- [x] Thread tags render and toggle

### `index.html` — Home Page [M]
- [x] Bestiary cards render (data-driven from portal-entities.json, session-gated) → `bestiary.spec.js`
- [x] Session-aware artefact cards hidden/shown by session → `artefacts.spec.js` (15 tests: w1/w2/w3 gating, blur, status text)
- [x] Artefact cards render (total phase count, id + name elements) → `artefacts.spec.js`

### `the-lab.html` — Research Lab Playbook [L]
- [ ] Page loads and renders team playbook content
- [ ] D1-backed state saves and restores

### D1 Persistence (cross-page) [H, but hard]
- [x] Full save→reload→restore cycle for hunter sheets → `d1-round-trip.spec.js`
- [x] Full save→reload→restore cycle for incident choice state → `d1-round-trip.spec.js`
- [x] Full save→reload→restore cycle for player report (rating pip + textarea) → `d1-round-trip.spec.js`
- [ ] Offline fallback: when D1 is unreachable, localStorage state is used

### Nav injection correctness [M]
- [x] Mobile hamburger toggle: visible at ≤640px, click opens/closes nav → `nav.spec.js`
- [x] Desktop: `.nav-toggle` hidden → `nav.spec.js`
- [x] All player-facing pages inject nav with the same set of links → `nav.spec.js`
- [x] Subdirectory pages (`hunters/`, `missions/`, `reports/`) get correct relative paths in nav links → `nav.spec.js`
- [ ] Nav links resolve to valid pages (no 404s on click)

## Running the Tests

```bash
# Install dependencies (first time only)
npm install
npx playwright install chromium

# Run all tests
npm test

# Run with UI (recommended for debugging)
npm run test:ui

# Run a single spec file
npx playwright test tests/incidents.spec.js

# Run with server already running (faster)
wrangler pages dev .  # in one terminal
npx playwright test   # in another
```

The `playwright.config.js` has `reuseExistingServer: true` — if `wrangler pages dev .` is already running, Playwright will use it. Otherwise it starts it automatically.

---

## Feature Backlog — Pending Implementation

Things not yet built, noted here so they don't get lost.

### `feed.html` — Move card / feed entry expand behaviour [UX]

**Current:** move cards in the MOVES panel and roll entries in the feed expand (show description/outcome detail) on hover (`CSS :hover` with `opacity` + `max-height` transition).

**Desired default:** expand on **click** instead — feels more intentional during play, less noisy.

**Feature flag:** `?mouseover=true` in the URL restores hover behaviour for A/B testing with players.

**Implementation notes:**
- Read `new URLSearchParams(location.search).get('mouseover')` on boot; store as a boolean `hoverMode`
- If `hoverMode` is false (default): add a click listener to each `.feed-entry` / move card that toggles an `.expanded` class; CSS `:hover` rule replaced by `.expanded` rule
- If `hoverMode` is true: keep current CSS hover behaviour as-is
- Both modes should work for: move cards in MOVES panel, roll entries in feed, outcome detail blocks
- **Decided UX:** click toggles expand/collapse; multiple entries can be open simultaneously; clicking the ROLL button on a move card does NOT collapse it
- Tests to add once implemented: click to expand, click again to collapse, two entries can both be open, ROLL button click doesn't collapse card, `?mouseover=true` restores hover behaviour
