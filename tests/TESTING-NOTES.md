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
| Nav injection | `tests/nav.spec.js` | 5 | ✅ |

## Test Backlog — Not Yet Covered

Priority: **H** = high (core features, likely to break), **M** = medium, **L** = low (nice to have).

### `feed.html` — Live Session Feed [H]
- [ ] Hunter picker dropdown renders and selecting a hunter loads their data
- [ ] Move cards render after hunter selection (at least one visible)
- [ ] Hover on a move card shows description block
- [ ] Roll button exists on move cards
- [ ] Roll feed area exists and accepts new messages via composer
- [ ] ROLL button sends a roll entry to the feed
- [ ] Feed composer: name auto-fills from selected hunter
- [ ] Tracks (harm/luck/xp) render as clickable pips
- [ ] Keeper mode activates on 5× logo click (extra tabs appear)
- [ ] Keeper mode CONTACTS tab shows NPC visibility toggles
- [ ] Keeper mode REFERENCES tab shows MoTW cheat sheet content
- [ ] Keeper mode THREATS tab shows entity data
- [ ] Feed polling: new entries appear without page reload (requires controlled test data)

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
- [ ] Session-aware cards: cards with `data-session-from` are hidden/shown based on active session
- [ ] Archive cards render
- [ ] Bestiary cards render
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
