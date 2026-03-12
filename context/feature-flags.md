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

## Adding New Feature Flags

When you add a URL-parameter flag to any page:
1. Add it here with: page scope, parameter name, default value, behaviour diff, and implementation note.
2. Add corresponding test cases (or backlog entries) in `tests/TESTING-NOTES.md`.
