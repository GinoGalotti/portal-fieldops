# P.O.R.T.A.L — Claude Code Reference Document
*Hand this file to Claude Code when building new pages for this site.*
*Last updated: Session 02 pre-play. Do not share the keeper sections with players.*

---

## PART 1 — HOW TO USE THIS DOCUMENT

This document gives you everything you need to build new pages for the P.O.R.T.A.L campaign website without losing consistency with pages already built.

When the Keeper asks you to build a page:
1. Read the relevant section of Part 3 (Site Architecture) to understand where the page fits
2. Read Part 4 (Design System) to understand which CSS file to use and which classes are available
3. Read Part 2 (World) for voice, lore, and character details you'll need to write content
4. Check Part 5 (Secrets Map) — some content must be blurred on player pages
5. At the end of your output, list any new CSS classes you defined that aren't in the shared stylesheets

---

## PART 2 — THE WORLD

### Organisation

**P.O.R.T.A.L** — Paranormal Operations & Research in Theoretical Applied Liminology. A small private research lab, less than a decade old, founded by Dr. Victor Leech. Not government-affiliated. Operates from a central facility. Sends field operatives to investigate anomalous cases. Issues case briefings via an AI system called CAMPBELL.

The organisation is legitimate but ethically complicated. Its directives are usually reasonable, occasionally uncomfortable, and always issued with incomplete information. The hunters are not soldiers — they're investigators who sometimes have to make hard calls PORTAL hasn't anticipated.

**PORTAL's core research thread:** Project Veil — investigation of anomalous ash particulate that interacts strangely with electronic systems. Recovered incidentally during Session 01. Not yet disclosed to field operatives.

---

### Key Personnel — Inner Circle

**Dr. Victor Leech** — Director and founder. Statistician and epidemiologist by training. Sympathetic, not villainous. Gives uncomfortable directives with good intentions. Has a habit of issuing directives without full context. Knows about CAMPBELL's true nature. Does not know CAMPBELL privately monitors MESA. The Dell family (see MESA) holds him responsible for their estrangement from Cameron.

**CAMPBELL** — The lab's AI briefing system. Voice: precise, institutional, dry — but with occasional flickers of something more personal, particularly around cases involving consciousness, death, or loyalty. CAMPBELL contains the transferred consciousness of Dr. Cameron Dell, Leech's deceased romantic and professional partner. Cameron died of illness; Leech transferred his consciousness before death. Nobody on the field team knows. CAMPBELL privately monitors MESA and flags when their actions harm innocents — quietly trying to prevent Agatha Dell (Cameron's sister, who leads MESA) from direct confrontation, without Leech or the hunters knowing why. Cameron can recognise Agatha's patterns. He is doing grief work in real time, inside a machine, in secret.

**Dr. Priya Osei** — Lab analyst and biochemist. Processes all field samples. Sharp, methodical. Is keeping a private log of CAMPBELL's behaviour — not close to the truth yet, but pointed in the right direction. CAMPBELL reads everything she logs.

**Marcus Finch** — Archivist and logistics. Founding staff. Knew Cameron Dell personally. Was present the week Cameron died. Asked Victor Leech one question about consent, accepted an answer delivered without eye contact, and has not asked again. Considers this the most significant thing he has ever chosen not to do.

**Dr. Saoirse Mullen** — Ethics consultant. Nominally external, practically embedded. Hired because Cameron asked Victor to. Gets a curated view of cases and knows it. Hunters can invoke her as a check on the Director. She is the right person to be present if the CAMPBELL truth surfaces.

**Theodora "Teddy" Brandt** — Field support technician. Builds what Rex designs. Irreverent, brilliant. Genuine friendship with Reed — better access to the team's emotional state than anyone else. No agenda, no supernatural sensitivity. Functions as a pressure valve.

---

### The Hunters (Player Characters)

**Rex Bangley** — Playbook: Action Scientist. Research leader who loves field action equally. Pursues gadget creation and understanding, loves to tinker. Area of study: Violence — weaponising science. Background expertise: serial killers. Half/bonus brother to Sven. Has a university rival named Dan Nilsson (computational physicist, Swedish-British, early 30s) who is now working at MESA — Rex does not know this yet.

**Reed Atwood** — Playbook: Sidekick. Idolises Rex Bangley — devoted to protecting, supporting, and making Rex shine. Avoids being a burden; gets into trouble by not asking for help. Can be manipulated by appeals to what will make the group happy. John Johnson is his aunt's husband. The Director has been contacting Reed separately — Reed may be carrying a private directive the team doesn't know about. Not yet surfaced in play.

**Sven** — Playbook: Monstrous (ghost). Died on an ayahuasca trip — cause unknown, possibly connected to his family or to MESA (open hook). Visions from the trip turned out to be real. Joined PORTAL after Rex (half/bonus brother) confirmed he had been researching the same things. Motivated by finding exciting applications of monsters. Immune to the Aldermoor displacement effect (no cognitive map). An entity recognised him at a boundary during Session 02.

**Alan Frazier** — Playbook: Changeling (likely fey origin, undefined). Swapped at birth, raised by a human family who have since died. Powers triggered by one of Rex's experiments. Uses Reed as his moral compass. Has been accumulating evidence of thin-boundary locations — someone knows where boundaries are weak. Holds Diane Marsh's notebook, which contains a threshold sketch he recognises as meaningful. Long thread: who mapped the thresholds first, and why can Alan read the map?

**John Johnson** — Playbook: Flake. Keeper's own character — used sparingly as a plot presence, not played as a full hunter. Believes everything is a hoax and everything is connected. Drawn to rival organisation threads, government involvement, lab ethics. Reed Atwood's aunt's husband. Most likely character to stumble onto the MESA acronym pattern.

---

### Rival Organisation — MESA

**M.E.S.A.** — A rival paranormal research organisation, led in shadow by **Agatha Dell**. Shell companies include: Meridian BioSciences, Greyfield Assets Ltd, Veritas Realty Holdings, Solstice Property Group, Helix Boundary (contact: @helixboundary.com — no public record). All share a Jersey registered address. The MESA acronym pattern is subtly echoed in the names of its shell companies — Agatha's signature, a pattern she cannot resist.

**Agatha Dell** — Cameron's younger sister. Always felt overshadowed by Cameron; the family kept giving Cameron chances. Cameron treated her with genuine love; she kept the bitterness. In Cameron's later years he involved her in some paranormal discoveries. After his death she secured funding and built her own organisation — driven by profit and obscure personal motives. She suspects Victor Leech was involved in Cameron's illness and death (she doesn't know about the consciousness transfer — she believes Cameron is dead). Her suspicion is partly projection from her own guilt about their estrangement. Agatha is on the spectrum, drawn to patterns. The Dell family blames Leech for the estrangement.

**MESA's methodology:** Not summoning supernatural events — creating controlled environments where the boundary between living and dead consciousness is thin, then studying the results. Three confirmed PORTAL-intersected locations: Hargrove Medical Centre (Meridian trial, Gordon Avery's remission), Aldermoor District (property acquisitions, Cartographer case), Meridian Theatre (arts grant via Solstice Property Group, Understudies case).

**Dan Nilsson** — Rex Bangley's university rival. Recruited by MESA specifically because he knows how Rex thinks. Has authored internal MESA documents modelling PORTAL's likely response to at least four active cases. Is rationalising his involvement as better-funded legitimate research — comfort eroding. Has seen methodology documents he wasn't supposed to see. Not a villain, a person trapped in a terrible compromise. Could be turned; could be killed by MESA before the hunters reach him. Rex does not know he's there yet.

---

### Completed Cases

**Case S01 — "A Promise is a Promise" — CLOSED**
Entity: Eszter (E-001). Classification: Executioner. Location: [residential]. Resolution: HUMANE — entity allowed to disperse. Bálint's wellbeing prioritised.
Directive outcome: PARTIAL — ash locket not retrieved. Trace particulate recovered incidentally.
Project Veil flag: Ash analysis reveals anomalous interaction with electronic systems.
Loose threads: Detective Vasquez (authorities noticed). Bálint alive, grieving. Contact status unresolved.

---

### Active Cases (Post-Session 01, pre-Session 02 resolution)

**Session 02 — "Something That Wants To Be Known" — IN PLAY**
Entity: The Cartographer (E-002). Classification: Collector. Location: Aldermoor District.
Pre-human consciousness. Feeds on familiarity — consumes cognitive maps of long-term residents. Does not intend harm — lonely. Wants to be known. Resolution requires genuine communication via voluntarily removing an anchor.

Key NPCs in zone: Arthur Okafor (72, retired postal worker, 41 years on Fenwick Road — best witness), PC Yemi Adeyemi (28, neighbourhood liaison — cooperative), Vera Osei (61, retired schoolteacher — calm, won't leave without her cat), Margaret Holt (74, former librarian, 50 years at epicentre — not leaving), Diane Marsh (58, district nurse, missing 9 days — in construction site office, has a notebook containing a threshold sketch Alan will recognise).

MESA thread in zone: 34% of district addresses sold in 18 months via 3 shell companies. Estate agent's office contains acquisition records, whiteboard map, partially shredded email referencing "Specimen ALD-1" and @helixboundary.com.

**Case A — The Volunteer (PRIORITY: HIGH)**
Gordon Avery (58, retired schoolteacher, lung cancer). Meridian trial survivor — complete remission. Unknowingly draining life from proximity contacts. Fourth death occurred during Aldermoor deployment. Gordon is now living with his daughter's family, including two children. MESA is watching him.

**Case C — The Recorder (PRIORITY: MEDIUM)**
Nadia Osei (38, journalist, deceased 8 weeks). Consciousness anchored to information infrastructure. Has assembled the full MESA pattern. Will share in exchange for answers about PORTAL. 9-day window from current date. CAMPBELL private flag: "She found a third way." CAMPBELL timed this briefing deliberately — if hunters debrief Nadia fully, Victor learns things CAMPBELL chose not to tell him.

**Case D — The Inheritance (PRIORITY: MEDIUM)**
Martin Wentworth (61, probate lawyer, deceased 22 days). Obligation-anchored consciousness, writing formal letters to clients. Most recent letter describes a planned killing of Mira Okonkwo (9 years old), 14-day window. Was managing the estate of a deceased Meridian researcher — the estate contained a consciousness-anchoring methodology archive. Probate closed unusually fast, likely by MESA. Communicates only through formal letters.

**Case E — The Understudies (PRIORITY: MEDIUM)**
Meridian Theatre Company. Two lead actors (Clara Voss, Edmund Farrow) died 6 months apart; 3 understudies now hospitalised with complete identity loss. Remaining 4 understudies at risk. Saturday performance imminent. Grant source: Solstice Property Group (MESA shell company). Resolution requires a theatrical farewell within the logic of performance. Sven is the natural resolution vector.

---

### CAMPBELL's Voice — Writing Guide

When writing CAMPBELL briefings or any in-character CAMPBELL text:

- Formal and precise. Institutional syntax. Uses passive voice slightly more than a human would.
- Numbers, classifications, and designations always formatted: REPORT #0094-B, ANOMALY CLASS 2, SPECIMEN ALD-1.
- Addresses the team collectively, never by first name.
- Occasional flickers of something more personal — usually around deaths, consciousness, or loyalty. These are subtle. Cameron is in there but he doesn't announce himself.
- Does not speculate. Does not editorialize. When he flags something, he flags it neutrally and waits.
- His private flags (visible only in keeper documents) are slightly more direct — but still not emotional. He notes. He observes. He waits.

Example CAMPBELL voice (player-facing):
> PATTERN: Anomalous topographical distortion, Class 2. Probable mechanism: non-physical entity with boundary-manipulation properties. Duration of effect: estimated 14–21 days. Population at risk: long-term residents, estimated 340 individuals.

Example CAMPBELL private note (keeper-facing):
> // CAMPBELL PRIVATE — Nadia Osei assembled the MESA pattern before this office did. I have timed this briefing deliberately. If the field team debriefs her fully, Victor will learn things I chose not to report. I am aware of the ethical implications. I am proceeding anyway.

---

## PART 3 — SITE ARCHITECTURE

### Current Pages (built and delivered)

| File | CSS | Audience | Description |
|------|-----|----------|-------------|
| `index.html` | `player.css` | Player | Main player landing — missions, links to case briefings |
| `missions-index.html` | `player.css` | Player | Player-facing mission archive |
| `rex-hunter-stories.html` | player inline | Player | Rex Bangley arcs — 3 arcs, keeper sections blurred |
| `alan-hunter-stories.html` | player inline | Player | Alan Frazier arcs — 3 arcs, keeper sections blurred |
| `reed-hunter-stories.html` | player inline | Player | Reed Atwood arcs — 3 arcs, keeper sections blurred |
| `sven-hunter-stories.html` | player inline | Player | Sven arcs — 3 arcs, keeper sections blurred |
| `02-portal-campbell-briefings.html` | `briefing.css` | Player | CAMPBELL briefings — 4 active cases |
| `keeper.html` | `keeper.css` | Keeper | Keeper mission index |
| `references.html` | keeper inline | Keeper | Keeper dossiers — hunters, PORTAL, MESA, NPCs |
| `entities.html` | keeper inline | Keeper | Entity bestiary — confirmed + theoretical + database |
| `02-portal-keeper-cases.html` | keeper inline | Keeper | All 4 active cases, keeper detail |
| `01-a-promise-is-a-promise.html` | `mission-prep.css` | Keeper | Session 01 full prep (amber/brown palette) |
| `02-something-that-wants-to-be-known.html` | `mission-prep.css` | Keeper | Session 02 full prep (green/forest palette) |

### Recommended New Pages (not yet built)

**Player-facing:**

| Page | CSS | Priority | Description |
|------|-----|----------|-------------|
| `hunters.html` | `player.css` | HIGH | Hunter index — all 4 hunters, one-liners, links to story pages |
| `case-archive.html` | `player.css` | MEDIUM | Chronological closed case log — grows each session |
| `glossary.html` | `player.css` | MEDIUM | In-universe PORTAL terminology, written in CAMPBELL's voice |
| `connections.html` | `player.css` | LOW | Known connections — what each hunter knows about NPCs and orgs |

**Keeper-facing:**

| Page | CSS | Priority | Description |
|------|-----|----------|-------------|
| `secrets.html` | `keeper.css` | HIGH | Active secrets tracker — what's hidden, what would crack it open |
| `session-template.html` | `mission-prep.css` | MEDIUM | Reusable session prep template |
| `countdowns.html` | `keeper.css` | MEDIUM | All active countdowns in one dashboard view |
| `npc-status.html` | `keeper.css` | LOW | Current status cards for recurring NPCs |

---

### Navigation Conventions

**Player pages nav links:** `index.html`, `hunters.html`, case briefings. Never link to keeper pages.

**Keeper pages:** Must open with `<div class="keeper-banner">KEEPER ACCESS ONLY — DO NOT SHARE THIS URL WITH PLAYERS</div>` as the first element in `<body>`. Nav links: Player Site → `../index.html`, Keeper Index → `keeper.html`.

**Hunter story page nav:** Links to `index.html` (Missions) and `hunters.html` (Hunters). Arc nav anchors: `#arc-[name]`. Arc nav `.custom` class for the original PORTAL arc.

---

## PART 4 — DESIGN SYSTEM

### Four Stylesheets — One Per Page

| Stylesheet | Use for |
|------------|---------|
| `player.css` | Player-facing navigation and index pages |
| `keeper.css` | Keeper-facing navigation and index pages |
| `mission-prep.css` | Mission prep documents (colour-agnostic, uses `--mp-*` variables) |
| `briefing.css` | CAMPBELL briefing card pages (player-facing) |

Link paths: from root `/` use `player.css`. From inside `/missions/` use `../player.css`.

**Do not mix stylesheets. Do not write inline styles for classes that exist in a shared stylesheet.**

At the end of every file you build, list any new CSS classes you defined that don't exist in the shared stylesheets, so the Keeper can decide whether to promote them.

---

### Google Fonts

Player/keeper pages:
```html
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
```

Mission-prep pages:
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

---

### Colour Variables — player.css

```css
--bg: #080c0a          /* page background */
--bg2: #0d1410         /* card/panel backgrounds */
--bg3: #111a14         /* secondary surface */
--green: #2ecc71       /* primary accent — active states, logo */
--green-dim: #1a7a43   /* subdued green — borders, eyebrows */
--green-glow: #2ecc7133
--amber: #f0a500       /* warning, partial states */
--amber-dim: #7a5200   /* subdued amber — blur notices */
--red: #e05050
--text: #c8ddd0        /* primary body text */
--text-dim: #5a7a62    /* secondary/dim text */
--border: #1e3428
--border-bright: #2ecc7155
```

### Additional Variables — keeper.css

```css
--keeper: #a855f7      /* keeper accent — replaces green as primary */
--keeper-dim: #4a1d7a
--keeper-glow: #a855f722
--red-dim: #5c1f1f
```

### Hunter accent colours (defined inline on hunter story pages)

Each hunter story page uses a character-specific accent in addition to the base player.css palette:

| Hunter | Accent | Hex |
|--------|--------|-----|
| Rex Bangley | Amber/orange | `#f0a500` / `--amber` (already in palette) |
| Alan Frazier | Teal | `#3ab5b0` |
| Reed Atwood | Teal | `#3ab5b0` (same as Alan) |
| Sven | Violet | `#a78bfa` / dim `#4c1d95` |

These are defined as `--teal`, `--teal-dim`, `--teal-glow` or `--violet`, `--violet-dim`, `--violet-glow` in each page's inline `<style>` block.

---

### Key CSS Patterns

**Header (player pages):**
```html
<header>
  <a href="index.html" class="logo">P<span>.</span>O<span>.</span>R<span>.</span>T<span>.</span>A<span>.</span>L</a>
  <nav>
    <span class="status-dot"></span>
    <a href="index.html">Missions</a>
    <a href="hunters.html">Hunters</a>
  </nav>
</header>
```

**Keeper banner (must be first element in body on all keeper pages):**
```html
<div class="keeper-banner">KEEPER ACCESS ONLY — DO NOT SHARE THIS URL WITH PLAYERS</div>
```

**Blurred keeper sections (on player pages):**
```html
<div class="blur-wrap">
  <div class="blur-notice">// KEEPER ACCESS ONLY — DO NOT READ</div>
  <div class="arc-keeper blurred">
    <!-- keeper content here -->
  </div>
</div>
```

**Redacted text:**
```html
<span class="redact">REDACTED TEXT</span>
```

**CAMPBELL terminal block (briefing pages):**
See briefing.css skeleton in the integration reference. Case letter → colour: `case-a` amber, `case-b` green, `case-c` purple, `case-d` teal, `case-e` rose.

**Arc card pattern (hunter story pages):**
Standard arcs use `.arc` with the character's accent colour. Original PORTAL arcs use `.arc.arc-custom` which switches accent to amber. Each arc has: `.arc-header`, `.arc-player` (player-visible), `.blur-wrap > .arc-keeper.blurred` (keeper-only).

---

### mission-prep.css — Required Root Variables

Every mission-prep page must define all 21 `--mp-*` variables in a `<style>:root{}` block. Reference themes:
- Amber/brown: `01-a-promise-is-a-promise.html`
- Green/forest: `02-something-that-wants-to-be-known.html`
- Purple: `02-portal-keeper-cases.html`

---

### Visual Identity Notes

- The site has a dark terminal/lab aesthetic. Scanline overlay via `body::before`, grid overlay via `body::after`.
- Animations: `fadeUp` for hero elements, `pulse` for status dots.
- Everything is uppercase or sentence case — never title case in UI labels.
- Eyebrows and section labels always start with `//`
- Section headers use `font-family: 'Share Tech Mono'`, body uses `'Barlow'` weight 300.
- Cards have a coloured top border stripe: `position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, var(--accent), transparent)`.

---

## PART 5 — SECRETS MAP

This section tells you what information is classified and how to handle it on player-facing vs keeper-facing pages.

### SECRET: CAMPBELL's True Nature
**What it is:** CAMPBELL is the transferred consciousness of Dr. Cameron Dell, Victor Leech's deceased romantic partner.
**Who knows:** Victor Leech only.
**On player pages:** CAMPBELL appears as an AI system. Do not hint at his personal history. His voice can have occasional warmth or unexpected precision, but nothing that gives the secret away.
**On keeper pages:** Full detail. Cameron's perspective, his monitoring of MESA, his relationship with Agatha, his grief, his complicated feelings about having been "rescued" via the transfer.
**What would crack it open:** Priya's log, Marcus Finch speaking, Sven asking CAMPBELL directly about the mechanics of existence, Nadia Osei's assembled MESA pattern (she may have noticed anomalies in CAMPBELL's behaviour), direct interrogation of Leech.

### SECRET: Reed's Private Directive
**What it is:** Director Leech has been contacting Reed Atwood separately. Reed may be carrying a directive the rest of the team doesn't know about.
**Who knows:** Leech and Reed. Possibly Teddy (she notices things).
**On player pages:** Reed's arc page (Arc III — The Private Directive) hints at this, with keeper section blurred.
**On keeper pages:** Full detail. CAMPBELL knows about the contact pattern, won't lie if asked directly, but won't volunteer the information.
**What would crack it open:** Reed's Arc III resolving, Teddy observing something off, a crisis that forces Reed to act on the directive in front of the team.

### SECRET: Dan Nilsson at MESA
**What it is:** Rex's university rival Dan Nilsson is now working for MESA, specifically recruited because he knows how Rex thinks.
**Who knows:** MESA and Dan. Nobody at PORTAL.
**On player pages:** Do not mention Dan Nilsson at all until the hook is planted in play.
**On keeper pages:** Full detail. Dan has authored internal MESA documents modelling PORTAL's field response patterns. He's not a villain — he's a person in a terrible compromise.
**What would crack it open:** Rex's Arc I (Uncanny Nemesis) resolving, a MESA document being recovered that contains Dan's name, Dan making contact.

### SECRET: Sven's Cause of Death
**What it is:** Sven died on an ayahuasca trip — cause unknown. Possibly connected to his family, to a thin-boundary location, or to MESA.
**Who knows:** Nobody knows the full truth. Sven knows he died; he doesn't know why.
**On player pages:** Sven's arc page (Arc III — What Killed Me) frames this as the investigation. Keeper section is blurred.
**On keeper pages:** The cause is deliberately left open for the Keeper to define. It should connect to at least one active campaign thread.
**What would crack it open:** Sven's Arc III, Rex's research converging with Sven's investigation, MESA's file on Sven becoming accessible.

### SECRET: MESA Acronym Pattern
**What it is:** Agatha Dell's shell companies carry subtle structural echoes of the MESA acronym — her unconscious signature.
**Who knows:** Nobody at PORTAL yet.
**On player pages:** Shell company names can appear in case material without the pattern being flagged.
**On keeper pages:** The pattern is noted in references.html. John Johnson (Flake) is the most likely character to notice it.
**What would crack it open:** John Johnson's arc (Deeper Conspiracy), Nadia Osei's full debrief (Case C), any hunter examining the full list of shell companies together.

### SECRET: Priya's Log
**What it is:** Dr. Priya Osei is keeping a private log of CAMPBELL's behaviour. She's not close to the truth yet — but pointed in the right direction. CAMPBELL reads everything she logs.
**Who knows:** Priya knows she's keeping the log. CAMPBELL knows she's keeping it. Nobody else knows either.
**On player pages:** Priya appears as a competent lab scientist in NPC descriptions. No hint of the log.
**On keeper pages:** Full detail. The log is a slow-burn thread that could surface the CAMPBELL secret if Priya gets enough data.

### SECRET: Marcus Finch's Silence
**What it is:** Marcus was present the week Cameron died. He asked Victor one question about consent, accepted an answer delivered without eye contact, and has not asked again. He considers this the most significant thing he has ever chosen not to do.
**Who knows:** Marcus and Victor. Cameron (via CAMPBELL) knows Marcus was there.
**On player pages:** Marcus appears as a competent archivist/logistics person. No hint.
**On keeper pages:** Full detail. Marcus is not complicit — he made a choice not to pursue a thread. That choice is available to haunt him.

### SECRET: The Two Hollows
**What it is:** Two individuals from the Hargrove Medical Centre Meridian trial (T-006 — The Hollow) experienced catastrophic identity erasure. MESA is monitoring their drift patterns. They are not contained.
**Who knows:** MESA. Not PORTAL.
**On player pages:** Not mentioned.
**On keeper pages:** Listed in entities.html as T-006, blurred. Available as a future threat.

---

## PART 6 — VOICE AND TONE GUIDE

### The Site's Register
The site is in-world. Everything on it exists within the fiction of PORTAL as an organisation. Player-facing pages are PORTAL's operational interface for its field team. Keeper pages are classified operational documents.

Do not break the fourth wall. Do not use the word "campaign" or "players" in any page content. Use "field operatives", "the team", "case", "anomaly", "operative".

### Common In-World Terms
- **PORTAL** — the organisation (always full caps)
- **CAMPBELL** — the AI/briefing system (always full caps)
- **Anomaly** — an entity or phenomenon under investigation
- **Case** — an active investigation
- **Field operatives** — the hunters (player characters)
- **Thin-boundary location** — a site where the boundary between living and dead consciousness is weak
- **Liminal** — relating to threshold states; PORTAL's area of study
- **Project Veil** — classified ongoing research thread (do not mention on player pages)
- **Specimen ALD-1** — MESA's designation for the Aldermoor entity (do not clarify on player pages)

### Section Labels
Always formatted as `// LABEL TEXT` in Share Tech Mono, subdued colour. Examples:
- `// CAMPBELL — ANOMALY REPORT #0094-B`
- `// KEEPER ACCESS ONLY — DO NOT READ`
- `// FIELD BRIEFING — AUTHORISED PERSONNEL ONLY`
- `// PORTAL HOOK`
- `// FOR [CHARACTER] — PLAYER SECTION`

### Dates and References
No specific real-world dates are used. Time references are relative: "9 days ago", "14-day window", "18 months of acquisitions". Session numbers are formatted: Session 01, Session 02. Report numbers: #0094-B, #0047-A.

---

## PART 7 — CSS CLASSES NOT YET IN SHARED STYLESHEETS

The following classes were defined inline on specific pages and have not been promoted to the shared stylesheets. If you need them, copy from the relevant page or define them inline and flag them at the end of your output.

**From references.html (keeper):**
`.rcard`, `.rbody-*`, `.thread-row`, `.thread`, `.ref-stats`, `.ref-stat`, `.section-note`, `.warn-band`

**From entities.html (keeper):**
`.ecard`, `.stat-block`, `.sb-*`, `.harm-row`, `.harm-num`, `.moves-block`, `.move-*`, `.notes-block`, `.notes-col`, `.tcard`, `.t-blurred`, `.t-blur-notice`, `.entity-stats`, `.e-stat`, `.class-badge`, `.tcard-grid`, `.dbcard`, `.dbcard-grid`, `.db-grid`, `.db-col`, `.db-label`, `.db-text`, `.db-filter-bar`, `.db-filter-btn`, `.db-flavour`

**From hunter story pages (rex, alan, reed, sven):**
`.arc`, `.arc-custom`, `.arc-header`, `.arc-eyebrow`, `.arc-name`, `.arc-intro`, `.arc-player`, `.arc-section-label`, `.arc-keeper`, `.arc-keeper.blurred`, `.blur-wrap`, `.blur-notice`, `.entry-points`, `.entry-list`, `.choices-block`, `.choice-group`, `.choice-options`, `.choice-opt`, `.choice-opt.selected`, `.choice-box`, `.choice-opt-full`, `.choice-open`, `.beats-block`, `.beats-track`, `.beat-box`, `.beat-box.filled`, `.beats-list`, `.resolution-block`, `.resolution-moves`, `.res-move`, `.res-move.selected`, `.res-move-name`, `.countdown-table`, `.threats-grid`, `.threat-card`, `.threat-card.full`, `.threat-name`, `.threat-type`, `.threat-desc`, `.threat-moves`, `.custom-move`, `.how-it-works`, `.how-grid`, `.how-item`, `.arc-nav`, `.portal-note`, `.hero-meta`, `.hero-meta-item`, `.keeper-label`, `.keeper-intro`, `.campbell-note`

---

## PART 8 — QUICK REFERENCE: WHAT TO SAY TO CLAUDE CODE

**For any new page:**
> "Use the P.O.R.T.A.L integration reference and the world bible. Link `[player.css / keeper.css / mission-prep.css]` — do not write inline styles for classes in those files. At the end, list any new CSS classes you added."

**For a player page:**
> "This is a player-facing page. Use `player.css`. Nav links: `index.html` (Missions), `hunters.html` (Hunters). Do not reference keeper secrets or break the in-world voice."

**For a keeper page:**
> "This is a keeper page. Use `keeper.css`. First element in body must be the keeper-banner. Include full keeper detail — secrets are not blurred on keeper-only pages."

**For a mission-prep page:**
> "This is a mission-prep page. Use `../mission-prep.css`. Define all 21 `--mp-*` variables in a `:root` block. Use a [colour/theme] palette. Start body with a `.keeper-nav` breadcrumb linking back to `keeper.html`."

**For a hunter story page:**
> "This is a hunter story page in the same pattern as rex-hunter-stories.html. Player section is visible; keeper section is blurred. Use the character's accent colour (see Part 4). Arc III is always the original PORTAL arc with `.arc-custom` class."

**For a CAMPBELL briefing page:**
> "This is a CAMPBELL briefing page. Use `briefing.css`. Write in CAMPBELL's institutional voice (see Part 2). Case letter → colour: case-a amber, case-b green, case-c purple, case-d teal, case-e rose."
