# CLAUDE-config-variables.md
*Configuration values, IDs, and environment references for this project.*
*Last updated: 2026-03-13*

---

## Cloudflare Account

| Variable | Value |
|----------|-------|
| Account email | gino.galotti@gmail.com |
| Account ID | `16173cc8b08eab625480fc137852403b` |
| Deployment branch | `dev` (Cloudflare Pages auto-deploys on push) |
| Main branch | `main` (GitHub Pages — older player-facing site) |

---

## D1 Database

| Variable | Value |
|----------|-------|
| Database name | `portal-db` |
| Database ID | `aa558dc0-96c4-4c88-ab54-a79611d161d2` |
| Binding name (in Functions) | `portal_db` |
| Access in code | `env.portal_db` |

### D1 Tables

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| `hunter_arc_state` | `hunter_id TEXT` | Arc beat selections per hunter |
| `field_reports` | `session_id TEXT` | Keeper field report per session |
| `player_reports` | `(week TEXT, hunter_id TEXT)` | Player operative reports |
| `hunter_sheets` | `hunter_id TEXT` | Full hunter sheet (stats, harm, luck, xp, checks, bonds) |
| `team_state` | `team_id TEXT` | Team playbook state (the-lab.html) |
| `messages` | `id INTEGER AUTOINCREMENT` | Feed messages (rolls, posts, handouts, clears) |
| `incident_responses` | `(session_id, incident_id)` | Open text responses per incident |
| `incident_state` | `(session_id, week)` | Choice selections per week's incidents |
| `map_state` | `map_id TEXT` | Unlocked/visited cells per district map |
| `global_flags` | `key TEXT` | Arbitrary persistent flags (campbell-logs hints, evidence visibility) |

All tables use `state TEXT` JSON blob column + `updated_at TEXT` (ISO timestamp).

---

## Local Development

| Variable | Value |
|----------|-------|
| Dev command | `wrangler pages dev .` |
| Dev port | `8788` |
| Playwright base URL | `http://localhost:8788` |
| Wrangler version | `4.71.0` (global install) |

---

## API Endpoints (Live)

All under `functions/api/v1/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/hunters/:id/arc-state` | GET + PUT | Hunter arc state |
| `/api/v1/hunters/:id/sheet` | GET + PUT | Full hunter sheet |
| `/api/v1/reports/:id/state` | GET + PUT | Keeper field report |
| `/api/v1/player-reports/:week/:hunter/state` | GET + PUT | Player operative report |
| `/api/v1/rolls` | GET (`after=`, `offset=`) + POST | Feed rolls |
| `/api/v1/messages` | GET (`after=`, `offset=`) + POST | Feed messages |
| `/api/v1/incidents/:id/state` | GET + PUT | Incident choice state (`:id` = week) |
| `/api/v1/incidents/:id/responses` | GET + POST | Incident open text responses |
| `/api/v1/session/active` | GET + PUT | Active session (keeper toggle) |
| `/api/v1/team/playbook` | GET + PUT | Team playbook state |
| `/api/v1/maps/:id/state` | GET + PUT | District map unlock/visited state |
| `/api/v1/evidence/visibility` | GET + PUT | Evidence card revealed state (global_flags) |
| `/api/v1/campbell-logs/hints` | GET + PUT | Campbell logs clue revealed state (global_flags) |

---

## Data Files

| File | Key |
|------|-----|
| `data/sessions/index.json` | Campaign session list — source of truth for `session-state.js` |
| `data/sessions/s0N.json` | Per-session keeper data (threats, equipment, handouts, readaloud) |
| `data/hunters.json` | Static hunter identity |
| `data/playbook-moves.json` | Move definitions keyed by `data-check-key` |
| `data/briefings.json` | CAMPBELL queue weeks and items |
| `data/incidents.json` | Week-indexed incident blocks |
| `data/portal-npcs.json` | NPC records (player descriptions, session_overrides) |
| `data/portal-entities.json` | Entity stat blocks + bestiary phases |
| `data/portal-entity-types.json` | 8 theoretical entity type cards |
| `data/portal-maps.json` | Interactive district map grids |
| `data/hunter-arcs.json` | Campaign arc beats for all hunters |
| `data/portal-missions.json` | Mission list for index.html + missions.html |

---

## Session Keys

| Session | Key | Status |
|---------|-----|--------|
| Week 01 — A Promise is a Promise | `M01` | closed |
| Week 02 — Something That Wants to Be Known | `M02` | closed |
| Week 03 — (S03 title TBD) | `M03` | active |

---

## Hunters

| Hunter | ID | Playbook |
|--------|----|---------|
| Reed Atwood | `reed` | Mundane |
| Sven | `sven` | Monstrous |
| Rex Bangley | `rex` | Action Scientist |
| Alan Frazier | `alan` | Sidekick |
| John Johnson | `john-johnson` | Flake |

---

## Environment Variables / Secrets

| Variable | Where | Notes |
|----------|-------|-------|
| `OPENAI_API_KEY` | `.env` (gitignored) | Image generation script only — paste manually |

No auth secrets required (no Clerk, no JWT). D1 access is via Workers binding — no connection string needed.
