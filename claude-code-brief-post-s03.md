# Claude Code Brief — Post-S03 Updates + S04 Preparation

**Context:** Session 03 "The Understudies" is complete (played across two sessions). This document contains everything needed to update data files, lock canon, and prepare for S04. Always pull the latest versions of files from the GitHub repo before editing.

---

## PART 1 — S03 Outcome Summary

**Resolution:** Partial. Clara left voluntarily (in the hospital, not on stage). Edmund left during the Saturday performance after an improvised farewell. The prompt book was in Reed's backpack (not on stage), so the mechanism didn't close cleanly — traces remain in the theatre. The prompt book is now at the lab.

**Key events in order:**
1. Team contained Clara's spirit in a jar (willing, partial containment, leaks over time)
2. Drove to hospital with prompt book — studied it en route (catalyst works both ways: start AND close)
3. Rex and Reed visited Daniel/Edmund — he wants to see the play, doesn't know how to leave
4. Alan (as Nurse Jackie) and Sven visited Miriam — channelled Clara through the jar's leakage
5. Alan described the fey afterlife (forests, nature, freedom) — implanted the vision in Clara AND Sven
6. Alan wrote "Clara, exit stage left" on paper — Clara read it, chose to leave, jar emptied
7. Miriam returned to herself, handed over Clara's notebooks from her bedside table
8. Team dropped prompt book at lab for Campbell to analyse
9. Team planted false info in reports to Campbell (integrity test — checking if Veritas acts on it)
10. Team called Director Leech — he confirmed Veritas involvement across all cases, shared Campbell's origin (his late partner's quantum breakthrough)
11. Smuggled Daniel/Edmund to the Saturday matinee
12. During Act IV peak: Reed forced a standing ovation, Alan jumped on stage (got possessed by Proteus, punched another actor), Sven helped restrain
13. Edmund said farewell: "There is peace on the other side. Thank you." — departed
14. Daniel returned to himself, overwhelmed but present. Returned to hospital.
15. Lab debrief: prompt book stays for study, team defined "fake it till you make it" as therapeutic BIM application

---

## PART 2 — Data File Updates

### A. `data/sessions/s03.json` — New Handouts to Add

Add these to the existing handouts array:

**PDA — Director's message about Veritas**
```json
{
  "id": "s03-director-veritas-debrief",
  "type": "pda",
  "session": "s03",
  "label": "Director Leech — Post-Mission",
  "from": "Dr. Victor Leech",
  "body": "Good work out there. At least they are at peace. Veritas has been involved in every case we've tracked — sometimes observing, sometimes funding. They have more resources than us and they're always six months ahead. I need to know: are you going to share the resolution with them as they requested? And I want everything you have on that prompt book. The catalyst mechanics could be significant.",
  "classification": "portal-internal"
}
```

**Document — Clara's Notebooks**
```json
{
  "id": "s03-clara-notebooks-recovered",
  "type": "document",
  "session": "s03",
  "label": "Clara Voss — Rehearsal Notebooks",
  "body": "Recovered from Miriam Okafor's bedside table at the hospital. Clara had told Miriam where to find them. The notebooks document the mechanism from the inside: early entries are normal rehearsal notes, but the voice shifts over time. Clara recorded thoughts she didn't think, blocking decisions she didn't make, a growing sense of being inhabited.",
  "link": "handouts/dossier/s03-clara-notebooks.html",
  "classification": "Recovered by the team from Miriam Okafor's hospital room"
}
```

**PDA — Campbell Analysis of Prompt Book**
```json
{
  "id": "s03-campbell-prompt-book",
  "type": "pda",
  "session": "s03",
  "label": "CAMPBELL — Prompt Book Analysis",
  "from": "CAMPBELL",
  "body": "BIM readings on the prompt book are significant — consistent with previous catalyst artefacts (cf. Aldermoor substrate). The writing shifts partway through: annotations stop being performance instructions and become something else. Key phrases identified: 'the audience is not watching, the audience is participating,' 'belief is the medium through which transfer occurs,' 'without them the performer is alone with the character; with them the character has somewhere to arrive from.' This is not a spell book. It is a record of discovery.",
  "classification": "portal-internal"
}
```

**Scan — Performance Peak Reading**
```json
{
  "id": "s03-scan-performance-peak",
  "type": "scan",
  "session": "s03",
  "label": "BIM Reading — Saturday Matinee, Act IV Peak",
  "body": "Stage centre during Act IV: readings spiked to highest recorded levels. Actors on stage read significantly higher than the same individuals offstage. Audience emotional engagement correlates directly with BIM amplitude. The prompt book (in Reed's backpack, audience seating) showed resonance — not physically vibrating but a felt charge. Readings dropped sharply after Edmund's departure.",
  "status": "critical",
  "classification": "Rex Bangley — field scanner, Saturday matinee"
}
```

### B. `data/portal-threads.json` — Thread Updates

Update the following threads (use the existing thread IDs):

**Clara/Edmund thread** — Status: resolved (partial)
- Update `player_summary` to reflect resolution: "Clara chose to leave at the hospital after Alan helped her understand the fey afterlife. Edmund departed during Saturday's performance after a farewell ovation. The prompt book was not on stage, so traces remain in the theatre — understudies may retain some residual effects."

**Veritas/MESA thread** — Update with new developments:
- Array returned (quid pro quo from Aldermoor exchange)
- CAMPBELL integrity test planted (false info in reports)
- Leech confirmed Veritas is not government, has more resources than PORTAL, involved in every case

**CAMPBELL thread** — Update:
- Players explicitly suspicious: "I'm starting to think that Campbell or whoever programmed Campbell is not on the same side"
- Planted false info to test if Veritas acts on it
- Leech shared Campbell's origin: late partner's quantum computing breakthrough, "it seems to have a mind of its own"

**Prompt book thread** — New or update existing:
- At the lab under study
- Campbell's analysis: writing shifts from performance instructions to mechanism documentation
- Science application: "fake it till you make it" — belief as reality-shaping therapeutic approach

### C. `data/evidence.json` — New Evidence Items

Add with `"session_visible": "s03"`:

```json
{
  "id": "prompt-book-lab",
  "title": "The Prompt Book (Secured)",
  "session_visible": "s03",
  "category": "artefact",
  "summary": "Victorian-era prompt book by Silvia Hederstrom, recovered from the Meridian Theatre. BIM-saturated catalyst — amplifies consciousness transfer in performance contexts. Now at the lab. Campbell's analysis reveals the annotations shift from stage directions to mechanism documentation. Key phrase: 'belief is the medium through which transfer occurs.'"
},
{
  "id": "clara-notebooks",
  "title": "Clara Voss's Rehearsal Notebooks",
  "session_visible": "s03",
  "category": "document",
  "summary": "Recovered from Miriam Okafor's hospital room. Document Clara's experience of the mechanism from the inside — rehearsal notes that shift over time as the boundary between Clara and Silvia dissolved."
},
{
  "id": "campbell-integrity-test",
  "title": "CAMPBELL Integrity Test",
  "session_visible": "s03",
  "category": "rival",
  "summary": "False information planted in reports to Campbell and the Director. If Veritas acts on the fabricated intel, it confirms a leak — either through Campbell or through the Director's chain. Results pending."
}
```

### D. `data/campbell-logs.json` — New Batch (Post-S03)

Add a new batch (Batch 4, post-S03). Follow the existing three-layer reveal format:
- Layer 1: In-world highlights (Teddy/Priya)
- Layer 2: Anomaly flags
- Layer 3: Clue spans (keeper-triggered)

Entries should cover:
1. Campbell's prompt book analysis — the writing shift, "the audience is participating"
2. Campbell processing the performance data — audience belief as BIM amplifier confirmed
3. Campbell noting that the team returned the array to Veritas — flagging cooperation
4. A late-night entry where Cameron's voice bleeds through: the "fake it till you make it" discovery resonates with something personal — Cameron's own transfer was a form of believing you can exist somewhere you shouldn't be able to
5. Campbell NOT flagging the planted false information — because if Campbell is compromised, the logs wouldn't show it; if Campbell is honest, it might flag the inconsistency itself

### E. `worldbuilding-lore.md` — Lock New Canon

Add to the canon section:

**Spirits in Vessels:** Spirits can be contained in physical vessels (jars, containers) if they enter willingly. Containment is imperfect — the spirit leaks over time, and there is a persistent pull back toward anchoring locations. The pull strengthens with distance and time. Coercion is theoretically possible but not tested.

**Fey Afterlife:** The fey understanding of what comes after death is forests, nature, freedom — running, frolicking, communing with the natural world. Alan described this instinctively during S03; it may be his suppressed memories of his origin. The vision was strong enough to implant in others (Sven saw it too).

**Alan's Fey Imprinting:** Alan can implant visions/ideas into others' minds. This costs fey points (he becomes less human each time he uses it). Sven experienced the forest vision during the Clara scene. This ability is tied to his changeling nature, not learned magic.

**Catalyst Bidirectionality:** Artefacts that catalyse supernatural events are also required to close them. The catalyst works both ways — starting and ending. Removing the catalyst dampens the mechanism but doesn't cleanly resolve it (cf. prompt book in backpack = partial ending).

**BIM Science — "Fake It Till You Make It":** The prompt book's mechanism reveals a therapeutic application: belief can reshape capability at a psychological/physiological level. If you truly believe you are something, you develop the functional capacity (muscle memory, reflexes, confidence) — but not physical attributes you don't possess (you can't grow muscles, but you can access muscle memory as if trained). This is now a lab research direction.

**Silvia Hederstrom:** The Victorian-era actor who authored the prompt book's annotations. Player-defined name.

---

## PART 3 — Player Feedback & Complaints

### What Players Said (Stars & Wishes from both sessions)

**STARS (what worked):**
- Meeting Veritas/Rook — "extremely exciting" (Sven's player)
- Alan jumping on stage — bold, unexpected, drove the climax
- "Clara, exit stage left" — creative player-driven resolution
- The Outlaws read-through (Part 1) — comedy highlight, everyone engaged
- Splitting the party for the hospital — gave momentum
- Part 2 was more comprehensible than Part 1 (Rex's player)
- CAMPBELL suspicion building naturally

**WISHES (complaints and requests):**
- **TOO MANY CHARACTERS.** Every player said this. The keeper agreed: "I overcomplicated the characters in my head." The casting chain (Clara→Miriam→Sophie, Edmund→Daniel→James) was too many names at once. Even the keeper got confused mid-session.
- **WANTED MORE ACTION.** Direct quote from multiple players: "I want one mission where it's mostly just combat." "I wanna kick some ass." The keeper confirmed S04 will be "more actiony and traditional Monster of the Week, with actual harm."
- **TOO COMPLEX / TOO MANY THREADS.** Players felt lost in Part 1. The open investigation was directionless. They wanted clearer guidance on available paths.
- **REED FELT SIDELINED.** During supernatural scenes (Clara's dressing room, the jar channelling), Reed's player had nothing to do. "I feel useless."
- **REX FELT SIDELINED.** Rex's player felt the "sciency side has been exhausted" — during the hospital and performance, he had no non-supernatural levers.
- **FEY BREADCRUMBS WERE CONFUSING.** The keeper acknowledged: "I tried to make it confusing because fey — but it was just frustrating confusing."

### What They Want for S04
- **Pulpy, action-packed, goofy.** A palate cleanser after two heavy investigation sessions.
- **A clear monster they can fight.** Not a sympathetic entity, not a mechanism — something that hits back.
- **Combat with actual harm.** The keeper wants to start using harm as a resource.
- **Fewer NPCs.** Four maximum.
- **Linear path.** Not branching, not open-ended. Briefing → investigate → fight.
- **Everyone has something to do.** Especially Reed (civilian management) and Rex (gadgets, analysis, direct action).

---

## PART 4 — Files to Reference

These files are authored and ready — pull from Claude outputs or the repo:

| File | Purpose |
|------|---------|
| `s04-outline-draft.md` | Full S04 Shōjō outline — parameters, NPCs, three encounters, stat block, custom moves, MESA aftermath, per-hunter design |
| `portal-session-design/SKILL.md` | Session design skill with all anti-patterns from S01-S04 actual play |
| `portal-session-design/references/session-profiles.md` | S01-S04 profiles with actual play data and five preset profiles |
| `s03-session-summary.md` | Part 1 transcript analysis |
| `s03-part2-session-summary.md` | Part 2 transcript analysis |
| `s03-continuation-guide.md` | What was planned vs what happened |

---

## PART 5 — Implementation Checklist

- [ ] Update `s03.json` with new handouts (Part 2 section A)
- [ ] Update `portal-threads.json` with thread movements (Part 2 section B)
- [ ] Update `evidence.json` with new items (Part 2 section C)
- [ ] Add Batch 4 to `campbell-logs.json` (Part 2 section D)
- [ ] Update `worldbuilding-lore.md` with locked canon (Part 2 section E)
- [ ] Update session-profiles.md in context/ with S03 actual play results
- [ ] Verify all player-facing content uses "Veritas" not "MESA" (players don't know the name MESA)
- [ ] Verify no game-mechanic language in player-facing handouts (no clocks, no routes)
- [ ] Stage the S04 outline for keeper review before expanding to full session prep
