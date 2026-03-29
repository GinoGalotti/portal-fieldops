# CLAUDE-troubleshooting.md
*Common issues and proven solutions for this project.*
*Last updated: 2026-03-28*

---

## Wrangler Auth Errors (Remote D1)

**Symptom:** `wrangler d1 execute portal-db --remote` fails with auth/permission error.

**Fix:**
```bash
wrangler login
```
Opens browser OAuth flow. Re-run the original command after.

**Note:** Auth sessions expire. This is the first thing to try for any remote D1 failure.

---

## Local Dev Server Not Starting

**Command:** `wrangler pages dev .`
**Default port:** 8788 (not 8787 — that's Workers dev)

**If port in use:**
```bash
wrangler pages dev . --port 3000
```

**Playwright tests expect port 8788** — if you change the dev port, update `playwright.config.js` `baseURL`.

---

## D1 Migration Not Applied

**Symptom:** API returns 500 or "no such table" error locally.

**Check which migrations have been applied:**
```bash
wrangler d1 execute portal-db --local --command="SELECT * FROM d1_migrations ORDER BY id"
```

**Apply missing migration:**
```bash
wrangler d1 execute portal-db --local --file=workers/migrations/00N_name.sql
```

**Remote:**
```bash
wrangler d1 execute portal-db --remote --file=workers/migrations/00N_name.sql
```

**Applied migrations (remote + local):** 001–015.

---

## Feed Not Updating / Stale Data

**Symptom:** Feed shows old entries; new rolls/messages don't appear.

**Likely causes:**
1. Tab is hidden or blurred → polling at 60s. Bring tab to foreground.
2. `after=lastId` parameter means only new entries are fetched. If the feed was cleared and reloaded mid-session, check for `type:'clear'` sentinel handling.
3. Local D1 has entries that remote D1 doesn't (or vice versa) — check which environment wrangler is serving.

---

## Handout Not Appearing in Feed HANDOUTS Tab

**Symptom:** Session selected, HANDOUTS tab shown, but expected handout missing.

**Check:**
1. `data/sessions/s0N.json` — is the entry in the correct session's `handouts[]` array?
2. Is the `id` field unique within the array? Duplicates cause silent drops.
3. Is the `type` field one of: `readaloud`, `pda`, `document`, `image`, `map`, `classified`, `tone`, `linecard`, `scan`?
4. For `image`/`map` types: does `src` path exist under `images/`?

---

## Playwright Tests Failing

**Run tests:**
```bash
npx playwright test
```

**Requires dev server running first:**
```bash
wrangler pages dev .   # in a separate terminal
```

**Single spec:**
```bash
npx playwright test tests/feed.spec.js
```

**Debug mode:**
```bash
npx playwright test --debug
```

**Common failure: port mismatch** — check `playwright.config.js` `baseURL` matches wrangler port (8788).

**Common failure: D1 not seeded** — `d1-round-trip.spec.js` needs local D1 tables to exist. Apply all migrations first.

---

## Image Generation Script

**Run:**
```bash
python generate_images.py
```

**Requires:** `OPENAI_API_KEY` in `.env` file (gitignored — paste manually after cloning).

**Already-generated images are skipped.** Delete the image file to force regeneration.

**No `openai` package** — script uses `requests` directly to DALL-E 3 endpoint.

---

## Nav Links Broken in Subdirectory Page

**Symptom:** Nav links 404 or point to wrong paths when page is in `missions/`, `hunters/`, or `reports/`.

**Fix:** Ensure the correct script tag path is used:
- Root pages: `<script src="player-nav.js">`
- Pages in subdirectory: `<script src="../player-nav.js">`

`player-nav.js` auto-detects the subdirectory and adjusts all relative paths. The script tag path itself must be correct for it to load.

---

## JSON Parse Error in Data File

**Symptom:** Page shows blank content or console error; fetch succeeds but render fails.

**Fix:** Validate the JSON file:
```bash
node -e "JSON.parse(require('fs').readFileSync('data/sessions/s03.json', 'utf8')); console.log('OK')"
```

Common causes: trailing comma, unescaped quote in string content, missing closing bracket after editing.

---

## Skip-to-Content Link Visible on Page

**Symptom:** "Skip to content" text appears in the top-left corner of a page.

**Fix:** The skip-link must use `position: fixed; top: -200px;` — NOT `position: absolute; top: -100%`. Percentage-based positioning is relative to the parent element (often a 64px header), so `top: -100%` only moves the link up 64px — still within the viewport.

**Files:** `player.css`, `keeper.css` (`.skip-link` class)

---

## Hunter Pip Tests Flaky (Playwright)

**Symptom:** Hunter page tests (pips, checkboxes) fail on first attempt with "element not stable" or "pointer events intercepted", then pass on retry.

**Cause:** Auth gating sets `tabindex="-1"` on non-authenticated elements during page load. Playwright may try to click before auth state resolves.

**Fix:** Pre-existing flake — not a regression. Tests pass with `retries: 1` in playwright config. Exit code 1 from Playwright indicates retries occurred, not total failure. Check the summary line for actual pass count.
