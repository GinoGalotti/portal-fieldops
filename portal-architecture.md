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

- **vs Supabase:** No free-tier project pauses. No external dependency. Everything — hosting, API, database, realtime — in one CF account with one billing relationship (currently $0).
- **vs GitHub API as backend:** Works for one keeper. Breaks for multi-user, real-time, player sheets.
- **vs Vercel + PlanetScale / Neon:** More moving parts, more potential costs, more configuration.
- **vs self-hosted:** Zero ops burden.

---

## Repository Structure (Target)

```
portal-campaign/
├── public/                    # All current static pages — unchanged
│   ├── index.html
│   ├── keeper.html
│   ├── arcs.html
│   ├── report.html
│   ├── missions/
│   ├── player.css
│   ├── keeper.css
│   └── ...
│
├── app/                       # New interactive pages (also static HTML)
│   ├── session.html           # Live session tool (player view)
│   ├── command.html           # Live session tool (keeper command board)
│   ├── sheet.html             # Character sheet (player-editable)
│   ├── hub.html               # Campaign hub (combined dashboard)
│   └── contacts.html          # NPC contact list (player-facing)
│
├── workers/                   # Cloudflare Workers API
│   ├── src/
│   │   ├── index.ts           # Main router
│   │   ├── routes/
│   │   │   ├── characters.ts  # GET/POST/PUT character sheets
│   │   │   ├── rolls.ts       # POST roll log entries
│   │   │   ├── session.ts     # Session state, clock status
│   │   │   ├── npcs.ts        # NPC roster
│   │   │   ├── messages.ts    # CAMPBELL/Director message queue
│   │   │   └── leads.ts       # Open leads per session
│   │   └── realtime/
│   │       └── session-room.ts  # Durable Object for live session
│   └── wrangler.toml          # CF Workers config
│
├── data/                      # Static game data (not in DB)
│   ├── motw-basic-moves.json
│   ├── motw-playbooks.json    # All playbook moves for PORTAL's active hunters
│   └── portal-custom-moves.json  # Any house rules / custom moves
│
└── wrangler.toml              # Root CF Pages config
```

---

## Database Schema (D1 / SQLite)

```sql
-- ─── HUNTERS ───────────────────────────────────────────────────────────────
CREATE TABLE hunters (
  id          TEXT PRIMARY KEY,        -- 'rex' | 'reed' | 'alan' | 'sven'
  name        TEXT NOT NULL,
  playbook    TEXT NOT NULL,
  harm        INTEGER DEFAULT 0,
  harm_max    INTEGER DEFAULT 7,
  stability   INTEGER DEFAULT 7,       -- for Monstrous/Changeling
  luck        INTEGER DEFAULT 7,       -- MOTW luck track (7 = full)
  xp          INTEGER DEFAULT 0,
  xp_threshold INTEGER DEFAULT 5,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE hunter_stats (
  hunter_id   TEXT REFERENCES hunters(id),
  stat        TEXT NOT NULL,           -- cool | tough | sharp | charm | weird
  value       INTEGER NOT NULL,
  PRIMARY KEY (hunter_id, stat)
);

CREATE TABLE hunter_moves (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT REFERENCES hunters(id),
  move_name   TEXT NOT NULL,
  source      TEXT,                    -- 'basic' | 'playbook' | 'advanced' | 'custom'
  notes       TEXT
);

CREATE TABLE hunter_bonds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT REFERENCES hunters(id),
  target      TEXT NOT NULL,           -- name of person/hunter
  description TEXT
);

CREATE TABLE hunter_gear (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT REFERENCES hunters(id),
  name        TEXT NOT NULL,
  tags        TEXT,                    -- JSON array: ["hand", "2-harm", "loud"]
  notes       TEXT
);

-- ─── ROLL LOG ──────────────────────────────────────────────────────────────
CREATE TABLE rolls (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT REFERENCES hunters(id),
  session     TEXT NOT NULL,           -- 'S01' | 'S02' etc
  move_name   TEXT NOT NULL,
  stat_used   TEXT,                    -- cool | tough | sharp | charm | weird
  roll_1      INTEGER NOT NULL,
  roll_2      INTEGER NOT NULL,
  modifier    INTEGER DEFAULT 0,
  total       INTEGER NOT NULL,
  outcome     TEXT NOT NULL,           -- 'hit' (10+) | 'partial' (7-9) | 'miss' (6-)
  note        TEXT,                    -- optional context
  timestamp   TEXT DEFAULT (datetime('now'))
  -- append-only: never UPDATE or DELETE rows
);

-- ─── SESSION STATE ──────────────────────────────────────────────────────────
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,        -- 'S01' | 'S02' etc
  title       TEXT,
  status      TEXT DEFAULT 'upcoming', -- 'upcoming' | 'live' | 'closed'
  outcome     TEXT,                    -- 'humane' | 'partial' | 'bad'
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE clocks (
  id          TEXT PRIMARY KEY,
  session_id  TEXT REFERENCES sessions(id),
  case_name   TEXT NOT NULL,
  clock_max   INTEGER DEFAULT 6,
  clock_current INTEGER DEFAULT 0,
  notes       TEXT,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT REFERENCES sessions(id),   -- session when lead opened
  closed_session TEXT,                         -- session when resolved (null = open)
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT DEFAULT 'medium',           -- 'high' | 'medium' | 'low'
  tags        TEXT                             -- JSON: ["MESA", "Project Veil"]
);

-- ─── NPCS ──────────────────────────────────────────────────────────────────
CREATE TABLE npcs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  affiliation TEXT,                    -- 'PORTAL' | 'MESA' | 'civilian' | 'unknown'
  status      TEXT DEFAULT 'alive',   -- 'alive' | 'dead' | 'missing' | 'unknown'
  first_seen  TEXT,                   -- session ID: 'S01'
  visible_to_players BOOLEAN DEFAULT false,
  player_notes TEXT,                  -- what players know (shown on player pages)
  keeper_notes TEXT,                  -- full truth (keeper only)
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- ─── MESSAGES (CAMPBELL / DIRECTOR) ────────────────────────────────────────
CREATE TABLE messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT REFERENCES sessions(id),
  sender      TEXT NOT NULL,           -- 'CAMPBELL' | 'DIRECTOR' | 'MESA' | 'SYSTEM'
  recipient   TEXT DEFAULT 'all',      -- 'all' | hunter_id
  subject     TEXT,
  body        TEXT NOT NULL,
  delivered   BOOLEAN DEFAULT false,   -- keeper controls when players see it
  delivered_at TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- ─── HANDOUTS ───────────────────────────────────────────────────────────────
CREATE TABLE handouts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT REFERENCES sessions(id),
  title       TEXT NOT NULL,
  type        TEXT DEFAULT 'text',     -- 'text' | 'image' | 'document'
  content     TEXT,                    -- text content or image URL
  visible_to_players BOOLEAN DEFAULT false,
  revealed_at TEXT
);
```

---

## Workers API (Routes)

All endpoints under `/api/v1/`. Keeper endpoints require a header token; player endpoints require a session URL token (see Auth).

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

**Keeper access:** Cloudflare Access with Google SSO. One-time setup, zero maintenance. Your Google account is the key. Protects all `/command.html`, `/api/v1/` write endpoints, and keeper pages.

**Player access:** URL tokens. You generate a session link like:
`https://portal-campaign.pages.dev/session.html?token=rex-s02-a8f3k2`
Players bookmark it. Same token works across all sessions (it identifies who they are, not what session it is). Tokens live in a `player_tokens` table, checked by Workers on every request. No login screen, no password, no account. If a token leaks, you revoke it and send a new link.

This means: players arrive at a URL, they're in. Keeper arrives at keeper pages, Google login appears once. That's the entire auth UX.

---

## The Live Session Tool (Durable Objects)

This is the technically distinct piece. Durable Objects give you a persistent WebSocket room that all connected clients (keeper + players) share.

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

**What the keeper command board contains:**
- Hunter sheets (read-only overview of all 4)
- Active case clocks
- Message composer (CAMPBELL / Director / custom sender)
- Handout/image uploader with reveal button
- NPC reveal panel
- Move reference for current session (from JSON, not DB)
- Monster/entity stat block (from current session's keeper prep data)
- Roll log feed (live, all hunters)
- Scene flavour text blocks (pre-loaded from session prep)

**What the player session view contains:**
- Their own character sheet (harm, luck, stats, moves)
- Roll interface: move picker → stat auto-filled → roll 2d6+stat → result shown → logged
- Roll feed (all players visible, real-time)
- CAMPBELL terminal (messages appear as typed, not all at once)
- Director PDA (styled differently — more urgent, warmer)
- Revealed handouts and images
- Contacts (NPCs revealed so far)

---

## The MOTW Moves JSON (No Scraping Required)

Roll20's content is licensed and cannot be scraped or redistributed. The correct approach:

**Source:** Monster of the Week SRD (Creative Commons, legally free). All basic moves and playbook move descriptions are available as plain text in the published PDF/book.

**Format for our use:**
```json
{
  "version": "motw-revised-2022",
  "basic_moves": [
    {
      "id": "kick-some-ass",
      "name": "Kick Some Ass",
      "trigger": "When you fight to harm someone",
      "roll": "tough",
      "outcomes": {
        "10_plus": "You exchange harm — you deal your harm to them, they deal their harm to you. Choose: press the attack (deal +1 harm) or protect yourself (-1 harm taken).",
        "7_9": "You exchange harm. You may choose to take -1 harm by pulling back — but if you do, you also deal -1 harm.",
        "miss": "You get your ass kicked. The monster deals its harm to you."
      }
    }
  ],
  "playbooks": [
    {
      "id": "action-scientist",
      "name": "Action Scientist",
      "hunter": "rex",
      "starting_moves": ["i-know-that", "preparedness"],
      "moves": [
        {
          "id": "i-know-that",
          "name": "I Know That",
          "description": "When you first encounter a monster, phenomenon or location...",
          "roll": "sharp",
          "outcomes": { "10_plus": "...", "7_9": "...", "miss": "..." }
        }
      ]
    }
  ]
}
```

**Build process:** Copy move text from the MOTW book/SRD into this JSON file. ~2–3 hours for all active playbooks. Store in `data/` in the repo — it's a static asset, no database needed, served directly by CF Pages.

The roll interface in `session.html` reads this JSON to populate the move picker. When a player selects a move, the stat auto-fills, they roll, and the result + outcome text is shown immediately.

---

## Dynamic CAMPBELL Briefings

Currently: static HTML files, one per session.

**Target:** CAMPBELL briefings are generated from live data and session reports.

**How it works:**
- Briefing template stays as HTML (preserving the existing design)
- Case data, NPC status, clock readings, and open leads are fetched from D1 at page load
- Keeper can draft the briefing text in a simple form, preview it, and publish it (setting `delivered = true` in a `briefings` table)
- Players see the briefing once published; prior session briefings are accessible in a history view

**The "feed to Claude" moment:** After a session, the keeper files the report in `report.html`, exports the `.md`, and drops it here. That report + the current D1 state (leads, clocks, NPC updates) becomes the context for the next briefing draft. Claude generates the CAMPBELL voice briefing; keeper edits and publishes.

---

## Build Phases

### Phase 0 — Data Foundation (do first, no UI)
**~2 hours**
- Write `data/motw-basic-moves.json` and `data/motw-playbooks.json` from the SRD
- Write `data/portal-custom-moves.json` for any house rules
- Write initial `data/hunters.json` seed (Rex, Reed, Alan, Sven starting states)
- These are static files, no backend needed yet

### Phase 1 — Still on GH Pages (no Cloudflare yet)
**~1–2 days**
- Dice roller component (pure JS, reads from moves JSON, displays result + outcome text)
- Embed roller into existing pages or as a standalone `roller.html`
- Character sheet pages (localStorage, same pattern as `report.html`)
- Campaign State export: single button aggregating sheets + open leads + last report into one markdown blob

### Phase 2 — Cloudflare Setup
**~1–2 hours one-time setup**
1. Create CF account (free)
2. `npm install -g wrangler` — CF's CLI
3. `wrangler pages project create portal-campaign` — connects to GitHub repo
4. `wrangler d1 create portal-db` — creates the D1 database
5. Run schema migrations
6. Deploy: every git push to main auto-deploys

### Phase 3 — Workers API + Character Sheets to D1
**~1–2 days**
- Scaffold Workers router with the routes listed above
- Migrate character sheets from localStorage to D1 (keep localStorage as offline fallback)
- NPC roster API + `contacts.html` player page
- Leads API + dynamic leads display per session

### Phase 4 — Live Session Tool
**~2–3 days**
- Durable Object for session room (WebSocket)
- Player `session.html`: character sheet, move picker, roll interface, feed
- Keeper `command.html`: command board, message composer, handout uploader, reveal controls
- CAMPBELL terminal + Director PDA message display

### Phase 5 — Dynamic CAMPBELL Briefings
**~1 day**
- Briefing data model in D1
- Keeper briefing editor
- Player briefing history view
- Integration with session report export

---

## Versioning / GitHub

**Yes, keep GitHub.** It does three things in this setup:
1. Source of truth for all code
2. Deploy trigger for Cloudflare Pages (push to main → auto-deploy)
3. History for static assets and design files

D1 handles the campaign data. GitHub handles the code. They are separate concerns and that's correct.

**Recommended branches:**
- `main` → production (what players see)
- `dev` → staging (Cloudflare Pages can deploy a preview URL from any branch)

**What goes in the repo (and therefore git history):**
- All HTML, CSS, JS
- `data/` JSON files (moves, playbooks)
- Workers code
- Schema migrations

**What does NOT go in the repo:**
- `wrangler.toml` API tokens or secrets (use CF environment variables)
- Player session tokens
- Any D1 data (it's in the database, not the repo)

---

## Immediate Next Steps (In Order)

1. **Write the moves JSON** — open the MOTW book, copy the 4 active playbooks + basic moves into `data/`. This unblocks everything else and requires no infrastructure.

2. **Build the dice roller** — pure JS component, reads moves JSON, embeds into existing pages. Test it. This is Phase 1 and takes an afternoon.

3. **Create Cloudflare account and run Phase 2 setup** — one-time, ~1 hour. Once D1 exists, all subsequent development can target it.

4. **Scaffold the Workers API** — start with `/hunters` and `/rolls` endpoints. Character sheets and roll logging are the most immediately useful features.

5. **Build `session.html` and `command.html`** — this is the ambitious piece and should come after the data layer is working.

---

## Notes for Claude Code Sessions

When picking this up:
- Always check `workers/wrangler.toml` first — it tells you the D1 binding name and environment
- Workers use TypeScript; client-side JS in `app/` pages is vanilla JS (no framework)
- The existing design system (four CSS files, `--mp-*` variables, keeper/player split, terminal aesthetic) applies to all new pages — read `worldbuilding.md` Part 4
- Roll log is append-only: INSERT only, never UPDATE or DELETE
- Player pages are offline-first: always check localStorage before fetching from API, write to both on save
- Keeper pages write directly to D1; player pages write their own data only
- CAMPBELL's voice rules are in `worldbuilding.md` Part 2 — any generated message must sound like CAMPBELL
- Never add passwords or a signup flow — keeper uses CF Access (Google), players use URL tokens
