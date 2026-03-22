# P.O.R.T.A.L — Feature Flags & URL Parameters

URL parameters that change behaviour in specific pages. Pass on the URL, e.g. `feed.html?mouseover=true`.

---

## `feed.html` — Live Session Feed

### `?mouseover=true`

**Default:** off (click-to-expand)
**When on:** restores legacy CSS `:hover` expand behaviour for feed entries and move cards

**What changes:**
- **Off (default):** clicking a `.feed-entry` or move card toggles the `.expanded` class, which CSS uses to show/hide the `.feed-outcome-detail` block. Multiple entries can be open simultaneously. Click again to collapse. Clicking a button (e.g. ROLL) does not toggle the card.
- **On (`?mouseover=true`):** the `.no-hover` class is NOT added to `<body>`, so the original CSS `:hover .feed-outcome-detail` rule is active. Hovering over any entry shows the detail. Click behaviour is disabled.

**Implementation:** `player-nav.js`-independent, handled inside `feed.html`. On boot:
```js
var hoverMode = new URLSearchParams(location.search).get('mouseover') === 'true';
if (!hoverMode) document.body.classList.add('no-hover');
```
CSS selector `body.no-hover .feed-entry:hover .feed-outcome-detail` suppresses hover when off.

**Use case:** A/B testing with players during a session. Share the URL with `?mouseover=true` to compare.

---

---

## `?session=wN` — Session Override (all session-aware pages)

**Scope:** any page that includes `session-state.js` — `index.html`, hunter pages, mission pages, `lab-incidents.html`, etc.

**Default:** off — active session determined by D1 API (`/api/v1/session/active`), falling back to localStorage cache.

**When on:** forces the active session to `wN` (e.g. `w1`, `w2`, `w3`) for that page load only. Does not write to localStorage or D1 — the override is URL-only and temporary.

**What changes:**
- All `data-session-from` / `data-session-until` elements are shown/hidden as if the campaign is at week `wN`
- Bestiary on `index.html`: use `?session=w1` to see Eszter pre-reveal only; `?session=w2` to see both entities with blurred Cartographer; `?session=w3` for both fully revealed
- Session indicator in the keeper banner (if on a keeper page) does not update — the override is silent on player pages

**Implementation:** `session-state.js`, highest-priority branch:
```js
var params = new URLSearchParams(window.location.search);
if (params.get('session')) return Promise.resolve(params.get('session'));
```
URL param is checked before localStorage and D1. Value is validated against `data/sessions.json`; unknown values fall back to default resolution.

**Known valid values:** `w1`, `w2` (add to `data/sessions.json` as sessions are added).

**Use cases:**
- Testing session-gated content without changing the live session in D1
- Reviewing what players see at a specific campaign point
- Sharing a URL with a specific session state for screenshots or review

---

## Adding New Feature Flags

When you add a URL-parameter flag to any page:
1. Add it here with: page scope, parameter name, default value, behaviour diff, and implementation note.
2. Add corresponding test cases (or backlog entries) in `tests/TESTING-NOTES.md`.
