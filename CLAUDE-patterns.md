# CLAUDE-patterns.md
*Established code patterns and conventions for this project.*
*Last updated: 2026-03-28*

---

## D1 Persistence Pattern

Every interactive page follows the same read/write cycle. Reference implementation: `hunters/hunter.js` + `functions/api/v1/hunters/[id]/arc-state.js`.

**Load:**
```js
async function load() {
  try {
    const res = await fetch(`/api/v1/{resource}`);
    if (res.ok) { state = await res.json(); applyState(state); return; }
  } catch (e) {}
  // fall back to localStorage
  const saved = localStorage.getItem('portal_{key}');
  if (saved) applyState(JSON.parse(saved));
}
```

**Save:**
```js
async function save() {
  localStorage.setItem('portal_{key}', JSON.stringify(state));
  showFeedback('SAVING');
  try {
    const res = await fetch(`/api/v1/{resource}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(state)
    });
    showFeedback(res.ok ? 'SAVED' : 'OFFLINE');
  } catch (e) { showFeedback('OFFLINE'); }
}
```

---

## API Function Pattern (Pages Functions)

File location: `functions/api/v1/{resource}/[param].js`

```js
export async function onRequestGet({ params, env }) {
  const row = await env.portal_db.prepare(
    'SELECT state FROM table WHERE id = ?'
  ).bind(params.param).first();
  if (!row) return new Response('{}', { status: 404 });
  return new Response(row.state, { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPut({ params, env, request }) {
  const body = await request.text();
  const now = new Date().toISOString();
  await env.portal_db.prepare(
    'INSERT OR REPLACE INTO table (id, state, updated_at) VALUES (?, ?, ?)'
  ).bind(params.param, body, now).run();
  return new Response('{"ok":true}');
}
```

---

## Data-Driven Architecture

**Rule:** Content lives in JSON data files. HTML pages render from JSON at load time. Never hardcode content in HTML that belongs in data.

| Data file | What it drives |
|-----------|---------------|
| `data/briefings.json` | `missions/campbell-briefings.html` — all weeks/items |
| `data/incidents.json` | `lab-incidents.html` — all weeks/blocks |
| `data/hunter-arcs.json` | `missions/arcs.html` — all arc cards |
| `data/portal-entities.json` | `missions/entities.html` Section I + `index.html` bestiary |
| `data/portal-entity-types.json` | `missions/entities.html` Section II |
| `data/portal-db-deck.json` | `missions/entities.html` Section III deck |
| `data/portal-maps.json` | Feed MAP tab — grid + connection maps, NPC pills, order |
| `data/sessions/index.json` | Session registry — source of truth for `session-state.js` |
| `data/sessions/s0N.json` | Per-session data: threats, equipment, handouts, readaloud |
| `data/hunters.json` | Hunter identity, nav, feed picker |

**Adding content:** Edit the JSON file. No HTML edits needed. No deployment changes.

---

## Handout Types

All handout entries live in `data/sessions/s0N.json` → `handouts[]`.

| type | Renders as | Required fields |
|------|-----------|-----------------|
| `readaloud` | Green prose block | `id`, `label`, `text` |
| `pda` | Amber terminal card | `id`, `from`, `subject`, `body` |
| `document` | Amber monospace + classification stamp | `id`, `label`, `classification`, `body` |
| `image` | Gallery item + feed image | `id`, `label`, `src` |
| `map` | Posted as image handout | `id`, `label`, `src` |
| `classified` | Keeper sees full content; players see REDACTED bars | `id`, `label`, `body` |
| `tone` | Italic atmospheric line, no sender/timestamp | `id`, `label`, `text` |
| `linecard` | Per-recipient scripted line with distortion; non-recipients see redacted notice | `id`, `label`, `character`, `recipient`, `lines[]`, `intensity` |
| `scan` | BIM scanner result — status pip + reading value | `id`, `label`, `subject`, `reading`, `status` (nominal/trace/alert/critical) |

**Ordering:** Array order = keeper posting order. Arrange by scene sequence top-to-bottom.

---

## CSS File Assignment

Never mix stylesheets. Each page type has exactly one CSS file.

| CSS file | Use for | Notes |
|----------|---------|-------|
| `player.css` | Player-facing pages | Green palette |
| `keeper.css` | Keeper-facing pages | Purple palette; body opens with `.keeper-banner` div |
| `mission-prep.css` | Mission prep docs | Requires all 21 `--mp-*` CSS variables in `:root` |
| `briefing.css` | CAMPBELL briefing fragments | No `<html>`/`<head>`/`<body>` |

---

## Navigation Injection

Nav is injected dynamically — never hardcode nav links in HTML.

- **Player pages:** `<nav id="player-nav"></nav>` in `<header>` + `<script src="../player-nav.js">` (adjust path for subdirectory)
- **Keeper pages:** include `missions/keeper-nav.js`
- Scripts auto-detect subdirectory and adjust relative paths

Player nav order (12 items): Briefing · Operatives · Bestiary · Logs · Artefacts · Missions · Evidence · Contacts · Report · Queue · Incidents · Feed

---

## D1 Migration Convention

New table = new numbered migration file in `workers/migrations/`.

```sql
-- workers/migrations/012_example.sql
CREATE TABLE IF NOT EXISTS example (
  id TEXT PRIMARY KEY,
  state TEXT,
  updated_at TEXT
);
```

Apply locally first, then remotely:
```bash
wrangler d1 execute portal-db --local --file=workers/migrations/012_example.sql
wrangler d1 execute portal-db --remote --file=workers/migrations/012_example.sql
```

---

## Playwright Test Conventions

- Tests target `wrangler pages dev .` on port 8788
- Spec files read source JSON at module level (data-driven — resilient to new content)
- `feed.spec.js` + `map.spec.js`: use `page.route()` for API mocking
- `d1-round-trip.spec.js`: real local D1 — no mocking
- `bestiary.spec.js`: mocks `/api/v1/session/active` → `{ session_id: "wN" }` for session gating
- New features → add untested items to `tests/TESTING-NOTES.md`

---

## Feed Roll Thresholds

| Result | Range |
|--------|-------|
| Failure | 6- |
| Partial success | 7–10 |
| Success | 11–12 |
| Advanced success | 13+ |

---

## Accessibility Patterns (added 2026-03-28)

### Keyboard-Accessible Clickable Elements

For any `<div>` or `<span>` that acts as a button/checkbox, use the helper pattern from `hunters/hunter.js`:

```js
function makeKeyboardAccessible(el, role) {
  el.setAttribute('tabindex', '0');
  if (role) el.setAttribute('role', role);
  el.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
}
```

- `role="button"` for toggle/action elements (track pips, feed entries, move cards)
- `role="checkbox"` + `aria-checked` for checkable elements (beat boxes, choice opts)
- `aria-expanded` for collapsible sections (feed entries, campbell batch headers, evidence groups)
- Auth gating: set `tabindex="-1"` on non-editable elements when auth restricts interaction

### Focus-Visible Convention

Each CSS file uses its own accent variable for the focus ring:
- `player.css` → `var(--green)`
- `keeper.css` → `var(--keeper)`
- `hunters/hunter.css` → `var(--accent)`
- `handouts/dossier/dossier.css` → `var(--accent, var(--green, #2ecc71))` (fallback chain)

### Skip-to-Main Link

Injected by `player-nav.js` / `keeper-nav.js`. CSS: `position: fixed; top: -200px` (not `absolute` or percentage — those can be visible in short headers). All pages must have `<main id="main-content">`.

### Save Button Live Regions

All save buttons use `aria-live="polite"` so screen readers announce status changes (SAVING / SAVED / OFFLINE / ERROR).

### Keyboard Shortcuts Guide

Press `?` on any player page to open shortcuts overlay. Injected by `player-nav.js`. Page-context-aware: shows different hints for feed, hunter pages, evidence/logs pages.
