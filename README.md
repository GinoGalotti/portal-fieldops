# P.O.R.T.A.L — Field Operations

## What am I?

This started as a small GitHub page where I could add some flavour text and extra context for my friends playing a Monster of the Week campaign, but quickly evolved into an experiment for me understanding how to use Claude Code and not being afraid of feature creep. At the moment, it aims to be a full solution for our campaign — player data and a feed where we can play and roll during the sessions.

**P.O.R.T.A.L** stands for *Paranormal Operations · Research · Theoretical Applied Liminology* — the fictional agency our operatives work for, overseen by an AI handler called CAMPBELL.

---

## Stack

No build step. No npm. No framework. Just:

| Layer | Tech |
|---|---|
| Hosting | Cloudflare Pages (deploys from `dev` branch) |
| API | Cloudflare Pages Functions (`functions/api/v1/`) |
| Database | Cloudflare D1 (SQLite at the edge, binding: `portal_db`) |
| Frontend | Vanilla HTML + CSS + JavaScript |

All persistence follows the same pattern: load from D1 on page open (fall back to `localStorage` if offline), save explicitly via a button that writes `localStorage` immediately and fires a PUT to D1.

---

## Running locally

```bash
# Serve the site with D1 local binding
wrangler pages dev .

# Apply a new migration locally
wrangler d1 execute portal-db --local --file=workers/migrations/00N_name.sql

# Apply a migration to remote D1
wrangler d1 execute portal-db --remote --file=workers/migrations/00N_name.sql
```

Deployment is automatic — push to `dev` branch → Cloudflare Pages deploys.

---

## Site structure

```
/
├── index.html                  # Player home (briefings, operatives, bestiary, artefacts)
├── feed.html                   # Live session tool — roll feed + keeper panel
├── contacts.html               # NPC directory
├── the-lab.html                # Research Lab team playbook
├── player-nav.js               # Shared player navigation (injected dynamically)
│
├── hunters/                    # One page per operative
│   ├── alan.html, reed.html, rex.html, sven.html
│   ├── hunter.js               # Shared sheet/arc persistence logic
│   └── hunter.css
│
├── missions/                   # Keeper-facing tools + mission docs
│   ├── keeper.html             # Keeper index
│   ├── report.html             # Keeper field report
│   ├── references.html         # MoTW rules reference
│   ├── entities.html           # Threat/entity database
│   ├── arcs.html               # NPC arc tracker
│   └── keeper-nav.js           # Shared keeper navigation
│
├── reports/
│   └── player-report.html      # Player operative debrief (per week + hunter)
│
├── functions/api/v1/           # Cloudflare Pages Functions (serverless API)
│   ├── hunters/[id]/           # arc-state, sheet
│   ├── reports/[id]/           # field report state
│   ├── player-reports/[week]/[hunter]/
│   ├── rolls.js                # Roll feed (GET + POST)
│   └── messages.js             # Message feed (GET + POST)
│
├── data/
│   ├── hunters.json            # Static operative identity (playbook, lore)
│   ├── playbook-moves.json     # Move definitions for the feed
│   ├── portal-npcs.json        # Full NPC roster
│   ├── portal-entities.json    # Threat/entity database
│   └── session-data.json       # Per-session data for the feed threats tab
│
└── workers/migrations/         # Numbered D1 SQL migrations (001–007)
```

---

## Context files

The `context/` directory has detailed documentation used during development:

- [`context/portal-architecture.md`](context/portal-architecture.md) — full technical stack, D1 schema, API endpoints, build phases, design constraints (including CF free-tier budget awareness)
- [`context/worldbuilding-site.md`](context/worldbuilding-site.md) — site architecture, design system, CSS conventions, data files
- [`context/worldbuilding-lore.md`](context/worldbuilding-lore.md) — campaign world, NPCs, factions, CAMPBELL voice guide

---

## Two audiences, two palettes

| Audience | CSS | Palette |
|---|---|---|
| Players | `player.css` | Green terminal (`#2ecc71`) |
| Keeper (GM) | `keeper.css` | Purple (`#8b5cf6`) |

Nav is injected dynamically by `player-nav.js` / `missions/keeper-nav.js` — never hardcoded in HTML.

---

*Made by Gino with Claude · [GitHub](https://github.com/GinoGalotti/portal-fieldops)*
