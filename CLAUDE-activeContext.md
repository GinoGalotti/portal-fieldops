# CLAUDE-activeContext.md
*Current session state, recent changes, and immediate next steps.*
*Last updated: 2026-03-20*

---

## Most Recent Work

### Nav cleanup + anchor scroll fix (2026-03-20)
- **`player-nav.js`** — Removed "The Lab" (12 items now). Lab lore + team playbook link remain on `index.html` directly after `#operatives`.
- **`player.css`** — Hamburger breakpoint raised from 640px → 900px (13 items overflowed at intermediate widths).
- **`index.html`** — `#lab` section moved after `#operatives`; section top padding reduced 80px → 24px so anchored headings land near viewport top.

### VIEW FULL LOGS link — lab-incidents.html (2026-03-20)
- **`data/incidents.json`** — `link` field added to both CAMPBELL-LOG teaser items.
- **`lab-incidents.html`** — `renderTeaser()` conditionally renders `.log-full-link a` → `campbell-logs.html`.

### Test suite expansion (2026-03-20)
- `feed.spec.js` 45 → 53 (readaloud + document handout types)
- `campbell-logs.spec.js` 35 → 37 (clue pre-revealed D1 load)
- `keeper-review.spec.js` new — 11 tests
- `playwright.config.js` — `retries: 1` for d1-round-trip stability under parallel load

### Phase D — Evidence board + CAMPBELL logs (2026-03-17/18)
- **`evidence.html`** — session-gated evidence cards, category filter, keeper mode (triple-click eyebrow), D1-backed via `global_flags` key `evidence-visibility`.
- **`campbell-logs.html`** — CAMPBELL activity log archive, 3-layer highlights, keeper clue spans D1-persisted via `global_flags` key `campbell-logs-hints`.
- **`workers/migrations/015_global_flags.sql`** — applied remote + local.

---

## Current State

### Test Suite
- **591 tests across 23 files** — all passing (1 skipped) against `wrangler pages dev .` (port 8788)
- Files: smoke · nav · contacts · incidents · feed · bestiary · arcs · artefacts · missions · lab · entities · hunters · briefings · player-report · d1-round-trip · map · report · index-session · evidence · threads · campbell-logs · keeper-review · post-session-integrity
- Backlog: `tests/TESTING-NOTES.md`

### D1 Migrations
- Migrations 001–015 applied **remote + local**
- Latest: `015_global_flags` (global_flags table — used by campbell-logs hints + evidence visibility)

### Session Data
- `data/sessions/index.json` — M01 (closed), M02 (closed), M03 (active)
- Session keys: `M01`, `M02`, `M03`

### Player Nav (12 items)
Briefing · Operatives · Bestiary · Logs · Artefacts · Missions · Evidence · Contacts · Report · Queue · Incidents · Feed

---

## Next Up

**1. Hunter D1 restore tests [M]** — 3 unchecked items in `hunters.spec.js`: arc state restores on reload, XP overflow badge, sheet restores from D1.

**2. Post-S03 ingestion** — after S03 runs: threads, clocks, evidence, incidents, arcs, NPC updates via `context/post-session-runbook.md`.

---

## Open Notes
- `data/canon.json` starts empty — populated after S03 via ingestion package (field report canon slots → ingestion → JSON entries)
- `evidence-visibility` D1 key is live on remote; old `evidence-revealed` key is orphaned (no migration needed)
