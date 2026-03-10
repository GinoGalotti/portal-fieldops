# P.O.R.T.A.L — Full Architecture & Roadmap
*Technical planning document. Hand to Claude Code at the start of any infrastructure session.*

---

## The Vision (Plain Language)

Two modes, one codebase:

**Between sessions (async):** A campaign hub. Keeper and players can access character sheets, arc progress, session reports, NPC contact list, CAMPBELL briefings with history, open leads per session. All persistent, versioned, accessible from any device.

**During sessions (live):** A table tool. Players roll dice, see outcomes, receive CAMPBELL terminal messages and Director PDA dispatches, view handouts and images, access their moves and sheet. Keeper has a command board: push content to players, reveal NPCs, display monster stats, trigger scene flavour, run the session.

These share the same data layer. The async hub feeds the live tool. A session report filed after play becomes context for the next briefing.

---

## What We Are NOT Building

- A general TTRPG platform
- A Roll20 replacement for other games
- Anything requiring a native app
- Anything with complex auth (no passwords — see auth section)

---

## Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Hosting (static) | **Cloudflare Pages** | Free, fast, deploys from GitHub, global CDN |
| API | **Cloudflare Workers** | Serverless, runs at the edge, free tier vast, same deployment as Pages |
| Database | **Cloudflare D1** | SQLite at the edge, free tier sufficient (5GB, 25M reads/day), no separate service to manage |
| Realtime (live session) | **Cloudflare Durable Objects** | Stateful WebSocket rooms, same CF account, free tier includes 400k requests/day |
| Auth | **Cloudflare Access** (keeper) + **URL tokens** (players) | No passwords, no signup. Keeper gets Google SSO. Players get a session link. |
| Version control | **GitHub** | Stays. CF Pages deploys from the repo. |
| Existing static pages | **Unchanged** | All current HTML/CSS pages stay exactly as built. Workers API is additive. |

### Why Cloudflare over alternatives

- **vs Supabase:** No free-tier project pauses. No external dependency. Everything in one CF account (currently $0).
- **vs GitHub API as backend:** Works for one keeper. Breaks for multi-user, real-time, player sheets.
- **vs Vercel + PlanetScale / Neon:** More moving parts, more potential costs, more configuration.
- **vs self-hosted:** Zero ops burden.

---

## Repository Structure (Actual)

```
portal-fieldops/
├── context/                   # Claude reference docs — hand these at session start
│   ├── worldbuilding.md       # World, voice, design system (for new pages)
│   └── portal-architecture.md # This file — technical stack, schema, build phases
│
├── data/                      # Static game data (not in DB) — see "Static Data Files" section
│   ├── motw-basic-moves.json      # All basic moves, alternate Weird moves, new Weird moves
│   ├── motw-playbooks.json        # Active hunter playbooks (Action Scientist, Sidekick, Changeling, Monstrous, Flake)
│   ├── motw-teambooks.json        # Research Lab team playbook (PORTAL's active team book)
│   ├── portal-custom-moves.json   # MESA equipment moves + house rules
│   ├── hunters.json               # Hunter starting states + player choices seed data
│   ├── portal-npcs.json           # Full NPC roster with player/keeper description split
│   └── portal-entities.json       # Entity/threat database for keeper command board
│
├── functions/                 # CF Pages Functions (serverless API, auto-routed)
│   └── api/v1/
│       ├── hunters/[id]/arc-state.js          # GET + PUT hunter arc state → D1
│       ├── reports/[id]/state.js              # GET + PUT keeper field report per session → D1
│       └── player-reports/[week]/[hunter]/state.js  # GET + PUT player debrief per week+hunter → D1
│
├── workers/                   # Cloudflare Workers API (Phase 3+)
│   ├── schema.sql             # D1 schema — already applied to remote DB
│   ├── migrations/            # Numbered SQL migration files
│   │   ├── 001_arc_state.sql     # hunter_arc_state table (applied remote + local)
│   │   ├── 002_field_reports.sql # field_reports table (applied local; remote needs wrangler login)
│   │   └── 003_player_reports.sql # player_reports table (applied local)
│   └── src/                   # (Phase 3) Workers source
│       ├── index.ts           # Main router
│       └── routes/
│           ├── characters.ts
│           ├── rolls.ts
│           ├── session.ts
│           ├── npcs.ts
│           ├── messages.ts
│           └── leads.ts
│
├── app/                       # (Phase 3+) New interactive pages
│   ├── session.html           # Live session tool (player view)
│   ├── command.html           # Live session tool (keeper command board)
│   ├── sheet.html             # Character sheet (player-editable)
│   ├── hub.html               # Campaign hub (combined dashboard)
│   └── contacts.html          # NPC contact list (player-facing)
│
├── wrangler.jsonc             # CF Pages + D1 config (root)
├── index.html                 # Player-facing site
├── missions/                  # Keeper + player mission pages
├── reports/                   # Post-session player-facing reports
│   ├── player-report.html     # Player debrief form (week + hunter selector, ratings, scene notes)
│   └── s1-ash-veil-memo.html  # S01 redacted ash/veil lab report (static)
├── hunters/                   # Hunter story pages (arc choices + beats persist to D1)
│   ├── hunter.js              # Shared script: keeper toggle, D1 save/load, all interactions
│   └── *-hunter-stories.html  # One page per hunter — no inline scripts, just <script src="hunter.js">
├── images/                    # Active reference images
├── player-nav.js              # Shared player nav
└── missions/keeper-nav.js     # Shared keeper nav
```

---

## Cloudflare Configuration (Live)

- **CF account:** gino.galotti@gmail.com | Account ID: `16173cc8b08eab625480fc137852403b`
- **CF Pages:** Connected to GitHub repo, deploying from `dev` branch
- **D1 database:** `portal-db` | ID: `aa558dc0-96c4-4c88-ab54-a79611d161d2` | binding: `portal_db`
- **wrangler.jsonc** at repo root — binding already configured
- **GitHub Pages** still serves `main` for players while `dev` / CF Pages is in development

---

## Database Schema (D1 / SQLite)

Schema is in `workers/schema.sql` and has been applied to the remote D1 database. All 13 tables created.

Migrations are numbered files in `workers/migrations/`. Each must be applied to **both** remote and local D1:
```bash
wrangler d1 execute portal-db --file=workers/migrations/001_arc_state.sql          # local
wrangler d1 execute portal-db --file=workers/migrations/001_arc_state.sql --remote # remote
```

**Migration 001 — `hunter_arc_state`** (applied ✅)

```sql
-- ─── FIELD REPORTS (migration 002) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS field_reports (
  session_id TEXT PRIMARY KEY,   -- 'S01' | 'S02' etc (keeper report, one per session)
  state      TEXT NOT NULL,      -- JSON blob: { session, mission, date, outcome, directive, summary,
                                 --   energy, intensity, best, surprise, flat,
                                 --   hunters: { rex/reed/alan/sven: { action, arc, note } },
                                 --   threads: [], unresolved, questions, npcs,
                                 --   clocks: [], clockNotes, scenes: { scene_id: text },
                                 --   spine, stars, wishes, campbell, setup, aiPrompt }
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ─── PLAYER REPORTS (migration 003) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_reports (
  week       TEXT NOT NULL,   -- 'W01' | 'W02' etc (player-facing week numbering)
  hunter_id  TEXT NOT NULL,   -- 'alan' | 'reed' | 'rex' | 'sven' | 'john'
  state      TEXT NOT NULL,   -- JSON blob: { week, hunter,
                              --   ratings: { story, atmosphere, role, emotion, overall } (0-5),
                              --   favourite, different, operative, other,
                              --   scenes: { scene_id: text } }
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (week, hunter_id)
);

-- ─── HUNTER ARC STATE (migration 001) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS hunter_arc_state (
  hunter_id  TEXT PRIMARY KEY,   -- 'alan' | 'reed' | 'rex' | 'sven'
  state      TEXT NOT NULL,      -- JSON blob matching hunter.js data model (see below)
  updated_at TEXT DEFAULT (datetime('now'))
);
-- JSON blob schema: { "arc-id": { choices: {"gi-oi": true}, texts: {"i": "val"}, beats: N, resolution: N|null } }

-- ─── HUNTERS ───────────────────────────────────────────────────────────────
CREATE TABLE hunters (
  id           TEXT PRIMARY KEY,        -- 'rex' | 'reed' | 'alan' | 'sven'
  name         TEXT NOT NULL,
  playbook     TEXT NOT NULL,
  harm         INTEGER DEFAULT 0,
  harm_max     INTEGER DEFAULT 7,
  stability    INTEGER DEFAULT 7,       -- for Monstrous/Changeling
  luck         INTEGER DEFAULT 7,
  xp           INTEGER DEFAULT 0,
  xp_threshold INTEGER DEFAULT 5,
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE hunter_stats (
  hunter_id TEXT REFERENCES hunters(id),
  stat      TEXT NOT NULL,             -- cool | tough | sharp | charm | weird
  value     INTEGER NOT NULL,
  PRIMARY KEY (hunter_id, stat)
);

CREATE TABLE hunter_moves (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id TEXT REFERENCES hunters(id),
  move_name TEXT NOT NULL,
  source    TEXT,                       -- 'basic' | 'playbook' | 'advanced' | 'custom'
  notes     TEXT
);

CREATE TABLE hunter_bonds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT REFERENCES hunters(id),
  target      TEXT NOT NULL,
  description TEXT
);

CREATE TABLE hunter_gear (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id TEXT REFERENCES hunters(id),
  name      TEXT NOT NULL,
  tags      TEXT,                       -- JSON array: ["hand", "2-harm", "loud"]
  notes     TEXT
);

-- ─── ROLL LOG ──────────────────────────────────────────────────────────────
CREATE TABLE rolls (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id TEXT REFERENCES hunters(id),
  session   TEXT NOT NULL,             -- 'S01' | 'S02' etc
  move_name TEXT NOT NULL,
  stat_used TEXT,
  roll_1    INTEGER NOT NULL,
  roll_2    INTEGER NOT NULL,
  modifier  INTEGER DEFAULT 0,
  total     INTEGER NOT NULL,
  outcome   TEXT NOT NULL,             -- 'hit' (10+) | 'partial' (7-9) | 'miss' (6-)
  note      TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
  -- append-only: never UPDATE or DELETE rows
);

-- ─── SESSION STATE ──────────────────────────────────────────────────────────
CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,         -- 'S01' | 'S02' etc
  title      TEXT,
  status     TEXT DEFAULT 'upcoming',  -- 'upcoming' | 'live' | 'closed'
  outcome    TEXT,                     -- 'humane' | 'partial' | 'bad'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE clocks (
  id            TEXT PRIMARY KEY,
  session_id    TEXT REFERENCES sessions(id),
  case_name     TEXT NOT NULL,
  clock_max     INTEGER DEFAULT 6,
  clock_current INTEGER DEFAULT 0,
  notes         TEXT,
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     TEXT REFERENCES sessions(id),
  closed_session TEXT,
  title          TEXT NOT NULL,
  description    TEXT,
  priority       TEXT DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  tags           TEXT                   -- JSON: ["MESA", "Project Veil"]
);

-- ─── NPCS ──────────────────────────────────────────────────────────────────
CREATE TABLE npcs (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT NOT NULL,
  affiliation        TEXT,             -- 'PORTAL' | 'MESA' | 'civilian' | 'unknown'
  status             TEXT DEFAULT 'alive',
  first_seen         TEXT,
  visible_to_players BOOLEAN DEFAULT false,
  player_notes       TEXT,
  keeper_notes       TEXT,
  updated_at         TEXT DEFAULT (datetime('now'))
);

-- ─── MESSAGES ───────────────────────────────────────────────────────────────
CREATE TABLE messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT REFERENCES sessions(id),
  sender       TEXT NOT NULL,          -- 'CAMPBELL' | 'DIRECTOR' | 'MESA' | 'SYSTEM'
  recipient    TEXT DEFAULT 'all',
  subject      TEXT,
  body         TEXT NOT NULL,
  delivered    BOOLEAN DEFAULT false,
  delivered_at TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- ─── HANDOUTS ───────────────────────────────────────────────────────────────
CREATE TABLE handouts (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id         TEXT REFERENCES sessions(id),
  title              TEXT NOT NULL,
  type               TEXT DEFAULT 'text', -- 'text' | 'image' | 'document'
  content            TEXT,
  visible_to_players BOOLEAN DEFAULT false,
  revealed_at        TEXT
);

-- ─── AUTH ───────────────────────────────────────────────────────────────────
CREATE TABLE player_tokens (
  token      TEXT PRIMARY KEY,
  hunter_id  TEXT REFERENCES hunters(id),
  created_at TEXT DEFAULT (datetime('now')),
  revoked    BOOLEAN DEFAULT false
);
```

---

## Workers API (Routes)

All endpoints under `/api/v1/`. Keeper endpoints require a header token; player endpoints require a session URL token.

**Live endpoints (CF Pages Functions in `functions/`):**
```
GET  /api/v1/hunters/:id/arc-state                  → hunter arc state (no auth)
PUT  /api/v1/hunters/:id/arc-state                  → upsert arc state (no auth)
GET  /api/v1/reports/:id/state                      → keeper field report for session (no auth)
PUT  /api/v1/reports/:id/state                      → upsert keeper field report (no auth)
GET  /api/v1/player-reports/:week/:hunter/state     → player debrief for week+hunter (no auth)
PUT  /api/v1/player-reports/:week/:hunter/state     → upsert player debrief (no auth)
```

**Planned (Phase 3, Workers):**
```
GET  /api/v1/hunters                    → all hunters (public fields)
GET  /api/v1/hunters/:id                → single hunter sheet
PUT  /api/v1/hunters/:id                → update sheet (keeper or own hunter)

POST /api/v1/rolls                      → log a roll
GET  /api/v1/rolls?session=S02          → roll log for a session
GET  /api/v1/rolls?hunter=rex           → roll log for a hunter

GET  /api/v1/sessions                   → session list
GET  /api/v1/sessions/:id               → session detail + clocks + leads
PUT  /api/v1/sessions/:id/status        → set live | closed (keeper)

GET  /api/v1/leads?session=S02          → leads open at end of session
POST /api/v1/leads                      → create lead (keeper)
PUT  /api/v1/leads/:id                  → update/close lead (keeper)

GET  /api/v1/npcs?visible=true          → player-visible NPCs
GET  /api/v1/npcs                       → all NPCs (keeper)
POST /api/v1/npcs                       → create NPC (keeper)
PUT  /api/v1/npcs/:id                   → update NPC (keeper)
PUT  /api/v1/npcs/:id/reveal            → make visible to players (keeper)

POST /api/v1/messages                   → create message (keeper)
PUT  /api/v1/messages/:id/deliver       → push message to players (keeper)
GET  /api/v1/messages?session=S02       → messages for a session (players see delivered only)

POST /api/v1/handouts                   → upload handout (keeper)
PUT  /api/v1/handouts/:id/reveal        → reveal to players (keeper)
GET  /api/v1/handouts?session=S02&visible=true  → revealed handouts (players)
```

---

## Auth Strategy (No Passwords)

**Keeper access:** Cloudflare Access with Google SSO. Your Google account is the key. Protects all `/command.html`, `/api/v1/` write endpoints, and keeper pages.

**Player access:** URL tokens. Generate a session link like:
`https://portal-fieldops.pages.dev/session.html?token=rex-s02-a8f3k2`
Players bookmark it. Same token works across all sessions. Tokens live in `player_tokens` table. If a token leaks, revoke it and send a new link.

---

## The Live Session Tool (Durable Objects)

**How it works:**
1. Keeper opens `/command.html`, starts a session → creates/connects to a Durable Object room keyed by session ID
2. Players open their session URL → connect to the same room via WebSocket
3. Keeper actions broadcast events to all connected clients:
   - `roll_result` → appears in everyone's roll feed
   - `message_deliver` → CAMPBELL terminal message appears for players
   - `handout_reveal` → image/document appears for players
   - `npc_reveal` → NPC card appears in player contacts
   - `clock_update` → keeper's clock ticks, players can optionally see it
4. Player rolls fire from the player's browser → logged to D1 via Worker → broadcast to all clients as `roll_result`

**Keeper command board contains:**
- Hunter sheets (read-only overview of all hunters)
- Active case clocks
- Message composer (CAMPBELL / Director / custom sender)
- Handout/image uploader with reveal button
- NPC reveal panel
- Move reference for current session (from JSON, not DB)
- Monster/entity stat block (from `portal-entities.json`)
- Roll log feed (live, all hunters)
- Scene flavour text blocks (pre-loaded from session prep)

**Player session view contains:**
- Their own character sheet (harm, luck, stats, moves)
- Roll interface: move picker → stat auto-filled → roll 2d6+stat → result shown → logged
- Roll feed (all players visible, real-time)
- CAMPBELL terminal (messages appear as typed, not all at once)
- Director PDA (styled differently — more urgent, warmer)
- Revealed handouts and images
- Contacts (NPCs revealed so far)

---

## Dynamic CAMPBELL Briefings

Currently: static HTML files, one per session.

**Target:** CAMPBELL briefings generated from live data and session reports.
- Case data, NPC status, clock readings, and open leads fetched from D1 at page load
- Keeper drafts briefing text, previews, and publishes (`delivered = true` in a `briefings` table)
- Players see the briefing once published; prior briefings accessible in history view

**The "feed to Claude" moment:** After a session, keeper files the report, exports `.md`, and drops it here. That report + the current D1 state becomes context for the next briefing draft. Claude generates the CAMPBELL voice briefing; keeper edits and publishes.

---

## Build Phases

### Phase 0 — Data Foundation ✅ COMPLETE
All seven static data files built from source (MOTW hardcover, Slayer's Survival Kit, worldbuilding.md). Live in `data/`, ready to serve. No backend required to use them.

**Files delivered:**
- `data/motw-basic-moves.json` — all basic moves + alternate/new Weird moves
- `data/motw-playbooks.json` — Action Scientist, Sidekick, Changeling, Monstrous, Flake
- `data/motw-teambooks.json` — Research Lab team playbook
- `data/portal-custom-moves.json` — Substance Θ, Anchor Spike, BIM Collection Array + house_rules
- `data/hunters.json` — all 5 hunters seeded; `FILL_FROM_SESSION` markers for unrecorded picks
- `data/portal-npcs.json` — 21 NPCs with player/keeper description split
- `data/portal-entities.json` — 7 entities (E-001 through E-006 + T-006)

**Outstanding:** Fill `FILL_FROM_SESSION` fields in `hunters.json` from actual character sheets (stat lines, gear picks, second/third moves, Sven's curse).

### Phase 1 — Still on GH Pages (no Cloudflare yet)
- Dice roller component (pure JS, reads from moves JSON, displays result + outcome text)
- Character sheet pages (localStorage, same pattern as `report.html`)
- Campaign State export: single button aggregating sheets + open leads + last report into one markdown blob

### Phase 2 — Cloudflare Setup ✅ COMPLETE
- CF account created (gino.galotti@gmail.com)
- CF Pages connected to GitHub repo, deploying from `dev` branch
- D1 database `portal-db` created and schema applied (13 tables + migration 001)
- `wrangler.jsonc` configured at repo root with D1 binding
- Node.js v24.14.0, npm 11.11.0, Wrangler 4.71.0 installed locally
- GH Pages still serves `main` for players during development

### Phase 2.5 — Hunter Arc Persistence ✅ COMPLETE
- **`functions/api/v1/hunters/[id]/arc-state.js`** — live CF Pages Function
  - `GET /api/v1/hunters/:id/arc-state` → returns state JSON from D1 (or `{}`)
  - `PUT /api/v1/hunters/:id/arc-state` → upserts state JSON to D1
- **`hunters/hunter.js`** — shared script for all hunter pages
  - `load()`: fetches from D1 on page open; falls back to localStorage if offline/file://
  - `save()`: writes localStorage immediately + fires background PUT to D1
  - `saveNow(btn)`: explicit save with button feedback (SAVING → SAVED ✓ / ERROR / OFFLINE)
  - `resetAll()`: clears DOM, localStorage, and sends `PUT {}` to D1
  - Keeper toggle (double-click/double-tap top-right corner)
- All four hunter pages (alan, reed, rex, sven): inline scripts removed, `// SAVE` button replaces `// PRINT`
- State shared across all users/browsers in real time via D1

### Phase 2.6 — Field Reports + Player Debrief ✅ COMPLETE
- **`missions/report.html`** — rebuilt keeper field report
  - Session tab switcher (S01/S02); each session has distinct threads, countdowns, and scene note prompts
  - D1 via `/api/v1/reports/:id/state` (GET + PUT); localStorage fallback; explicit Save with feedback
  - Copy for Claude exports full report as Markdown including scene notes
  - Removed: report history log, Export MD, Backup JSON, Restore JSON
- **`reports/player-report.html`** — player-facing Operative Field Report
  - Week selector (Week 01 / Week 02, etc.) + Hunter selector (Alan / Reed / Rex / Sven / John)
  - State is unique per week+hunter; loads from D1 on selection, Save button persists to D1
  - **Ratings** (5 sliders, 0–5): Story Quality, Atmosphere & Tone, Operative's Role, Emotional Impact, Overall
  - **General feedback** textareas: favourite moment, something different, operative's feelings, other
  - **Scene by Scene** section — per-week prompts about specific events (dynamic, config-driven)
  - D1 via `/api/v1/player-reports/:week/:hunter/state`; localStorage fallback
  - Linked from player nav as "Debrief"
- **Session config pattern** (used by both reports): threads, clocks, and scenes defined in a JS `SESSIONS`/`WEEKS` object at the top of the script — add new sessions by extending the config
- **Future**: keeper review view for all player debriefs (read all rows for a given week, display aggregated ratings + notes)

### Phase 3 — Workers API + Character Sheets to D1
- Scaffold Workers router with the routes listed above
- Migrate character sheets from localStorage to D1 (keep localStorage as offline fallback)
- NPC roster API + `contacts.html` player page
- Leads API + dynamic leads display per session
- Seed D1 from `hunters.json` and `portal-npcs.json`

### Phase 4 — Live Session Tool
- Durable Object for session room (WebSocket)
- Player `session.html`: character sheet, move picker, roll interface, feed
- Keeper `command.html`: command board, message composer, handout uploader, reveal controls
- CAMPBELL terminal + Director PDA message display

### Phase 5 — Dynamic CAMPBELL Briefings
- Briefing data model in D1
- Keeper briefing editor
- Player briefing history view
- Integration with session report export

---

## Versioning / GitHub

- `main` → GitHub Pages (current player-facing site, unchanged)
- `dev` → Cloudflare Pages (all new development, auto-deploys on push)

When everything works on CF, players are pointed to the new URL and GH Pages is retired.

**What goes in the repo:** All HTML, CSS, JS; `data/` JSON files; Workers code; schema migrations.

**What does NOT go in the repo:** CF API tokens or secrets; player session tokens; D1 data.

---

## Static Data Files Reference

All files in `data/` are static assets served by CF Pages. Never written to at runtime — all campaign state goes in D1. Read from browser via `fetch('/data/<filename>.json')`.

**General rules:**
- Fields marked `FILL_FROM_SESSION` are genuine unknowns — treat as `null` at runtime, show placeholder in UI
- All `id` fields use kebab-case — stable as DOM IDs, map keys, and D1 foreign keys
- `keeper_description` / `keeper_notes` fields must **never** be sent to player-facing endpoints or rendered on player pages

---

### `motw-basic-moves.json`

**Purpose:** Complete MOTW move reference for the roll interface.

**Top-level:** `version`, `source`, `note`, `basic_moves` (10 moves), `alternate_weird_moves` (8), `new_weird_moves` (7 from SSK).

**Each move:** `id`, `name`, `trigger` ("When you..."), `roll` (stat or null), `outcomes` (keys: `12_plus`, `10_plus`, `7_9`, `miss` or `general`), optional `choices` array and `choices_note`.

**Roll interface:** Filter `basic_moves` by `roll !== null`. Read `roll` to auto-fill stat. Select outcome key after rolling; render `choices` as pick list if present.

**Weird move:** Each hunter has one active Weird move. Check `hunters.json` → `hunter.weird_move`.

---

### `motw-playbooks.json`

**Purpose:** Playbook move reference for each active hunter. Used by roll interface, character sheet display, and keeper command board move reference panel.

**Each playbook:** `id`, `name`, `hunter`, `moves`, `stats`, `gear`, `improvements`, `player_choices`.

**`player_choices`:** Confirmed picks are set; unrecorded fields are `FILL_FROM_SESSION`. Use to initialise hunter's sheet in D1.

**Confirmed picks:**
- Rex: `area_of_study: Violence`, `weird_move: weird-science`
- Reed: `hero: rex`, mandatory move `there's-no-i-in-team`
- Sven: `breed: ghost`, `curse: vulnerability (rock salt suggested)`, `attacks: magical force + hand range`, `moves: incorporeal + immortal`

---

### `motw-teambooks.json`

**Purpose:** Reference for the Research Lab team playbook.

**Key fields:** `campaign_style: action-science`, end-of-session question: "Did we defeat extreme danger with science?" (yes = +1 mark, yes and prominent = +2), `improvement_track.marks_to_advance: 5`.

---

### `portal-custom-moves.json`

**Purpose:** Campaign-specific moves merged with standard move lists at runtime.

**Current entries:**
- `substance-theta-active-dose` — roll+Weird; Project Veil breadcrumb
- `anchor-spike-discharge` — no roll; `target_effects` covers liminal entities, hunters, Sven (revelation moment), and the Cartographer
- `bim-collection-array-recovery` — no roll; most plot-significant retrievable object in a MESA encounter

**Adding house rules:** Push to `house_rules` array using the same structure.

---

### `hunters.json`

**Purpose:** Seed data for D1 hunter tables. Also used as offline fallback in Phase 1.

**Each hunter:** `id`, `playbook`, `accent_colour`, `stats` (confirmed or `FILL_FROM_SESSION`), `active_moves` (with `confirmed` flag), `gear`, `bonds`, `keeper_notes` (arc_hooks, secrets_involved).

**D1 seeding:** Map stats → `hunter_stats`; active_moves → `hunter_moves`; gear → `hunter_gear`; bonds → `hunter_bonds`. Skip `FILL_FROM_SESSION` rows.

---

### `portal-npcs.json`

**Purpose:** Seed data for D1 `npcs` table. Static source for `contacts.html` and keeper NPC reveal panel.

**Each NPC:** `id`, `affiliation`, `visible_to_players`, `player_description` (safe for players), `keeper_description` (never send to player endpoints), `secrets_involved`.

**Player contacts flow:** Filter `visible_to_players === true`, render only `player_description`. Toggling `visible_to_players` pushes to D1 and broadcasts via Durable Object.

**Counts:** 21 NPCs — 6 PORTAL, 4 MESA, 11 civilian. 12 visible to players; 9 keeper-only.

---

### `portal-entities.json`

**Purpose:** Entity/threat database for keeper command board.

**Each entity:** `id`, `designation` (E-001 etc.), `classification`, `case`, `status`, `player_description`, `keeper_description`, `powers`, `harm`, `harm_capacity`, `armour`, `weakness`, `bim_connection`, `bim_note` (highlight in command board — Project Veil thread), `keeper_moves`, optional `keeper_only`.

**Command board:** Load entity by case ID when session is active. Highlight `bim_note` — keeper's reminder of which Project Veil breadcrumbs are live in this scene.

**Current state:** E-001 (Eszter) resolved. E-002 (Cartographer) active — Session 02. E-003–E-006 active. T-006 (The Hollow) theoretical/keeper-only.

---

## Immediate Next Steps (In Order)

1. **Fill `FILL_FROM_SESSION` fields in `hunters.json`** — stat lines, gear picks, second/third move choices, Sven's curse. Requires actual character sheets.

2. **Build the dice roller** — pure JS, reads `motw-basic-moves.json` + `motw-playbooks.json`, auto-fills stat, displays result + outcome text. Phase 1, one afternoon.

3. **Scaffold the Workers API** — start with `/hunters` and `/rolls`. Seed D1 from `hunters.json` and `portal-npcs.json` once Workers are up.

4. **Build `session.html` and `command.html`** — comes after data layer is working. Command board entity panel reads from `portal-entities.json`; NPC reveal panel reads from `portal-npcs.json`.

---

## Notes for Claude Code Sessions

When picking this up:
- Check `wrangler.jsonc` at repo root — has D1 binding name (`portal_db`) and database ID
- Workers use TypeScript; client-side JS in `app/` pages is vanilla JS (no framework)
- The existing design system (four CSS files, `--mp-*` variables, keeper/player split, terminal aesthetic) applies to all new pages — read `context/worldbuilding.md` Part 4
- Roll log is append-only: INSERT only, never UPDATE or DELETE
- Player pages use D1-first persistence: on load fetch from API, fall back to localStorage if offline; on save write localStorage immediately then PUT to API in background
- Hunter arc state pattern is the reference implementation — see `hunters/hunter.js` and `functions/api/v1/hunters/[id]/arc-state.js`
- New migrations go in `workers/migrations/` as `NNN_description.sql`; apply to both local and remote D1 (see migration command above)
- Keeper pages write directly to D1; player pages write their own data only
- CAMPBELL's voice rules are in `context/worldbuilding.md` Part 2 — any generated message must sound like CAMPBELL
- Never add passwords or a signup flow — keeper uses CF Access (Google), players use URL tokens
- All seven `data/` JSON files are built and ready — read the "Static Data Files Reference" section above before writing any code that touches moves, hunters, NPCs, or entities. Do not reconstruct data that already exists in those files.
- `keeper_description` and `keeper_notes` fields must never appear in player-facing API responses or page renders
