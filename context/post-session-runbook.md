# P.O.R.T.A.L — Post-Session Runbook
*Hand this file to Claude Code at the start of any post-session update session, along with `portal-architecture.md`, `worldbuilding-lore.md`, and `worldbuilding-site.md`.*
*Also paste the Keeper Field Report markdown (from the "Copy for Claude" button) directly into the chat.*

---

## Overview

After each session, updates happen in two stages:

1. **Data collection** — Keeper and players fill their reports independently (no Claude needed)
2. **Site updates** — Claude Code updates the site with new session data (this document)

---

## Stage 1 — After the Session Ends (Keeper, no Claude needed)

- [ ] Open `missions/report.html` (Keeper Field Report)
  - Select the session tab (S01, S02, S03…)
  - Fill all sections: outcome, directive, summary, ratings, hunter cards, scene notes, threads, clocks, next session seeds
  - Click **// SAVE REPORT** — syncs to D1 (shared across devices)
  - Click **⬡ COPY FOR CLAUDE** — keep this Markdown; you'll paste it into the next Claude session

- [ ] Remind players to fill `reports/player-report.html` (Operative Field Report)
  - Each player selects their week + operative
  - Fills the 5 rating pips and feedback fields
  - Clicks **// SAVE REPORT** — saves to D1 automatically, unique per player+week
  - No action needed from Keeper — data is waiting in D1 when you're ready

---

## Stage 1.5 — Session Prep Export (Before Next Session, no Claude needed)

Before authoring a new session or prepping with Claude, generate the session context export from the keeper site:

1. Open `missions/threads.html` (Campaign Threads & Clocks page)
2. Under **Session Prep Export**, click the case the players chose to tackle next
3. Click **⬡ COPY SESSION CONTEXT FOR CLAUDE** — copies a markdown block to clipboard
4. Paste into claude.ai at the start of the session-prep conversation

The export includes:
- Full case briefing (rows + director's note) for the selected case
- All countdown clocks with current state and advancement guidance
- All threads grouped by status: active (full detail) → dormant (full detail) → resolved (names only)
- Last session field report summary (outcome + directive + summary) fetched from D1
- Between-session incidents for the active week — incident titles, narratives, choice options, and saved selections (locked choices + operative notes) fetched from D1
- Existing data reference: `sessions.json` (full), last `session-data.json` entry (format template), NPC ID roster, entity ID roster

This gives claude.ai everything it needs to produce all ingestion package sections without requiring separate data files.

Use this as the primary context handoff to claude.ai for new mission prep, NPC authoring, or CAMPBELL briefing drafting. Combine with `worldbuilding-lore.md` and the relevant context files per the "Context to Hand Claude" guide at the bottom of this document.

---

## Stage 1.6 — Generate Session Images (after mission prep, before session)

Once the mission prep ingestion package has been ingested (session-data.json updated, handout filenames confirmed), generate the images:

1. The mission prep package includes **Section J** — a `SNN-prompts.py` file (e.g. `S3-prompts.py`)
2. Run: `python generate_images.py S3-prompts` (adjust session number)
3. Images output to `images/` — already-generated images are skipped automatically
4. Verify the generated images match the `src` filenames in `data/session-data.json` handouts

**If incidents reference images** (Section G `"type": "image"` blocks, currently unused but possible), include those in the prompts file too.

**Note:** `OPENAI_API_KEY` must be in `.env` at repo root. If missing, paste it manually — it's gitignored.

---

## Stage 2 — Before Next Session (Claude Code session)

Hand Claude this file + `portal-architecture.md` + `worldbuilding-site.md` + `worldbuilding-lore.md` + the Keeper Field Report markdown.

Work through the checklist below in order. Not every item applies every session — mark what's needed.

---

### 2.0 — Advance the Campaign Session

This step updates the session-aware content system so player pages reflect the new state.

**a) Update `data/sessions.json`:**
- Mark the just-completed session `"status": "closed"`
- Add a new entry for the incoming session (`"status": "active"`)

```json
{ "id": "w3", "label": "WEEK 03", "title": "Mission Title", "status": "active" }
```

**b) Author W-next content variants in player-facing pages:**

For each session that just resolved, player pages need post-resolution variants. Most are now data-driven — **no HTML edits needed for bestiary or arcs**.

**Data-file edits (mission archive):**
- **`data/portal-missions.json`** — for the resolved mission, cap the active phase with `"show_until": "wN"` and append a new completed phase with `"show_from": "wN+1"`, `"status": "completed"`, revealed `index_redacted` text (no `[REDACT]`), proper `meta_tags` (green CONTAINED/RESOLVED tag), and a filled `outcome` string. For the upcoming mission, cap the upcoming phase with `"show_until": "wN"` and append a new active phase with `"show_from": "wN+1"`, `"status": "active"`, and the confirmed title, subtitle, excerpt, and meta_tags.

**HTML edits still required:**
- **`index.html`** — add COMPLETED variants for any recovered artefact cards with `data-session-from="wN+1"`. **Mission archive and bestiary are now data-driven — do NOT add HTML cards for these.**
- **`missions/contacts.html`** — add `data-session-from="wN+1"` wrappers for any NPCs now visible for the first time

The pattern is always: old card/phase gets `show_until: "wN"`, new card/phase gets `show_from: "wN+1"`.

**Data-file updates (instead of HTML):**
- **Bestiary** (`index.html`): append a new phase to `portal-entities.json` → `entity.bestiary.phases[]` with `show_from: "wN+1"`. Set the previous phase `show_until: "wN"` if it should hide after resolution. The bestiary re-renders from data on page load — no HTML change needed.
- **Hunter arcs** (`missions/arcs.html`): edit `data/hunter-arcs.json` to update arc content. The page renders entirely from that file.

**c) Add new session entry to `data/session-data.json`:**
- Add a new object for the incoming session with: `id`, `session_key`, `label`, `doc`, `entity_ids`, `threats`, `equipment`, `readaloud`, `handouts`
- `threats[]` = keeper combat reference (stat blocks, moves, harm capacity) for NPCs appearing this session — this is the THREATS tab cheat sheet in feed.html
- `handouts[]` = all pushable content for the session (readalouds, PDA messages, images, maps) — this is the keeper HANDOUTS tab in feed.html
- Use the existing W2 entry as a template. See `context/worldbuilding-site.md` Part 8 for the handout format.

**d) Update NPC `session_overrides` in `data/portal-npcs.json`:**
- For each NPC first revealed in this session, add a `"wN+1"` entry in `session_overrides` with the post-resolution `player_description`
- Set `available_from_session` to the session when they first appear in contacts.html
- Add new NPCs who appear for the first time as full entries
- Note: `portal-npcs.json` is the *persistent* NPC record (player descriptions, relationships, keeper arc notes across all sessions). `session-data.json threats[]` is the *tactical* reference for running them at the table. Recurring NPCs like Rook live in both — npcs.json for the campaign, session-data.json for their stat block each time they appear.

**e) Update entity data in `data/portal-entities.json`:**
- For any resolved entity, update `status` field: `"active"` → `"resolved"` / `"contained"` / `"escalated"`
- Update `session_overrides` if the keeper/player description changes post-resolution
- **Bestiary phases**: for entities on the player bestiary (`bestiary.show: true`), append a new fully-revealed phase with `show_from: "wN+1"` and set the previous phase's `show_until: "wN"`. Set `classified_blurred: false` on the new phase. The bestiary on `index.html` will pick up the change automatically — no HTML edits needed.

**f) The Keeper toggle in D1 does not need to be changed in code** — when the Keeper is ready for players to see the new session, they click the new week button in the keeper banner on any keeper page. This updates D1 and all player pages reflect it immediately.

---

### 2.1 — Add new session to Keeper Field Report

In `missions/report.html`, add a new entry to the `SESSIONS` config object.

Read `missions/NN-[mission-title].html` before writing scene prompts — it is the source of truth for what happened.

```js
S03: {
  title: 'Mission Title',
  threads: ['THREAD A', 'THREAD B', ...],
  clocks: [
    { id: 'clock-id', label: 'Clock description' },
  ],
  scenes: [
    { id: 'scene-id', label: 'SCENE LABEL', prompt: 'Keeper prompt.' },
  ]
}
```

---

### 2.2 — Add new week to Player Field Report

In `reports/player-report.html`, add a new entry to the `WEEKS` config object.

Use player-friendly language. Do not write questions about events that didn't happen.

```js
W03: {
  label: 'Week 03',
  subtitle: 'Mission Title',
  scenes: [
    { id: 'scene-id', label: 'SCENE LABEL', prompt: 'Player-facing question.' },
    { id: 'your-moment', label: "YOUR OPERATIVE'S MOMENT", prompt: 'Was there a moment where your operative really felt like themselves? What was it?' }
  ]
}
```

---

### 2.3 — Add new CAMPBELL briefing week

1. Create `missions/briefings/wNN.html` — see `worldbuilding-site.md` Part 8 for exact fragment format and CSS class reference
2. Update `missions/briefings/index.json` — add new entry, set previous week's `status` to `"closed"`
3. Use "Copy for Claude" output from the Keeper Field Report + CAMPBELL voice rules (`worldbuilding-lore.md`) to draft the briefing content

---

### 2.4 — Update NPC visibility and status

- If any NPCs were revealed to players: update `missions/contacts.html`
- If NPC relationships changed, alliances shifted, or new NPCs appeared: update `data/portal-npcs.json` keeper notes
- If any NPC died or status changed: update `status` field in `data/portal-npcs.json`

---

### 2.5 — Update entity status

- If any entity was resolved, seriously wounded, or evolved: update `data/portal-entities.json`
- Update `status` field: `active` → `resolved` / `contained` / `escalated`
- Update `bim_note` if any new Project Veil thread was established

---

### 2.6 — Update lore and site context files

Update `context/worldbuilding-lore.md` with anything confirmed in play:
- New lore or location details established at the table
- NPC behaviour that contradicts or extends their written description
- New connections between characters or organisations
- Hunter developments (new beats, arc moves, revelations)
- Any player-invented facts the Keeper adopted ("yes-and")

Keep this document honest — only add things that are now true in the fiction.

---

### 2.7 — Update hunter arc pages (if needed)

If arc beats were triggered during the session:
- Arc state saves via D1 during play — players click their choices live
- If the Keeper needs to override or correct arc state (wrong beat clicked, retcon): note what needs fixing and update the D1 record or clear and reset via the // RESET button on the hunter page

---

### 2.10 — Update campaign threads and clocks

After each session, ask these questions and edit the JSON files accordingly.

**`data/portal-threads.json` — update if:**
- A thread moved in this session → update `last_moved` to the new session id
- A dormant thread activated → change `status` from `"dormant"` to `"active"`
- A thread resolved → change `status` to `"resolved"`
- A new thread opened (new hook, new NPC relationship, new discovery) → add a new entry. **ID rule:** case-category threads must use `case-{letter}-{slug}` (e.g. `case-a-volunteer`) — the session prep export uses this to auto-highlight the selected case thread.
- Summary or notes are now inaccurate → update the text

**`data/portal-clocks.json` — ask after every session:**
1. **Should any existing clock advance?** (Did hunters ignore a case? Did MESA gain information? Did time pass in the fiction?)
   - Increment `filled` by the agreed number of ticks
   - Advance note in `advancement_note` explains when to tick each clock
2. **Did any clock fire?** (filled == segments)
   - Update `status` to `"resolved"` and note the outcome in the `notes` field
3. **Is there a new time-sensitive threat that needs a clock?**
   - Add a new entry: `id`, `label`, `description`, `segments` (4 for most, 6 for longer timelines), `filled: 0`, `status: "active"`, `segment_labels[]` (one label per segment), `advancement_note`, `notes`

**Guidance for clock design:**
- 4 segments = short window (1-4 sessions before it fires)
- 6 segments = medium window (3-6 sessions)
- Label segments as escalating states, not dates — keeps them flexible
- The last segment label describes what happens when the clock fires
- `advancement_note` should be specific: "Advance 1 tick if hunters make no contact with X this session"

---

### 2.8 — Apply any new D1 migrations

If new DB tables were added since last deploy:
```bash
wrangler d1 execute portal-db --file=workers/migrations/NNN_description.sql           # local
wrangler d1 execute portal-db --file=workers/migrations/NNN_description.sql --remote  # remote
```
Remote requires active `wrangler login` session. If auth error, run `wrangler login` first.

---

### 2.9 — Commit and push

```bash
git add [changed files]
git commit -m "post-session update: S0N [brief description]"
git push origin dev
```

---

## Stage 3 — Reviewing Player Reports

Player feedback is stored in D1 (`player_reports` table, keyed by `week` + `hunter_id`).

**`reports/keeper-review.html`** — keeper review page is built. W01/W02 tabs, auto-loads on click, fetches all 5 hunter reports via `Promise.all`, 5-col responsive card grid. Filed/not-filed badge, rating pips, text fields, scene notes per hunter.

To query raw D1 directly (fallback):
```bash
wrangler d1 execute portal-db --command "SELECT hunter_id, state FROM player_reports WHERE week = 'W01'" --remote
```

---

## Full Checklist — Files Touched Each Session

### Files to create (new session)
- [ ] `missions/briefings/wNN.html` — CAMPBELL queue fragment for the new week
- [ ] `missions/NN-[title].html` — session prep doc (if prepped before session)
- [ ] `SNN-prompts.py` — image generation prompts (Section J of ingestion package); run `python generate_images.py SNN-prompts` after ingestion
- [ ] `reports/sN-[title].html` — player-facing post-session memo (if written)

### Files to modify (every session)
- [ ] `data/portal-missions.json` — cap resolved mission phase with `show_until`; add completed + next active phases (step 2.0b)
- [ ] `data/portal-threads.json` — update `last_moved`, `status`, summaries, `player_summary` fields; add new threads (step 2.10)
- [ ] `data/portal-clocks.json` — advance `filled` on any ticking clocks; add new clocks (step 2.10)
- [ ] `data/evidence.json` — append new evidence items for this session (Section L of ingestion package). After ingesting, consider whether any `hidden: true` items should now be `hidden: false` (keeper has revealed them in play). Keeper can also toggle visibility live on `evidence.html` without touching the JSON.
- [ ] `data/sessions.json` — add new session entry, mark previous `"closed"` (step 2.0a)
- [ ] `missions/briefings/index.json` — add new week entry, close previous
- [ ] `missions/report.html` — add new session to `SESSIONS` config
- [ ] `reports/player-report.html` — add new week to `WEEKS` config
- [ ] `data/session-data.json` — add new session entry with threats, equipment, handouts, readaloud (step 2.0c)
- [ ] `data/portal-npcs.json` — update status, `session_overrides` for newly-revealed NPCs, `keeper_scene_notes` for next mission (step 2.0d)
- [ ] `data/portal-entities.json` — update entity status, `session_overrides`, and `bestiary.phases[]` for resolved/changed entities (step 2.0e)
- [ ] `context/worldbuilding-lore.md` — update lore, NPC relationships, confirmed facts
- [ ] `context/post-session-runbook.md` — update this file if the workflow changes

### Files to modify (when needed)
- [ ] `missions/missions.html` — add W-next session-aware card variants (step 2.0b)
- [ ] `index.html` — add W-next session-aware variants for archive and artefacts only — **not bestiary** (step 2.0b)
- [ ] `missions/contacts.html` — add W-next contact sections for newly-visible NPCs (step 2.0b)
- [ ] `data/hunter-arcs.json` — if arc content changes (new arc added, description updated, status changed)
- [ ] `missions/arcs.html` — **only** if beat state needs manual correction via browser (beat/status saved in localStorage)
- [ ] `context/portal-architecture.md` — update if infrastructure changes
- [ ] `workers/migrations/` — new SQL if new DB tables added

---

## Context to Hand Claude — By Task Type

### Post-session site update (most common)
- `context/post-session-runbook.md` (this file)
- `context/portal-architecture.md`
- `context/worldbuilding-lore.md`
- `context/worldbuilding-site.md`
- The Keeper Field Report markdown (from "Copy for Claude" button on `missions/report.html`)
- Optionally: player report data (paste D1 query output, or ask Claude to query and summarise)

### New session data authoring (before next session)
Hand Claude these files so it knows the existing state before adding to it:
- `context/post-session-runbook.md` (this file — step 2.0 explains what to produce)
- `context/worldbuilding-lore.md` (NPCs, world, CAMPBELL voice)
- `data/session-data.json` (so Claude adds the new entry in the right format)
- `data/portal-npcs.json` (so Claude knows which NPCs already exist before adding new ones)
- The mission prep HTML doc if written (e.g. `missions/03-title.html`)

Claude should produce: new entry in `session-data.json` (threats, equipment, handouts, readaloud) + updates to `portal-npcs.json` (new NPCs, session_overrides for any that change) + `SNN-prompts.py` (Section J — one entry per `"type": "image"` handout). Share `S2-prompts.py` as the format reference.

### Lore / NPC / worldbuilding only
- `context/worldbuilding-lore.md`

### Coding / feature work
- `context/portal-architecture.md`
- `context/worldbuilding-site.md`
