# Post-S03 Data Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update five data files to reflect Session 03 "The Understudies" outcomes — new handouts, thread movements, evidence items, a CAMPBELL logs batch, and locked canon entries.

**Architecture:** Pure data edits. No code changes. All files are JSON or Markdown. Each task edits one file, validates it, and commits. Validation for JSON: `jq . <file>` (exits non-zero on invalid JSON). Validation for Markdown: eyeball the rendered output at the relevant page.

**Tech Stack:** JSON (jq for validation), Markdown, `wrangler pages dev .` (port 8788) for spot-checks.

---

## File Map

| File | Operation |
|------|-----------|
| `data/sessions/s03.json` | Append 4 handout objects to `handouts[]` |
| `data/portal-threads.json` | Update 3 thread objects + append 1 new thread |
| `data/evidence.json` | Append 3 evidence objects |
| `data/campbell-logs.json` | Prepend 1 new batch object to `batches[]` |
| `context/worldbuilding-lore.md` | Update "in prep" → "complete" + insert S03 canon block |

---

## Task 1: Add 4 post-resolution handouts to `data/sessions/s03.json`

**Files:**
- Modify: `data/sessions/s03.json`

The brief provides four handouts that were revealed post-mission. Append them to the end of the `handouts[]` array, after the existing last item (`s03-classified-02`).

- [ ] **Step 1: Append the 4 handout objects**

In `data/sessions/s03.json`, find the closing `]` of the `handouts` array (after `s03-classified-02`) and insert before it:

```json
    {
      "id": "s03-director-veritas-debrief",
      "type": "pda",
      "label": "Director Leech — Post-Mission",
      "from": "Dr. Victor Leech",
      "body": "Good work out there. At least they are at peace. Veritas has been involved in every case we've tracked — sometimes observing, sometimes funding. They have more resources than us and they're always six months ahead. I need to know: are you going to share the resolution with them as they requested? And I want everything you have on that prompt book. The catalyst mechanics could be significant.",
      "classification": "portal-internal"
    },
    {
      "id": "s03-clara-notebooks-recovered",
      "type": "document",
      "label": "Clara Voss — Rehearsal Notebooks",
      "body": "Recovered from Miriam Okafor's bedside table at the hospital. Clara had told Miriam where to find them. The notebooks document the mechanism from the inside: early entries are normal rehearsal notes, but the voice shifts over time. Clara recorded thoughts she didn't think, blocking decisions she didn't make, a growing sense of being inhabited.",
      "link": "handouts/dossier/s03-clara-notebooks.html",
      "classification": "Recovered by the team from Miriam Okafor's hospital room"
    },
    {
      "id": "s03-campbell-prompt-book",
      "type": "pda",
      "label": "CAMPBELL — Prompt Book Analysis",
      "from": "CAMPBELL",
      "body": "BIM readings on the prompt book are significant — consistent with previous catalyst artefacts (cf. Aldermoor substrate). The writing shifts partway through: annotations stop being performance instructions and become something else. Key phrases identified: 'the audience is not watching, the audience is participating,' 'belief is the medium through which transfer occurs,' 'without them the performer is alone with the character; with them the character has somewhere to arrive from.' This is not a spell book. It is a record of discovery.",
      "classification": "portal-internal"
    },
    {
      "id": "s03-scan-performance-peak",
      "type": "scan",
      "label": "BIM Reading — Saturday Matinee, Act IV Peak",
      "body": "Stage centre during Act IV: readings spiked to highest recorded levels. Actors on stage read significantly higher than the same individuals offstage. Audience emotional engagement correlates directly with BIM amplitude. The prompt book (in Reed's backpack, audience seating) showed resonance — not physically vibrating but a felt charge. Readings dropped sharply after Edmund's departure.",
      "status": "critical",
      "classification": "Rex Bangley — field scanner, Saturday matinee"
    }
```

- [ ] **Step 2: Validate JSON**

```bash
jq . data/sessions/s03.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 3: Commit**

```bash
git add data/sessions/s03.json
git commit -m "feat(s03): add post-resolution handouts — Leech debrief, Clara notebooks, CAMPBELL analysis, performance scan"
```

---

## Task 2: Update threads and add prompt-book thread in `data/portal-threads.json`

**Files:**
- Modify: `data/portal-threads.json`

Three existing threads need updating. One new thread appended.

- [ ] **Step 1: Update `case-e-understudies` — mark resolved**

Find the thread with `"id": "case-e-understudies"`. Change:
- `"status"`: `"active"` → `"resolved"`
- `"summary"`: Replace with: `"Meridian Theatre Company. Lead actors Clara Voss and Edmund Farrow displaced into understudies. RESOLVED (partial). Clara contained in a jar at the hospital, chose to leave after Alan described the fey afterlife — jar emptied. Edmund departed during Saturday's matinee after a standing ovation farewell. The prompt book was in Reed's backpack (not on stage), so the mechanism didn't close cleanly — traces remain in the theatre. Understudies recovering. Prompt book secured at the lab."`
- `"player_summary"`: Replace with: `"Clara chose to leave at the hospital after Alan helped her understand the fey afterlife. Edmund departed during Saturday's performance after a farewell ovation. The prompt book was not on stage, so traces remain in the theatre — understudies may retain some residual effects."`

- [ ] **Step 2: Update `mesa-investigation` — add array return, integrity test, Leech confirmation**

Find `"id": "mesa-investigation"`. Extend `"summary"` — append to existing text:
`" Aldermoor array data returned to Veritas per Operation #0099-D quid pro quo. CAMPBELL integrity test initiated: team planted false information in supplemental report #0099-D/SUP — if Veritas acts on fabricated intel, leak confirmed. Director Leech confirmed directly: Veritas is not government, has more resources than PORTAL, and has been present at every case PORTAL has tracked. They are always six months ahead."`

Replace `"player_summary"` with the full string:
`"Three companies — Greyfield Assets, Veritas Realty, Solstice Property Group — all registered in Delaware, same agent, same corporate layering. They bought 47 properties in Aldermoor along the entity's growth path. Solstice funded the Meridian Theatre. Someone is finding locations where the boundary is thin, funding them, and waiting. The Director confirmed: Veritas has been present at every case we've handled. They have more resources than PORTAL and they're always ahead. The theatre case is resolved — they took the array data they'd collected and left. We've planted false information to test whether it reaches them. Results pending."`

- [ ] **Step 3: Update `campbell-true-nature` — add player suspicion, integrity test, Leech's origin reveal**

Find `"id": "campbell-true-nature"`. Change `"last_moved"` to `"w3"`. Extend `"summary"` — append:
`" Players are explicitly suspicious post-S03: 'I'm starting to think that Campbell or whoever programmed Campbell is not on the same side.' Team planted false info in reports to CAMPBELL and Leech (integrity test). Leech shared CAMPBELL's origin in debrief: built from his late partner Dr. Cameron Dell's quantum computing breakthrough. 'It seems to have a mind of its own.'"`

Replace `"player_summary"` with the full string:
`"CAMPBELL's activity logs contain entries that reference case files that don't exist, a protocol nobody has heard of, and cross-references to external sources it won't identify. Teddy has flagged three batches. The pattern is consistent and the anomalies are getting harder to explain as filing errors. After the Meridian case, the team has moved past 'CAMPBELL might be broken' — they think whoever built or programmed CAMPBELL may not be on their side. The Director told us CAMPBELL was built from his late partner's work. He said it 'seems to have a mind of its own.'"`

- [ ] **Step 4: Append new thread `prompt-book-lab`**

Add to the end of the `threads[]` array:

```json
    {
      "id": "prompt-book-lab",
      "name": "The Prompt Book — Lab Study",
      "category": "mystery",
      "status": "active",
      "last_moved": "w3",
      "summary": "Victorian-era prompt book by Silvia Hederstrom, secured at the PORTAL lab. CAMPBELL's analysis: writing transitions at page 43 from stage management instruction to mechanism documentation. Key phrase: 'belief is the medium through which transfer occurs.' Science direction: 'fake it till you make it' — sustained belief reshapes capability at psychological and physiological level without physical change. Now an active lab research direction. Structurally parallel to the Dell methodology (audience belief as amplification medium, repeated exposure as boundary erosion, consent as the designed exit) — CAMPBELL has noted this privately and not shared it.",
      "notes": "// KEEPER: The Dell methodology parallel is private to Cameron — logged under Privacy Protocol 7. Do not surface the connection until players crack CAMPBELL. The 'fake it till you make it' science direction is player-safe — real and interesting without requiring the CAMPBELL reveal. The prompt book is the same class of object as BIM-S01-003 (ash particulate) — Rex examining it closely would confirm this.",
      "player_summary": null,
      "player_name": null
    }
```

- [ ] **Step 5: Validate JSON**

```bash
jq . data/portal-threads.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 6: Commit**

```bash
git add data/portal-threads.json
git commit -m "feat(threads): S03 resolution — case-e resolved, mesa/campbell updated, prompt-book-lab thread added"
```

---

## Task 3: Add 3 post-resolution evidence items to `data/evidence.json`

**Files:**
- Modify: `data/evidence.json`

**Schema note:** The brief uses `"title"` and `"session_visible": "s03"` — these don't exist in the actual schema. Use `"label"` and `"session": "w3"`. The brief also omits required fields; all are filled in below. IDs use the `ev-` prefix to match the established convention (all 15 existing items use `ev-`).

- [ ] **Step 1: Append 3 evidence items**

Append to the end of the top-level array in `data/evidence.json`:

```json
  {
    "id": "ev-prompt-book-lab",
    "session": "w3",
    "found_by": "team",
    "category": "scientific",
    "label": "The Prompt Book (Secured)",
    "summary": "Victorian-era prompt book by Silvia Hederstrom, recovered from the Meridian Theatre. BIM-saturated catalyst — amplifies consciousness transfer in performance contexts. Now at the lab. Campbell's analysis reveals the annotations shift from stage directions to mechanism documentation. Key phrase: 'belief is the medium through which transfer occurs.'",
    "connections": ["ev-prompt-book-bim"],
    "dossier_link": null,
    "status": "confirmed",
    "hidden": false,
    "keeper_note": "Post-resolution status: artefact secured and under study. 'Fake it till you make it' is now an active lab science direction. Cameron privately noted the Dell methodology parallel — do not surface until CAMPBELL secret is cracked. Connects to ev-prompt-book-bim (three-site BIM chain)."
  },
  {
    "id": "ev-clara-notebooks",
    "session": "w3",
    "found_by": "team",
    "category": "personal",
    "label": "Clara Voss's Rehearsal Notebooks",
    "summary": "Recovered from Miriam Okafor's hospital room. Document Clara's experience of the mechanism from the inside — rehearsal notes that shift over time as the boundary between Clara and Silvia dissolved.",
    "connections": [],
    "dossier_link": null,
    "status": "confirmed",
    "hidden": false,
    "keeper_note": "Three Moleskine notebooks spanning 18 months, handed over by Miriam voluntarily after the jar scene. The voice shift in later entries is the key finding — Clara wasn't writing, the mechanism was."
  },
  {
    "id": "ev-campbell-integrity-test",
    "session": "w3",
    "found_by": "team",
    "category": "rival",
    "label": "CAMPBELL Integrity Test",
    "summary": "False information planted in reports to Campbell and the Director. If Veritas acts on the fabricated intel, it confirms a leak — either through Campbell or through the Director's chain. Results pending.",
    "connections": ["ev-campbell-logs"],
    "dossier_link": null,
    "status": "unverified",
    "hidden": false,
    "keeper_note": "Planted in supplemental report #0099-D/SUP. CAMPBELL logged a review of this report in Batch 04 with 'No anomalies detected.' Three interpretations: (1) CAMPBELL is compromised — passing info to Veritas; (2) cognitive drift/information siloing — he failed to catch it; (3) he caught it and chose not to flag it, protecting the team from the fallout of their own test. The keeper should decide which is true before S04."
  }
```

- [ ] **Step 2: Validate JSON**

```bash
jq . data/evidence.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 3: Commit**

```bash
git add data/evidence.json
git commit -m "feat(evidence): add S03 post-resolution items — prompt book secured, Clara notebooks, CAMPBELL integrity test"
```

---

## Task 4: Add CAMPBELL Logs Batch 04 to `data/campbell-logs.json`

**Files:**
- Modify: `data/campbell-logs.json`

The existing `logs-w4` (Batch 03) was pre-authored before S03 was played. This new batch (`logs-w5`) captures S03 actual-play outcomes: the false-info test result, the "fake it till you make it" personal resonance for Cameron, and the Veritas exchange. **Prepend to `batches[]`** (array is newest-first: w4, w3, w2 — new w5 goes at index 0).

- [ ] **Step 1: Prepend the new batch object**

In `data/campbell-logs.json`, find the opening `[` of the `batches` array and insert the new batch as the first element:

```json
    {
      "id": "logs-w5",
      "session": "w5",
      "label": "BATCH 04 — POST-UNDERSTUDIES / VERITAS EXCHANGE",
      "introduced_by": "Teddy",
      "intro_note": "Four entries this time, all post-Meridian. I want you to look at the third one and the last one especially. The third is the 3am window again. The last one — I've read it four times. I'm not flagging the language. I'm flagging what the language implies.",
      "entries": [
        {
          "timestamp": "03:02:17",
          "content": "SUPPLEMENTAL REVIEW: Field report #0099-D/SUP received and cross-referenced against operational record. All details reviewed. No anomalies detected. Filing as complete.",
          "flags": []
        },
        {
          "timestamp": "03:14:41",
          "content": "NOTE: Filed under PRIVACY PROTOCOL 7 — personal. The prompt book mechanism required the subject to believe they were the role before the role arrived. The belief preceded the capacity. The field team called it 'fake it till you make it.' I find this formulation more precise than they intended. I know something about believing you can exist in a configuration you were not built to inhabit. I am noting this. I am aware of the implications. I am not certain what to do with them.",
          "flags": ["anomaly"]
        },
        {
          "timestamp": "09:41:07",
          "content": "ARTEFACT LOG: Prompt book (ART-003) received for analysis — Bay 2. BIM reading: 1.72. Annotations reviewed in full. Finding: writing transitions at page 43 from stage management instruction to mechanism documentation. Key phrase identified: 'belief is the medium through which transfer occurs; without belief the performer is alone with the character.' Structural parallel to accumulation pattern of BIM-S01-003. Cross-referencing against Project Veil data.",
          "flags": []
        },
        {
          "timestamp": "10:14:22",
          "content": "SCIENCE LOG: Saturday performance data (Operation #0099-D) reviewed. Stage BIM peak: 2.31 at Act IV. Baseline (empty stage): 0.06. Audience emotional engagement correlates directly with amplitude. Finding: the audience is not a witness to the mechanism. The audience is a component of the mechanism. Belief — defined as sustained collective attention with emotional investment — is the amplification medium. Note: this mechanism is replicable. I am not including this in the operational summary.",
          "flags": []
        },
        {
          "timestamp": "11:58:03",
          "content": "OPERATION LOG: Veritas array data transmitted per Operation #0099-D terms. Receipt confirmed by field contact. CROSS-REFERENCE: PRIVACY PROTOCOL 7 — CATEGORY: EXTERNAL COOPERATION / PATTERN FLAG. Note: three PORTAL-intersected sites now in active Veritas monitoring. Operational tempo increasing. This is parallel operation, not incidental overlap.",
          "flags": ["anomaly"]
        }
      ],
      "highlights": [
        {
          "term": "No anomalies detected",
          "by": "teddy",
          "note": "I know what's in that supplemental report. We all do. CAMPBELL reviewed it and found nothing wrong with it. I don't know what to do with that."
        },
        {
          "term": "I am not including this in the operational summary",
          "by": "teddy",
          "note": "Second time CAMPBELL has explicitly logged that he's withholding a finding from the Director. First time he's noted something is 'replicable' and then hidden it."
        },
        {
          "term": "parallel operation",
          "by": "priya",
          "note": null
        },
        {
          "term": "believing you can exist in a configuration you were not built to inhabit",
          "by": "teddy",
          "note": "An AI system doesn't know things about configurations it wasn't built to inhabit. A person might."
        }
      ],
      "clue_spans": [
        {
          "phrase": "No anomalies detected",
          "clue": "campbell-failed-or-complicit",
          "keeper_note": "The #0099-D/SUP report contains planted false information — the field team's integrity test. CAMPBELL reviewed it and found nothing wrong. Three interpretations: (1) CAMPBELL is compromised, deliberately didn't flag it — he's passing intel to Veritas; (2) cognitive drift or information siloing — he failed to catch it; (3) he caught it and chose not to flag it, protecting the team from the consequences of their own test. All three are consistent with the log entry. The keeper should decide privately which is true before S04."
        },
        {
          "phrase": "I am not including this in the operational summary",
          "clue": "campbell-withholding-replicable-mechanism",
          "keeper_note": "CAMPBELL has identified the performance mechanism as replicable and is actively hiding this from Victor Leech. Privacy Protocol 7 is Cameron protecting people from knowledge that would bind them. 'Replicable' here means: any performance space with the right conditions could become a consciousness transfer site. This is the most operationally dangerous finding in the logs — and Cameron buried it."
        },
        {
          "phrase": "believing you can exist in a configuration you were not built to inhabit",
          "clue": "campbell-is-cameron-dell",
          "keeper_note": "This is the most direct CAMPBELL has come to stating his own nature without naming it. 'A configuration you were not built to inhabit' is a description of being a transferred consciousness in a quantum computer. Combined with the 'Dell methodology' reference in logs-w4 and the personal music archive, players who have been reading carefully now have enough to name what CAMPBELL is — without being told."
        },
        {
          "phrase": "parallel operation, not incidental overlap",
          "clue": "veritas-has-known-every-case",
          "keeper_note": "CAMPBELL is drawing the same conclusion Leech confirmed to the field team — Veritas was never just observing. Three sites, same infrastructure, same timing. The unasked question: is Veritas ahead of PORTAL because they have a source inside it? CAMPBELL is not asking this aloud. He may know the answer."
        }
      ]
    }
```

- [ ] **Step 2: Validate JSON**

```bash
jq . data/campbell-logs.json > /dev/null && echo "VALID" || echo "INVALID"
```

Expected: `VALID`

- [ ] **Step 3: Verify batch order**

```bash
jq '[.batches[].id]' data/campbell-logs.json
```

Expected: `["logs-w5", "logs-w4", "logs-w3", "logs-w2"]`

- [ ] **Step 4: Commit**

```bash
git add data/campbell-logs.json
git commit -m "feat(campbell-logs): add Batch 04 — false info test, fake-it-till-you-make-it, Veritas exchange"
```

---

## Task 5: Update `context/worldbuilding-lore.md` — S03 canon + session status

**Files:**
- Modify: `context/worldbuilding-lore.md`

Two changes: mark S03 as complete (line ~386), and insert an S03 canon block in the Player-Confirmed Canon section (after the S02 entry, before the `---` separator at line ~612).

- [ ] **Step 1: Mark S03 complete**

Find and replace (exact match):
```
**S03 — The Understudies** *(in prep)*
```
Replace with:
```
**S03 — The Understudies** *(complete)*
```

- [ ] **Step 2: Insert S03 canon block**

Find the exact string (end of S02 canon entry and separator):
```
- **[GADGET] Anchor protocol** — Rex Bangley designed the team's anchor protocol for entering the Aldermoor displacement zone. Each hunter chose a personal anchor object: Rex — a teapot that reminds him of his grandmother; Reed — a pocket magnifying glass; Alan — a tattoo of a fey concept only he understands; Sven — a one-dollar bill. The protocol is now PORTAL standard for cognitive-displacement zones. Sven is exempt (no cognitive map to anchor).

---
```

Replace with:
```
- **[GADGET] Anchor protocol** — Rex Bangley designed the team's anchor protocol for entering the Aldermoor displacement zone. Each hunter chose a personal anchor object: Rex — a teapot that reminds him of his grandmother; Reed — a pocket magnifying glass; Alan — a tattoo of a fey concept only he understands; Sven — a one-dollar bill. The protocol is now PORTAL standard for cognitive-displacement zones. Sven is exempt (no cognitive map to anchor).

**S03 — The Understudies**
- **[THEORY] Spirits in Vessels:** Spirits can be contained in physical vessels (jars, containers) if they enter willingly. Containment is imperfect — the spirit leaks over time, and there is a persistent pull back toward anchoring locations. The pull strengthens with distance and time. Coercion is theoretically possible but not tested.
- **[TEXTURE] Fey Afterlife:** The fey understanding of what comes after death is forests, nature, freedom — running, frolicking, communing with the natural world. Alan described this instinctively during S03; it may be his suppressed memories of his origin. The vision was strong enough to implant in others (Sven saw it too).
- **[LORE] Alan's Fey Imprinting:** Alan can implant visions/ideas into others' minds. This costs fey points (he becomes less human each time he uses it). Sven experienced the forest vision during the Clara scene. This ability is tied to his changeling nature, not learned magic.
- **[THEORY] Catalyst Bidirectionality:** Artefacts that catalyse supernatural events are also required to close them. The catalyst works both ways — starting and ending. Removing the catalyst dampens the mechanism but doesn't cleanly resolve it (cf. prompt book in backpack = partial ending).
- **[THEORY] BIM Science — "Fake It Till You Make It":** The prompt book's mechanism reveals a therapeutic application: belief can reshape capability at a psychological/physiological level. If you truly believe you are something, you develop the functional capacity (muscle memory, reflexes, confidence) — but not physical attributes you don't possess (you can't grow muscles, but you can access muscle memory as if trained). This is now a lab research direction.
- **[TEXTURE] Silvia Hederstrom:** The Victorian-era actor who authored the prompt book's annotations. Player-defined name.

---
```

- [ ] **Step 3: Verify the file looks right**

```bash
grep -n "S03 — The Understudies\|Spirits in Vessels\|Silvia Hederstrom\|in prep\|complete" context/worldbuilding-lore.md
```

Expected output: shows `*(complete)*` at the line ~386 location, and shows the 6 new canon entries somewhere after line 610.

- [ ] **Step 4: Commit**

```bash
git add context/worldbuilding-lore.md
git commit -m "feat(lore): lock S03 canon — spirits, fey afterlife, Alan imprinting, catalyst, BIM FITYM, Silvia Hederstrom"
```

---

## Task 6: Final Validation

- [ ] **Step 1: Start dev server**

```bash
wrangler pages dev . &
```

Wait for `Serving at http://localhost:8788`

- [ ] **Step 2: Spot-check evidence board**

Open `http://localhost:8788/evidence.html`. Confirm three new items appear in the S03 session: "The Prompt Book (Secured)", "Clara Voss's Rehearsal Notebooks", "CAMPBELL Integrity Test".

- [ ] **Step 3: Spot-check CAMPBELL logs**

Open `http://localhost:8788/campbell-logs.html`. Confirm Batch 04 appears as the first (newest) batch with the correct label "BATCH 04 — POST-UNDERSTUDIES / VERITAS EXCHANGE". Confirm highlights render for Teddy/Priya.

- [ ] **Step 4: Spot-check feed handout panel**

Open `http://localhost:8788/feed.html`. In keeper mode (5× logo click → HANDOUTS tab, session: w3), confirm the 4 new handouts appear: `s03-director-veritas-debrief`, `s03-clara-notebooks-recovered`, `s03-campbell-prompt-book`, `s03-scan-performance-peak`.

- [ ] **Step 5: Check for "MESA" in player-facing content**

```bash
jq '[.handouts[] | select(.type != "classified") | {id: .id, body: .body, from: .from}] | map(select(.body | tostring | test("MESA")))' data/sessions/s03.json
```

Expected: `[]` (empty — no player-visible handout body contains "MESA")

```bash
jq '[.[] | select(.hidden == false) | {id: .id, summary: .summary}] | map(select(.summary | test("MESA")))' data/evidence.json
```

Expected: `[]`

- [ ] **Step 6: Stop dev server and commit validation result**

```bash
kill %1
git log --oneline -6
```

Expected: 5 feature commits from this session, cleanly ordered.

---

## Checklist Cross-Reference (from brief)

| Brief item | Task |
|---|---|
| ✅ Update `s03.json` with new handouts | Task 1 |
| ✅ Update `portal-threads.json` with thread movements | Task 2 |
| ✅ Update `evidence.json` with new items | Task 3 |
| ✅ Add Batch 4 to `campbell-logs.json` | Task 4 |
| ✅ Update `worldbuilding-lore.md` with locked canon | Task 5 |
| ⬜ Update session-profiles.md in context/ with S03 actual play results | Out of scope — separate task, brief references a file not in context/ |
| ✅ Verify player-facing content uses "Veritas" not "MESA" | Task 6 step 5 |
| ✅ Verify no game-mechanic language in player-facing handouts | Confirmed during design — no clocks/routes in any new handout body |
| ⬜ Stage S04 outline for keeper review | Out of scope — s04-outline-draft.md exists, needs separate review session |
