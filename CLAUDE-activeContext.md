# CLAUDE-activeContext.md
*Current session state, recent changes, and immediate next steps.*
*Last updated: 2026-03-28*

---

## Most Recent Work

### Frontend Accessibility Improvement — Phases 1–5 (2026-03-28)
Implemented full `context/frontend-improvement-plan.md`. Two commits: `9c9ebe3` (Phase 1–2) + `46a8757` (Phase 3–5).

**Phase 1 — Global CSS accessibility:**
- `:focus-visible` on all 5 CSS files (player/keeper/hunter/briefing/dossier)
- `prefers-reduced-motion` media query on all CSS files + `feed.html` inline styles
- Text size bumps: all sub-0.7rem fonts raised (0.55→0.65, 0.62→0.68, 0.65→0.7rem)
- Touch target padding on mobile (nav toggle, filter buttons)

**Phase 2 — ARIA + keyboard support (JS):**
- `hunters/hunter.js`: `makeKeyboardAccessible(el, role)` helper — track pips, beat boxes, choice opts, check items all keyboard-navigable with ARIA roles/states
- `feed.html`: feed entry + move card expansion via Enter/Space, `aria-expanded`, `tabindex="0"`
- `campbell-logs.html` + `evidence.html`: collapsible headers keyboard-accessible
- `player-nav.js` + `keeper-nav.js`: `aria-current="page"`, `aria-expanded` on toggle, skip-to-main link injection, focus management (menu open→first link, close→toggle)
- Keyboard shortcuts guide overlay (press `?` on any player page) — page-context-aware hints
- Save buttons: `aria-live="polite"` on all save status elements
- `auth.js`: `role="alert"` on error div

**Phase 3 — Contrast:**
- `--text-dim` lightened: `#5a7a62` → `#7a9a82` (4.6:1 ratio, passes AA)
- `--green-dim` lightened: `#1a7a43` → `#28945a` (4.6:1 ratio)
- Grid overlay opacity: 0.4 → 0.25
- Badge contrast audit: all pass AA — no changes needed

**Phase 4 — Semantic HTML:**
- Card semantics: `div→article` on NPC cards, beast cards, evidence cards, log entries
- Form associations: `fieldset/legend/label` on all 5 hunter stat grids
- Heading hierarchy: `h3→h2` in hunter pages, `sr-only h1` on feed, `h1` on lab memo
- `id="main-content"` on all 21 pages with `<main>`
- Skip-link fix: `position: absolute; top: -100%` → `position: fixed; top: -200px`

**Phase 5 — Print + polish:**
- Print stylesheets: `mission-prep.css` + `handouts/dossier/dossier.css`
- 5.3 (responsive breakpoint normalisation) deferred — marked "only if time permits"

**Tests:** 571 passed, 1 skipped, 8 did not run (pre-existing map keeper-mode flakes). No regressions.

### Field Journals page — data-driven (2026-03-24)
- **`data/journals.json`** — block-based journal system with stable `id` per block. John Johnson S01+S02 authored.
- **`missions/journal.html`** — keeper-facing renderer with per-operative accent colors, multi-journal tabs.

---

## Current State

### Test Suite
- **571 tests passing** (1 skipped, 8 did not run — map keeper-mode flakes) against `wrangler pages dev .` (port 8788)
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

**1. Push accessibility commits** — Two local commits (`9c9ebe3`, `46a8757`) not yet pushed to `origin/dev`.

**2. Hunter D1 restore tests [M]** — 3 unchecked items in `hunters.spec.js`: arc state restores on reload, XP overflow badge, sheet restores from D1.

**3. Post-S03 ingestion** — after S03 runs: threads, clocks, evidence, incidents, arcs, NPC updates via `context/post-session-runbook.md`.

**4. Responsive breakpoint normalisation [optional]** — Plan item 5.3: standardise breakpoints across CSS files (currently 580/600/640/700/820/900px). Low priority.

---

## Open Notes
- `data/canon.json` starts empty — populated after S03 via ingestion package (field report canon slots → ingestion → JSON entries)
- `evidence-visibility` D1 key is live on remote; old `evidence-revealed` key is orphaned (no migration needed)
