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
| Nav injection + hamburger | `tests/nav.spec.js` | 10 | ✅ |
| `feed.html` | `tests/feed.spec.js` | ~25 | ✅ |
| `index.html` bestiary | `tests/bestiary.spec.js` | 15 | ✅ |
| `missions/arcs.html` | `tests/arcs.spec.js` | 24 | ✅ |
| `missions/entities.html` | `tests/entities.spec.js` | 36 | ✅ |
| `hunters/*.html` | `tests/hunters.spec.js` | ~18 | ✅ |
| `missions/campbell-briefings.html` | `tests/briefings.spec.js` | ~12 | ✅ |
| `reports/player-report.html` | `tests/player-report.spec.js` | ~15 | ✅ |

## ⬆ Next Up (recommended order)

1. **`tests/missions/report.spec.js`** [M] — Keeper field report: session selector, save, COPY FOR CLAUDE button.
2. **Full D1 round-trip** [H] — Save→reload→restore cycle: hunter sheets, incident state. Requires live local wrangler.
3. **Nav subdirectory paths** [M] — All player-facing pages inject nav with same links; links resolve correctly from `hunters/`, `missions/`, `reports/` subdirs.

---

## Test Backlog — Not Yet Covered

Priority: **H** = high (core features, likely to break), **M** = medium, **L** = low (nice to have).

### `feed.html` — Live Session Feed [H]
- [x] Page loads, feed-entries area and composer present
- [x] Roll entries from API render in the feed
- [x] Message entries from API render in the feed
- [x] Feed entry expands on click (adds .expanded)
- [x] Clicking expanded entry collapses it (removes .expanded)
- [x] Two entries can be expanded simultaneously
- [x] Keeper mode activates on 5× logo click (keeper tabs appear)
- [x] Keeper HANDOUTS tab visible and renders handout list (S02)
- [x] Keeper handout POST buttons default to ▶ POST (not RE-POST)
- [x] Clear handouts immediately resets RE-POST buttons to POST (no reload)
- [x] Clear handouts removes .feed-image entries from feed DOM
- [x] Clear feed view removes all entries from DOM immediately
- [x] On reload, messages before clear sentinel are discarded
- [x] Clear sentinel received via polling wipes the visible feed
- [x] Feed composer sends POST with correct sender and body
- [ ] Hunter picker dropdown renders and selecting a hunter loads their data
- [ ] Move cards render after hunter selection (at least one visible)
- [ ] Roll button exists on move cards
- [ ] ROLL button sends a roll entry to the feed
- [ ] Feed composer: name auto-fills from selected hunter
- [ ] Tracks (harm/luck/xp) render as clickable pips
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

### `missions/report.html` — Keeper Field Report [M]
- [ ] Session selector renders
- [ ] Scene sections and rating sliders render
- [ ] SAVE REPORT button exists
- [ ] COPY FOR CLAUDE button exists
- [ ] State persists and restores

### `index.html` — Home Page [M]
- [x] Bestiary cards render (data-driven from portal-entities.json, session-gated) → `bestiary.spec.js`
- [ ] Session-aware cards: archive/artefact cards with `data-session-from` are hidden/shown
- [ ] Archive cards render
- [ ] Artefact cards render

### `the-lab.html` — Research Lab Playbook [L]
- [ ] Page loads and renders team playbook content
- [ ] D1-backed state saves and restores

### D1 Persistence (cross-page) [H, but hard]
- [ ] Full save→reload→restore cycle for hunter sheets
- [ ] Full save→reload→restore cycle for incident choice state
- [ ] Offline fallback: when D1 is unreachable, localStorage state is used
- **Note**: these tests require either a real local D1 instance (wrangler provides one at `.wrangler/state/`) or test fixtures. The save/restore cycle tests are the most valuable and the hardest to write without flakiness.

### Nav injection correctness [M]
- [x] Mobile hamburger toggle: visible at ≤640px, click opens/closes nav → `nav.spec.js`
- [x] Desktop: `.nav-toggle` hidden → `nav.spec.js`
- [ ] All player-facing pages inject nav with the same set of links
- [ ] Subdirectory pages (`hunters/`, `missions/`, `reports/`) get correct relative paths in nav links
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
