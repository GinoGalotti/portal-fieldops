# P.O.R.T.A.L — Authentication System Design

**Status:** Design complete. Ready for Claude Code implementation.
**Priority:** Before next session. Unblocks per-hunter write protection.

---

## Overview

Simple auth system for 6 hardcoded users. No registration, no password reset, no email. Players log in with a username and password. The session persists via JWT in localStorage. The Worker validates every API write against the token. The UI adapts to show/hide controls based on the logged-in user.

---

## Users

| Username | Role | Display Name | Can write to |
|----------|------|-------------|-------------|
| `rex` | player | Rex Bangley | Rex's hunter page, Rex's report, Lab page, Incidents, Feed (Rex's values only) |
| `alan` | player | Alan Frazier | Alan's hunter page, Alan's report, Lab page, Incidents, Feed (Alan's values only) |
| `reed` | player | Reed Atwood | Reed's hunter page, Reed's report, Lab page, Incidents, Feed (Reed's values only) |
| `sven` | player | Sven | Sven's hunter page, Sven's report, Lab page, Incidents, Feed (Sven's values only) |
| `john` | player | John Johnson | John's hunter page, John's report, Lab page, Incidents, Feed (John's values only) |
| `admin` | admin | Keeper | Everything. All hunter pages, all reports, all feed values, all handout posting, map controls, clear feed. |

---

## Architecture

### Password Storage

**Cloudflare environment secrets** — set via the CF Pages dashboard, never in code.

```
AUTH_PASSWORDS = {"rex":"[password]","alan":"[password]","reed":"[password]","sven":"[password]","john":"[password]","admin":"[password]"}
AUTH_JWT_SECRET = "[random 64-char hex string]"
```

`AUTH_PASSWORDS` is a JSON string containing username→password pairs. The Worker parses it at runtime. Gino sets the passwords via the CF dashboard. They never appear in the repo.

`AUTH_JWT_SECRET` is the signing key for JWT tokens. Generated once, set in the dashboard. Also never in code.

**Why not hashed passwords:** With 6 hardcoded users and passwords set by the keeper, the threat model is "players shouldn't be able to read each other's passwords from the code." CF secrets handles this. Hashing adds complexity with no real benefit for this use case.

### Authentication Flow

```
1. Player opens any page
2. Page loads auth.js → checks localStorage for 'portal-auth-token'
3. If no token (or token expired/invalid): show login prompt
4. If valid token: decode payload, apply permissions, show username in nav

LOGIN:
1. Player enters username + password in nav login form
2. Client POSTs to /api/auth/login { username, password }
3. Worker validates against AUTH_PASSWORDS env secret
4. If valid: Worker signs a JWT { sub: username, role: "player"|"admin", exp: +30d }
5. Returns { token, user: { username, role, display_name } }
6. Client stores token in localStorage('portal-auth-token')
7. Client stores user object in localStorage('portal-auth-user')
8. Page refreshes UI state

LOGOUT:
1. Player clicks username in nav → dropdown → "Log out"
2. Client clears localStorage('portal-auth-token') + localStorage('portal-auth-user')
3. Page refreshes UI state → login prompt returns
```

### Session Persistence

JWT token in `localStorage('portal-auth-token')`. Token payload:

```json
{
  "sub": "sven",
  "role": "player",
  "display": "Sven",
  "iat": 1711000000,
  "exp": 1713592000
}
```

Token lifetime: **30 days**. Long enough that players don't have to re-login between biweekly sessions. The keeper can rotate passwords in the CF dashboard to force re-authentication if needed.

The client reads the token payload directly (JWT payloads are base64, not encrypted) for UI decisions. The Worker validates the full token signature on every API write.

### API Enforcement

**Every existing API write endpoint** adds token validation. The token is sent as a Bearer header:

```
Authorization: Bearer <jwt_token>
```

The Worker middleware:
1. Extracts the token from the Authorization header
2. Validates the signature against AUTH_JWT_SECRET
3. Checks expiry
4. Extracts `sub` (username) and `role`
5. Passes them to the endpoint handler
6. The endpoint handler checks permissions (see matrix below)
7. Returns 401 if no token / invalid token, 403 if valid token but wrong permissions

**Read endpoints are NOT gated.** All pages and data are visible to everyone, logged in or not. Auth only gates writes.

---

## Permission Matrix

### Hunter Pages (`hunters/rex.html`, etc.)

| Action | Who can do it |
|--------|--------------|
| View page, view arcs, view stats | Anyone (no auth required) |
| Change arc selections | Owner (e.g., `sven` for Sven's page) + `admin` |
| Change stat values (harm, luck, XP, etc.) | Owner + `admin` |

**API enforcement:** `PUT /api/v1/hunters/{hunter_id}/state` → check `token.sub === hunter_id || token.role === 'admin'`

**UI:** If not logged in as owner or admin, save buttons are hidden. Inputs are `disabled`. A subtle note: "Log in as [hunter] to edit."

### Lab Page (`the-lab.html`)

| Action | Who can do it |
|--------|--------------|
| View page | Anyone |
| Change any values | Any logged-in player + `admin` |

**API enforcement:** `PUT /api/v1/lab/state` → check `token.role === 'player' || token.role === 'admin'` (any authenticated user)

### Reports (`reports/player-report.html`)

| Action | Who can do it |
|--------|--------------|
| View all reports | Anyone |
| Save a report for Sven | `sven` + `admin` |
| Save a report for Rex | `rex` + `admin` |
| (etc.) | |

**API enforcement:** `PUT /api/v1/reports/{hunter_id}/state` → check `token.sub === hunter_id || token.role === 'admin'`

**UI behaviour when logged in:**
- Auto-select the logged-in hunter in the hunter picker
- If logged in as `sven`, the picker defaults to Sven. Player can browse other reports (read-only) but the SAVE button only appears when viewing their own.
- If logged in as `admin`, SAVE appears for all hunters.

### Incidents (`lab-incidents.html`)

| Action | Who can do it |
|--------|--------------|
| View incidents | Anyone |
| Save choice responses | Any logged-in player + `admin` |
| Submit open responses | Any logged-in player + `admin` |

**API enforcement:** `PUT /api/v1/incidents/{week}/state` → check `token` exists and is valid (any authenticated user). `POST /api/v1/incidents/{id}/responses` → same.

**No per-hunter gating.** Incidents are team decisions, not individual ones. Any logged-in player can save.

### Feed (`feed.html`)

| Action | Who can do it | Notes |
|--------|--------------|-------|
| View feed | Anyone | |
| Post messages to feed | Any logged-in player + `admin` | Message tagged with `token.sub` |
| Change XP/Harm/Luck for Sven | `sven` + `admin` | |
| Change XP/Harm/Luck for Rex | `rex` + `admin` | |
| Roll moves for any hunter | Any logged-in player | Rolls are attributed to the roller, not the hunter |
| Post handouts | `admin` only | |
| Clear feed | `admin` only | |
| Map controls (unlock, reveal, etc.) | `admin` only | |

**UI behaviour when logged in:**
- Auto-select the logged-in hunter in the moves panel hunter picker
- Player can switch the picker to view other hunters' moves (read-only reference)
- XP/Harm/Luck controls are only editable when viewing own hunter (or if admin)
- Keeper tabs (HANDOUTS, MAP, THREATS, etc.) only appear for admin — replaces the 5× click keeper mode activation for the feed specifically
- Feed messages show the sender's display name

**NOTE on feed keeper mode:** Currently feed keeper mode is activated by 5× logo click. With auth, this should change: if logged in as `admin`, the keeper tabs are always visible. No 5× click needed for the feed. This is the ONE place where auth replaces the 5× click pattern. All other pages keep 5× click as-is.

### Dossier Pages, Evidence, CAMPBELL Logs, Briefings

**No auth gating.** All read-only for players. The clue reveal system and keeper mode stay as they are (D1 toggle + 5× click). Auth doesn't touch these pages.

---

## New API Endpoint

### `POST /api/auth/login`

**Request:**
```json
{ "username": "sven", "password": "the_password" }
```

**Success (200):**
```json
{
  "token": "eyJ...",
  "user": {
    "username": "sven",
    "role": "player",
    "display": "Sven"
  }
}
```

**Failure (401):**
```json
{ "error": "Invalid username or password" }
```

**Implementation:** The Worker reads `AUTH_PASSWORDS` from environment, parses the JSON, compares username+password. If valid, signs a JWT with `AUTH_JWT_SECRET` and returns it.

---

## Shared Client Module: `auth.js`

A single JS file included on every page that has the player nav. Handles:

1. **Token management:** Read/write/clear from localStorage
2. **User state:** `auth.getUser()` returns `{ username, role, display }` or `null`
3. **Permission checks:** `auth.canWrite(resource, resourceId)` — returns boolean
4. **Login UI:** Renders login form in nav or username + logout dropdown
5. **API helper:** `auth.fetch(url, options)` — wrapper around fetch that auto-adds the Authorization header
6. **Auto-select:** `auth.getHunterId()` — returns the logged-in hunter ID (or null for admin/not logged in)

### Nav Integration

**Not logged in:**
```
[ PORTAL ] [ Briefing ] [ Operatives ] ... [ CAMPBELL: ONLINE ] [ LOG IN ]
```

Clicking LOG IN opens a compact inline form (or a small modal) with username + password fields. No page navigation.

**Logged in as player:**
```
[ PORTAL ] [ Briefing ] [ Operatives ] ... [ CAMPBELL: ONLINE ] [ SVEN ▾ ]
```

Clicking the username shows a dropdown with "Log out." That's it — no settings, no profile.

**Logged in as admin:**
```
[ PORTAL ] [ Briefing ] [ Operatives ] ... [ CAMPBELL: ONLINE ] [ KEEPER ▾ ]
```

Same dropdown. Admin badge could be a different colour (purple?) to distinguish from player names.

---

## Migration Notes for Existing API Endpoints

Every existing `PUT` and `POST` endpoint in the Worker needs the auth middleware added. The pattern:

```javascript
// Before (no auth):
async function handlePut(request, env) {
  const body = await request.json();
  // ... save to D1
}

// After (with auth):
async function handlePut(request, env) {
  const user = await validateAuth(request, env);
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  // Permission check (example: hunter page)
  const hunterId = getHunterIdFromPath(request.url);
  if (user.role !== 'admin' && user.sub !== hunterId) {
    return new Response('Forbidden', { status: 403 });
  }
  
  const body = await request.json();
  // ... save to D1
}
```

**Endpoints to update:**

| Endpoint | Permission rule |
|----------|----------------|
| `PUT /api/v1/hunters/{id}/state` | `sub === id \|\| role === admin` |
| `PUT /api/v1/lab/state` | Any authenticated user |
| `PUT /api/v1/reports/{id}/state` | `sub === id \|\| role === admin` |
| `PUT /api/v1/incidents/{week}/state` | Any authenticated user |
| `POST /api/v1/incidents/{id}/responses` | Any authenticated user |
| `POST /api/v1/feed/messages` | Any authenticated user (tag with `sub`) |
| `PUT /api/v1/feed/handouts` | `role === admin` |
| `POST /api/v1/feed/clear` | `role === admin` |
| `PUT /api/v1/map/state` | `role === admin` |
| `PUT /api/state` (generic D1 state) | Depends on key — see below |
| `PUT /api/v1/arcs/state` | `sub === hunter_id_in_payload \|\| role === admin` |

**Generic state endpoint:** The `PUT /api/state` endpoint is used for dossier clue reveals, incident choices, and other D1-backed state. For now, don't gate this behind auth — it's used for too many different things with different permission models. Gate the specific endpoints above instead. The generic state endpoint can be auth-gated later if needed.

---

## Implementation Order

1. **CF secrets setup** — Gino sets `AUTH_PASSWORDS` and `AUTH_JWT_SECRET` in the CF Pages dashboard
2. **Worker: auth middleware** — `validateAuth()` function, JWT signing/verification
3. **Worker: login endpoint** — `POST /api/auth/login`
4. **Client: auth.js** — token management, user state, permission checks, nav UI
5. **Client: nav integration** — login form / username display on all nav pages
6. **Worker: add auth checks** — to each existing PUT/POST endpoint, one by one
7. **Client: UI gating** — hide/disable controls based on `auth.canWrite()`
8. **Feed: admin detection** — replace 5× click keeper mode with admin login detection (feed only)
9. **Report: auto-select** — default to logged-in hunter
10. **Feed: auto-select** — default to logged-in hunter in moves panel

Steps 1–5 can ship as a single PR. Steps 6–10 can be incremental.

---

## What This Does NOT Do

- **No registration.** Users are hardcoded. Adding a player means Gino updates the CF secret.
- **No password reset.** Gino changes passwords in the CF dashboard.
- **No per-page read gating.** All pages are visible to everyone. Auth only gates writes.
- **No change to keeper mode.** 5× click stays on all pages except the feed (where admin login replaces it).
- **No change to clue reveal.** D1 toggle stays. The keeper clicks REVEAL CLUES from any device.
- **No change to dossier pages.** They don't have the nav — they're standalone. No auth needed.
- **No user management UI.** The 6 users are the 6 users. Forever (or until Gino changes the secret).

---

## Security Notes

- **Passwords in CF secrets only.** Never in code, never in D1, never in localStorage. The repo is public.
- **JWT signed server-side.** The client can read the payload (for UI decisions) but can't forge a token.
- **Server-side enforcement.** The UI hides buttons for convenience. The Worker rejects unauthorized writes regardless of what the client sends.
- **No HTTPS concerns.** CF Pages serves over HTTPS by default. Tokens transit encrypted.
- **Token in localStorage, not cookies.** Simpler, no CSRF concerns, no cross-domain issues. The tradeoff (XSS can read it) is acceptable for a private game site with 6 users.
- **30-day token expiry.** Players don't re-login between sessions. Keeper rotates passwords to force re-auth if needed.
