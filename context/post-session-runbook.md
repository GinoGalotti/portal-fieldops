# P.O.R.T.A.L — Post-Session Runbook
*Hand this file to Claude Code at the start of any post-session update session, along with `portal-architecture.md` and `worldbuilding.md`.*
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

## Stage 2 — Before Next Session (Claude Code session)

Hand Claude this file + `portal-architecture.md` + `worldbuilding.md` + the Keeper Field Report markdown.

Work through the checklist below in order. Not every item applies every session — mark what's needed.

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

1. Create `missions/briefings/wNN.html` — copy previous week as starting point (see worldbuilding.md Part 3 for fragment rules)
2. Update `missions/briefings/index.json` — add new entry, set previous week's `status` to `"closed"`
3. Use "Copy for Claude" output from the Keeper Field Report + CAMPBELL voice rules (worldbuilding.md Part 6) to draft the briefing content

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

### 2.6 — Update worldbuilding.md

Update `context/worldbuilding.md` with anything confirmed in play:
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

**Future:** a keeper review page will display all reports for a given week — aggregated ratings and notes side by side.

**For now**, to read a specific player's report:
```bash
wrangler d1 execute portal-db --command "SELECT hunter_id, state FROM player_reports WHERE week = 'W01'" --remote
```

Or ask Claude to query all reports for a week and summarise the ratings and key feedback.

---

## Full Checklist — Files Touched Each Session

### Files to create (new session)
- [ ] `missions/briefings/wNN.html` — CAMPBELL queue fragment for the new week
- [ ] `missions/NN-[title].html` — session prep doc (if prepped before session)
- [ ] `reports/sN-[title].html` — player-facing post-session memo (if written)

### Files to modify (every session)
- [ ] `missions/briefings/index.json` — add new week entry, close previous
- [ ] `missions/report.html` — add new session to `SESSIONS` config
- [ ] `reports/player-report.html` — add new week to `WEEKS` config
- [ ] `data/portal-npcs.json` — update status, keeper notes, visibility
- [ ] `data/portal-entities.json` — update entity status
- [ ] `context/worldbuilding.md` — update lore, NPC relationships, confirmed facts
- [ ] `context/post-session-runbook.md` — update this file if the workflow changes

### Files to modify (when needed)
- [ ] `missions/contacts.html` — update visible NPCs
- [ ] `missions/arcs.html` — arc tracker (if beats were missed or need manual correction)
- [ ] `context/portal-architecture.md` — update if infrastructure changes
- [ ] `workers/migrations/` — new SQL if new DB tables added

---

## Context to Hand Claude at Session Start

Always provide:
- `context/portal-architecture.md`
- `context/worldbuilding.md`
- `context/post-session-runbook.md` (this file)
- The Keeper Field Report markdown (from "Copy for Claude" button on `missions/report.html`)

Optionally:
- Player report data (paste D1 query output, or ask Claude to query and summarise)
- Any new mission prep notes or between-session lore additions
