# Design Spec — Post-S03 Data Ingestion

**Date:** 2026-04-17
**Session:** S03 "The Understudies" (complete)
**Brief:** `claude-code-brief-post-s03.md`

---

## Scope

Update five data files to reflect Session 03 outcomes. All content is fully specified in the brief. This spec documents the exact approach for each file, including schema adaptations where the brief and actual schema differ.

---

## 1. `data/sessions/s03.json` — Add 4 handouts

Append four new objects to the end of the `handouts[]` array in this order:

1. `s03-director-veritas-debrief` — type: `pda`, Leech post-mission message confirming Veritas involvement in all cases
2. `s03-clara-notebooks-recovered` — type: `document`, links to existing `handouts/dossier/s03-clara-notebooks.html`
3. `s03-campbell-prompt-book` — type: `pda`, from CAMPBELL, prompt book analysis
4. `s03-scan-performance-peak` — type: `scan`, status: `critical`, Saturday matinee Act IV reading

**Player-facing rules:** None of these use "MESA". The Leech PDA and Campbell PDA use "Veritas" and the Veritas array terminology. No game-mechanic language (no clocks, no routes). The document handout uses a different `id`, `label`, `classification`, and richer `body` than the existing `s03-doc-02` that links to the same dossier — no conflict.

---

## 2. `data/portal-threads.json` — 3 updates + 1 new thread

### Updates

**`case-e-understudies`**
- `status`: `"active"` → `"resolved"`
- `last_moved`: `"w3"` (already set)
- `player_summary`: Replace with: "Clara chose to leave at the hospital after Alan helped her understand the fey afterlife. Edmund departed during Saturday's performance after a farewell ovation. The prompt book was not on stage, so traces remain in the theatre — understudies may retain some residual effects."

**`mesa-investigation`**
- Extend `summary` to add: array returned to Veritas (quid pro quo from Aldermoor exchange); CAMPBELL integrity test planted — false info in reports to test if Veritas acts on it; Leech confirmed Veritas is not government, has more resources than PORTAL, and has been involved in every case PORTAL has tracked.
- `player_summary` update (uses "Veritas", no mechanic language): add sentence that the team returned the Aldermoor array data to Veritas as agreed, and that Leech confirmed Veritas predates PORTAL and funds sites they don't.

**`campbell-true-nature`**
- Extend `summary` to add: players are explicitly suspicious ("I'm starting to think Campbell or whoever programmed Campbell is not on the same side"); team planted false info to test if Veritas acts on it; Leech shared Campbell's origin — built from his late partner Cameron Dell's quantum computing breakthrough, "it seems to have a mind of its own."
- `last_moved`: `"w3"`

### New thread

**`prompt-book-lab`**
- `name`: "The Prompt Book — Lab Study"
- `category`: "mystery"
- `status`: "active"
- `last_moved`: "w3"
- `summary`: Prompt book at the lab under study. Campbell's analysis: writing shifts partway through from stage directions to mechanism documentation. Key phrase: "belief is the medium through which transfer occurs." Science direction: "fake it till you make it" — belief can reshape capability at psychological/physiological level. This is now an active lab research direction.
- `notes`: Keeper context: connect to Project Veil breadcrumb chain. The prompt book's mechanism is structurally parallel to the Dell transfer — Cameron has noted this privately. Do not surface the Dell connection until players crack CAMPBELL.
- `player_summary`: null (keeper-only for now)
- `player_name`: null

---

## 3. `data/evidence.json` — Add 3 items

The brief's snippet uses `"title"` and `"session_visible"` — these don't match the actual schema. Apply the following corrections:

| Brief field | Actual field | Value |
|---|---|---|
| `title` | `label` | as written in brief |
| `session_visible: "s03"` | `session: "w3"` | |

Additional required fields not in brief:

| Item | `found_by` | `status` | `hidden` | `connections` | `dossier_link` |
|------|-----------|----------|---------|--------------|----------------|
| `prompt-book-lab` | `"team"` | `"confirmed"` | `false` | `["ev-prompt-book-bim"]` | `null` |
| `clara-notebooks` | `"team"` | `"confirmed"` | `false` | `[]` | `null` |
| `campbell-integrity-test` | `"team"` | `"unverified"` | `false` | `["ev-campbell-logs"]` | `null` |

`hidden: false` means items appear to players when the session gate opens (no keeper reveal action required). `keeper_note` added per item for keeper context.

For `prompt-book-lab`, the connection `ev-prompt-book-bim` links it to the existing prompt book evidence card (three-site BIM match).

---

## 4. `data/campbell-logs.json` — New batch `logs-w5`

The pre-authored `logs-w4` (Batch 03) covers post-S03 CAMPBELL analysis from a predicted-outcome perspective. The new batch captures specific S03 play outcomes not predictable when Batch 03 was written:

- The false-info-not-flagged angle (if CAMPBELL is compromised, the logs won't show it)
- The explicit "fake it till you make it" / Cameron's personal resonance (his own transfer was a form of believing you can exist somewhere you shouldn't)
- The quid pro quo acknowledgement (team cooperated with Veritas, CAMPBELL notes it)

**New batch object:**
- `id`: `"logs-w5"`
- `session`: `"w5"`
- `label`: "BATCH 04 — POST-UNDERSTUDIES / PORTAL–VERITAS EXCHANGE"
- `introduced_by`: `"Teddy"`
- `intro_note`: Written per the existing pattern — Teddy notes the anomalous entries, flags one term she nearly missed

**Entries (5 total):** Follow existing 3am window pattern and `flags: ["anomaly"]` convention. Content per brief:
1. Prompt book science finding — "belief is the medium"
2. Performance data logged — audience amplification confirmed
3. Veritas exchange noted — team cooperated, array data transmitted, CAMPBELL flags this as a pattern
4. A late-night entry where Cameron's voice is audible: "fake it till you make it" resonates personally — his own transfer required believing he could exist somewhere he shouldn't be able to
5. CAMPBELL logs receipt of the supplemental field report (`#0099-D/SUP`) and explicitly marks it clean: "Report reviewed. No anomalies detected." This is the entry players know is wrong — the report contains the planted false intel. The clue is not absence but an explicit "no anomalies" on a poisoned document. If CAMPBELL is compromised, he's hiding it; if he's honest, he failed to catch it. Either reading is damning.

**Highlights:** Teddy and Priya annotations on key phrases per existing pattern.

**Clue spans:** 3–4 keeper-gated spans with `phrase`, `clue`, `keeper_note` per existing format.

---

## 5. `context/worldbuilding-lore.md` — S03 canon entries

Two changes:

**A. Update S03 session line (approx. line 386):** Change `"*(in prep)*"` to `"*(complete)*"`.

**B. Add S03 canon block** inside `### Player-Confirmed Canon`, after the existing S02 entry (line ~612), before the `---` separator that leads into Post-Session 01 Incident Log.

New block heading: `**S03 — The Understudies**`

Six entries from the brief, verbatim:
1. Spirits in Vessels
2. Fey Afterlife
3. Alan's Fey Imprinting
4. Catalyst Bidirectionality
5. BIM Science — "Fake It Till You Make It"
6. Silvia Hederstrom (Victorian-era actor, player-defined name)

---

## Player-Facing Content Audit

All new player-visible content (handouts, evidence summaries, player_summary thread fields) has been reviewed:
- Uses "Veritas" not "MESA" throughout ✓
- No clock references ✓
- No route references ✓
- No game-mechanic language ✓

---

## Files Changed

| File | Operation |
|------|-----------|
| `data/sessions/s03.json` | +4 handout objects appended |
| `data/portal-threads.json` | update 3 threads + 1 new thread appended |
| `data/evidence.json` | +3 evidence items appended |
| `data/campbell-logs.json` | +1 new batch object prepended (newest first) |
| `context/worldbuilding-lore.md` | +6 canon entries + "in prep" → "complete" |

**Note on logs ordering:** Existing batches appear newest-first in the array (`logs-w4`, `logs-w3`, `logs-w2`). New batch `logs-w5` should be prepended (inserted at index 0).
