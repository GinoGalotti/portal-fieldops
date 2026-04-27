---
name: portal-session-design
description: Design and author Monster of the Week session prep documents for the P.O.R.T.A.L campaign. Use this skill whenever creating a new session, episode, or mission — including the session HTML, session data JSON, NPC boxes, stat blocks, handouts, dossier pages, and the ingestion package. Also use when iterating on a session draft, adjusting pacing or tone, or reviewing session feedback. Triggers on phrases like "new session", "next episode", "S04", "mission prep", "session outline", "write the session", or any reference to designing a PORTAL game session.
---

# P.O.R.T.A.L — Session Design Skill

This skill guides the creation of Monster of the Week session prep documents for the P.O.R.T.A.L campaign. It captures lessons from S01–S04 about pacing, tone, NPC density, deliverable formats, and player feedback.

---

## Step 1: Read Context Files

Before designing any session, read these files to understand the current campaign state:

1. `context/worldbuilding-lore.md` — Campaign secrets, arc structure, NPC registry, active threads
2. `context/worldbuilding-site.md` — Site architecture, data schemas, handout types
3. `context/ideas.md` — Episode candidates, creature ideas, unreviewed concepts
4. `context/session-ingestion-template.md` — Required deliverable format for Claude Code
5. `context/post-session-runbook.md` — Post-session workflow (for understanding what happens after)

If previous session data exists, also read the most recent `data/sessions/s0N.json` to understand where the story left off.

---

## Step 2: Set Session Parameters

Before writing anything, establish these parameters with the keeper. Present them as choices, not assumptions.

### Tunable Parameters

**ACTION LEVEL** — How much combat and physical danger?
- `low` — Investigation and conversation. No combat. Tension through mystery and relationships. (S02 Aldermoor)
- `medium` — One significant encounter, possibly avoidable. Danger present but not central. (S03 Understudies)
- `high` — Real combat with a real creature. Multiple encounters. Physical stakes. (S04 Shōjō)

**MYSTERY COMPLEXITY** — How open-ended is the investigation?
- `linear` — One path forward, clear next steps, mystery reveals itself through action. Good after complex sessions.
- `branching` — 2-3 investigation routes, players choose priority. Each route gives different pieces. (S03 had Routes A/B/C — worked narratively but confused players)
- `layered` — One apparent mystery concealing a deeper one. The first answer is wrong or incomplete.

**NPC DENSITY** — How many named characters?
- `minimal` (3-4 NPCs) — Lean. Players remember everyone. Best for action sessions. (S04 target)
- `moderate` (5-7 NPCs) — Standard investigation. Each NPC has a clear role. (S01, S02)
- `dense` (8+ NPCs) — Ensemble cast. Only for sessions where the social web IS the mystery. (S03 — feedback was "too many characters")

**TONE** — What's the emotional register?
- `dread` — Something is wrong and getting worse. Slow build. The horror is in understanding. (S02)
- `uncanny` — Things that should be normal aren't. The wrongness is the tone. (S03)
- `action` — Fast, physical, momentum. Comedy from the situation. (S04)
- `melancholy` — Loss, letting go, things that can't be undone. (S03 climax)
- `comic` — The situation is absurd and everyone knows it. (Soul Fraud concept)

**MESA INVOLVEMENT** — How present is the rival organisation?
- `absent` — No MESA presence. Standalone case. (S01)
- `background` — Evidence of MESA found during investigation, no confrontation. (S02 main)
- `confrontation` — MESA field team present. Direct interaction with Rook. (S03)
- `aftermath` — MESA acted while the hunters were occupied. Consequences on return. (S04)

**SESSION LENGTH** — How much table time?
- `short` (2-3 hours) — One act structure. Hook → Investigation → Climax.
- `standard` (3-4 hours) — Three act structure. Most sessions.
- `long` (4-5 hours) — Four acts with breathing room. Only for complex sessions.

### Parameter Lessons from Play

- S03 was `medium action / branching mystery / dense NPCs / uncanny tone` — players found it too complex and wanted more action
- The sweet spot seems to be 4-5 NPCs maximum unless the NPC web is the puzzle
- Sessions that run over are usually because investigation has too many threads, not because combat takes too long
- Comedy and genuine emotion work best when they share scenes, not when they alternate
- The MESA aftermath pattern (consequences while you were away) creates urgency without adding NPCs to the active session
- **S03 actual play confirmed:** Players don't split up even when offered branching paths. Design for the group staying together.
- **S03 actual play confirmed:** Investigation without exit conditions expands to fill available time. The theatre exploration took 90 minutes because no discovery signalled "you now have enough."
- **S03 actual play confirmed:** Bold player moves (Alan shapeshifting into Sophie, Sven walking through walls) create the session's best moments. Leave room for improvisation. Don't over-script scenes.
- **S03 actual play confirmed:** The keeper also gets confused by high NPC density — "wait, that is Clara? No, that's Clara's protégé." If the keeper can't track the names, the players certainly can't.
- **S03 actual play confirmed:** Players want clearer guidance about available paths, not more open-ended freedom. Frame choices through the situation, not through keeper narration.
- **S03 actual play confirmed:** Scripted comedy moments (Outlaws line cards) were the session's best-paced section — tight, fun, everyone involved. More of these.
- **S03 actual play confirmed:** Nadia's blogpost (atmospheric, short, connected to the case without explaining it) landed perfectly. Atmospheric handouts work as mood-setters and implicit guidance simultaneously.
- Players will almost always stay together rather than split up. Design for this as the default.
- Scripted read-aloud moments where players perform lines (like the Outlaws scene) are high-engagement, low-prep, and give everyone something to do. Include at least one per session if the tone allows.
- Players want guidance — not railroading, but clear "here's what you know, here's what you could do next" beats from NPCs or CAMPBELL. Open sandboxes feel directionless.
- Every investigation scene needs an exit condition: a moment where the players know they've found the important thing and can move on. Without this, exploration expands to fill all available time.

---

## Step 3: Design the Session — Iterative Outline

Start with a **lean outline** (like the S04 draft). Do NOT write the full session HTML first. The outline should be 2-3 pages covering:

### Required Outline Sections

1. **Premise** (3-4 sentences) — What's happening, what's at stake, why now
2. **The Entity/Threat** — What it is, what it wants, how it's dangerous, what stops it
3. **NPCs** (name, role, one sentence each) — Count them. If there are more than the parameter allows, cut.
4. **Session Structure** — Scene-by-scene sequence with approximate timing
5. **The Mystery** — What the players don't know, what investigation reveals, what makes the answer click. For each clue source, define the **exit condition**: the specific moment where the players know they've found the important thing and are pointed toward the next step. Without exit conditions, investigation expands to fill all available time.
6. **Combat Mechanics** (if action level is medium or high) — Stat block, custom moves, encounter structure. If multiple encounters: first encounter teaches (the creature is too strong / something unexpected), investigation beat reveals the weakness, second encounter tests (real fight with tactical choices).
7. **Hunter Moments** — One specific seed per hunter. What this session gives each character.
8. **MESA/Arc Thread** — How the session connects to the larger campaign. What advances.
9. **Resolution Paths** — Best ending, partial ending, bad ending. What each means for the campaign.

### Outline Review Checklist

Before expanding to full session prep, verify:

- [ ] NPC count is within the density parameter
- [ ] Every NPC has a clear function (if you can't say what they DO in one sentence, cut them)
- [ ] The mystery has a "click moment" — a point where the pieces assemble
- [ ] If there's combat, the creature has a weakness the players must discover (not just damage it enough)
- [ ] Each hunter has at least one moment designed for them specifically
- [ ] The session has a tonal shift — it doesn't stay at one register the whole time
- [ ] The session can be summarised in one sentence (if it can't, it's too complex)
- [ ] Clock/urgency is present but NOT expressed using game-mechanic language in player-facing materials

**Get keeper approval on the outline before proceeding to Step 4.**

---

## Step 4: Write the Full Session Prep

Once the outline is approved, expand to the complete session HTML document.

### Document Structure

```
Title Block + Flavour Text
Premise & Scene Structure
Entity/Threat Backstory
The Artefact/Mechanism (if applicable)

SCENE-BY-SCENE:
  Hook (Lab Briefing)
  Cold Open (readaloud — sets the tone)
  Scene 1 (Investigation)
  Scene 2 (Development / First Encounter)
  Scene 3 (Escalation / Confrontation)
  Climax (Resolution)

KEEPER QUICK REFERENCE:
  Entity Stat Block
  Session Pacing (NOT "countdown clock" — avoid game-mechanic language)
  Clue Checklist
  Tone Reminders

APPENDIX (if needed):
  Extended NPC interactions
  MESA confrontation details
  Open Slots — Player-Defined Canon
```

### Writing Voice Rules

These are codified from four sessions of calibration:

**Register system:**
- **Fuller register (~68 words):** Significant emotional moments only
- **Default register (B-C range):** Most content — smart scientists writing for colleagues
- **Near-clinical (~45 words):** CAMPBELL voice, routine reporting, data-forward content

**Self-check on every paragraph:**
1. Does every sentence add new information?
2. Could a smart colleague infer this from context?
3. Is the emotion carried by word choice, not extra sentences?

**NPC boxes:**
- Read-aloud block: 4-6 sentences of first-impression description. Written to be read aloud at the table.
- Motivation line: one sentence, what they want
- Background: 2-3 sentences maximum
- One characteristic quote
- Keeper note (if needed): mechanical or narrative instruction

**Keeper notes vs. narrative text:**
- Keeper notes are instructions TO the keeper (how to run this, what to watch for)
- Narrative text is the world itself (what the hunters experience)
- Never mix them in the same paragraph

**Player-facing language rules (lessons from S03):**
- Never use game-mechanic terms in readalouds or handouts ("clock 3/4", "Route A", "the entity")
- NPCs don't know they're NPCs — their dialogue should sound like people, not quest-givers
- Clue labels in the session doc are for the keeper's reference, not read aloud
- "Countdown Clock" → "Session Pacing — What Happens When"
- "Route A / Route B" → just describe where things are findable

---

## Step 5: Author the Session Data (s0N.json)

Every session needs a complete `s0N.json` file. This is what drives the live feed tool.

### Required Handout Types

| Type | When to include | Minimum per session |
|------|----------------|-------------------|
| `readaloud` | Every scene transition, cold opens, climax | 3-5 per session |
| `pda` | CAMPBELL briefings, Director messages, mid-deployment directives | 2-3 per session |
| `document` | Physical evidence the hunters find. Link to dossier page if one exists | 1-3 per session |
| `image` | Scene-setting, locations, characters, artefacts | 5-8 per session |
| `classified` | Keeper-only reminders, plot flags, post-resolution CAMPBELL notes | 1-2 per session |
| `linecard` | When players read scripted lines (rare, scene-specific) | 0 unless scripted scene |
| `scan` | Rex's scanner readings. Include status pip (nominal/trace/alert/critical) | 0-10 depending on session |
| `tone` | One-line atmospheric fragments for the keeper to drop in | 5-12 per session |

### Handout Authoring Rules

- **Previously On recap** is ALWAYS the first handout entry. Threads from the previous session into this one.
- **Readalouds** in handouts duplicate the readaloud[] array entries — the array is the legacy format, handouts are what the feed renders
- **Document handouts** with dossier pages: keep the `body` field to a 2-3 sentence summary, add `"link": "handouts/dossier/s0N-slug.html"`
- **Scans** should include control readings (normal things that read zero) alongside significant readings. The contrast makes discoveries feel earned.
- **Tone cards** are short — one sentence, sometimes a fragment. They're not narration, they're texture. "The stage manager's clipboard lowers." "Fourteen minutes to curtain."
- **Classification lines** on documents should describe who found it and where, NOT game routes ("recovered by Reed Atwood", NOT "Route A")
- No game-mechanic language in any player-facing handout (no clocks, no routes, no "the entity")

### Stat Block Format (threats[])

```json
{
  "id": "creature-id",
  "name": "Display Name",
  "subtitle": "Type description — location/context",
  "type": "Monster: Beast / Dusk / etc.",
  "motivation": "One sentence — what it wants",
  "harm_capacity": 12,
  "armour": "2 (drops to 1 when weakness known)",
  "harm": "3-harm close (attack name). 2-harm ignore-armour (special attack).",
  "moves": [
    "Move Name — mechanical description",
    "Move Name — mechanical description"
  ],
  "notes": "Keeper guidance. Weakness. Resolution requirements."
}
```

---

## Step 6: Author Dossier Pages (if needed)

Dossier pages are standalone HTML documents for significant evidence the hunters recover. Not every session needs them — S01 had none, S03 had seven.

### When to create a dossier page:
- The evidence has depth that can't fit in a handout `body` field
- The document has a voice (notebooks, letters, annotated artefacts)
- Multiple clue spans exist within it that the keeper might want to reveal progressively
- It will be referenced across sessions (evidence board, thread tracker)

### Dossier page structure:
```
Classification line (who found it, where)
Title + subtitle
Provenance block (location, recovered by, condition)
Content sections (notebook entries, document fields, annotations)
Keeper notes per section
Clue spans (data-clue attributes on specific phrases)
Keeper toolbar (REVEAL CLUES button)
```

### Dossier page rules:
- Each page has its own CSS palette (set in :root variables)
- Use `dossier.css` + `dossier.js` as shared base
- `DOSSIER_ID` constant must be unique — used for D1 persistence
- Clue spans use `<span class="clue-hint" data-clue="slug">` — keeper-toggled, D1-persisted
- Keeper notes are visible only in keeper mode (5× click)
- No game-mechanic language (no "Route A", no "clock")
- No MESA references in player-visible text if players don't know the name yet

---

## Step 7: Produce the Ingestion Package

After the session prep is complete, produce a session ingestion package following the template in `context/session-ingestion-template.md`. This is what Claude Code uses to ingest all content into the site.

For pre-session (mission prep), include Sections B, C, D, J, K.
For post-session, include all applicable sections A through L.

---

## Anti-Patterns — Lessons from S01-S04

These are specific mistakes made and corrected. Check every session against this list.

### Structural Anti-Patterns
- **Too many NPCs.** If you have more than 7 named characters, the players will not remember them. Cut ruthlessly. Every NPC must justify their existence with a function no other NPC serves.
- **Branching routes presented as game mechanics.** "Route A / Route B / Route C" is keeper architecture, not player experience. Players should discover things by going places and talking to people, not by choosing labelled paths.
- **Clock mechanics in player-facing content.** "Clock 3/4" is Monster of the Week game terminology. Players experience urgency ("Saturday's performance is tomorrow"), not clock positions.
- **Investigation without a click moment.** If the clues don't assemble into a realisation, the investigation is just a fetch quest. Design the "oh shit" moment first, then work backward to the clues that produce it.

### Voice Anti-Patterns
- **CAMPBELL reports containing information CAMPBELL is supposed to be hiding.** If CAMPBELL is deliberately omitting the financial connection, don't put it in CAMPBELL's briefing. Put it in the Director's note as something Leech found independently. Consistency matters.
- **Readalouds that tell players how to feel.** "The room feels wrong" is fine. "You feel a deep sense of unease and foreboding" is not. Describe the stimulus, not the emotion.
- **NPC dialogue that sounds like a quest briefing.** "You should investigate the warehouse on the east side" is a quest marker. "I saw something by the containers — tall, red-haired — and nobody believes me" is a person.
- **Explaining the mechanism in the flavour text.** The flavour text at the top of the session is mood, not exposition. It should make the keeper feel something, not understand the plot.

### Pacing Anti-Patterns
- **Investigation with too many threads.** If players can't exhaust the investigation in 45-60 minutes, there's too much. Three clue sources maximum per scene. Each source gives one key piece.
- **Investigation without exit conditions.** Each clue source needs a clear "you now know X, which points you to Y" moment. Without that, players explore indefinitely because they don't know when they have "enough." S03's theatre investigation expanded to 90 minutes because nothing signalled completion.
- **Combat without preparation.** If the players fight the creature without having discovered its weakness, they will either win trivially (bad) or lose unfairly (worse). The first encounter should teach, the second should test.
- **No tonal shift.** A session that stays at one emotional register for three hours is exhausting. Build in at least one gear change — comedy before the climax, a quiet moment after the action, an absurd detail in a serious scene.
- **MESA confrontation as a separate act.** MESA works best as a complication within an existing scene, not as a standalone scene that pauses the story. Rook arriving during the investigation is better than Rook arriving in a dedicated MESA scene.
- **Assuming players will split up.** S03 was designed for the team to split between hospital and theatre. All four players went to the theatre together. Design for the group staying together as the default. Splitting is a bonus path, not the expected one.
- **Introducing too many names at once.** The casting chain (Clara→Miriam→Sophie, Edmund→Daniel→James) overwhelmed the players and the keeper simultaneously. Introduce one name at a time, through encounter, not through briefing. If you need a visual reference, post it to the feed — don't explain it verbally.

### Character Design Anti-Patterns
- **No deliberate Reed scene.** Every session MUST have at least one moment where Reed's human skills (empathy, attention, protection) are the right tool. If the scene is supernatural investigation, give Reed the person who needs talking to. S03's dressing room scene left Reed's player saying "I feel useless."
- **Rex also needs non-supernatural levers.** Rex is the Action Scientist — gadgets and analysis, not perception. If a scene is pure supernatural investigation, design at least one thing Rex can find through direct action (interviewing someone, examining a device, running a scan). In S03 Rex pivoted to interviewing James because he had nothing else to do — that worked, but it was improvised, not designed.
- **Fey breadcrumbs that are confusing rather than intriguing.** A single clear fey moment ("Alan notices something definite") is better than scattered ambiguous hints. The keeper said "I tried to make it confusing because fey — but it was just frustrating confusing."
- **NPCs who exist for worldbuilding, not function.** If you can't say what an NPC DOES for the players in one sentence, they don't need to be named. Constance (method actor with diary) was texture but players didn't engage with the comedy. Texture NPCs should be described, not named, unless the players ask.

### Player Agency Anti-Patterns
- **Not rewarding bold moves.** When a player commits to something dramatic (Alan shapeshifting into Sophie in S03, Sven walking through walls), that move should drive the scene — not be absorbed into the existing plan. Alan's shapeshifting became the session's most memorable moment because the keeper leaned into it. Design space for these moves. Leave scenes with enough flexibility that a bold player choice can redirect them.
- **Not signalling available paths.** "You can investigate three things" is a game menu. But saying nothing and expecting players to figure out the paths from context doesn't work either. The keeper's own insight: "in my head the open paths were more clear." The fix: frame choices through NPCs and situation, not through keeper narration. "Petra says the director is out until lunch, the hospital visiting hours end at 4, and there are police still at the loading bay" gives three paths without labelling them.
- **Overbuilding investigation, underbuilding resolution.** S03 spent 90 minutes investigating the theatre and 0 minutes on the climax. The investigation had no "you now have enough" signal. Budget investigation time ruthlessly — if it takes more than 60 minutes, cut clue sources. The resolution should get at least as much time as the investigation.

---

## Quick Reference — Session Deliverables Checklist

For every session, you need:

- [ ] Session outline (approved by keeper before expanding)
- [ ] Session HTML (`missions/0N-title.html`)
- [ ] Session data JSON (`data/sessions/s0N.json`) with all handout types
- [ ] Entity stat block (in the JSON threats[])
- [ ] Custom moves (if any)
- [ ] Dossier pages (if evidence warrants them)
- [ ] Image prompts (`S0N-prompts.py`)
- [ ] Report schema entry (Section K of ingestion package)
- [ ] Previously On recap (first handout entry)
- [ ] Ingestion package (for Claude Code)

### What NOT to include:
- Game-mechanic language in player-facing materials
- NPC names the players will never use
- Branching route labels
- Clock position indicators
- MESA references before players learn the name
