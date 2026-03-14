# P.O.R.T.A.L — Site & Design Reference
*Hand this file to Claude when building or editing pages for this site.*
*Last updated: Session 02 post-prep (pre-play).*

---

## HOW TO USE THIS FILE

Hand this file when:
- Building a new page (player, keeper, mission-prep, briefing, or hunter story)
- Extending an existing page with new sections or navigation
- Adding a session to the reports or a week to the CAMPBELL queue
- Checking CSS conventions, variable names, or class patterns

For world lore, NPC detail, CAMPBELL voice, and secrets → use `worldbuilding-lore.md`

### Workflow Split

**This workflow (Claude.ai):** Lore, NPC writing, case design, CAMPBELL voice, between-session content, scene structure, keeper narrative material, HTML drafts, and markdown briefs for Claude Code. Does not need access to the live repo.

**Claude Code:** CSS integration, page architecture, Workers, D1, live site deployment. Receives markdown briefs and HTML reference drafts — does not need to understand campaign lore to build correctly.

**Between-session content pages** ship as two files:
- **HTML draft** (`lab-incidents.html` pattern) — correct content and structure, close to site aesthetic, built here for preview and Keeper reference
- **Markdown brief** (`lab-incidents-brief.md` pattern) — handed to Claude Code for integration into the live site

The markdown brief always includes: which CSS file to use, which existing pages to reference for patterns, localStorage keys in use, keeper/player split, badge colours, mobile requirements, and any forward links to pages not yet built.

When the Keeper asks you to build a page:
1. Read Part 3 (Site Architecture) — where does this page fit?
2. Read Part 4 (Design System) — which CSS file, which classes?
3. At the end of your output, list any new CSS classes you defined that aren't in the shared stylesheets

---

## PART 3 — SITE ARCHITECTURE

### Current Pages (built and delivered)

| File | CSS | Audience | Description |
|------|-----|----------|-------------|
| `index.html` | `player.css` | Player | Main player landing — missions, links to case briefings |
| `missions-index.html` | `player.css` | Player | Player-facing mission archive |
| `hunters/rex.html` | `hunter.css` + accent | Player | Rex Bangley — playbook section + 3 arcs, keeper sections blurred |
| `hunters/alan.html` | `hunter.css` | Player | Alan Frazier — playbook section + 3 arcs, keeper sections blurred |
| `hunters/reed.html` | `hunter.css` + accent | Player | Reed Atwood — playbook section + 3 arcs, keeper sections blurred |
| `hunters/sven.html` | `hunter.css` + accent | Player | Sven — playbook section + 3 arcs, keeper sections blurred |
| `the-lab.html` | `player.css` | Player | Research Lab team playbook — XP track, moves/assets checklists, ally/enemy, D1-backed |
| `campbell-briefings.html` | `briefing.css` | Player | CAMPBELL priority queue — week switcher, renders from `data/briefings.json` |
| `data/briefings.json` | — | — | All queue weeks: week metadata + `items[]` (cases + section labels). Add one `weeks[]` entry per week. |
| `keeper.html` | `keeper.css` | Keeper | Keeper mission index |
| `references.html` | keeper inline | Keeper | Keeper dossiers — hunters, PORTAL, MESA, NPCs |
| `entities.html` | keeper inline | Keeper | Entity bestiary — confirmed + theoretical + database |
| `02-portal-keeper-cases.html` | keeper inline | Keeper | All 4 active cases, keeper detail |
| `01-a-promise-is-a-promise.html` | `mission-prep.css` | Keeper | Session 01 full prep (amber/brown palette) |
| `02-something-that-wants-to-be-known.html` | `mission-prep.css` | Keeper | Session 02 full prep (green/forest palette) — includes inline SVG district map, read-aloud blurbs (.read-aloud class), MESA confrontation appendix with Rook stat block |
| `arcs.html` | `keeper.css` | Keeper | Arc tracker — renders entirely from `data/hunter-arcs.json`. All 12 hunter arcs (4 hunters × 3 arcs) + 6 cross-hunter intersections. Beat progress, status (DORMANT/ACTIVE/RESOLVED), and resolution notes saved to localStorage (`portal-arcs-v1`). |
| `threads.html` | `keeper.css` | Keeper | Campaign thread + clock tracker — renders from `data/portal-threads.json` (14 threads: faction/mystery/personal/case categories) and `data/portal-clocks.json` (countdown clocks with pip tracks, segment labels, advancement notes). Read-only display; update JSON files after each session (see runbook step 2.10). |
| `report.html` | `keeper.css` | Keeper | Keeper post-session field report — session tab switcher (M01/M02), outcome, hunter cards, per-session scene notes, thread tags, clock status, seeds. Saves to D1. "Copy for Claude" exports Markdown. |
| `reports/player-report.html` | `player.css` | Player | Operative Field Report — week + hunter selector, 5 rating pips, general feedback, per-week scene questions. Unique save per week+hunter, D1-backed. Always-visible `// KEEPER DEBRIEF` section at bottom fetches keeper field report for each week (`GET /api/v1/reports/{S01\|S02}/state`) and shows outcome badge + directive + summary (pending placeholder if not yet filed). Linked from player nav as "Report". |
| `reports/keeper-review.html` | `keeper.css` | Keeper | All-reports review — W01/W02 tabs, auto-loads on click, fetches all 5 hunter reports via `Promise.all`, renders 5-col responsive card grid. Filed/not-filed badge, rating pips, text fields, scene notes per hunter. No new API needed — reads existing `player-reports` endpoints. |
| `contacts.html` | `player.css` | Player | NPC Contact Directory — fetches `portal-npcs.json`, renders player-visible NPCs grouped by affiliation (PORTAL staff / field contacts / unknown). Static render, no D1 dependency. |
| `lab-incidents.html` | `player.css` + inline | Player | Between-session incident log. Fully data-driven from `data/incidents.json`. Week tab switcher (W1 closed/empty, W2 active). Incident types: `choice` (3-button pick + optional custom textarea), `open` (freetext multi-submit), `informational` (read-only), `teaser` (email + log excerpts). Single **SAVE RESPONSES** button collects all choice answers → `PUT /api/v1/incidents/{week}/state` → locks buttons; also writes localStorage. Open incidents keep independent SUBMIT button → `POST /api/v1/incidents/{id}/responses`. EXPORT FOR KEEPER on open incidents. |
| `feed.html` | `player.css` + inline | Player + Keeper | Live session tool — split layout (feed left, resizable panel right; drag handle saves width to `localStorage('portal_panel_width')`). Hunter picker; **Moves tab** (always-active + playbook + basic moves, inline modifier + ROLL, hover shows description + outcome rows + questions for Investigate/Read); **Contacts tab** (player-visible NPCs, double-click to add per-hunter private note stored in `localStorage('portal_contact_notes')` as `{hunter_id:{npc_id:text}}`); **Handouts tab** (images/maps posted by keeper, session tabs M01/M02, deduplicated 2-column gallery, click to open lightbox — documents/classified/readaloud/PDA entries are feed-only, not shown in gallery); **MAP tab** (player district map — mission session selector, locked/unlocked grid cells, detail card on click, SYNC MAP button). Bottom composer for any player to post to the feed. Feed entries **expand on click** (toggle `.expanded` class); click again to collapse; multiple can be open simultaneously. Roll entries show breakdown `[d1 + d2 + stat + mod = total]`, click shows specific outcome text + question list (for Investigate a Mystery / Read a Bad Situation). **Smart polling**: 6s when tab has focus, 60s when tab hidden or window blurred (immediately re-polls on regain focus). 5s auto-save for harm/luck/xp changes. `?mouseover=true` URL flag restores legacy CSS `:hover` expand behaviour (for A/B testing). Keeper mode (5× logo click) replaces player UI with 6 tabs: **OPERATIVES** (click hunter to view sheet + moves), **CONTACTS** (session filter M01/M02/ALL + NPC visibility toggles persisted to localStorage), **REFERENCES** (MoTW rules cheat sheet: outcomes, harm moves, luck, XP, end-of-session, principles, keeper moves, monster moves, phenomena moves, investigate questions, keeper page links), **THREATS** (session selector, entity stat block from `portal-entities.json`, threats/minions/bystanders + equipment from `session-data.json`), **HANDOUTS** (session selector; per-session list of all handout items with POST / RE-POST buttons persisted to `localStorage('portal_posted_handouts')`; classified items show purple pip; **CLEAR HANDOUTS** button removes all non-message entries from feed DOM + localStorage + D1), **MAP** (keeper district map — mission selector, grid with order badges [keeper-only, hidden from players], NPC pills per cell, unlock toggle, visited button ○/✓, bulk actions: REVEAL ALL / RESET MAP / ALL VISITED / CLEAR VISITED; state schema `{ u: {loc_id: true}, v: {loc_id: true} }` saved to D1 `map_state` table). **CLEAR FEED** (keeper button): posts a `type:'clear'` sentinel to D1; keeper's feed clears immediately; polling clients clear on receipt; `initialLoad()` discards all entries before the sentinel (history still accessible via "↑ LOAD EARLIER HISTORY"). Keeper tab row uses `overflow-x: auto` with styled thin scrollbar for narrow viewports. |

---

### Feed Handout Types — Reference for New Session Data

All handouts live in `data/session-data.json` under `handouts[]` per session entry. The keeper posts them from the HANDOUTS tab during play. Each type renders differently in the player feed. Claude should use these creatively when authoring session data.

| type | Player sees | Keeper POST button | Player gallery? | Best used for |
|------|-------------|-------------------|-----------------|---------------|
| `readaloud` | Green bordered block with `// KEEPER READALOUD` eyebrow + prose text | ▶ POST | No | Scene-setting narration, cold opens, atmosphere — read aloud at the table |
| `pda` | Amber PDA terminal card with FROM/SUBJ header, body text, PORTAL FIELD COMMS chrome | ▶ POST | No | In-universe messages from CAMPBELL, Director Leech, or other senders — delivered mid-scene |
| `document` | Amber monospace card with classification stamp (e.g. FIELD EVIDENCE — S02), title, preformatted body | ▶ POST | No | Physical documents the hunters find — whiteboards, partial emails, notebooks, reports |
| `image` | Captioned photo in 2-column gallery + feed thumbnail | ▶ POST | Yes (2-col) | Scene images, locations, character portraits, artefacts |
| `map` | Captioned image in 2-column gallery + feed thumbnail | ▶ POST / ↺ RE-POST | Yes (2-col) | District/location maps — posted from Keeper HANDOUTS tab like any other image |
| `classified` | Black redacted block with 3 censorship bars + `[ CLASSIFIED — KEEPER ACCESS ONLY ]` | ▶ POST | No | Keeper-only reminders, NPC private notes, plot flags — players know *something* arrived but can't read it |

**JSON shape for each type:**
```json
{ "id": "s02-ra-01",  "type": "readaloud",  "label": "Scene Title",     "text": "Prose..." }
{ "id": "s02-pda-01", "type": "pda",        "from": "CAMPBELL",         "subject": "SUBJ LINE", "body": "Body..." }
{ "id": "s02-doc-01", "type": "document",   "label": "Doc Title",       "classification": "FIELD EVIDENCE — S02", "body": "Preformatted text..." }
{ "id": "s02-img-01", "type": "image",      "label": "Caption",         "src": "images/filename.png" }
{ "id": "s02-map-01", "type": "map",        "label": "Map Title",       "src": "images/map.png", "_note": "keeper note" }
{ "id": "s02-cl-01",  "type": "classified", "label": "Keeper Note — X", "body": "Private text..." }
```

**Naming convention:** `s{session_num}-{type_abbrev}-{nn}` e.g. `s02-ra-01`, `s02-pda-03`, `s02-doc-02`, `s02-classified-01`.

**Creative notes for future sessions:**
- `pda` from unexpected senders (MESA, a bystander with the portal number, an unknown domain) creates intrigue
- `document` works well for anything physical: business cards, receipts, torn pages, transcripts, lab reports
- `classified` is great for keeper-only scene reminders that appear as incoming transmissions — players feel the information asymmetry
- `readaloud` + matching `image` posted together creates strong visual narrative moments
- Ordering in `handouts[]` sets the keeper panel display order — arrange narratively, not by type

---

### Upcoming Pages (planned, not yet built)

**Immediate priority:** *(feed.html and contacts.html are now built — see Current Pages above)*

**Player-facing:**

| Page | CSS | Priority | Description |
|------|-----|----------|-------------|
| `hunters.html` | `player.css` | HIGH | Hunter index — all 4 hunters, one-liners, links to story pages |
| `case-archive.html` | `player.css` | MEDIUM | Chronological closed case log — grows each session |
| `glossary.html` | `player.css` | MEDIUM | In-universe PORTAL terminology, written in CAMPBELL's voice |
| `campbell-logs.html` | `player.css` | MEDIUM | CAMPBELL anomaly log page — Teddy Brandt's discovery of Privacy Protocol 7 and three flagged log excerpts. Teased in `lab-incidents.html`. Do not add a link from `lab-incidents.html` until this page exists. |

**Keeper-facing:**

| Page | CSS | Priority | Description |
|------|-----|----------|-------------|
| `missions/player-reports-review.html` | `keeper.css` | HIGH | Review all player field reports for a given week — aggregated ratings + notes side by side |
| `secrets.html` | `keeper.css` | MEDIUM | Active secrets tracker — what's hidden, what would crack it open |
| `countdowns.html` | `keeper.css` | MEDIUM | All active countdowns in one dashboard view |

---

### Adding a New CAMPBELL Queue Week

The queue page (`missions/campbell-briefings.html`) renders entirely from `data/briefings.json`. To add Week 03 after a session:

1. Append a new entry to the `"weeks"` array in `data/briefings.json`
2. Set the previous week's `"status"` to `"closed"` in the same file
3. That's it — the new tab appears automatically, the renderer handles all HTML

**No HTML files to create.** See FORMAT 2 in Part 10 for the exact JSON schema.

**Case colour assignments (briefing.css):**
- Case A → amber (`case-a`)
- Case B → green (`case-b`)
- Case C → purple (`case-c`)
- Case D → teal (`case-d`)
- Case E → rose (`case-e`)
- If a case is resolved in a new week, omit the card entirely — its absence is the signal

---

### Adding a New Session to the Reports

After each session, two report config blocks need extending — one in each file. Both follow the same pattern: a JS object keyed by session/week ID.

**Keeper Field Report** (`missions/report.html`) — extend `SESSIONS`:
```js
S03: {
  title: 'Mission Title Here',
  threads: ['THREAD ONE', 'THREAD TWO', ...],   // active story threads for this session
  clocks: [
    { id: 'clock-id', label: 'Clock description' },
    ...
  ],
  scenes: [
    { id: 'scene-id', label: 'SCENE LABEL', prompt: 'Keeper prompt for this scene.' },
    ...  // 2–4 scenes, grounded in what actually happened
  ]
}
```

**Player Field Report** (`reports/player-report.html`) — extend `WEEKS`:
```js
W03: {
  label: 'Week 03',
  subtitle: 'Mission Title Here',
  scenes: [
    { id: 'scene-id', label: 'SCENE LABEL', prompt: 'Player-facing question about this scene.' },
    { id: 'your-moment', label: "YOUR OPERATIVE'S MOMENT", prompt: 'Was there a moment where your operative really felt like themselves? What was it?' }
  ]
}
```

**Rules for scene prompts:**
- Scene IDs and prompts must be grounded in what actually happened — never invent events
- Player prompts should be open questions, not leading ones
- The `your-moment` scene is recommended for every week as the last entry
- Read the mission prep doc (`missions/NN-*.html`) before writing scene prompts — it is the source of truth

---

### Navigation Conventions

**Player nav links (in order):** Briefing · Operatives · Bestiary · The Lab · Artefacts · Missions · Contacts · Report · Queue · **Feed**. Injected by `player-nav.js` into `#player-nav`. The script handles base-path from any subdirectory (`missions/`, `hunters/`, `reports/`). Never link to keeper pages from player nav. `contacts.html` is at the repo root (not inside `missions/`).

**Keeper pages:** Must open with `<div class="keeper-banner">KEEPER ACCESS ONLY — DO NOT SHARE THIS URL WITH PLAYERS</div>` as the first element in `<body>`. Nav links: Player Site → `../index.html`, Keeper Index → `keeper.html`.

**Hunter story page nav:** Links to `index.html` (Missions) and `hunters.html` (Hunters). Arc nav anchors: `#arc-[name]`. Arc nav `.custom` class for the original PORTAL arc.

---

## PART 4 — DESIGN SYSTEM

### Four Stylesheets — One Per Page

| Stylesheet | Use for |
|------------|---------|
| `player.css` | Player-facing navigation and index pages |
| `keeper.css` | Keeper-facing navigation and index pages |
| `mission-prep.css` | Mission prep documents (colour-agnostic, uses `--mp-*` variables) |
| `briefing.css` | CAMPBELL briefing card pages (player-facing) |

Link paths: from root `/` use `player.css`. From inside `/missions/` use `../player.css`.

**Do not mix stylesheets. Do not write inline styles for classes that exist in a shared stylesheet.**

At the end of every file you build, list any new CSS classes you defined that don't exist in the shared stylesheets, so the Keeper can decide whether to promote them.

---

### Google Fonts

Player/keeper pages:
```html
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
```

Mission-prep pages:
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

---

### Colour Variables — player.css

```css
--bg: #080c0a          /* page background */
--bg2: #0d1410         /* card/panel backgrounds */
--bg3: #111a14         /* secondary surface */
--green: #2ecc71       /* primary accent — active states, logo */
--green-dim: #1a7a43   /* subdued green — borders, eyebrows */
--green-glow: #2ecc7133
--amber: #f0a500       /* warning, partial states */
--amber-dim: #7a5200   /* subdued amber — blur notices */
--red: #e05050
--text: #c8ddd0        /* primary body text */
--text-dim: #5a7a62    /* secondary/dim text */
--border: #1e3428
--border-bright: #2ecc7155
```

### Additional Variables — keeper.css

```css
--keeper: #a855f7      /* keeper accent — replaces green as primary */
--keeper-dim: #4a1d7a
--keeper-glow: #a855f722
--red-dim: #5c1f1f
```

### Hunter accent colours (defined inline on hunter story pages)

Each hunter story page uses a character-specific accent in addition to the base player.css palette:

| Hunter | Accent | Hex |
|--------|--------|-----|
| Rex Bangley | Amber/orange | `#f0a500` / `--amber` (already in palette) |
| Alan Frazier | Teal | `#2ec4b6` |
| Reed Atwood | Teal | `#3ab5b0` |
| Sven | Violet | `#a78bfa` / dim `#4c1d95` |

These are defined as `--teal`, `--teal-dim`, `--teal-glow` or `--violet`, `--violet-dim`, `--violet-glow` in each page's inline `<style>` block.

---

### Key CSS Patterns

**Header (player pages):**
```html
<header>
  <a href="index.html" class="logo">P<span>.</span>O<span>.</span>R<span>.</span>T<span>.</span>A<span>.</span>L</a>
  <nav>
    <span class="status-dot"></span>
    <a href="index.html">Missions</a>
    <a href="hunters.html">Hunters</a>
  </nav>
</header>
```

**Keeper banner (must be first element in body on all keeper pages):**
```html
<div class="keeper-banner">KEEPER ACCESS ONLY — DO NOT SHARE THIS URL WITH PLAYERS</div>
```

**Blurred keeper sections (on player pages):**
```html
<div class="blur-wrap">
  <div class="blur-notice">// KEEPER ACCESS ONLY — DO NOT READ</div>
  <div class="arc-keeper blurred">
    <!-- keeper content here -->
  </div>
</div>
```

**Redacted text:**
```html
<span class="redact">REDACTED TEXT</span>
```

**CAMPBELL terminal block (briefing pages):**
See briefing.css skeleton in the integration reference. Case letter → colour: `case-a` amber, `case-b` green, `case-c` purple, `case-d` teal, `case-e` rose.

**Arc card pattern (hunter story pages):**
Standard arcs use `.arc` with the character's accent colour. Original PORTAL arcs use `.arc.arc-custom` which switches accent to amber. Each arc has: `.arc-header`, `.arc-player` (player-visible), `.blur-wrap > .arc-keeper.blurred` (keeper-only).

---

### mission-prep.css — Required Root Variables

Every mission-prep page must define all 21 `--mp-*` variables in a `<style>:root{}` block. Reference themes:
- Amber/brown: `01-a-promise-is-a-promise.html`
- Green/forest: `02-something-that-wants-to-be-known.html`
- Purple: `02-portal-keeper-cases.html`

---

### Visual Identity Notes

- The site has a dark terminal/lab aesthetic. Scanline overlay via `body::before`, grid overlay via `body::after`.
- Animations: `fadeUp` for hero elements, `pulse` for status dots.
- Everything is uppercase or sentence case — never title case in UI labels.
- Eyebrows and section labels always start with `//`
- Section headers use `font-family: 'Share Tech Mono'`, body uses `'Barlow'` weight 300.
- Cards have a coloured top border stripe: `position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, var(--accent), transparent)`.

---

## PART 5 — SESSION-AWARE CONTENT SYSTEM

The site uses a `data-session-from` / `data-session-until` attribute system to show or hide HTML elements based on the active campaign session. The active session is set by the Keeper via the keeper toggle widget and stored in D1, so all player pages update globally.

### How It Works

- **`session-state.js`** (root) is included at the end of `<body>` on all session-aware pages
- It resolves the active session: URL param `?session=wN` → localStorage → D1 fetch → fallback to last non-upcoming session in `data/sessions.json`
- It applies visibility to every element with a `data-session-*` attribute
- On keeper pages (detected by `.keeper-banner`), it auto-injects the session toggle widget into the banner

### Visibility Attributes

```html
<!-- Show only if current session >= w2 (strict: unknown sessions = hidden) -->
<div data-session-from="w2">...</div>

<!-- Show only if current session <= w1 (permissive: unknown sessions = visible) -->
<div data-session-from="w1" data-session-until="w1">...</div>

<!-- W2 variant of the same card: visible from w2 onwards -->
<div data-session-from="w2">...</div>
```

**Rules:**
- `data-session-from` is **strict**: if the referenced session doesn't exist in `sessions.json`, the element is hidden
- `data-session-until` is **permissive**: if the referenced session doesn't exist, the element stays visible (no upper limit yet)
- Reference future sessions that don't exist yet (e.g., `data-session-from="w3"`) to hide content until that session is added

### `data/sessions.json` — Session Registry

All sessions are listed here in order. `session-state.js` loads this file to determine session ordering.

```json
[
  {
    "id": "w1",
    "label": "WEEK 01",
    "title": "A Promise is a Promise",
    "status": "closed"
  },
  {
    "id": "w2",
    "label": "WEEK 02",
    "title": "Something That Wants to Be Known",
    "status": "active"
  }
]
```

**Fields:**
- `id` — matches the `data-session-from` values used in HTML (`w1`, `w2`, `w3`…)
- `label` — displayed in the keeper toggle buttons
- `title` — mission title, shown as button tooltip
- `status` — `"active"` | `"closed"` | `"upcoming"`. The fallback logic picks the last non-`"upcoming"` session. **The active session should always be the one currently being played.** When a session concludes and the next begins, mark the old one `"closed"` and add a new entry.

### Authoring Session Content Variants

For content that changes between sessions, author **separate HTML elements** for each session state — never try to dynamically alter text within a single card. Co-existing variants are fine; only one will be visible at a time.

**Pattern — same card, different state:**
```html
<!-- W1 state: active, details redacted -->
<div class="mission-card" data-session-from="w1" data-session-until="w1">
  <span class="mission-status active">ACTIVE</span>
  <div class="mission-title">A Promise is a Promise</div>
  ENTITY: <span class="redact">████████████</span>
  <div class="mission-actions">
    <a href="campbell-briefings.html" class="mission-action-link">→ CAMPBELL PRIORITY QUEUE</a>
    <a href="../reports/player-report.html" class="mission-action-link">→ FILE A FIELD REPORT</a>
  </div>
</div>

<!-- W2+ state: completed, details revealed — add id for deep linking from index.html -->
<div class="mission-card" id="mission-01" data-session-from="w2">
  <span class="mission-status completed">COMPLETED</span>
  <div class="mission-title">A Promise is a Promise</div>
  ENTITY: Incorporeal Spirit — Eszter
  <div class="mission-outcome">
    DEBRIEF FILED: POST-SESSION 01 · ...<br>
    ENTITY OUTCOME: ...<br>
    OUTSTANDING: ...
  </div>
  <div class="mission-actions">
    <a href="../reports/s1-memo.html" class="mission-action-link">→ REDACTED LAB MEMO</a>
    <a href="../reports/player-report.html" class="mission-action-link">→ FILE A FIELD REPORT</a>
  </div>
</div>
```

**When to use separate variants vs. a single card:**
- Use **separate variants** when the title, status, outcome text, or entity details change
- Use **`data-session-from` on the whole card** when the card should simply not exist until a session (e.g., M02 card hidden in W1)
- Use **`data-session-from="w1" data-session-until="w1"`** for the "in progress" version of a card that gets replaced in W2+

### Keeper Toggle Widget

All keeper pages include `session-state.js`, which auto-injects W1/W2/… buttons into the `.keeper-banner` div. No manual HTML changes needed on keeper pages. The active session is highlighted. Clicking a button:
1. Saves to localStorage (instant local render)
2. PUT to `/api/v1/session/active` → updates D1 → all player pages reflect the new session on next load

### Testing Session States

Any player page can be previewed in a specific session state without affecting other users:
```
/index.html?session=w1        → preview W1 state
/missions/missions.html?session=w2  → preview W2 state
```
URL param always takes priority. It does **not** update localStorage or D1 — safe for testing without affecting players.

---

## PART 6 — ADDING A NEW CASE

### What the Keeper Provides to Claude

When starting a new case/session, give Claude:
1. **This file** (`worldbuilding-site.md`)
2. **`worldbuilding-lore.md`** — for world, NPC, and entity context
3. **The case brief** — location, entity type, anomaly report, key NPCs, secrets, what the field team investigates
4. **Existing session count** — which week number this is (W2, W3…) and what the previous session resolved
5. **NPC list for this case** — names, affiliations, what players learn vs. what the keeper knows, at which scenes

### What Claude Produces (Full New Case Package)

Claude should produce all of the following in one session, in this order:

#### 1. Mission Prep Doc — `missions/NN-title.html`
- CSS: `../mission-prep.css`, define all 21 `--mp-*` variables in `:root`
- Starts with keeper breadcrumb back to `keeper.html`
- Sections: Overview, CAMPBELL Report, Scene Breakdown (with `.read-aloud` blocks), NPCs, Entity Stat Block, Keeper Moves, Project Veil thread if applicable
- Keeper-only: never linked from player nav

#### 2. CAMPBELL Queue Week — `data/briefings.json`
- Append a new `weeks[]` entry (JSON only — no HTML files)
- Mark previous week `"status": "closed"` in the same file
- CAMPBELL voice (see `worldbuilding-lore.md` Part 2)

#### 3. Session-Aware HTML Updates
All four player-facing areas need updating for the new session:

**`data/sessions.json`** — add the new session entry, mark previous as `"closed"`.

**`missions/missions.html`** — add two card variants:
- `data-session-from="wN" data-session-until="wN"` — ACTIVE state (redacted entity, pending directive). Include a `.mission-actions` block with `→ CAMPBELL PRIORITY QUEUE` and `→ FILE A FIELD REPORT` links.
- `data-session-from="wN+1"` — COMPLETED state (revealed entity, outcome filled). Add `id="mission-NN"` for deep linking from index.html. Include a `.mission-outcome` block with debrief details (entity outcome, casualties, samples, outstanding items) and a `.mission-actions` block with `→ REDACTED LAB MEMO` (if a memo exists) and `→ FILE A FIELD REPORT`.
Also: previous session's ACTIVE card gets `data-session-until="wN-1"` and a new COMPLETED card gets `data-session-from="wN"` (already done from prior sessions).

**`index.html` Session Archive** — session cards are anchor tags (`<a class="session-card">`) linking to `missions/missions.html` (active) or `missions/missions.html#mission-NN` (completed, using the `id` on the completed card). Completed card: `data-session-from="wN+1"`. Upcoming placeholder: plain `<div>` with `style="opacity:0.5"`, not a link.

**`index.html`** — update or add:
- Oracle readout variants (W-current active cases count)
- Session archive card with W-current active / W+1 completed variants
- Beast card for new entity (W-current hidden/blurred variant, W+1 revealed variant)
- Artefact card(s) with appropriate `data-session-from`

**`missions/contacts.html`** — add NPC sections for this case:
- Filter button: `data-session-from="wN"` (hidden until this session)
- NPC section wrapper: `data-session-from="wN"` (entire section hidden until this session)

#### 4. Data File Updates

**`data/portal-npcs.json`** — add or update NPCs for this case. Full schema below.

**`data/portal-entities.json`** — add or update entities for this case.

#### 5. Report Configs
**`missions/report.html`** — add new entry to `SESSIONS` config (threads, clocks, scenes).
**`reports/player-report.html`** — add new entry to `WEEKS` config (scenes, player prompts).

---

### NPC Data Schema — Full Model

Every NPC entry in `data/portal-npcs.json` should use this schema. The `keeper_description`, `keeper_scene_notes`, and `secrets_involved` fields are **never** sent to player-facing endpoints.

```json
{
  "id": "balint-varga",
  "name": "Bálint Varga",
  "affiliation": "civilian",
  "status": "alive",

  "available_from_session": "w2",

  "player_description": "Bálint Varga — grieving student at Keller University. Cooperative but traumatized post-resolution. PORTAL contact on-file.",

  "session_overrides": {
    "w1": {
      "player_description": null
    },
    "w2": {
      "player_description": "Bálint Varga — grieving student at Keller University. Cooperative but traumatized post-resolution. Understands what he inadvertently caused. Willing to assist PORTAL."
    }
  },

  "keeper_description": "Bálint bound Eszter's ghost unintentionally through grief and a promise. He is not malicious — he could not let go. Post-resolution: guilty, relieved, seeking a way to atone. Could become a recurring PORTAL asset if handled carefully. Knows more about the Ash Veil methodology than he realises.",

  "keeper_scene_notes": {
    "s01-initial-contact": "Before players suspect him: sad, withdrawn, protective of Eszter's memory. Won't volunteer information about the locket. Answer questions about Eszter honestly but deflect anything about their last conversation.",
    "s01-confrontation": "When confronted about the promise/locket: breaks down. The binding was not intentional — he made a promise to a dying girlfriend and meant it literally. Not a villain moment; a tragedy moment.",
    "s01-resolution": "After Eszter's release: devastated but present. Will answer any question the team has. The locket detail — he kept it because it was the last thing she touched."
  },

  "secrets_involved": ["secret-eszter-anchor", "secret-ash-veil"]
}
```

**Field reference:**

| Field | Type | Who sees it | Notes |
|-------|------|-------------|-------|
| `id` | string | — | kebab-case, stable |
| `name` | string | both | display name |
| `affiliation` | string | both | `"PORTAL"` / `"MESA"` / `"civilian"` / `"unknown"` |
| `status` | string | both | `"alive"` / `"dead"` / `"missing"` |
| `available_from_session` | string or null | — | `"w1"` / `"w2"` / `null` (null = keeper-only, never player-visible) |
| `player_description` | string | players | default player-facing text; used when no session override applies |
| `session_overrides` | object | — | per-session overrides of `player_description`; null value means not shown |
| `keeper_description` | string | keeper | full arc role, secrets, pressure points, how they behave |
| `keeper_scene_notes` | object | keeper | per-scene guidance keyed by `"sNN-scene-slug"`; keeper prep only, not UI |
| `secrets_involved` | array | — | references secret IDs from `worldbuilding-lore.md` Part 5 |

**`available_from_session` rules:**
- `"w1"` — appears in contacts.html from the first session (PORTAL staff, pre-known NPCs)
- `"w2"` — appears after Session 01 resolves (NPCs first met in S01)
- `"w3"` — appears after Session 02 resolves (NPCs first met in S02)
- `null` — keeper-only, never appears on any player page

**`session_overrides` rules:**
- Keys are session IDs (`"w1"`, `"w2"`)
- `player_description: null` = not visible at this session even if `available_from_session` would allow it
- The last override that defines a field wins (accumulated forward from w1)
- Omit a session from `session_overrides` if the default `player_description` is correct for that session

**Within-session reveals (scenes):** `keeper_scene_notes` is keeper reference material only — it tells the Keeper what information is appropriate at each scene. Actual mid-session reveals will be handled by the future Live Feed / keeper command board (Phase 4). For now, only between-session changes are automated.

---

### NPC Authoring — Two Tracks

When writing NPC entries for a new case, always think in two separate tracks. Ask both questions for every NPC:

**Track 1 — Player site (between sessions)**
> *What do players see on the contacts page after this session resolves?*

This goes in `session_overrides.wN+1.player_description`. It is always a post-resolution state — after the session has ended and the case outcome is known. The contacts page is a between-sessions reference, not a live tool. It should never show mid-mission states like "missing" or "suspect" — those belong in Track 2.

Examples:
- Diane Marsh at W3: "District nurse, Aldermoor District. Recovered after nine days inside the displacement zone. Submitted field notes to PORTAL voluntarily. Cooperative civilian contact."
- Bálint Varga at W2: "Grieving student, Keller University. Cooperative, traumatized post-resolution. Understands what he caused. Willing to assist PORTAL."

**Track 2 — Live feed (during session)**
> *What does the keeper push to players mid-session, scene by scene?*

This goes in `keeper_scene_notes`, keyed by scene slug. It is per-scene guidance for the keeper — what information is appropriate to share at each point in the session. This data will eventually feed the Live Feed command board (Phase 4), where the keeper can push NPC cards to players in real time.

Examples:
- `"s02-scene-1"`: "Diane Marsh — district nurse, missing 9 days. Last seen heading toward the old reservoir. Neighbours describe her as competent and calm. Arthur Okafor knew her professionally."
- `"s02-scene-3"`: "Diane Marsh — located in site office, extraction needed. Has been keeping field notes. Cooperative. The notebook is the valuable thing."

**Key distinction:** If an NPC's state changes meaningfully during a session (rescued, revealed as suspect, killed, allied), Track 1 only captures the final state. Track 2 captures the progression. Never write Track 1 content that reflects an unresolved mid-session state.

---

### Entity Data Schema — Full Model

Entities in `data/portal-entities.json` use an extended schema identical in philosophy to NPCs:

```json
{
  "id": "e-001",
  "designation": "E-001",
  "name": "Eszter",
  "classification": "Incorporeal Spirit — Executioner",
  "case": "S01",
  "status": "resolved",

  "available_from_session": "w1",

  "player_description": "Confirmed entity. Incorporeal spirit bound to a grief anchor. Released — no longer active.",

  "session_overrides": {
    "w1": {
      "player_description": "Unclassified ectoplasmic residue. Field team investigating.",
      "blurred": true
    },
    "w2": {
      "player_description": "Incorporeal spirit, identity: Eszter. Grief-anchor binding released after field resolution.",
      "blurred": false
    }
  },

  "keeper_description": "Full keeper notes: Eszter's history, the promise mechanism, what she wanted, how she could be contacted...",

  "keeper_scene_notes": {
    "s01-first-manifestation": "She appears as environmental disturbance first — cold spots, reflected light, smell of ash. She is not hostile unless the anchor is threatened.",
    "s01-contact-attempt": "If players attempt contact: she responds to Bálint's name. That is the unlock."
  },

  "bim_connection": true,
  "bim_note": "Ash particulate is the BIM fingerprint — same signature as Project Veil substrate.",

  "secrets_involved": ["secret-project-veil", "secret-ash-veil"]
}
```

The `blurred` field in `session_overrides` controls whether the beast card renders with the `.blur-notice` treatment on the player-facing bestiary (index.html). If `blurred: true`, the description is shown dimmed with a keeper-access notice. If `false`, the full description renders clearly.

#### Entity `bestiary{}` object — player-facing bestiary on `index.html`

The player bestiary on `index.html` is **fully data-driven** — no HTML edits needed to add or update beast cards. It fetches `portal-entities.json` and renders entities with `bestiary.show === true`.

Each phase is session-gated with `show_from` / `show_until` (same pattern as `data-session-from/until` on HTML elements). Add a new session-phase by appending to `phases[]` with the correct `show_from`.

```json
"bestiary": {
  "show": true,
  "phases": [
    {
      "show_from": "w1",
      "show_until": "w1",
      "threat": "?",
      "class": "UNCONFIRMED — INCORPOREAL",
      "description": "Player-facing mystery text (HTML allowed)",
      "classified": "⚠ WEAKNESSES: UNDER FIELD ASSESSMENT\nANCHOR OBJECT: Located — recovery directive active",
      "classified_blurred": true,
      "blur_notice": "⚠ FULL PROFILE UNLOCKS POST-SESSION 01"
    },
    {
      "show_from": "w2",
      "threat": "2",
      "class": "INCORPOREAL SPIRIT — EXECUTIONER",
      "description": "Player-facing revealed description (HTML allowed)",
      "classified": "⚠ WEAKNESSES: presence of ash from the promise site\nSTATUS: RESOLVED — PEACEFUL DISPERSAL",
      "classified_blurred": false
    }
  ]
}
```

**Fields:**
- `show`: `true` → entity appears in bestiary; `false` / omitted → skipped (e.g. keeper-only entities)
- `show_from` / `show_until`: session week strings (`"w1"`, `"w2"` etc.) — same logic as HTML `data-session-from/until`. Omit `show_until` for the final phase (visible from that week onward).
- `classified_blurred`: `true` → classified block is blurred with `blur_notice` overlay
- `blur_all`: `true` → entire card is blurred (name, class, description, classified) — use for entities not yet partially revealed
- `blur_notice`: string shown in the blur overlay when `classified_blurred` or `blur_all` is true

**How to add a new entity to the bestiary:** Add a `bestiary{}` object to its entry in `portal-entities.json`. The player bestiary re-renders on next load — no HTML change needed.

---

## PART 7 — CSS CLASSES NOT YET IN SHARED STYLESHEETS

The following classes were defined inline on specific pages and have not been promoted to the shared stylesheets. If you need them, copy from the relevant page or define them inline and flag them at the end of your output.

**From references.html (keeper):**
`.rcard`, `.rbody-*`, `.thread-row`, `.thread`, `.ref-stats`, `.ref-stat`, `.section-note`, `.warn-band`

**From entities.html (keeper):**
`.ecard`, `.stat-block`, `.sb-*`, `.harm-row`, `.harm-num`, `.moves-block`, `.move-*`, `.notes-block`, `.notes-col`, `.tcard`, `.t-blurred`, `.t-blur-notice`, `.entity-stats`, `.e-stat`, `.class-badge`, `.tcard-grid`, `.dbcard`, `.dbcard-grid`, `.db-grid`, `.db-col`, `.db-label`, `.db-text`, `.db-filter-bar`, `.db-filter-btn`, `.db-flavour`

**From hunter story pages (rex, alan, reed, sven):**
`.arc`, `.arc-custom`, `.arc-header`, `.arc-eyebrow`, `.arc-name`, `.arc-intro`, `.arc-player`, `.arc-section-label`, `.arc-keeper`, `.arc-keeper.blurred`, `.blur-wrap`, `.blur-notice`, `.entry-points`, `.entry-list`, `.choices-block`, `.choice-group`, `.choice-options`, `.choice-opt`, `.choice-opt.selected`, `.choice-box`, `.choice-opt-full`, `.choice-open`, `.beats-block`, `.beats-track`, `.beat-box`, `.beat-box.filled`, `.beats-list`, `.resolution-block`, `.resolution-moves`, `.res-move`, `.res-move.selected`, `.res-move-name`, `.countdown-table`, `.threats-grid`, `.threat-card`, `.threat-card.full`, `.threat-name`, `.threat-type`, `.threat-desc`, `.threat-moves`, `.custom-move`, `.how-it-works`, `.how-grid`, `.how-item`, `.arc-nav`, `.portal-note`, `.hero-meta`, `.hero-meta-item`, `.keeper-label`, `.keeper-intro`, `.campbell-note`

**From arcs.html (keeper):**
`.arc-card`, `.arc-card-head`, `.arc-card-body`, `.arc-beats`, `.beat`, `.beat.filled`, `.arc-status`, `.arc-note`, `.arc-session-row`, `.arc-session-input`, `.arc-cod-block`, `.arc-cod-input`, `.arc-cod-lock`, `.arc-cod-lock.is-locked`, `.session-counter`, `.session-counter-label`, `.session-counter-btn`, `.intersection-map`, `.int-hunter`, `.int-hunter-link`, `.data-controls`, `.data-controls-label`, `.data-btn`, `.data-btn.import-btn`, `.data-btn.danger`

**From 02-something-that-wants-to-be-known.html (mission-prep, inline):**
`.read-aloud` — candidate for promotion to mission-prep.css. Green palette hardcoded; when promoting, replace with `--mp-*` variables. Displays a ▶ READ ALOUD eyebrow label above flavour text blocks intended to be read at the table.

**From report.html (keeper):**
`.report-wrap`, `.meta-bar`, `.meta-field`, `.db-section`, `.db-section-head`, `.db-tag`, `.db-field`, `.hunter-grid`, `.hunter-card`, `.hunter-card-head`, `.hunter-dot`, `.hunter-card-body`, `.check-grid`, `.check-item`, `.check-item.checked`, `.check-box`, `.check-label`, `.rating-row`, `.rating-label`, `.rating-pips`, `.pip`, `.pip.filled`, `.thread-row`, `.thread-tag`, `.thread-tag.active`, `.outcome-row`, `.outcome-btn`, `.outcome-btn.active-humane`, `.outcome-btn.active-partial`, `.outcome-btn.active-bad`, `.momentum-bar`, `.synthesis-box`, `.report-log`, `.report-log-head`, `.report-entry`, `.re-session`, `.re-title`, `.re-outcome`, `.re-del`, `.report-empty`, `.data-btn.primary`, `.data-btn.new-btn`

---

## PART 8 — DATA FILES DIRECTORY

Ten static JSON files live in `data/` and cover all game rules, campaign characters, NPCs, entities, hunter arcs, and district maps. **Read this section before building any page or Worker that touches game data.** Full technical documentation for each file — field schemas, consumption patterns, D1 seeding notes — is in `portal-architecture.md` under "Static Data Files Reference".

### What lives in the data files (not in D1)

These files are static assets served by Cloudflare Pages. They are read-only at runtime. Campaign state (current harm, XP, roll log, NPC visibility) lives in D1 — not here.

| File | What it contains | Used by |
|------|-----------------|---------|
| `sessions.json` | Session registry — id, label, title, status. Orders sessions for the keeper toggle and session-state.js fallback logic. | `session-state.js`, keeper toggle |
| `portal-maps.json` | District map grid data. Each entry: `id`, `session_id`, 5×7 grid matrix (cell types: `loc`/`street-h`/`street-v`/`empty`). Each `loc`: `id`, `order` (narrative 1-7, keeper-only), `label`, `sublabel`, `player_desc`, `keeper_note`, `npcs[]`. | `feed.html` player MAP tab + keeper MAP tab |
| `motw-basic-moves.json` | All 10 basic moves + 15 Weird move variants (hardcover + SSK). Each move has trigger, stat, and outcome text for 12+/10+/7-9/miss. | Roll interface, move reference panel |
| `motw-playbooks.json` | 24 playbooks total: 4 PORTAL campaign hunters (rex/reed/alan/sven, each with `hunter` field + `player_choices` block) + 20 generic reference playbooks (`hunter: null`). Full move text, stat options, gear lists, improvements per entry. | Roll interface, character sheet display, keeper move reference; generic entries are reference-only (no code reads them yet) |
| `motw-teambooks.json` | All 9 team playbooks from SSK. Research Lab is active (`active: true`, campaign style: Action Science). Other 8 (Artifact Collectors, Coven, Escaped Experiments, Good Monsters, Medical Team, Mundane Monstrosities, Radio Station, Swipe to Slay) are reference-only — useful if the campaign switches team or a new group starts. | Keeper session reference, improvement tracker; `the-lab.html` renders from Research Lab entry |
| `portal-custom-moves.json` | Substance Θ (roll+Weird), Anchor Spike (situational, no roll), BIM Collection Array recovery (no roll). Plus an empty `house_rules` array. | Roll interface (merged with standard moves), keeper command board |
| `hunters.json` | All 5 hunters — harm, luck, XP, stats, active moves, gear, bonds, background, keeper arc hooks. Confirmed fields locked; unrecorded picks marked `FILL_FROM_SESSION`. | D1 seed, character sheet pages, offline fallback |
| `portal-npcs.json` | NPCs — PORTAL inner circle, MESA operatives, case bystanders. Each has `player_description` / `keeper_description` split, `available_from_session` (replaces old `visible_to_players` flag), `session_overrides` per session, and `keeper_scene_notes` per scene. See Part 6 for full schema. | `contacts.html`, keeper NPC panel |
| `portal-entities.json` | Entities. Status, stat blocks, powers, weaknesses, keeper moves, BIM connection. Each has `available_from_session`, `session_overrides`, and `keeper_scene_notes`. Also drives the **player-facing bestiary** on `index.html` via the `bestiary{}` object (see Part 6). See Part 6 for full schema. | Keeper entity panel, player bestiary (`index.html`) |
| `portal-entity-types.json` | Classification archetypes — 8 theoretical type cards (T-001 → T-008) for `missions/entities.html` Section II. Each has `class_badge`, `tags[]`, `active_case` FK to portal-entities.json, and `sections[]` (HTML content, optional `blurred`/`blur_notice`). **Add a new theoretical type:** append to `types[]` — no HTML edit needed. | `missions/entities.html` Section II |
| `portal-db-custom.json` | PORTAL-authored custom entries for `missions/entities.html` Section III. Currently: Shōjō. Schema: `id`, `display_name` (HTML string), `tags[]`, `stat_block[]` (items have `label`/`value`/`full`, or `label`/`harm_num`/`harm_sub`/`harm_color` for harm rows), `custom_moves[]`, `notes[]`. **⚠ Schema normalisation pending** — current label/value pattern to be replaced with semantic field keys (see backlog). **Add a new custom entry:** append to `entries[]` — no HTML edit needed. | `missions/entities.html` Section III |
| `portal-db-deck.json` | 53 Deck of Monsters archive entries for `missions/entities.html` Section III. Schema: `id`, `name`, `tags[]`, `columns[]` (items: `label`, `value`, optional `full` + `flavour` flags). **⚠ Schema normalisation pending** (same as portal-db-custom.json — backlog item). **Add a new deck entry:** append to `entries[]` — no HTML edit needed. | `missions/entities.html` Section III |
| `hunter-arcs.json` | **Campaign arcs** — all 4 PORTAL hunters × 3 arcs + 6 cross-hunter intersections. Drives `missions/arcs.html` entirely — no hardcoded arc content. Add a new arc by appending to the hunter's `arcs[]` — no HTML edit needed. Beat/status/notes state lives in localStorage (`portal-arcs-v1`). | `missions/arcs.html` |
| `portal-threads.json` | **Campaign thread registry** — 14 named threads: faction (MESA, Rook, Dan Nilsson), mystery (CAMPBELL/Cameron, Project Veil, 3am lab incident, Priya's log), personal (Reed's directive, Sven's death, Alan's maps), case (Cases A/C/D/E). Each: `id, name, category, status (active/dormant/resolved), last_moved, summary, notes`. Edit after each session (step 2.10). | `missions/threads.html` |
| `portal-clocks.json` | **Countdown clock registry** — 4 active clocks: Nadia's window (1/4), Mira Okonkwo (2/6), Saturday's performance (2/4), MESA response (2/4). Each: `id, label, description, segments, filled, status, segment_labels[], advancement_note, notes`. Advance `filled` after each session (step 2.10). | `missions/threads.html` |
| `motw-playbook-arcs.json` | **Reference arc library** — all 33 playbooks × 2 arcs from the Hunter's Journal. Schema: `playbooks[]` with `entry_points[]`, `story_beats[]`, `resolution_moves[]` per arc. Read-only inspiration source when picking arcs for new hunters (e.g. Flake for John Johnson). Never rendered by any page — keeper lookup only. | Reference only |

### Cross-file relationships

```
motw-playbooks.json
  └── player_choices.starting_moves[] → ids reference moves within the same file
  └── player_choices.weird_move       → id references motw-basic-moves.json alternate_weird_moves[]

hunters.json
  └── hunter.playbook          → matches motw-playbooks.json playbook.id
  └── hunter.active_moves[].id → matches motw-playbooks.json move.id or motw-basic-moves.json move.id
  └── hunter.weird_move        → matches motw-basic-moves.json alternate_weird_moves[].id

portal-npcs.json
  └── npc.secrets_involved[]   → references secret IDs from worldbuilding-lore.md Part 5

portal-entities.json
  └── entity.case              → references session/case IDs ('S01', 'case-a', etc.)
  └── entity.secrets_involved[]→ references secret IDs from worldbuilding-lore.md Part 5
  └── entity.bestiary.phases[] → drives player-facing bestiary cards on index.html (show_from/show_until gated)

portal-entity-types.json
  └── type.active_case         → references portal-entities.json entity id (or null if theoretical)
  └── type.portal_entities_ref → secondary FK for entities with no active case but a stat block entry

hunter-arcs.json
  └── arc.type ('portal'|'adapted') → CSS class logic in arcs.html renderer
  └── intersection.from_hunter → references hunter id (rex/reed/alan/sven) for colour lookup
```

### The keeper/player split in data files

Three files have a dual-description pattern. **Never send the keeper side to player-facing endpoints or render it on player pages.**

- `portal-npcs.json` — `player_description` vs `keeper_description` per NPC; `visible_to_players` boolean controls whether the NPC appears in `contacts.html` at all
- `portal-entities.json` — `player_description` vs `keeper_description` per entity; `keeper_only: true` on T-006 means it must never surface in any player context
- `hunters.json` — `keeper_notes` object per hunter (arc hooks, secrets involved) is keeper-only; all other fields are safe for player sheet display

### What is NOT in the data files

The following lives in D1 only — do not try to read it from the static files:
- Current harm, luck, and XP values (they change during play)
- Roll log entries
- Session state and clock progress
- Which NPCs have been revealed to players (the *current* state — the initial state is in `portal-npcs.json`)
- CAMPBELL messages and handouts
- Open leads

---

## PART 9 — ARCHITECTURE ROADMAP

### Current State — Cloudflare Pages + D1

Hosting: Cloudflare Pages (`dev` branch). D1 binding: `portal_db`. Three migrations applied. Full technical stack in `portal-architecture.md`.

**What stays localStorage-only (single-user keeper tools):**
- `arcs.html`, `report.html`, mission prep pages

**What uses D1:**
- Hunter arc state (`functions/api/v1/hunters/[id]/arc-state.js`)
- Keeper field reports (`functions/api/v1/reports/[id]/state.js`)
- Player field reports (`functions/api/v1/player-reports/[week]/[hunter]/state.js`)

### Build Order (when resuming)

**Phase 1 — Live Feed (next immediate build):**
- `app/feed.html` — split-screen session tool. Left: roll feed + CAMPBELL messages. Right: playbook panel. Keeper mode via double-click. D1 polling first; Durable Objects later.

**Phase 2 — Player interactive features:**
- Character sheet pages (D1-backed, offline-first localStorage fallback)
- Dice roller (pure JS, logs to visible roll history div)
- Campaign State export — aggregates sheets + open threads + last session report into one markdown blob for Claude context

**Phase 3 — Auth + real-time:**
- Player login (Cloudflare Access or simple magic-link via Workers)
- Live roll logging visible to all players
- Real-time updates via Durable Objects — not essential, nice-to-have

### Notes for Claude Code Sessions

When building new pages or Workers:
1. Workers API should be RESTful and thin — no business logic, just DB access
2. Character sheets must work offline-first with localStorage fallback
3. Roll log is append-only — never update or delete rolls, only insert
4. Keeper pages always have full read access; player pages only see their own character + shared NPC list + roll log
5. Do not add auth in Phase 2 — simple shared session key or URL token for now
6. The existing design system (four CSS files, `--mp-*` variables, keeper/player split) applies to all new pages without exception

---

## INTEGRATION REFERENCE — Prompts for Common Tasks

**For any new page:**
> "Use the P.O.R.T.A.L site reference (`worldbuilding-site.md`). Link `[player.css / keeper.css / mission-prep.css]` — do not write inline styles for classes in those files. At the end, list any new CSS classes you added."

**For a player page:**
> "This is a player-facing page. Use `player.css`. Nav links via `player-nav.js`. Do not reference keeper secrets or break the in-world voice."

**For a keeper page:**
> "This is a keeper page. Use `keeper.css`. First element in body must be the keeper-banner div. Include `<script src="../session-state.js"></script>` before `</body>` — this injects the session toggle widget automatically. Include full keeper detail — secrets are not blurred on keeper-only pages."

**For a mission-prep page:**
> "This is a mission-prep page. Use `../mission-prep.css`. Define all 21 `--mp-*` variables in a `:root` block. Use a [colour/theme] palette. Start body with a `.keeper-nav` breadcrumb linking back to `keeper.html`."

**For a hunter story page:**
> "This is a hunter story page in the same pattern as rex-hunter-stories.html. Player section is visible; keeper section is blurred. Use the character's accent colour (see Part 4). Arc III is always the original PORTAL arc with `.arc-custom` class."

**For a CAMPBELL briefing page:**
> "This is a CAMPBELL briefing page. Use `briefing.css`. Write in CAMPBELL's institutional voice (see `worldbuilding-lore.md` Part 2). Case letter → colour: case-a amber, case-b green, case-c purple, case-d teal, case-e rose."

**For adding a new case / session:**
> "Read Part 6 (Adding a New Case) in `worldbuilding-site.md` for the full checklist. Provide: case brief, location, entity type, NPC list with keeper vs. player knowledge per scene, and current week number. Claude produces: mission-prep doc, CAMPBELL briefing fragment, session-aware HTML variants for missions.html + index.html + contacts.html, NPC JSON entries with `available_from_session` and `session_overrides`, entity JSON entries, report config blocks."
>
> For every NPC, author **two tracks** (see Part 6 — NPC Authoring — Two Tracks):
> - **Track 1** (`session_overrides.wN+1.player_description`): post-resolution state for the contacts page — what players read between sessions after the case closes. Never mid-mission states.
> - **Track 2** (`keeper_scene_notes`): per-scene guidance for the keeper during the session — what information to push to players at each scene via the live feed. Keyed as `"sNN-scene-slug"`.

**For writing between-session incident content (new week):**
> "Read Part 10 (Between-Session Content Formats) in `worldbuilding-site.md` for the exact JSON schema. Produce: a single `weeks[]` entry as JSON, ready to append to `data/incidents.json`. Do NOT produce HTML. Use only the documented block types and inline markup syntax. Mark the new week `"status": "active"` and note that the previous active week should be changed to `"closed"`."

**For writing the CAMPBELL priority queue (new week):**
> "Read Part 10 (Between-Session Content Formats) in `worldbuilding-site.md` for the exact JSON schema. Produce: a single `weeks[]` entry as JSON, ready to append to `data/briefings.json`. Do NOT produce HTML. Use only the documented item types, row fields, and inline markup syntax (`{{color:text}}`). Mark the new week `"status": "active"` and note that the previous active week should be changed to `"closed"`. Write case content in CAMPBELL's institutional voice (see `worldbuilding-lore.md` Part 2)."

**For advancing the campaign session (after a session plays):**
> "Read `post-session-runbook.md`. Key steps: update `data/sessions.json` (mark old session `closed`, add new), author W-next HTML content variants in missions.html + index.html + contacts.html, update NPC `session_overrides` for revealed NPCs, update entity `session_overrides` for resolved entities, update D1 active session via keeper toggle."

---

## PART 10 — BETWEEN-SESSION CONTENT FORMATS

This part is for **Claude.ai (content author)**. It defines exactly what to produce for each recurring between-session content type. Claude Code integrates the output; no translation should be needed.

Two content types are authored between sessions:
1. **Incident Log** — append a new `weeks[]` entry to `data/incidents.json`
2. **CAMPBELL Queue** — append a new `weeks[]` entry to `data/briefings.json` (mark the previous week `"closed"`)

---

### FORMAT 1 — Incident Log (`data/incidents.json`)

**What to produce:** A single JSON object — one `weeks[]` entry — ready to paste into the array. No HTML. No JavaScript. No CSS class names. All rendering is handled by `lab-incidents.html`.

**Delivery format:**
```
Append this entry to the `weeks[]` array in `data/incidents.json`.
Mark the previous active week as `"status": "closed"`.
```

#### Week Entry Structure

```json
{
  "id": "W3",
  "label": "WEEK 03",
  "status": "active",
  "hero_eyebrow": "// BETWEEN-SESSION — POST-S02 STAFF COMMUNIQUÉS",
  "hero_desc": "One item logged during the Aldermoor deployment requires staff input.",
  "incidents": [ ... ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | `"W1"`, `"W2"`, `"W3"` — uppercase, no leading zero |
| `label` | string | `"WEEK 01"` — displayed on tab button |
| `status` | string | `"active"` or `"closed"` — only one week is `"active"` at a time |
| `hero_eyebrow` | string | Monospace header line above the page title |
| `hero_desc` | string | One or two sentences — sets up the week's content |
| `incidents` | array | Ordered list of incident objects (empty `[]` for closed/blank weeks) |

#### Incident Object — Base Fields (all types)

```json
{
  "id": "S02-I01",
  "type": "choice",
  "color": "amber",
  "title": "The Eszter Particulate",
  "badge": "RESPONSE REQUIRED",
  "badge_color": "amber",
  "item_label": "// INCIDENT LOG — POST-SESSION 02 — ITEM 01 OF 02",
  "stamps": [
    "LOGGED: POST-SESSION 02",
    "CATEGORY: SAMPLE HANDLING / RESEARCH DIRECTION",
    "SUBMITTED BY: DR. P. OSEI"
  ],
  "blocks": [ ... ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Pattern: `SNN-IMM` — session + item, e.g. `S02-I01` |
| `type` | string | `"choice"` / `"open"` / `"informational"` / `"teaser"` |
| `color` | string | `"amber"` / `"purple"` / `"red"` — card accent stripe |
| `title` | string | Display title (all-caps rendered by CSS) |
| `badge` | string | Short text in badge pill |
| `badge_color` | string | `"amber"` / `"purple"` / `"red"` |
| `item_label` | string | Monospace ID line at top of card |
| `stamps` | array of strings | Footer metadata pills (omit for `teaser` type) |
| `blocks` | array | Content blocks — see Block Types below |

**Type-specific additional fields:**

`choice` — add after `blocks`:
```json
"choices": [
  { "id": "A", "label": "A — Short Title", "text": "Longer description of this option." },
  { "id": "B", "label": "B — Short Title", "text": "..." },
  { "id": "C", "label": "C — Short Title", "text": "..." }
],
"allow_custom": true
```
`allow_custom: true` shows an optional freetext textarea below the choice buttons.

`open` — add after `blocks`:
```json
"form_hint": "Write whatever you actually think. This goes to Saoirse's office, not the Director.",
"name_optional": true
```

`informational` — no additional fields.

`teaser` — omit `color`, `stamps`. Uses different card styling (purple border section). The `item_label` is a volunteer/request line rather than an incident log line.

#### Block Types

All blocks go inside the `"blocks"` array in order. Mix freely per incident.

---

**`narrative`** — body prose paragraph.
```json
{ "type": "narrative", "text": "Single paragraph of prose." }
{ "type": "narrative", "text": "Dimmed paragraph — used for closing reflective text.", "dim": true }
```
`"dim": true` renders in a lighter colour. Optional; omit if false.

---

**`campbell`** — CAMPBELL terminal block. Green by default; purple for internal/anomalous notices.
```json
{
  "type": "campbell",
  "label": "// CAMPBELL — INTERNAL NOTICE — SAMPLE BIM-S01-003",
  "paragraphs": [
    "First paragraph of the notice.",
    "Second paragraph. Each renders separated by a blank line."
  ],
  "flag": "// FLAG: Decision required before next scheduled lab review.",
  "color": "green"
}
```
| Field | Notes |
|-------|-------|
| `label` | Monospace header — always starts with `// CAMPBELL —` |
| `paragraphs` | Array of strings. Each paragraph is a separate entry; they render with a blank line between. |
| `flag` | Optional closing flag line in accent colour. Starts with `// FLAG:` or `// NOTE:`. Omit if not needed. |
| `color` | `"green"` (default, omit if green) or `"purple"` (for anomalous/sensitive notices) |

---

**`callout`** — attributed aside block. Used for supplemental notes from named characters.
```json
{
  "type": "callout",
  "color": "amber",
  "from": "// DR. P. OSEI — SUPPLEMENTAL NOTE",
  "text": "First paragraph text.\n\nSecond paragraph. Use \\n\\n for paragraph breaks within a callout."
}
```
| Field | Notes |
|-------|-------|
| `color` | `"amber"` / `"purple"` / `"red"` — matches the incident accent |
| `from` | Attribution line — always `// NAME — ROLE` format |
| `text` | Use `\n\n` (two newlines in JSON) for paragraph breaks within the callout. |

---

**`email`** — internal email block. Used in `teaser` type incidents.
```json
{
  "type": "email",
  "from": "teddy.brandt@portal-internal.org",
  "to": "field-team@portal-internal.org",
  "subject": "something slightly weird I need help with",
  "date": "this week",
  "body_paras": [
    "First paragraph of email body.",
    "Second paragraph. Use {{em:quoted text}} for italicised inline emphasis.",
    "Third paragraph."
  ],
  "sig": "— Teddy\nField Support Technician, PORTAL"
}
```
`\n` in `sig` becomes a line break. Each string in `body_paras` becomes a `<p>` tag.

---

**`log-excerpt`** — CAMPBELL activity log terminal block. Used in `teaser` type incidents.
```json
{
  "type": "log-excerpt",
  "label": "CAMPBELL ACTIVITY LOG — EXCERPT A // TIMESTAMP 03:41:07",
  "lines": [
    "INVENTORY CHECK: Bay 3 sample BIM-S01-003 — PRESENT / CONTAINED",
    "CROSS-REFERENCE: {{anomaly:CASE FILE S01-EXTENDED — STATUS: ACTIVE}}",
    "NOTE: Subject remains within designated parameters. Monitoring continues {{anomaly:per directive}}."
  ],
  "annotation": "// TEDDY'S ANNOTATION: Case S01 is closed. There is no \"S01-EXTENDED\" in the system."
}
```
`annotation` is optional — set to `null` or omit if no annotation. Each string in `lines` renders on its own line.

---

#### Inline Markup (used inside specific string fields only)

| Syntax | Renders as | Use in |
|--------|-----------|--------|
| `{{anomaly:TEXT}}` | Purple `.log-anomaly` span | `log-excerpt` lines only |
| `{{em:TEXT}}` | Italic `<em>` span | `email` body_paras only |

Do not use HTML tags directly in any field. Do not use inline markup outside the specified fields.

---

#### Constraints

| Rule | Detail |
|------|--------|
| One `"active"` week | Only one week in the array has `"status": "active"`. All others are `"closed"`. |
| Week IDs | `"W1"`, `"W2"`, `"W3"` — uppercase, no leading zero. |
| Incident IDs | `"SNN-IMM"` pattern — e.g. `S02-I01`, `S02-I02`. Unique across the whole file. |
| Incident order | Incidents render in array order. Put `choice` and `open` before `informational`. Put `teaser` last. |
| No HTML | Never write HTML tags in any field. The renderer handles all markup. |
| Empty week | An empty `"incidents": []` renders a "no incidents logged" state — correct for `"closed"` weeks. |

---

#### Minimal Example — One Choice Incident

```json
{
  "id": "W3",
  "label": "WEEK 03",
  "status": "active",
  "hero_eyebrow": "// BETWEEN-SESSION — POST-S02 STAFF COMMUNIQUÉS",
  "hero_desc": "One item logged during the Aldermoor deployment requires staff input.",
  "incidents": [
    {
      "id": "S02-I01",
      "type": "choice",
      "color": "amber",
      "title": "The Volunteer Sample",
      "badge": "RESPONSE REQUIRED",
      "badge_color": "amber",
      "item_label": "// INCIDENT LOG — POST-SESSION 02 — ITEM 01 OF 01",
      "stamps": [
        "LOGGED: POST-SESSION 02",
        "CATEGORY: SAMPLE HANDLING",
        "SUBMITTED BY: DR. P. OSEI"
      ],
      "blocks": [
        {
          "type": "narrative",
          "text": "The tissue sample recovered from the Hargrove case is unlike anything in the catalogued set."
        },
        {
          "type": "campbell",
          "label": "// CAMPBELL — INTERNAL NOTICE — SAMPLE HRG-S02-001",
          "paragraphs": [
            "Sample HRG-S02-001 has been logged under standard anomalous-material protocols.",
            "Preliminary analysis indicates Class 3 vitality displacement signature — first recorded instance in a stable, inert sample."
          ],
          "flag": "// FLAG: Decision required before next scheduled lab review."
        },
        {
          "type": "callout",
          "color": "amber",
          "from": "// DR. P. OSEI — SUPPLEMENTAL NOTE",
          "text": "I don't know what this does at scale. Neither direction is safe in the way we usually mean safe."
        }
      ],
      "choices": [
        { "id": "A", "label": "A — Controlled Study", "text": "Incremental exposure under lab conditions. Treat it as a data source." },
        { "id": "B", "label": "B — Full Isolation",   "text": "Faraday shielding, no electronic proximity. Document the change." },
        { "id": "C", "label": "C — Saoirse First",   "text": "No direction proceeds until Dr. Mullen has reviewed the analysis." }
      ],
      "allow_custom": true
    }
  ]
}
```

---

### FORMAT 2 — CAMPBELL Priority Queue (`data/briefings.json`)

**What to produce:** a single `weeks[]` entry as JSON, ready to append to `data/briefings.json`. No HTML files. The renderer in `campbell-briefings.html` handles all layout.

#### Week Entry Schema

```json
{
  "id": "w03",
  "label": "WEEK 03",
  "status": "active",
  "title": "Post-Operation #XXXX-X (Location Name)",
  "summary": "4 cases active · 1 high · 3 medium",
  "header_note": "⚠ N CASES ACTIVE — FIELD TEAM REQUIRED · [PREV-OP] CLOSED",
  "header_timestamp": "// QUEUE UPDATE ISSUED N DAYS POST-OPERATION #XXXX-X ([LOCATION])",
  "items": [ ... ],
  "closing_note": { ... }
}
```

| Field | Notes |
|-------|-------|
| `id` | Week identifier: `"w03"`, `"w04"`, etc. |
| `label` | Tab button text: `"WEEK 03"` |
| `status` | `"active"` or `"closed"`. Mark the previous week `"closed"` when adding. |
| `title` | Tab tooltip: `"Post-Operation #XXXX-X (Location)"` |
| `summary` | Tab tooltip suffix: `"N cases active · N high · N medium"` |
| `header_note` | Banner line below the divider — `⚠ …` format |
| `header_timestamp` | Optional second line — `// QUEUE UPDATE ISSUED …` format. Omit if not needed. |

#### `items[]` — Cases and Section Labels

Items are rendered in order. Mix `"type": "section-label"` entries between cases to create grouping headers.

**Section label:**
```json
{ "type": "section-label", "css_class": "carry-over", "text": "// CARRY-OVER — CASES OPEN PRIOR TO [PREV-OP] DEPLOYMENT" }
{ "type": "section-label", "css_class": "new-cases-label", "text": "// NEW — CASES FLAGGED DURING [PREV-OP] DEPLOYMENT · HUMAN REVIEW PENDING" }
```

**Case card:**
```json
{
  "type": "case",
  "id": "case-a",
  "report_id": "// CAMPBELL — ANOMALY REPORT #XXXX-X · UPDATED",
  "title": "CODENAME",
  "subtitle": "LOCATION · ANOMALY TYPE · CLASSIFICATION",
  "priority": "high",
  "priority_label": "PRIORITY: HIGH ↑",
  "rows": [ ... ],
  "directive": { ... },
  "footer_status": "ACTIVE — [STATUS SUMMARY]",
  "footer_ref": "REPORT #XXXX-X",
  "footer_class": "LOCATION · ANOMALY CLASS · NEW"
}
```

| `id` | CSS class | Accent colour |
|------|-----------|---------------|
| `case-a` | Amber | First/highest-priority case |
| `case-b` | Green | Second case |
| `case-c` | Purple | Third case / CAMPBELL-anomalous |
| `case-d` | Teal | Fourth case |
| `case-e` | Rose | Fifth case |

#### `rows[]` — Data Rows

```json
{ "k": "LOCATION", "v": "Address or area" }
{ "k": "CROSS-REF", "v": "Something alarming", "color": "alert" }
{ "k": "DATE FLAGGED", "v": "41 days ago", "note": "// review queue: low priority" }
{ "k": "CROSS-REF", "v": "Critical info", "color": "red", "note": "// dim suffix" }
{ "k": "POST 1", "v": "Predicted fire · {{alert:Verified accurate}}" }
{ "divider": true }
```

| Field | Notes |
|-------|-------|
| `k` | Key label (rendered without colon — renderer adds it) |
| `v` | Value text. Supports `{{color:text}}` inline markup for partial coloring. |
| `color` | Optional color for the whole value: `alert` · `red` · `dim` · `purple` · `teal` · `rose` |
| `note` | Optional dim suffix appended after the value (renders as `<span class="dim">`) |
| `divider` | `true` → renders `<hr class="t-divider">`. No other fields needed. |

**Value color meanings:**

| Value | Colour | Use for |
|-------|--------|---------|
| `alert` | Amber | Warning — something changed or escalated |
| `red` | Red | Danger — lives at risk, critical deadline |
| `dim` | Dim | Low-confidence, CAMPBELL internal note, starts with `//` |
| `purple` | Purple | CAMPBELL anomalous classification, unusual mechanism |
| `teal` | Teal | Novel classification, first recorded instance |
| `rose` | Rose | Identity / consciousness anomaly |
| (none) | Default white | Standard confirmed data |

**Inline markup** — for coloring part of a value (not the whole span):
`"v": "Predicted fire · {{alert:Verified accurate}}"` → renders the `Verified accurate` portion in amber.

#### `directive` — Director's Note

```json
{
  "label": "// DIRECTOR'S NOTE — [INITIAL / UPDATED POST-{PREV-OP}]",
  "paragraphs": [
    "First paragraph. Director's instruction to the field team.",
    "Second paragraph. Ends with the key question or priority."
  ],
  "dim_note": "// Optional personal aside. — Director"
}
```

- `paragraphs` renders with `<br><br>` between entries
- `dim_note` is optional; renders after the last paragraph, dimmed
- Distinguish `"INITIAL"` (new case) from `"UPDATED POST-[OP]"` (carry-over)

#### `priority_label` and `priority` values

| `priority` | `priority_label` | Use for |
|-----------|-----------------|---------|
| `high` | `PRIORITY: HIGH` or `PRIORITY: HIGH ↑` | Time-critical, lives at risk |
| `medium` | `PRIORITY: MEDIUM` | Standard active case |
| `info` | `PRIORITY: MEDIUM ↑` | Escalating, needs attention |
| `new` | `PRIORITY: MEDIUM · NEW` | First appearance, primary colour |
| `new-b` | `PRIORITY: MEDIUM · NEW` | First appearance, secondary colour |
| `low` | `PRIORITY: LOW` | Monitoring only |

#### `closing_note`

```json
{
  "header": "// CAMPBELL — POST-[PREV-OP] PRIORITY UPDATE",
  "count": "N CASES ACTIVE · N HIGH · N MEDIUM",
  "lines": [
    "OPERATION #XXXX-X ([PREV-OP]) CLOSED — ENTITY STATUS: [STATUS].",
    "PRIORITY QUEUE UPDATED.",
    "",
    "DURING [PREV-OP] DEPLOYMENT:",
    "· CASE #XXXX-X ([CODENAME]) — [what changed].",
    "",
    "[CAMPBELL pattern notes, connections, confidence levels.]"
  ],
  "sig": "// END TRANSMISSION — CAMPBELL · P.O.R.T.A.L ANOMALY DETECTION SYSTEM"
}
```

Empty strings in `lines` render as blank lines. Use `·` (middle dot) for bulleted items.

#### Rules

- **JSON only** — no HTML. The renderer in `campbell-briefings.html` handles all layout.
- **CAMPBELL voice** — see `worldbuilding-lore.md` Part 2. Formal, precise, institutional. Data-forward. Anomalous observations noted without editorial alarm.
- **General writing voice** — see `worldbuilding-lore.md` Part 4 (Writing Voice — General Principles). Default register: lead with the finding, one observation per sentence, no restatement. Fuller register only for first appearances or emotional centrepieces.
- **Director's notes** — distinguish "INITIAL" (new case) from "UPDATED POST-[OP]" (carry-over). Director's voice is more direct than CAMPBELL's; `dim_note` holds the personal aside.
- **Section labels** — include `carry-over` item only if there are carry-over cases; include `new-cases-label` item only if there are new cases. Both are optional.
- **`closing_note`** — always present, even if brief. Summarises queue state, notes pattern connections, ends with `// END TRANSMISSION`.
- **`footer_ref`** — report number only: `"REPORT #0091-F"`. The renderer appends ` · CAMPBELL v{ver}` automatically.
