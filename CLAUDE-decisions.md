# CLAUDE-decisions.md
*Architecture decisions and rationale for this project.*
*Last updated: 2026-03-28*

---

## Static HTML — No Build Step

**Decision:** Plain HTML + vanilla JS + CSS. No npm, no framework, no compilation.

**Why:** Cloudflare Pages deploys directly from the git repo. No build pipeline to maintain, no dependency rot, no bundler configuration. Pages Functions provide the API layer without changing the static site model. The site is simple enough that a framework would add overhead without benefit.

**Implication:** Every page is a standalone HTML file. Shared behaviour lives in `.js` files loaded via `<script src="...">`. CSS is four files, one per page type.

---

## D1 as Single Source of Truth

**Decision:** Cloudflare D1 (SQLite) is the persistence layer. localStorage is a fallback, not a primary store.

**Why:** The site has two audiences on different devices (players at home, keeper at the table). State needs to be shared. localStorage is per-device and per-browser — unusable for real collaboration.

**Implication:** Every save writes to D1 first. localStorage is written immediately as optimistic cache (so the UI feels instant) and used only if D1 is unreachable. All interactive pages show SAVING / SAVED / OFFLINE feedback.

---

## JSON Blobs in D1 (Not Column-Per-Field)

**Decision:** D1 tables store a single `state TEXT` column containing the full JSON blob. No column-level schema for individual fields.

**Why:** The game state for each entity (hunter sheet, arc state, field report, team playbook) is complex and schema-evolves with campaign progression. Adding a new field to a hunter sheet would require an ALTER TABLE migration. JSON blobs sidestep this — the shape is defined by the application, not the DB schema.

**Implication:** No SQL filtering on individual state fields. If you need to query "all hunters with xp > 3", you'd have to fetch all rows and filter in JS. This is fine for the data volumes involved.

---

## Data-Driven Content (JSON → Render)

**Decision:** Campaign content (NPCs, entities, arcs, handouts, briefings, incidents, maps) lives in JSON data files under `data/`. HTML pages fetch and render at load time.

**Why:** Keeps content out of markup. The keeper/GM can update campaign content (add a new entity, write a new briefing, add a handout) by editing a JSON file — no HTML knowledge required, no risk of breaking page structure or CSS.

**Implication:** Adding a new bestiary entry → edit `portal-entities.json`. Adding a new briefing week → edit `briefings.json`. No HTML edits, no deployment changes beyond the data file.

---

## Handout Order = Scene Order

**Decision:** `handouts[]` in `data/sessions/s0N.json` is ordered by narrative scene sequence, not by authoring order.

**Why:** During play, the keeper works through HANDOUTS tab top-to-bottom, posting items as each scene is reached. If handouts are in random order (appended as written), the keeper must hunt for the right item mid-session. Scene order means the keeper can just work down the list.

**Implication:** When adding new handouts, insert them at the correct narrative position, not at the end. When cleaning up post-authoring, reorder to scene sequence before the session runs.

---

## Two Audiences — Strict Split

**Decision:** Player-facing and keeper-facing pages are entirely separate, using different CSS files, different nav scripts, and different URL paths.

**Why:** Players should never accidentally see keeper notes, entity stat blocks, threat details, or classified handouts. Keeper pages show everything; player pages show only what's been revealed.

**Implication:** `classified` handout type is the boundary — rendered with REDACTED bars client-side based on `keeperMode` boolean. No server-side access control (this is a campaign tool for trusted players, not a secure application).

---

## Session Keys: M01, M02 (not S01, S02)

**Decision:** Session identifiers use `M` prefix (M01, M02) matching mission numbers, not `S` prefix.

**Why:** Renamed 2026-03-13 during interactive map work. `S01/S02` was inconsistent with the "Mission 01/02" naming used everywhere in the UI.

**Implication:** All `session_key` fields in `sessions/index.json` and any `session_id` values in the feed use `M` prefix (`M01`, `M02`, `M03`). Note: incident IDs like `S01-I01` use `S` prefix by convention — that is intentional and separate from session keys.

---

## Feed Polling Architecture

**Decision:** Smart polling — 6s interval when tab focused, 60s when hidden/blurred. Incremental (`after=lastId`). Re-polls immediately on focus regain.

**Why:** Live session tool needs near-realtime updates for players watching roll outcomes, but hammering D1 at 6s when nobody's looking is wasteful and burns free-tier quota.

**Implication:** The feed is eventually consistent, not realtime. For the table-top use case (all players in the same room, occasional remote player), 6s lag is imperceptible.

---

## JWT Auth — Server-Side Write Gating

**Decision:** JWT-based auth with server-side write gating. No third-party auth service.

**Why:** The site needed write protection so only the keeper can modify state (session data, visibility flags, etc.) while players can read freely. A lightweight JWT approach avoids external dependencies (Clerk, Auth0) while still gating D1 writes.

**Implication:** Keeper mode still activates via 5× logo click easter egg for UI features. Server-side write endpoints validate JWT before allowing mutations. Read endpoints remain open. `classified` handouts still use client-side `keeperMode` flag for rendering (no server-side access control on reads — acceptable for trusted group).

---

## Accessibility — WCAG AA Compliance

**Decision:** WCAG AA compliance across all pages. Focus-visible, reduced motion, contrast ratios, keyboard navigation, ARIA roles/states, semantic HTML, skip links.

**Why:** Accessibility is a baseline quality standard. Even for a private campaign site, keyboard navigation and screen reader support benefit all users (e.g. playing at the table with reduced visibility, using keyboard shortcuts during live sessions).

**Implication:** Every new interactive element must be keyboard-accessible (`tabindex="0"`, Enter/Space handler). All text must meet 4.5:1 contrast ratio against its background. All collapsible/expandable elements need `aria-expanded`. Print stylesheets on keeper documents.
