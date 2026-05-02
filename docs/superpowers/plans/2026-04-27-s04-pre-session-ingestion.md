# S04 Pre-Session Ingestion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up all site assets for the S04 "The Shōjō" session — CSS promotion, mission index entry, data file updates (s04.json, portal-threads.json, report-schema.json), and dossier page verification.

**Architecture:** Pure data and HTML/CSS edits. No new endpoints, no new tables, no new JS. Tasks 1–5 are fully independent and can execute in parallel. Tasks 6 and 7 run after all others complete.

**Tech Stack:** JSON (validate with `jq`), HTML, CSS. Dev server: `wrangler pages dev .` (port 8788) for spot-checks.

---

## File Map

| File | Operation |
|---|---|
| `mission-prep.css` | Append 8 CSS component blocks |
| `missions/04-the-shojo.html` | Strip promoted rules from inline `<style>` (keep `:root` only) |
| `missions/keeper.html` | Insert S04 `.kmission` block before `</div><!-- /missions-list -->` |
| `data/sessions/s04.json` | Update `leech-call-1` body text |
| `data/portal-threads.json` | Append 5 thread objects to `.threads[]` |
| `data/report-schema.json` | Append S04 entry object to top-level array |
| `handouts/dossier/s04-brewer-letter.html` | Verify only (no edits expected) |
| `handouts/dossier/s04-pulaski-case-file.html` | Verify only |
| `handouts/dossier/s04-mariana-statement.html` | Verify only |
| `handouts/dossier/s04-veritas-tablet.html` | Verify only |
| `handouts/dossier/s04-harbor-map.html` | Verify only |

---

## Task 1: Promote inline CSS to `mission-prep.css` and strip from `04-the-shojo.html`

**Files:**
- Modify: `mission-prep.css`
- Modify: `missions/04-the-shojo.html`

The S04 session prep doc has 8 CSS component blocks defined inline that should live in the shared stylesheet so future session docs inherit them.

- [ ] **Step 1: Append promoted CSS to `mission-prep.css`**

At the very end of `mission-prep.css` (after the `@media print` block), append:

```css

/* ── DIFFICULTY LABELS (S04+) ── */
.diff { font-family: 'Share Tech Mono', monospace; font-size: 0.85em; padding: 1px 6px; border-radius: 3px; background: #d4e4dc; color: #14242c; margin-right: 6px; }
.diff.trivial  { background: #c8e0d0; }
.diff.easy     { background: #c8e0d0; }
.diff.moderate { background: #e8d8a8; }
.diff.hard     { background: #e8b8a8; }
.diff.deadly   { background: #d8a8a8; color: #4a0000; }

/* ── LOCATION BOX (S04+) ── */
.location-box { border: 1px solid var(--mp-border); border-left: 4px solid var(--mp-accent); background: var(--mp-light-1); padding: 12px 16px; margin: 12px 0; border-radius: 3px; }
.location-box h4 { margin: 0 0 6px 0; color: var(--mp-accent); font-family: 'Cinzel', serif; font-size: 1.05em; letter-spacing: 0.05em; }

/* ── VICTIM CARD (S04+) ── */
.victim-card { border: 1px solid var(--mp-border); background: var(--mp-light-2); padding: 10px 14px; margin: 8px 0; border-radius: 3px; }
.victim-card h4 { margin: 0 0 4px 0; color: var(--mp-accent); font-family: 'Cinzel', serif; font-size: 1em; }
.victim-card p { margin: 4px 0; }

/* ── LETTER BLOCK (S04+) ── */
.letter-block { background: #f8f4ec; border: 1px solid #c8b890; padding: 18px 24px; margin: 12px 0; font-family: 'Crimson Text', serif; font-style: italic; line-height: 1.6; }

/* ── RADIO CALL (S04+) ── */
.radio-call { background: var(--mp-clock-bg); color: var(--mp-dark-text); padding: 12px 16px; margin: 10px 0; border-left: 3px solid #d8a8a8; font-family: 'Share Tech Mono', monospace; font-size: 0.92em; }
.radio-call .rc-label { color: #d8a8a8; font-weight: bold; display: block; margin-bottom: 6px; letter-spacing: 0.08em; }

/* ── COMBAT CLOCK (S04+) ── */
.combat-clock { background: #1a0a1a; color: #e8d8d0; padding: 14px 18px; margin: 12px 0; border-left: 4px solid #8a3a2a; border-radius: 3px; font-family: 'Crimson Text', serif; }
.combat-clock h4 { color: #d8a8a8; font-family: 'Cinzel', serif; margin: 0 0 8px 0; letter-spacing: 0.06em; font-size: 1em; }
.combat-clock .seg { display: block; padding: 5px 0 5px 28px; position: relative; line-height: 1.5; }
.combat-clock .seg::before { content: ""; position: absolute; left: 0; top: 7px; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #d8a8a8; background: transparent; }
.combat-clock .seg .label { color: #d8a8a8; font-weight: bold; letter-spacing: 0.05em; font-family: 'Share Tech Mono', monospace; font-size: 0.88em; }

/* ── TERRAIN GRID (S04+) ── */
.terrain-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
.terrain-grid .t-feat { background: var(--mp-light-1); border: 1px solid var(--mp-border); border-left: 3px solid var(--mp-accent); padding: 8px 12px; border-radius: 2px; font-size: 0.95em; }
.terrain-grid .t-feat strong { color: var(--mp-accent); display: block; font-family: 'Cinzel', serif; letter-spacing: 0.04em; margin-bottom: 3px; font-size: 0.9em; }
@media (max-width: 700px) { .terrain-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 2: Strip promoted rules from `missions/04-the-shojo.html` inline `<style>`**

Replace this entire block in `04-the-shojo.html` (lines 9–56):

```html
<style>
  :root {
    --mp-outer-bg:       #08100f;
    --mp-page-bg:        #f1f4f2;
    --mp-text:           #14242c;
    --mp-accent:         #1c4a52;
    --mp-accent-mid:     #3a6a72;
    --mp-subtitle:       #4a7882;
    --mp-border:         #88a8ac;
    --mp-border-h2:      #b4d0d2;
    --mp-dark-bg:        #0a2026;
    --mp-clock-bg:       #06181e;
    --mp-dark-text:      #c8e0e0;
    --mp-light-1:        #e6efea;
    --mp-light-2:        #d4e4dc;
    --mp-flavour-text:   #1c4a52;
    --mp-quick-ref-li:   #b4d0d2;
    --mp-tension-border: #3a6a72;
    --mp-tension-left:   #8a3a2a;
    --mp-tension-bg:     #efe4dc;
    --mp-res-best:       #3a7a5a;
    --mp-res-bad:        #8a3a2a;
    --mp-res-partial:    #6a7882;
  }
  .diff { font-family: 'Share Tech Mono', monospace; font-size: 0.85em; padding: 1px 6px; border-radius: 3px; background: #d4e4dc; color: #14242c; margin-right: 6px; }
  .diff.trivial { background: #c8e0d0; }
  .diff.easy    { background: #c8e0d0; }
  .diff.moderate{ background: #e8d8a8; }
  .diff.hard    { background: #e8b8a8; }
  .diff.deadly  { background: #d8a8a8; color: #4a0000; }
  .location-box { border: 1px solid var(--mp-border); border-left: 4px solid var(--mp-accent); background: var(--mp-light-1); padding: 12px 16px; margin: 12px 0; border-radius: 3px; }
  .location-box h4 { margin: 0 0 6px 0; color: var(--mp-accent); font-family: 'Cinzel', serif; font-size: 1.05em; letter-spacing: 0.05em; }
  .victim-card { border: 1px solid var(--mp-border); background: var(--mp-light-2); padding: 10px 14px; margin: 8px 0; border-radius: 3px; }
  .victim-card h4 { margin: 0 0 4px 0; color: var(--mp-accent); font-family: 'Cinzel', serif; font-size: 1em; }
  .victim-card p { margin: 4px 0; }
  .letter-block { background: #f8f4ec; border: 1px solid #c8b890; padding: 18px 24px; margin: 12px 0; font-family: 'Crimson Text', serif; font-style: italic; line-height: 1.6; }
  .radio-call { background: var(--mp-clock-bg); color: var(--mp-dark-text); padding: 12px 16px; margin: 10px 0; border-left: 3px solid #d8a8a8; font-family: 'Share Tech Mono', monospace; font-size: 0.92em; }
  .radio-call .rc-label { color: #d8a8a8; font-weight: bold; display: block; margin-bottom: 6px; letter-spacing: 0.08em; }
  .combat-clock { background: #1a0a1a; color: #e8d8d0; padding: 14px 18px; margin: 12px 0; border-left: 4px solid #8a3a2a; border-radius: 3px; font-family: 'Crimson Text', serif; }
  .combat-clock h4 { color: #d8a8a8; font-family: 'Cinzel', serif; margin: 0 0 8px 0; letter-spacing: 0.06em; font-size: 1em; }
  .combat-clock .seg { display: block; padding: 5px 0 5px 28px; position: relative; line-height: 1.5; }
  .combat-clock .seg::before { content: ""; position: absolute; left: 0; top: 7px; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #d8a8a8; background: transparent; }
  .combat-clock .seg .label { color: #d8a8a8; font-weight: bold; letter-spacing: 0.05em; font-family: 'Share Tech Mono', monospace; font-size: 0.88em; }
  .terrain-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
  .terrain-grid .t-feat { background: var(--mp-light-1); border: 1px solid var(--mp-border); border-left: 3px solid var(--mp-accent); padding: 8px 12px; border-radius: 2px; font-size: 0.95em; }
  .terrain-grid .t-feat strong { color: var(--mp-accent); display: block; font-family: 'Cinzel', serif; letter-spacing: 0.04em; margin-bottom: 3px; font-size: 0.9em; }
  @media (max-width: 700px) { .terrain-grid { grid-template-columns: 1fr; } }
</style>
```

With:

```html
<style>
  :root {
    --mp-outer-bg:       #08100f;
    --mp-page-bg:        #f1f4f2;
    --mp-text:           #14242c;
    --mp-accent:         #1c4a52;
    --mp-accent-mid:     #3a6a72;
    --mp-subtitle:       #4a7882;
    --mp-border:         #88a8ac;
    --mp-border-h2:      #b4d0d2;
    --mp-dark-bg:        #0a2026;
    --mp-clock-bg:       #06181e;
    --mp-dark-text:      #c8e0e0;
    --mp-light-1:        #e6efea;
    --mp-light-2:        #d4e4dc;
    --mp-flavour-text:   #1c4a52;
    --mp-quick-ref-li:   #b4d0d2;
    --mp-tension-border: #3a6a72;
    --mp-tension-left:   #8a3a2a;
    --mp-tension-bg:     #efe4dc;
    --mp-res-best:       #3a7a5a;
    --mp-res-bad:        #8a3a2a;
    --mp-res-partial:    #6a7882;
  }
</style>
```

- [ ] **Step 3: Verify the session doc still renders with correct classes**

```bash
grep -c "class=\"diff\|class=\"location-box\|class=\"combat-clock\|class=\"terrain-grid" missions/04-the-shojo.html
```

Expected: non-zero (classes still used in the HTML body, now sourced from mission-prep.css).

```bash
grep "\.diff\|\.location-box\|\.combat-clock\|\.terrain-grid" missions/04-the-shojo.html | grep -v "class="
```

Expected: empty output (no stray CSS rules left in the HTML).

- [ ] **Step 4: Commit**

```bash
git add mission-prep.css missions/04-the-shojo.html
git commit -m "feat(css): promote S04 inline styles to mission-prep.css — diff, location-box, combat-clock, terrain-grid"
```

---

## Task 2: Add S04 entry to `missions/keeper.html`

**Files:**
- Modify: `missions/keeper.html`

- [ ] **Step 1: Insert S04 mission card**

Find the exact string in `keeper.html`:

```html
    </div><!-- /m03 -->

  </div><!-- /missions-list -->
```

Replace with:

```html
    </div><!-- /m03 -->

    <!-- MISSION 04 -->
    <div class="kmission" id="m04">
      <div class="kmission-header" onclick="toggleMission('m04')">
        <div class="kmission-num">04</div>
        <div class="kmission-title-block">
          <div class="kmission-title">The Shōjō</div>
          <div class="kmission-sub">// INNER HARBOR · CAMPBELL REPORT #0104-A · RESIDUAL CONSCIOUSNESS — NATURAL BIM SOURCE</div>
          <div class="kmission-tags">
            <span class="ktag amber">ACTIVE</span>
            <span class="ktag red">ENTITY: VESSEL-BOUND SEA SPIRIT</span>
            <span class="ktag purple">DIRECTIVE: RESOLVE BEFORE FOURTH DEATH</span>
            <span class="ktag grey">RIVAL FACTION: VERITAS (OP. WHITECEDAR)</span>
          </div>
        </div>
        <div class="kmission-toggle">[ EXPAND ▾ ]</div>
      </div>

      <div class="kmission-body" id="m04-body">

        <div class="kbody-section">
          <span class="kbody-label">// HOOK &amp; DIRECTIVE</span>
          <div class="kbody-text">
            Three people dead in five days at Baltimore's Inner Harbor — bartender, retiree, dockworker. ME finding: no cause. A Shōjō — Japanese sea spirit, vessel-bound — arrived eight weeks ago in a grief-brewed sake cask shipped by Hosokawa Shipping. It feeds on human emotion when the sake runs low. A fourth victim will die tonight. Six ceremonial casks on a floating barge; one is cursed. Veritas (Op. WHITECEDAR) pre-shaped the situation and wants the cask as a natural BIM source.<br><br>
            <strong>Lab directive:</strong> Identify the entity. Locate and secure the Tachibana cask before Veritas does. Resolve without further casualties. Document the natural-source BIM mechanism.
          </div>
        </div>

        <div class="kbody-section">
          <span class="kbody-label">// THE ENTITY — THE SHŌJŌ</span>
          <div class="kbody-text">
            Cannot leave the cask. Cannot stop drinking. When sake runs low, it feeds on human emotion — the bystander cascade produces extreme euphoria, then cardiac arrest. BIM signature: muted by day, readable at close range only; spikes at dusk when it surfaces from the harbour.<br><br>
            <strong>Resolution key:</strong> The brewer's letter (Akira Tachibana, sealed, in Japanese). Yuki Tanaka — cultural coordinator — has it. Reading it aloud with genuine understanding of what Tachibana lost reduces the creature's armour and opens the Drink With the Spirit move. Best ending: offer sake in a cup with real emotion. The Shōjō departs. Hisako goes with it.
          </div>
        </div>

        <div class="kbody-section">
          <span class="kbody-label">// THREE INVESTIGATION ROUTES</span>
          <div class="kbody-text">
            <strong>Det. Pulaski's case file:</strong> three deaths, three ME no-cause findings, one witness (Mariana Costa). Pulaski visited the death sites himself. He believes Mariana.<br><br>
            <strong>The brewer's letter:</strong> Sealed, in Japanese, in Yuki's possession. Names the Tachibana cask and the resolution method ("give it to the sea").<br><br>
            <strong>The Veritas tablet:</strong> Recovered Veritas field brief — confirms Op. WHITECEDAR, Officer M.K.'s mob pre-shaping, and that Veritas wants the cask alive as a natural BIM source.
          </div>
        </div>

        <div class="kbody-section">
          <span class="kbody-label">// RESOLUTION PATHS</span>
          <div class="kbody-text">
            <strong>Drink With the Spirit (best):</strong> Sake cup + brewer's letter read aloud + genuine emotion. Shōjō departs. Hisako at peace. Cask safe to handle.<br><br>
            <strong>Contain and return to lab (strong):</strong> Cask secured, Shōjō inside. BIM study opportunity — and a liability. Veritas will pursue.<br><br>
            <strong>Veritas takes the cask (partial):</strong> Civilians safe for now. Veritas acquires a live natural-source BIM vessel. Long-term consequence: unresolved.
          </div>
        </div>

        <div class="full-col">
          <a href="04-the-shojo.html" class="full-link">→ OPEN FULL PREP DOCUMENT</a>
        </div>

      </div>
    </div><!-- /m04 -->

  </div><!-- /missions-list -->
```

- [ ] **Step 2: Verify HTML is valid (no unclosed tags)**

```bash
grep -c "kmission" missions/keeper.html
```

Expected: count increases by ~2 (the new entry adds at least 2 occurrences of `kmission`). Previous count was around 20 — new should be ~22+.

- [ ] **Step 3: Commit**

```bash
git add missions/keeper.html
git commit -m "feat(keeper): add S04 mission card — The Shōjō"
```

---

## Task 3: Update `leech-call-1` in `data/sessions/s04.json`

**Files:**
- Modify: `data/sessions/s04.json`

- [ ] **Step 1: Replace Drive Home placeholder text**

Find:
```
"Field team, Leech. The secondary deployment — they're on the ground at [Gordon's house / Nadia's location]. Veritas is already there with paperwork. Sven is with them. They're holding. If you finish in Baltimore tonight, we may still be able to act. Acknowledge."
```

Replace with:
```
"Field team, Leech. The secondary deployment — they're on the ground from the mission. Veritas is already there with paperwork. Sven is with them. They're holding. If you finish in Baltimore tonight, we may still be able to act. Acknowledge."
```

- [ ] **Step 2: Validate JSON**

```bash
jq . data/sessions/s04.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 3: Confirm the change**

```bash
jq '.handouts[] | select(.id == "leech-call-1") | .body' data/sessions/s04.json
```

Expected: body text contains `from the mission` with no `[` or `]` brackets.

- [ ] **Step 4: Commit**

```bash
git add data/sessions/s04.json
git commit -m "feat(s04): update leech-call-1 drive-home placeholder text"
```

---

## Task 4: Add 5 thread entries to `data/portal-threads.json`

**Files:**
- Modify: `data/portal-threads.json`

The file is `{ version, source, threads: [] }`. Append 5 new objects to the `threads` array. All are pre-session — nothing is resolved.

- [ ] **Step 1: Append the 5 thread objects**

Find the closing `]` of the `threads` array (after the current last entry `prompt-book-lab`) and insert before it, adding a comma after the existing last entry:

```json
    {
      "id": "case-d-shojo-baltimore",
      "name": "Case D — The Shōjō (Baltimore)",
      "category": "case",
      "status": "active",
      "last_moved": "w4",
      "summary": "Baltimore Inner Harbor. A Shōjō — Japanese sea spirit — arrived eight weeks ago in a grief-brewed sake cask shipped by Hosokawa Shipping from Hyōgo Prefecture. Three civilians dead: Marcus Schroeder (Rusty's), Eleanor Walsh (Pier 5), Frank Delgado (dockside). ME no-cause on all three. Fourth victim expected tonight. The spirit is vessel-bound — cannot leave the cask, cannot stop drinking. When sake runs low it feeds on human emotion instead. The brewer's letter (Akira Tachibana, sealed, in Japanese, in Yuki Tanaka's possession) identifies the cask and the resolution path. Case D is active at session start.",
      "notes": "PRIORITY: URGENT. Fourth victim tonight if unresolved. Six casks on the Hosokawa barge — one cursed. Veritas (Op. WHITECEDAR) is also on-site, wants the cask as a natural BIM source. Resolution: give the sake to the sea, or Drink With the Spirit using the brewer's letter. See 04-the-shojo.html.",
      "player_summary": null,
      "player_name": null
    },
    {
      "id": "veritas-op-whitecedar",
      "name": "Veritas — Op. WHITECEDAR",
      "category": "faction",
      "status": "active",
      "last_moved": "w4",
      "summary": "Veritas operational brief (recovered tablet) — WHITECEDAR is their Baltimore operation. Target: the Tachibana cask. Objective: acquire a natural BIM source before PORTAL resolves the case. Officer M.K. pre-shaped dockworker sentiment on the waterfront before PORTAL arrived. Officer C.V. (Rook) is confirmed elsewhere — the person the team encounters in Baltimore is not Rook. CAMPBELL's attention to Case D was accelerated by Veritas specifically to pull the field team out of position. Veritas modelled Case D six weeks before PORTAL was briefed.",
      "notes": "KEY: 'natural source priority' — Veritas considers natural BIM sources categorically more significant than manufactured ones. The longshoremen mob is orchestrated, not organic. Officer M.K.'s cover identity is unknown. Post-session: CAMPBELL integrity test results (planted in #0099-D/SUP) should show whether fabricated intel reached Veritas through this operation.",
      "player_summary": null,
      "player_name": null
    },
    {
      "id": "the-cask",
      "name": "The Cask — Tachibana Taru",
      "category": "mystery",
      "status": "active",
      "last_moved": "w4",
      "summary": "A traditional cedar taru from Tachibana Brewery, Hyōgo Prefecture. Brewer Akira Tachibana's daughter Hisako died of leukaemia during the brewing; the cask carries her residue. The Shōjō is bound to it. The cask is 60 litres, half-full, painted with the Tachibana brewery's mon — one of six ceremonial casks in Storage Hold A aboard the Hosokawa barge. Visually indistinguishable from the others without the brewer's letter or Rex's scanner at close range. Disposition pending session resolution.",
      "notes": "Same class of object as the Meridian prompt book (S03) — a catalyst that both summons and resolves. Destroying the cask releases the spirit unbound. Using it correctly (sake offering + genuine emotion + brewer's letter) is the best ending. Veritas wants it alive. Post-session: lock cask disposition canon slot.",
      "player_summary": null,
      "player_name": null
    },
    {
      "id": "sven-parallel-deployment",
      "name": "Sven — Parallel Deployment",
      "category": "personal",
      "status": "active",
      "last_moved": "w4",
      "summary": "Sven was pulled aside for a parallel operation before the Baltimore deployment. He is not with the field team in S04. Veritas is aware of Sven specifically and has prepared for his presence (per Op. WHITECEDAR tablet — 'sven-contingency'). The parallel deployment target and outcome are player-defined post-session. The Baltimore team receives radio updates from Leech during the session; Leech's final call: 'safe. Ish.'",
      "notes": "Drive Home choice determines what Sven was doing and what he found. Lock post-session. The Veritas contingency for Sven is documented in the recovered tablet but not detailed — leave the specifics open for player discovery in S05.",
      "player_summary": null,
      "player_name": null
    },
    {
      "id": "mob-preshaped-mk",
      "name": "Mob Pre-Shaping — Officer M.K.",
      "category": "faction",
      "status": "active",
      "last_moved": "w4",
      "summary": "Veritas tablet confirms Officer M.K. pre-shaped dockworker union sentiment on the Baltimore waterfront before the PORTAL team arrived. The longshoremen who may threaten the barge believe they are acting on genuine grievances — they do not know they were manipulated. Officer M.K.'s cover identity is unknown to PORTAL. The pre-shaping was designed to create a mob escalation threat that would complicate PORTAL's operation and potentially force civilian casualties.",
      "notes": "M.K. is not Rook (C.V. is confirmed elsewhere per the tablet). M.K.'s cover identity is a live investigative thread for future sessions. The dockworkers are victims of manipulation — player framing matters here for tone.",
      "player_summary": null,
      "player_name": null
    }
```

- [ ] **Step 2: Validate JSON**

```bash
jq . data/portal-threads.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 3: Verify thread count**

```bash
jq '.threads | length' data/portal-threads.json
```

Expected: `21` (was 16, +5 new).

- [ ] **Step 4: Commit**

```bash
git add data/portal-threads.json
git commit -m "feat(threads): add S04 threads — Shōjō case, WHITECEDAR, the cask, Sven parallel, mob pre-shaping"
```

---

## Task 5: Add S04 entry to `data/report-schema.json`

**Files:**
- Modify: `data/report-schema.json`

The file is a top-level array. Append an S04 object following the S03 structure. All values are empty/null — the keeper fills these post-session.

- [ ] **Step 1: Append S04 entry**

Find the closing `]` of the top-level array (after the last S03 entry's closing `}`) and insert before it:

```json
  {
    "session_id": "S04",
    "week_id": "W04",
    "week_label": "Week 04",
    "week_subtitle": "The Shōjō",
    "keeper_threads": [
      "CASE D — THE SHŌJŌ (BALTIMORE)",
      "VERITAS — OP. WHITECEDAR",
      "MOB PRE-SHAPING (OFFICER M.K.)",
      "THE CASK — TACHIBANA TARU",
      "SVEN — PARALLEL DEPLOYMENT",
      "CAMPBELL / CAMERON DELL — INTEGRITY TEST RESULTS",
      "PROJECT VEIL — NATURAL BIM SOURCE",
      "CASE A — GORDON AVERY",
      "CASE C — NADIA OSEI",
      "REED'S PRIVATE DIRECTIVE",
      "ALAN'S THRESHOLD MAPS"
    ],
    "keeper_clocks": [
      { "id": "clock-stirring",          "label": "Stirring Clock" },
      { "id": "clock-mob",               "label": "Mob Clock" },
      { "id": "clock-veritas-encounter", "label": "MESA/Veritas Encounter Clock" },
      { "id": "clock-shojo-encounter",   "label": "Shōjō Encounter Clock" }
    ],
    "keeper_scenes": [
      {
        "id": "arrival-investigation",
        "label": "ARRIVAL & INVESTIGATION",
        "prompt": "Which investigation routes did the team pursue — Pulaski (case file), Mariana (witness), Yuki (cask + letter), Rex's scanner? How did they identify the cursed cask? What was the Stirring Clock state going into dusk? What did they miss or skip?"
      },
      {
        "id": "dusk-confrontation",
        "label": "DUSK: MOB, VERITAS, AND THE SHŌJŌ",
        "prompt": "How did the three-way scene unfold — mob on the quay, Veritas arriving for the cask, the Shōjō surfacing at dusk? Which thread did the team address first? Final cask disposition: returned to sea / contained at lab / taken by Veritas / destroyed? Were there civilian casualties?"
      },
      {
        "id": "resolution-outcome",
        "label": "RESOLUTION & DRIVE HOME",
        "prompt": "Best ending (Drink With the Spirit) / strong ending (containment) / partial (Veritas takes it) / bad (destroyed)? Final state of each clock? What did Leech say on the radio? What happened to Sven? What seeds did you plant for S05?"
      }
    ],
    "player_scenes": [
      {
        "id": "the-harbor",
        "label": "THE HARBOR BY DAY",
        "prompt": "Pulaski has been on the job forty years. He has seen every kind of dead face. He had never seen ecstasy before this week. What did that land like for your operative when you first heard it?"
      },
      {
        "id": "the-shojo",
        "label": "THE SHŌJŌ",
        "prompt": "Tall. Red-haired. Swaying. Singing in Japanese in the fog over the harbour. What did your operative actually see? Was there a moment in the encounter where you felt something shift — not fear, something else?"
      },
      {
        "id": "your-moment",
        "label": "YOUR OPERATIVE'S MOMENT",
        "prompt": "Was there a moment this session where your operative felt fully themselves — or fully out of their depth? A decision, a line, a choice under pressure. What was it?"
      }
    ],
    "canon_slots": [
      {
        "id": "rex-sake-device",
        "category": "GADGET",
        "label": "Rex's Sake Deployment Device",
        "prompt": "Rex had to turn sake into a weapon or a tool. What did he build — an atomiser, coated rounds, a spray bottle, an aerosol grenade? What did he call it? Whatever the player described is now canon."
      },
      {
        "id": "scanner-name",
        "category": "GADGET",
        "label": "Rex's BIM Scanner — Name",
        "prompt": "The scanner has been in the field for four sessions. Does it have a name now? Whatever the player called it is canon."
      },
      {
        "id": "hisako-texture",
        "category": "TEXTURE",
        "label": "Hisako Tachibana",
        "prompt": "Akira Tachibana's daughter, who died of leukaemia while the sake was brewing. How old was she? What was she like? The brewer's letter doesn't say. If the table conjured her or speculated about her, lock it in."
      },
      {
        "id": "shojo-appearance",
        "category": "TEXTURE",
        "label": "The Shōjō's Exact Appearance",
        "prompt": "Tall. Red-haired. Swaying. Singing in Japanese. What else — how tall exactly, did it have a face, what did the singing sound like up close? What the players described and the keeper riffed on is canon."
      },
      {
        "id": "cask-disposition",
        "category": "THEORY",
        "label": "What PORTAL Did With the Cask",
        "prompt": "If the cask returned to the lab — what does PORTAL do with a vessel that held a sea spirit? What does Cameron think? If it went to the sea, who threw it? If Veritas took it, what does the team think that means long-term?"
      },
      {
        "id": "bim-taxonomy",
        "category": "THEORY",
        "label": "Natural vs. Engineered BIM",
        "prompt": "The Shōjō is a natural BIM source — no arrays, no infrastructure, just grief. The Aldermoor entity and the Meridian mechanism were different. If a player developed a taxonomy and the keeper adopted it, note it here."
      },
      {
        "id": "veritas-cask-intent",
        "category": "THEORY",
        "label": "Did Veritas Engineer the Cask's US Landing?",
        "prompt": "The tablet says 'natural source priority' but not how long Veritas has known. Did they know before the cask shipped, or find it in Baltimore? If the team formed a theory and acted on it, note it."
      },
      {
        "id": "sven-deployment-outcome",
        "category": "THEORY",
        "label": "What Happened to Sven on the Parallel Deployment",
        "prompt": "Leech said 'safe. Ish.' — what did Sven actually find? Who was at the location? What did Veritas have waiting for him? Lock the Drive Home choice here."
      }
    ]
  }
```

- [ ] **Step 2: Validate JSON**

```bash
jq . data/report-schema.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 3: Verify S04 entry present**

```bash
jq '[.[] | .session_id]' data/report-schema.json
```

Expected: array includes `"S04"`.

- [ ] **Step 4: Commit**

```bash
git add data/report-schema.json
git commit -m "feat(report-schema): add S04 entry — The Shōjō"
```

---

## Task 6: Verify all five dossier pages

**Files:** Read-only verification of existing files.

- [ ] **Step 1: Check DOSSIER_ID declarations**

```bash
grep "DOSSIER_ID" handouts/dossier/s04-*.html
```

Expected output (one line per file):
```
handouts/dossier/s04-brewer-letter.html:  const DOSSIER_ID = "s04-brewer-letter";
handouts/dossier/s04-harbor-map.html:     const DOSSIER_ID = "s04-harbor-map";
handouts/dossier/s04-mariana-statement.html: const DOSSIER_ID = "s04-mariana-statement";
handouts/dossier/s04-pulaski-case-file.html: const DOSSIER_ID = "s04-pulaski-case-file";
handouts/dossier/s04-veritas-tablet.html: const DOSSIER_ID = "s04-veritas-tablet";
```

- [ ] **Step 2: Check all pages link dossier.js and dossier.css**

```bash
for f in handouts/dossier/s04-*.html; do
  echo "$f:"
  grep -o 'dossier\.css\|dossier\.js' "$f" | sort | uniq | tr '\n' ' '
  echo
done
```

Expected: every file shows both `dossier.css` and `dossier.js`.

- [ ] **Step 3: Count clue-hint spans per page**

```bash
for f in handouts/dossier/s04-*.html; do
  count=$(grep -c 'class="clue-hint"' "$f")
  echo "$f: $count clue-hint spans"
done
```

Expected counts (per brief §D.3):
- `s04-brewer-letter.html`: 3
- `s04-harbor-map.html`: 1
- `s04-mariana-statement.html`: 5
- `s04-pulaski-case-file.html`: 12
- `s04-veritas-tablet.html`: 7 (brief §D.3 header says 6 but lists 7 items — trust the list, not the header count)

- [ ] **Step 4: Verify s04.json handout links resolve**

```bash
jq -r '[.handouts[] | select(.link != null) | .link] | .[]' data/sessions/s04.json | while read f; do
  [ -f "$f" ] && echo "OK: $f" || echo "MISSING: $f"
done
```

Expected: all lines start with `OK:`.

---

## Task 7: Final validation (runs after Tasks 1–6)

- [ ] **Step 1: Validate all modified JSON files**

```bash
for f in data/sessions/s04.json data/portal-threads.json data/report-schema.json; do
  jq . "$f" > /dev/null && echo "VALID: $f" || echo "INVALID: $f"
done
```

Expected: all `VALID`.

- [ ] **Step 2: Verify thread count**

```bash
jq '.threads | length' data/portal-threads.json
```

Expected: `21`.

- [ ] **Step 3: Confirm S04 entry in report-schema**

```bash
jq '.[] | select(.session_id == "S04") | {session_id, week_subtitle, canon_slots_count: (.canon_slots | length)}' data/report-schema.json
```

Expected: `{ "session_id": "S04", "week_subtitle": "The Shōjō", "canon_slots_count": 8 }`.

- [ ] **Step 4: Confirm no "MESA" in player-visible handouts in s04.json**

```bash
jq '[.handouts[] | select(.type != "classified") | select(.body != null) | select(.body | test("MESA"))] | length' data/sessions/s04.json
```

Expected: `0`.

- [ ] **Step 5: Confirm keeper.html has m04 entry**

```bash
grep -c "id=\"m04\"" missions/keeper.html
```

Expected: `2` (the div and the body div).

- [ ] **Step 6: Confirm mission-prep.css has .diff class**

```bash
grep -c "\.diff" mission-prep.css
```

Expected: `6` (`.diff` plus 5 variants).

- [ ] **Step 7: Push to remote**

```bash
git log --oneline -7
git push
```

Expected: 5 feature commits from Tasks 1–5 in the log.

---

## Track C: Image Generation (Keeper Action — Not Automated)

Image generation requires `OPENAI_API_KEY` in `.env`. Run manually:

```bash
python generate_images.py
```

Output directory: `images/sessions/s04/`

Generate:
- `s04-shojo-glimpse` — mark for keeper review before going live (the Shōjō's appearance is intentionally player-defined)
- `s04-pulaski-portrait`
- `s04-yuki-portrait`

Skip: `s04-mariana-portrait` (SVG sketch in `s04-mariana-statement.html` is sufficient).

After generation, confirm files exist:
```bash
ls images/sessions/s04/
```

---

## Execution Notes

**Parallel execution:** Tasks 1, 2, 3, 4, 5 have no dependencies between them. Use `superpowers:subagent-driven-development` to dispatch all five simultaneously, then run Tasks 6 and 7 sequentially after all five complete.

**Image generation (Track C):** Run manually with API key — cannot be automated without environment credentials.
