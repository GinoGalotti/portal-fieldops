# Design Spec — S04 Pre-Session Ingestion

**Date:** 2026-04-27
**Session:** S04 "The Shōjō" (pre-session)
**Brief:** `CLAUDE-CODE-BRIEF-s04.md`

---

## Scope

Wire up all site assets for the S04 session. This is implementation-only — all content is authored and approved. Four independent tracks can run in parallel; validation runs last.

---

## Assets Already in Place

| File | Status |
|---|---|
| `missions/04-the-shojo.html` | ✅ Present |
| `data/sessions/s04.json` | ✅ Present |
| `handouts/dossier/s04-pulaski-case-file.html` | ✅ Present |
| `handouts/dossier/s04-mariana-statement.html` | ✅ Present |
| `handouts/dossier/s04-veritas-tablet.html` | ✅ Present |
| `handouts/dossier/s04-harbor-map.html` | ✅ Present |
| `handouts/dossier/s04-brewer-letter.html` | ✅ Present |
| `s04-prompts.py` | ✅ Present (root) |

---

## Track A — HTML/CSS

### A.1 — Promote inline CSS to `mission-prep.css`

Extract the following rule-sets from the `<style>` block in `missions/04-the-shojo.html` and append them to `mission-prep.css`. Leave the `:root` palette block inline — it is session-specific.

Rules to promote:
- `.diff` and variants (`.diff.trivial`, `.diff.easy`, `.diff.moderate`, `.diff.hard`, `.diff.deadly`)
- `.location-box` and inner styles
- `.victim-card` and inner styles
- `.letter-block`
- `.radio-call` and `.radio-call .rc-label`
- `.combat-clock`, `h4`, `.seg`, `.seg::before`, `.seg .label`
- `.terrain-grid`, `.t-feat`, `.t-feat strong`
- `.terrain-grid` `@media` query

After extraction, remove those rules from `04-the-shojo.html`'s inline `<style>`. The `:root` block stays.

**Constraint:** S01, S02, S03 do not use these classes — promotion is purely additive; those docs are unaffected.

### A.2 — Add S04 entry to `missions/keeper.html`

Add a link entry for S04 matching the S03 pattern in the keeper mission index.

---

## Track B — Data Files

### B.1 — `data/sessions/s04.json` — Drive Home placeholder

In the `handouts[]` array, update two entries:

**`leech-call-1`** body: replace `[Gordon's house / Nadia's location]` with `from the mission`.

**`leech-call-2`**: no change needed (text reads naturally without the placeholder).

### B.2 — `data/portal-threads.json` — 5 new entries

Append five new thread objects to the `threads[]` array. All pre-session — none are resolved.

| id | name | category | status |
|---|---|---|---|
| `case-d-shojo-baltimore` | Case D — The Shōjō (Baltimore) | case | active |
| `veritas-op-whitecedar` | Veritas — Op. WHITECEDAR | faction | active |
| `the-cask` | The Cask | mystery | active |
| `sven-parallel-deployment` | Sven — Parallel Deployment | personal | active |
| `mob-preshaped-mk` | Mob Pre-Shaping — Officer M.K. | faction | active |

`last_moved`: `"w4"` for all. `player_summary`: `null` for all (keeper-only pre-session). `player_name`: `null` for all.

### B.3 — `data/report-schema.json` — S04 entry

Add a new S04 entry following the S03 structure:

- `session_id`: `"S04"`, `week_id`: `"W04"`, `week_subtitle`: `"The Shōjō"`
- `keeper_threads`: active campaign threads relevant to S04
- `keeper_clocks`: four S04 clocks (Stirring, Mob, Veritas Encounter, Shōjō Encounter)
- `keeper_scenes`: three keeper scene prompts (Arrival/Investigation, Encounter, Resolution)
- `player_scenes`: three player scene prompts
- `canon_slots`: slots from `s04.json`'s `open_slots[]`

All values empty/null — keeper fills post-session.

---

## Track C — Images

Run image generation pipeline using `s04-prompts.py`. Output directory: `images/sessions/s04/`.

**Generate:**
- Shōjō glimpse (mark for keeper review before going live)
- Pulaski portrait
- Yuki portrait

**Skip:** Mariana (her SVG sketch in the dossier page is sufficient).

**Note:** Requires `OPENAI_API_KEY` in `.env`. This is a keeper action if the key is not present in the environment.

---

## Track D — Dossier Pages (Verification)

All five dossier pages exist. Verify each:

- Correct `DOSSIER_ID` constant declared
- Links `../dossier.js` and `../dossier.css`
- All `<span class="clue-hint" data-clue="...">` spans present (see clue inventory in brief §D.3)
- Keeper-mode toggle (5× click) activates clue highlighting
- `.keeper-note` blocks visible (no access control required — players don't have direct URLs)

**Expected clue counts:** pulaski (12), brewer-letter (3), mariana (5), veritas-tablet (7), harbor-map (1).

---

## Track E — Validation (runs last)

Per brief §L:

- [ ] `mission-prep.css` updated; S01–S03 pages visually unchanged
- [ ] `04-the-shojo.html` renders correctly with promoted CSS
- [ ] `s04.json` valid JSON; all handout `link:` paths resolve
- [ ] All five dossier pages load at their URLs
- [ ] Mission index (`keeper.html`) has S04 link
- [ ] `portal-threads.json` valid JSON; 5 new entries present
- [ ] `report-schema.json` valid JSON; S04 entry present
- [ ] No broken links between session HTML, handouts, and main nav
- [ ] Keeper-mode toggles functional on dossier pages

---

## Open Questions — Resolved

| Question | Resolution |
|---|---|
| Drive Home placeholder text | Use "from the mission" |
| Shōjō image | Generate, mark for keeper review |
| NPC portraits | Pulaski + Yuki yes; Mariana skip |
| `s04-brewer-letter.html` source | File present in repo |

---

## Files Changed

| File | Operation |
|---|---|
| `mission-prep.css` | Append promoted CSS classes |
| `missions/04-the-shojo.html` | Remove promoted rules from inline `<style>` |
| `missions/keeper.html` | Add S04 entry |
| `data/sessions/s04.json` | Update `leech-call-1` body text |
| `data/portal-threads.json` | Append 5 thread entries |
| `data/report-schema.json` | Append S04 entry |
| `images/sessions/s04/` | New directory; generated images |
| `handouts/dossier/s04-brewer-letter.html` | Verify (no edits expected) |
