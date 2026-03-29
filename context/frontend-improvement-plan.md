# P.O.R.T.A.L — Frontend Design Improvement Plan

> **Created:** 2026-03-28
> **Safety commit:** `5e4ed0f` on `dev` (pushed to origin)
> **Scope:** Accessibility, UX, contrast, semantic HTML, responsive polish
> **Principle:** Preserve the existing military-surveillance aesthetic — fix gaps, don't redesign
> **Status:** Phases 1–5 COMPLETE (2026-03-28). Commits: `9c9ebe3` (Phase 1–2), `46a8757` (Phase 3–5). Only 5.3 (responsive breakpoints) deferred.

---

## Phase 1: Global Accessibility Foundation (CSS-only)

Lowest risk, highest impact. Pure CSS additions — no HTML or JS changes.

### 1.1 — Focus-visible indicators

**Files:** `player.css`, `keeper.css`, `hunters/hunter.css`, `briefing.css`, `handouts/dossier/dossier.css`

Add to each file:

```css
*:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 2px;
}
```

Keeper variant uses `--keeper` instead of `--green`. Hunter variant uses `--accent`.

**Why:** Currently zero visible focus states anywhere — keyboard users can't navigate. WCAG 2.4.7 failure.

### 1.2 — Reduced motion preference

**Files:** All CSS files + `feed.html` inline styles

Add to each file:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Why:** Scanline pulse, fadeUp, blink animations all run regardless of user preference. Affects users with vestibular disorders.

### 1.3 — Minimum text size bump

**Files:** `player.css`, `keeper.css`, `hunters/hunter.css`, `briefing.css`

Audit and raise all instances of `font-size` below `0.7rem` to at least `0.7rem` (11.2px). Key targets:

| Current | Location | Raise to |
|---------|----------|----------|
| 0.55rem | `.ccard-status`, `.ccard-case`, `.rel-tag` | 0.65rem |
| 0.62rem | `.ccard-role`, `.section-header-sm .section-tag` | 0.68rem |
| 0.65rem | `.filter-btn`, `.blur-notice`, `.section-tag` | 0.7rem |
| 0.6rem  | briefing.css timestamps/labels | 0.68rem |

**Why:** Small monospace text on dark backgrounds compounds contrast issues. Below ~11px is hard to read on most screens.

### 1.4 — Touch target padding

**Files:** `player.css`, `keeper.css`, auth styles in `auth.js`

Increase padding on small interactive elements for mobile:

```css
@media (max-width: 900px) {
  .nav-toggle { padding: 10px 16px; min-height: 44px; }
  .filter-btn { padding: 10px 16px; }
}
```

Auth.js inline styles: increase login button and input padding at small widths.

**Why:** Nav toggle at `6px 12px` (~24px tall) is well below WCAG 44x44px minimum touch target.

### 1.5 — Verification

- [ ] Tab through every page — green/purple/accent outline visible on all interactive elements
- [ ] Enable "reduce motion" in OS settings — no animations play
- [ ] Check smallest text is readable on mobile
- [ ] Tap nav toggle on phone — easy to hit

---

## Phase 2: ARIA & Keyboard Support (JS changes)

Medium risk — touches interaction code. Test each file after editing.

### 2.1 — Track pips: keyboard + ARIA (hunter.js)

Track pips (`.track-pip`) are clickable divs. Add:

- `tabindex="0"` and `role="button"` to each pip
- `aria-label="Harm pip 3 of 7"` (dynamic)
- `aria-pressed="true/false"` reflecting filled state
- Keydown handler: Enter/Space triggers same logic as click

**Files:** `hunters/hunter.js` (pip rendering + click handler)

### 2.2 — Beat boxes: keyboard + ARIA (hunter.js)

Beat boxes (`.beat-box`) same pattern:

- `tabindex="0"`, `role="checkbox"`, `aria-checked="true/false"`
- `aria-label="Beat 2 of 5: [beat text]"`
- Enter/Space toggles

**Files:** `hunters/hunter.js` (beat click handler)

### 2.3 — Choice options: keyboard + ARIA (hunter.js)

Choice options (`.choice-opt`) — these are already `<label>` wrapping `<input type="checkbox">` on some pages but plain divs on others. Normalize:

- Ensure all use `<label>` + hidden `<input type="checkbox">`
- Or add `role="checkbox"`, `tabindex="0"`, `aria-checked`, Enter/Space

**Files:** `hunters/hunter.js`, hunter HTML pages

### 2.4 — Feed entry expansion: keyboard + ARIA (feed.html)

Feed entries expand on click. Add:

- `tabindex="0"`, `role="button"` on `.feed-entry`
- `aria-expanded="true/false"`
- Enter/Space triggers expand/collapse
- Same for move cards (`.move-card`)

**Files:** `feed.html` inline JS (feed entry click handler ~line 1600)

### 2.5 — Collapsible sections: keyboard + ARIA

Campbell-logs batch headers, evidence thread groups — clickable divs that expand/collapse:

- Add `tabindex="0"`, `role="button"`, `aria-expanded`
- Keydown Enter/Space handler
- Or convert to native `<details>`/`<summary>` (preferred but higher-touch)

**Files:** `campbell-logs.html`, `evidence.html`

### 2.6 — Save status aria-live

Add `aria-live="polite"` to save button containers so screen readers announce "SAVING...", "SAVED", "ERROR", "OFFLINE" state changes.

**Files:** `hunters/hunter.js` (save button), `feed.html` (composer), `the-lab.html`, `lab-incidents.html`, `reports/player-report.html`

### 2.7 — Active nav item

Add `aria-current="page"` to the active navigation link in `player-nav.js` and `keeper-nav.js`.

**Files:** `player-nav.js`, `missions/keeper-nav.js`

### 2.8 — Mobile menu focus management

When hamburger menu closes (link click or toggle), return focus to the toggle button. When menu opens, move focus to first link.

**Files:** `player-nav.js`, `missions/keeper-nav.js`

### 2.9 — Auth error announcement

Add `role="alert"` to the login error message div so screen readers announce failures.

**Files:** `auth.js`

### 2.10 — Verification

- [ ] Tab through hunter page — can reach and toggle every pip, beat, choice via keyboard
- [ ] Tab through feed — can expand/collapse entries and move cards
- [ ] Screen reader (NVDA/VoiceOver) announces save status changes
- [ ] Screen reader announces active page in nav
- [ ] Login error announced by screen reader
- [ ] Mobile menu: focus moves to first link on open, returns to toggle on close

---

## Phase 3: Color & Contrast (CSS-only)

Low risk. Visual-only changes — verify with contrast checker.

### 3.1 — Lighten --text-dim

Current `--text-dim: #5a7a62` on `--bg: #080c0a`:
- Contrast ratio: ~2.8:1 (fails WCAG AA 4.5:1 for normal text)

Proposed: `--text-dim: #7a9a82` — contrast ratio ~4.6:1 (passes AA).

**Files:** `player.css` `:root`, `keeper.css` `:root`, `hunters/hunter.css` inherits from player

**Risk:** This is the most visually noticeable change. The dim text will be slightly brighter. Test on multiple pages to ensure the "faded" aesthetic still works.

### 3.2 — Lighten --green-dim

Current `--green-dim: #1a7a43` on dark backgrounds:
- Contrast ratio: ~3.1:1 (fails AA)

Proposed: `--green-dim: #28945a` — contrast ratio ~4.6:1.

**Files:** `player.css`, `keeper.css`

### 3.3 — Reduce grid overlay opacity

Current: `body::after { opacity: 0.4; }` — grid lines interfere with text readability on dense pages.

Proposed: `opacity: 0.25` — grid still visible as atmosphere but doesn't compete with content.

**Files:** `player.css`, `keeper.css` (if grid overlay present)

### 3.4 — Status badge contrast audit

Check each status color against its background:

| Badge | Color | Background | Action |
|-------|-------|-----------|--------|
| .missing | #f0a500 | --bg2 | Likely OK |
| .deceased | #e05050 | --bg2 | Likely OK |
| .cooperative | #50c8c8 | --bg2 | Check |
| .unresolved | --text-dim | --bg2 | Fix with 3.1 |

Use https://webaim.org/resources/contrastchecker/ to verify each.

**Files:** `player.css` (`.ccard-status` variants)

### 3.5 — Verification

- [ ] Run all pages through WAVE or axe browser extension
- [ ] Verify --text-dim still reads as "secondary" (not primary) text
- [ ] Grid overlay still creates atmosphere but doesn't obscure text
- [ ] All status badges pass 4.5:1 contrast ratio

---

## Phase 4: Semantic HTML Polish (HTML changes)

Medium risk — touches page structure. Test navigation and screen reader behaviour.

### 4.1 — Skip-to-main link

Add to `player-nav.js` and `keeper-nav.js` (injected before nav):

```html
<a href="#main-content" class="skip-link">Skip to content</a>
```

CSS (visually hidden until focused):

```css
.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 200;
  padding: 8px 16px;
  background: var(--green);
  color: var(--bg);
  font-family: 'Share Tech Mono', monospace;
  text-decoration: none;
}
.skip-link:focus { top: 8px; }
```

Add `id="main-content"` to `<main>` on every page (most already have `<main>`).

**Files:** `player-nav.js`, `missions/keeper-nav.js`, `player.css`, `keeper.css`

### 4.2 — Card semantics

Convert card container divs to `<article>` where content is self-contained:

- `.ccard` (contacts.html) → `<article class="ccard">`
- `.beast-card` (index.html bestiary) → `<article>`
- `.ev-card` (evidence.html) → `<article>`
- `.log-entry` (campbell-logs.html) → `<article>`

**Note:** This is a search-and-replace in the rendering JS — the HTML is generated dynamically on most pages.

**Files:** `contacts.html` JS, `index.html` JS, `evidence.html` JS, `campbell-logs.html` JS

### 4.3 — Form associations on hunter pages

Wrap stat inputs in `<fieldset>` with `<legend>`:

```html
<fieldset class="stats-row">
  <legend class="sr-only">Character Stats</legend>
  <!-- stat inputs -->
</fieldset>
```

Add `<label>` elements (visually hidden if needed) for each stat input.

**Files:** `hunters/reed.html`, `hunters/rex.html`, `hunters/john.html`, `hunters/sven.html`, `hunters/alan.html`

### 4.4 — Heading hierarchy audit

Ensure every page has exactly one `<h1>` and headings don't skip levels. Key fixes:

- `index.html`: hero title should be `<h1>`, not styled div
- All pages: verify h1 → h2 → h3 cascade

**Files:** Various HTML pages

### 4.5 — Verification

- [ ] Screen reader (NVDA/VoiceOver) can navigate by headings — hierarchy makes sense
- [ ] Skip link appears on Tab press, jumps to main content
- [ ] Card elements announced as "article" by screen reader
- [ ] Stat inputs announced with labels by screen reader

---

## Phase 5: Print & Responsive Polish

Lowest priority. Nice-to-have refinements.

### 5.1 — Print stylesheet for mission prep

Add `@media print` block to `mission-prep.css`:

```css
@media print {
  body { background: white; color: black; }
  .keeper-nav-top { display: none; }
  .page { box-shadow: none; border: none; max-width: 100%; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 0.8em; }
}
```

**Files:** `mission-prep.css`

### 5.2 — Print stylesheet for dossiers

Similar approach for `handouts/dossier/dossier.css`.

**Files:** `handouts/dossier/dossier.css`

### 5.3 — Responsive breakpoint normalisation

Current breakpoints are inconsistent across files (580/600/640/700/820/900px). Consider standardising to three tiers:

- **Mobile:** 600px
- **Tablet:** 768px (new — currently missing)
- **Desktop:** 900px

This is a larger refactor — only do if time permits. Low impact since current breakpoints work fine individually.

**Files:** All CSS files

### 5.4 — Verification

- [ ] Print a mission prep page — readable, no dark backgrounds, no nav
- [ ] Print a dossier page — clean output
- [ ] Check tablet-width rendering (768px) on affected pages

---

## Implementation Order

| Step | Phase | Est. Complexity | Files touched |
|------|-------|----------------|---------------|
| 1 | 1.1 Focus-visible | Low | 5 CSS files |
| 2 | 1.2 Reduced motion | Low | 5 CSS files + feed.html |
| 3 | 3.1-3.3 Contrast fixes | Low | 2 CSS files |
| 4 | 1.3 Text size bump | Low | 4 CSS files |
| 5 | 1.4 Touch targets | Low | 2 CSS files + auth.js |
| 6 | 2.7 Active nav ARIA | Low | 2 JS files |
| 7 | 2.9 Auth error ARIA | Low | 1 JS file |
| 8 | 4.1 Skip-to-main | Low | 2 JS + 2 CSS files |
| 9 | 2.1-2.3 Hunter keyboard | Medium | hunter.js + 5 HTML |
| 10 | 2.4 Feed keyboard | Medium | feed.html |
| 11 | 2.5 Collapsible ARIA | Medium | 2 HTML files |
| 12 | 2.6 Save aria-live | Medium | 5 files |
| 13 | 2.8 Menu focus mgmt | Medium | 2 JS files |
| 14 | 4.2-4.4 Semantic HTML | Medium | ~10 files |
| 15 | 3.4 Badge contrast audit | Low | 1 CSS file |
| 16 | 5.1-5.3 Print + responsive | Low | 3 CSS files |

**Recommended:** Do steps 1-8 in one session (all low-complexity, high-impact). Steps 9-13 in a second session. Steps 14-16 as cleanup.

---

## Testing Strategy

After each phase, run:

```bash
npx playwright test          # Full E2E suite (615 tests)
```

Key manual checks:
- Tab through 3 pages (index, feed, hunter) — focus visible?
- Enable OS reduced-motion — animations stopped?
- WAVE or axe browser extension — error count decreased?
- Mobile viewport (375px) — all buttons tappable?

---

## Rollback

If any phase causes visual regression or test failures:

```bash
git revert HEAD              # Undo last commit
# or
git reset --hard 5e4ed0f     # Return to safety point
```
