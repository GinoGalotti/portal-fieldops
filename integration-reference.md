# P.O.R.T.A.L — Integration Reference
*For AI assistants generating new HTML pages for this site.*

---

## 1. Centralised CSS Files

There are five stylesheets. Every page uses exactly **one** of them.

| File | Purpose | Link path from `/missions/` | Link path from `/hunters/` | Link path from root `/` |
|---|---|---|---|---|
| `player.css` | Player-facing nav pages | `../player.css` | — | `player.css` |
| `keeper.css` | Keeper-facing nav/index pages | `../keeper.css` | — | `keeper.css` |
| `mission-prep.css` | Mission prep documents (keeper) | `../mission-prep.css` | — | `mission-prep.css` |
| `briefing.css` | CAMPBELL briefing card pages (player) | `../briefing.css` | — | `briefing.css` |
| `hunters/hunter.css` | Hunter story arc pages (player) | — | `hunter.css` | `hunters/hunter.css` |

**Important:** Both `mission-prep.css` and `hunters/hunter.css` are colour-agnostic — they use CSS variables that each page defines in its own `<style>:root {}` block. See §3 for the variable sets.

Reference theme implementations:
- **Amber/brown:** `01-a-promise-is-a-promise.html`
- **Green/forest:** `02-something-that-wants-to-be-known.html`
- **Purple:** `02-portal-keeper-cases.html`

---

## 2. Google Fonts

**For `player.css` and `keeper.css` pages:**
```html
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
```

**For `mission-prep.css` pages:**
```html
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

---

## 3. Colour Variables

### `player.css`

| Variable | Value | Intended use |
|---|---|---|
| `--bg` | `#080c0a` | Page background |
| `--bg2` | `#0d1410` | Card / panel backgrounds |
| `--bg3` | `#111a14` | Secondary surface |
| `--green` | `#2ecc71` | Primary accent — active states, logo, headings |
| `--green-dim` | `#1a7a43` | Subdued green — borders, eyebrows, section tags |
| `--green-glow` | `#2ecc7133` | Glow shadows, radial overlays |
| `--amber` | `#f0a500` | Warning, partial states |
| `--amber-dim` | `#7a5200` | Subdued amber — blur notices |
| `--red` | `#e05050` | Error, bad states |
| `--text` | `#c8ddd0` | Primary body text |
| `--text-dim` | `#5a7a62` | Secondary / dim text, nav links |
| `--border` | `#1e3428` | Subtle structural borders |
| `--border-bright` | `#2ecc7155` | Visible borders, section dividers |

### `keeper.css` (all of the above, plus:)

| Variable | Value | Intended use |
|---|---|---|
| `--bg3` | `#0a0f0d` | Slightly different dark surface |
| `--red-dim` | `#5c1f1f` | Subdued red |
| `--keeper` | `#a855f7` | Keeper accent — replaces green as primary |
| `--keeper-dim` | `#4a1d7a` | Subdued keeper purple |
| `--keeper-glow` | `#a855f722` | Keeper glow shadows |

### `hunters/hunter.css` — required `:root` variables (per page)

All base site colours are built in. Only override the 7 accent variables to give a character their own colour identity. Alan Frazier's teal is the default (no override needed).

| Variable | Role | Alan (default) | Reed | Rex | Sven |
|---|---|---|---|---|---|
| `--accent` | Borders, fills, active states | `#2ec4b6` | `#3ab5b0` | `#2ecc71` | `#9b59b6` |
| `--accent-dim` | Eyebrows, labels, dim borders | `#1a6e68` | `#1a5a58` | `#1a7a43` | `#6c3483` |
| `--accent-glow` | Text-shadow, box-shadow | `#2ec4b633` | `#3ab5b022` | `#2ecc7133` | `#9b59b633` |
| `--accent-a03` | Faint tinted backgrounds | `rgba(46,196,182,0.03)` | `rgba(58,181,176,0.03)` | `rgba(46,204,113,0.03)` | `rgba(155,89,182,0.03)` |
| `--accent-a04` | Hover backgrounds | `rgba(46,196,182,0.04)` | `rgba(58,181,176,0.04)` | `rgba(46,204,113,0.04)` | `rgba(155,89,182,0.04)` |
| `--accent-a06` | Selected backgrounds | `rgba(46,196,182,0.06)` | `rgba(58,181,176,0.06)` | `rgba(46,204,113,0.06)` | `rgba(155,89,182,0.06)` |
| `--accent-a08` | Button hover backgrounds | `rgba(46,196,182,0.08)` | `rgba(58,181,176,0.08)` | `rgba(46,204,113,0.08)` | `rgba(155,89,182,0.08)` |

**To add a new character:** pick a colour, derive its rgba variants at 0.03/0.04/0.06/0.08, and paste the 7-variable block below into the page `<head>`.

### `mission-prep.css` — required `:root` variables (per page)

Define all of these in a `<style>` block inside the page `<head>`. Reference implementations:
- **Amber/brown theme:** `01-a-promise-is-a-promise.html` inline `<style>` block
- **Green/forest theme:** `02-something-that-wants-to-be-known.html` `<style>` block

```css
:root {
  --mp-outer-bg:        /* body background */
  --mp-page-bg:         /* .page background */
  --mp-text:            /* default text (p, li) */
  --mp-accent:          /* h1, h2, strong headings */
  --mp-accent-mid:      /* h3, stat keys */
  --mp-subtitle:        /* .title-block .subtitle */
  --mp-border:          /* borders, ornament, accent-on-dark */
  --mp-border-h2:       /* h2 bottom border */
  --mp-dark-bg:         /* npc-header, .section-header, .quick-ref bg */
  --mp-clock-bg:        /* .clock-step bg */
  --mp-dark-text:       /* text on dark backgrounds */
  --mp-light-1:         /* .npc-body, .resolution-row bg */
  --mp-light-2:         /* .stat-grid, .flavour bg */
  --mp-flavour-text:    /* .flavour text */
  --mp-quick-ref-li:    /* li text inside .quick-ref */
  --mp-tension-border:  /* .tension-box border */
  --mp-tension-left:    /* .tension-box left accent */
  --mp-tension-bg:      /* .tension-box background */
  --mp-res-best:        /* .resolution-row.best border */
  --mp-res-bad:         /* .resolution-row.bad border */
  --mp-res-partial:     /* .resolution-row.partial border */
}
```

---

## 4. Typography

### `player.css` / `keeper.css` pages

| Font | Family | Where used |
|---|---|---|
| Share Tech Mono | monospace | Logo, `.section-tag`, footer, data labels, eyebrows |
| Barlow Condensed | sans-serif | Nav links, section h2, hero titles, card titles |
| Barlow | sans-serif | `body` — weight 300, 16px, line-height 1.7 |

### `mission-prep.css` pages

| Font | Family | Where used |
|---|---|---|
| Cinzel | serif (decorative) | `.title-block h1`, `.section-header`, `h2`, `.npc-header`, `.stat-item strong`, `.quick-ref h3`, `.escalation-list li strong` |
| Crimson Text | serif (body) | `body`, `h3`, `.npc-header span`, `.flavour` |
| Courier New | system monospace | `.terminal` only |

Base: 17px, line-height 1.75, serif body.

---

## 5. Utility Classes

### `player.css`

| Class | Visual effect | When to use |
|---|---|---|
| `.logo` | Green glowing mono text, 1.1rem, 0.2em tracking | Site logo `<a>` in header |
| `.logo span` | Dim punctuation | Wraps each `.` in "P.O.R.T.A.L" |
| `.status-dot` | Pulsing green 8px circle | Live status indicator in player header |
| `.section-header` | Flex row, baseline-aligned h2 + tag, green bottom border | Opens each page section |
| `.section-tag` | Tiny mono label in `--green-dim` | Descriptor beside h2 inside `.section-header` |
| `.redact` | Black bar, `user-select: none` | In-world redacted text |
| `.blurred` | 4px blur, `user-select: none` | Content locked until post-session reveal |
| `.blur-notice` | Tiny amber bordered badge | Explanation next to blurred content |

### `keeper.css`

All `.logo`, `.section-header`, `.section-tag` exist with keeper-purple equivalents.

| Class | Visual effect | When to use |
|---|---|---|
| `.keeper-banner` | Purple bar, "KEEPER ACCESS ONLY" | **Must be first element in `<body>`** on all keeper pages |
| `.keeper-dot` | Pulsing purple 8px circle | Keeper status dot in header |
| `.hero` | Padded zone, max-width 1100px, z-index 10 | Hero/intro area on keeper pages |
| `.hero-eyebrow` | Tiny purple mono label | Pre-title context line in hero |
| `.hero-title` | Large condensed bold title | Page title in hero |
| `.hero-title .accent` | Purple glowing text | Highlighted word inside `.hero-title` |
| `.hero-desc` | Dim body text, max-width 600px | Subtitle paragraph in hero |
| `.ktag` | Tiny mono badge with coloured border | Status/category tags on keeper cards. Variants: `.green`, `.amber`, `.red`, `.purple`, `.grey`, `.teal` |
| `.section-note` | Dark inset mono text block, bordered | Inline contextual notes within a section (not a rules callout) |
| `.warn-band` | Thin full-width mono alert stripe | Short single-line warnings between content blocks. Variants: `.red`, `.amber`, `.purple` |

### `mission-prep.css`

| Class | Visual effect | When to use |
|---|---|---|
| `.page` | Cream/coloured column, max-width 720px, centred | Wraps **all** page content — one per page |
| `.title-block` | Centred, 2px accent bottom border | Document title block at top of `.page` |
| `.title-block .subtitle` | Italic, subdued colour | Subtitle under h1 in title block |
| `.section-header` | Full-bleed dark bar, Cinzel text, negative side margins | Scene / section dividers — bleeds to page edges |
| `.flavour` | Italic with left border + tinted bg | Read-aloud text, atmospheric descriptions |
| `.label-row` | Bold Cinzel label as block above text | Clue items, scene object descriptions |
| `.npc-box` | Bordered card, dark header + light body | NPC stat blocks |
| `.npc-header` | Dark bg, Cinzel name, italic sub-role | NPC name row inside `.npc-box` |
| `.npc-body` | Light bg, padded | NPC notes and dialogue inside `.npc-box` |
| `.npc-motivation` | Italic, accent-coloured paragraph | NPC motivation line — first `<p>` in `.npc-body` |
| `.stat-grid` | 2-column grid, light tinted bg, bordered | Monster / minion stat blocks |
| `.stat-item` | Single stat cell with Cinzel label + text | Within `.stat-grid` |
| `.stat-item.full` | Spans both columns | Longer stat entries (attacks, specials, weaknesses) |
| `.resolution` | Wrapper with `margin: 12px 0` | Groups a set of `.resolution-row` items |
| `.resolution-row` | Left-bordered row, light bg | Single outcome path |
| `.resolution-row.best` | Green left border | Good/best outcome |
| `.resolution-row.bad` | Red left border | Bad/worst outcome |
| `.resolution-row.partial` | Yellow-brown left border | Mixed/partial outcome |
| `.clock` | Vertical flex column, `gap: 6px` | Countdown clock container |
| `.clock-step` | Dark row — icon cell + label cell | One step on the countdown |
| `.clock-icon` | Emoji / icon, flex-shrink 0 | Icon cell within `.clock-step` |
| `.clock-label` | Light text | Description cell within `.clock-step` |
| `.quick-ref` | Dark inset box, light text | **Keeper-only callout** — rules, checklists, mechanics hidden from players |
| `.quick-ref h3` | Accent-coloured Cinzel header | Heading inside a `.quick-ref` |
| `.quick-ref ul li` | Tinted light list items | Bullet checklist inside `.quick-ref` |
| `.escalation-list` | List with Cinzel trigger labels above each item, border-separated rows | Mechanic sequences: "if X → then Y → then Z" — use inside or outside `.quick-ref` |
| `.escalation-list li strong` | Display-block Cinzel trigger label | Bold trigger at start of each escalation item — renders differently in `.quick-ref` context |
| `.keeper-note` | Italic, smaller, top-bordered paragraph | Closing meta-note for the Keeper — final `<p>` in a `.quick-ref` or section |
| `.terminal` | Dark green-on-black monospace box | CAMPBELL / AI system readouts |
| `.t-label` | Dim green header row | Terminal section label |
| `.t-key` | Bright green | Field labels in terminal |
| `.t-alert` | Amber | Warnings in terminal |
| `.t-red` | Red | Errors in terminal |
| `.t-dim` | Dim green | Comments / low-priority entries in terminal |
| `.tension-box` | Left-bordered callout, tinted bg | Narrative pressure points, scene stakes |
| `.ornament` | Centred decorative character row | Page-end section break |

---

## 6. Page Templates

### 6a. Player-facing nav page (e.g., `index.html`, `missions/index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P.O.R.T.A.L — [Page Title]</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="player.css">
  <style>
    /* page-specific styles only */
  </style>
</head>
<body>

<header>
  <a href="index.html" class="logo">P<span>.</span>O<span>.</span>R<span>.</span>T<span>.</span>A<span>.</span>L</a>
  <nav>
    <a href="index.html#sessions">Sessions</a>
    <a href="index.html#missions">Missions</a>
    <a href="index.html#operatives">Operatives</a>
    <!-- other nav links -->
  </nav>
  <div><span class="status-dot"></span></div>
</header>

<main>
  <section id="[section-id]" style="scroll-margin-top:64px; position:relative; z-index:10; max-width:1100px; margin:0 auto; padding:80px 24px;">
    <div class="section-header">
      <h2>[SECTION TITLE]</h2>
      <span class="section-tag">// [TAG]</span>
    </div>
    <!-- content -->
  </section>
</main>

<footer>
  <span>P.O.R.T.A.L — FIELD OPERATIONS // CLASSIFIED</span>
  <span>CAMPBELL v<span id="ver"></span></span>
</footer>

<script>
  document.getElementById('ver').textContent =
    '2.' + (Math.floor(Math.random()*9)+1) + '.' + (Math.floor(Math.random()*89)+10);
</script>
</body>
</html>
```

**Notes:**
- All sections use `scroll-margin-top: 64px` to account for the sticky 64px header.
- Nav links from `missions/index.html` back to the main site use `../index.html#section`.

### 6b. Hunter story arc page (e.g., `hunters/alan-hunter-stories.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P.O.R.T.A.L — [Character Name] · Hunter Stories</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="hunter.css">
  <style>
  :root {
    --accent:     #[hex];
    --accent-dim: #[hex];
    --accent-glow: #[hex+alpha];
    --accent-a03: rgba([r],[g],[b],0.03);
    --accent-a04: rgba([r],[g],[b],0.04);
    --accent-a06: rgba([r],[g],[b],0.06);
    --accent-a08: rgba([r],[g],[b],0.08);
  }
  </style>
  <!-- Omit the <style> block entirely for Alan Frazier (teal is the default). -->
</head>
<body>

<header>
  <a href="../index.html" class="logo">P<span>.</span>O<span>.</span>R<span>.</span>T<span>.</span>A<span>.</span>L</a>
  <nav>
    <span class="status-dot"></span>
    <a href="../index.html">Home</a>
    <a href="../index.html#operatives" class="active">Operatives</a>
  </nav>
</header>

<div class="hero">
  <div class="hero-eyebrow">// HUNTER DOSSIER · [PLAYBOOK] · HUNTER STORIES</div>
  <h1 class="hero-title">[FIRST NAME] <span class="accent">[LAST NAME]</span></h1>
  <p class="hero-desc">[One-paragraph character description.]</p>
  <div class="hero-meta">
    <div class="hero-meta-item">PLAYBOOK: <span>[Playbook]</span></div>
    <div class="hero-meta-item">[KEY]: <span>[VALUE]</span></div>
    <div class="hero-meta-item">STATUS: <span>Active · PORTAL Field Operative</span></div>
  </div>
  <div class="campbell-note">
    <span class="c-label">// CAMPBELL — OPERATIVE NOTE</span>
    [Brief CAMPBELL note explaining how hunter stories work.]
  </div>
</div>

<main>
<div class="arc-nav">
  <a href="#arc-[id]" class="active">Arc I — [Title]</a>
  <a href="#arc-[id]">Arc II — [Title]</a>
  <a href="#arc-[id]" class="custom">Arc III — [Title] ✦ PORTAL</a>
</div>

<div class="how-it-works">
  <div class="how-title">// ABOUT HUNTER STORIES</div>
  <div class="how-grid">
    <div class="how-item"><strong>Starting a Story</strong><p>Tell the Keeper you want to begin a hunter story. They'll weave its pressures into the campaign alongside active cases.</p></div>
    <div class="how-item"><strong>Story Beats</strong><p>Mark a beat when you do something that fits it. Mark five and you gain a benefit.</p></div>
    <div class="how-item"><strong>Resolution</strong><p>When the story concludes — resolved, failed, or transformed — take one resolution move.</p></div>
  </div>
</div>

<!-- ARC BLOCK — repeat for each arc -->
<div id="arc-[id]" class="arc">  <!-- add class="arc arc-custom" for PORTAL-original arcs -->
  <div class="arc-header">
    <div class="arc-eyebrow">// ARC [N] — [ADAPTED FROM HUNTER'S JOURNAL / ORIGINAL · P.O.R.T.A.L CAMPAIGN]</div>
    <div class="arc-name">[Arc Title]</div>
    <p class="arc-intro">[2–3 sentence arc premise.]</p>
  </div>

  <!-- PLAYER SECTION -->
  <div class="arc-player">
    <div class="arc-section-label">// FOR [CHARACTER] — PLAYER SECTION</div>

    <div class="entry-points">
      <h3>When to Start This Arc</h3>
      <ul class="entry-list">
        <li>[Trigger condition]</li>
      </ul>
    </div>

    <div class="choices-block">
      <div class="choice-group">
        <h3>[Choice Question]</h3>
        <div class="choice-options">
          <label class="choice-opt"><span class="choice-box"></span><span class="choice-text">[Option text]</span></label>
          <div class="choice-open"><label>Something else:</label><input type="text" placeholder="[Prompt]"></div>
        </div>
      </div>
    </div>

    <div class="beats-block">
      <h3>Story Beats <span style="font-weight:300;font-size:0.8rem;color:var(--text-dim)">&nbsp;— mark five to gain a benefit</span></h3>
      <div class="beats-track" id="beats-[arc-id]">
        <div class="beat-box">1</div><div class="beat-box">2</div><div class="beat-box">3</div><div class="beat-box">4</div><div class="beat-box">5</div>
      </div>
      <ul class="beats-list">
        <li>[Beat description]</li>
      </ul>
    </div>

    <div class="resolution-block">
      <h3>Resolution Moves</h3>
      <p class="resolution-intro">When the arc concludes, take one — or neither.</p>
      <div class="resolution-moves">
        <div class="res-move" onclick="toggleRes(this)">
          <div class="res-move-name"><span class="check"></span>[Move Name]</div>
          <p>[Move text with <strong>mechanical terms bolded</strong>.]</p>
        </div>
        <div class="res-move" onclick="toggleRes(this)">
          <div class="res-move-name"><span class="check"></span>[Move Name]</div>
          <p>[Move text.]</p>
        </div>
      </div>
    </div>

    <div class="portal-note">// PORTAL HOOK: [Connection to wider campaign.]</div>
  </div>

  <!-- KEEPER SECTION (blurred) -->
  <div class="blur-wrap">
    <div class="blur-notice">// KEEPER ACCESS ONLY — DO NOT READ</div>
    <div class="arc-keeper blurred">
      <div class="keeper-label">// FOR THE KEEPER — ARC: [TITLE]</div>
      <p class="keeper-intro">[Keeper guidance paragraph.]</p>

      <p class="keeper-intro" style="margin-bottom:16px"><strong style="color:var(--text)">Countdown — [Arc Title]</strong></p>
      <table class="countdown-table">
        <tr><td>Day</td><td>[Description]</td></tr>
        <tr><td>Shadows</td><td>[Description]</td></tr>
        <tr><td>Sunset</td><td>[Description]</td></tr>
        <tr><td>Dusk</td><td>[Description]</td></tr>
        <tr><td>Nightfall</td><td>[Description]</td></tr>
        <tr><td>Midnight</td><td>[Description]</td></tr>
      </table>

      <div class="threats-grid">
        <div class="threat-card">
          <div class="threat-name">[Threat Name]</div>
          <div class="threat-type">[Type — motivation]</div>
          <p class="threat-desc">[Description]</p>
          <ul class="threat-moves"><li>[Move]</li></ul>
        </div>
        <div class="threat-card full">
          <div class="threat-name">[Threat Name]</div>
          <div class="threat-type">[Type]</div>
          <p class="threat-desc">[Description]</p>
          <ul class="threat-moves"><li>[Move]</li></ul>
          <div class="custom-move"><strong>Custom Move — [Name]:</strong> [Text]</div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- end arc block -->

</main>

<div class="page-actions">
  <button class="action-btn" onclick="window.print()">// PRINT</button>
  <button class="action-btn" onclick="resetAll()">// RESET CHOICES</button>
</div>

<script>
document.querySelectorAll('.choice-opt').forEach(opt => {
  opt.addEventListener('click', function() { this.classList.toggle('selected'); });
});
function toggleRes(el) {
  el.parentElement.querySelectorAll('.res-move').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
}
document.querySelectorAll('.beats-track').forEach(track => {
  const boxes = track.querySelectorAll('.beat-box');
  boxes.forEach((box, i) => {
    box.addEventListener('click', function() {
      if (this.classList.contains('filled')) {
        boxes.forEach((b, j) => { if (j >= i) b.classList.remove('filled'); });
      } else {
        boxes.forEach((b, j) => { if (j <= i) b.classList.add('filled'); });
      }
    });
  });
});
function resetAll() {
  if (!confirm('Reset all choices on this page?')) return;
  document.querySelectorAll('.choice-opt').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.res-move').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.beat-box').forEach(o => o.classList.remove('filled'));
  document.querySelectorAll('.choice-open input').forEach(i => i.value = '');
}
document.querySelectorAll('.arc-nav a').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) { e.preventDefault(); document.querySelector(href).scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
</script>
</body>
</html>
```

**Notes:**
- File lives in `hunters/[name]-hunter-stories.html`. Link path for CSS is `hunter.css` (same directory).
- Alan's teal is the default — omit `<style>` block entirely for Alan. All others need the 7-variable override. See §3 for all four character palettes.
- Arc III (the PORTAL-original arc) gets `class="arc arc-custom"` — this shifts the accent stripe and `.portal-note` to amber.
- `.beats-track` elements need unique `id` attributes (`beats-[arc-id]`) if you want the scroll-active nav highlighting script to work.
- The Keeper section is blurred by default. The `.blur-wrap` / `.blur-notice` / `.arc-keeper.blurred` pattern is already in `hunter.css`.

### 6c. Keeper nav page (e.g., `keeper.html`, `gallery.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P.O.R.T.A.L — [Keeper Page Title]</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../keeper.css">
  <style>
    /* page-specific styles only */
  </style>
</head>
<body>

<div class="keeper-banner">KEEPER ACCESS ONLY — DO NOT SHARE THIS URL WITH PLAYERS</div>

<header>
  <a href="../index.html" class="logo">P<span>.</span>O<span>.</span>R<span>.</span>T<span>.</span>A<span>.</span>L <span style="font-size:0.7rem;color:var(--keeper-dim);margin-left:8px;">// KEEPER</span></a>
  <nav>
    <a href="../index.html">Player Site</a>
    <a href="index.html">Public Missions</a>
    <a href="keeper.html">Keeper Index</a>
    <a href="references.html">References</a>
    <a href="entities.html">Entities</a>
    <a href="gallery.html">Gallery</a>
  </nav>
  <div><span class="keeper-dot"></span><span style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;letter-spacing:0.1em;color:var(--keeper-dim)">RESTRICTED ACCESS</span></div>
</header>

<div class="hero">
  <div class="hero-eyebrow">// [EYEBROW TEXT]</div>
  <h1 class="hero-title">[TITLE]<br><span class="accent">[ACCENT WORD]</span></h1>
  <p class="hero-desc">[Description paragraph]</p>
</div>

<main>
  <div class="section-header">
    <h2>[SECTION]</h2>
    <span class="section-tag">// [TAG]</span>
  </div>
  <!-- content -->
</main>

<footer>
  <span>P.O.R.T.A.L — [PAGE LABEL] // RESTRICTED</span>
  <span>CAMPBELL v<span id="ver"></span></span>
</footer>

<script>
  document.getElementById('ver').textContent =
    '2.' + (Math.floor(Math.random()*9)+1) + '.' + (Math.floor(Math.random()*89)+10);
</script>
</body>
</html>
```

**Notes:**
- `.keeper-banner` must be the **first** element inside `<body>`, before `<header>`.
- Active nav link gets `class="active"` (renders in keeper purple).
- Nav items use `../index.html` for the player site, relative paths for sibling pages.

### 6c. Mission prep document (e.g., `02-something-that-wants-to-be-known.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Mission Name] — P.O.R.T.A.L Mission [NN]</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../mission-prep.css">
  <style>
    :root {
      --mp-outer-bg:        #[body-bg];
      --mp-page-bg:         #[page-bg];
      --mp-text:            #[body-text];
      --mp-accent:          #[h1-h2-strong];
      --mp-accent-mid:      #[h3-labels];
      --mp-subtitle:        #[subtitle];
      --mp-border:          #[borders-ornament-accent-on-dark];
      --mp-border-h2:       #[h2-underline];
      --mp-dark-bg:         #[section-header-npc-header-quick-ref-bg];
      --mp-clock-bg:        #[clock-step-bg];
      --mp-dark-text:       #[text-on-dark-bg];
      --mp-light-1:         #[npc-body-resolution-row-bg];
      --mp-light-2:         #[stat-grid-flavour-bg];
      --mp-flavour-text:    #[flavour-text];
      --mp-quick-ref-li:    #[li-inside-quick-ref];
      --mp-tension-border:  #[tension-box-border];
      --mp-tension-left:    #[tension-box-left-accent];
      --mp-tension-bg:      #[tension-box-bg];
      --mp-res-best:        #[resolution-best-border];
      --mp-res-bad:         #[resolution-bad-border];
      --mp-res-partial:     #[resolution-partial-border];
    }
  </style>
</head>
<body>

<div class="keeper-nav">
  <span>
    <a href="../missions/keeper.html">KEEPER INDEX</a>
    <span class="crumb"> / </span>
    [MISSION NAME]
  </span>
  <span class="warning">KEEPER ONLY — DO NOT SHARE</span>
</div>

<div class="page">

  <div class="title-block">
    <h1>[Mission Title]</h1>
    <div class="subtitle">[Subtitle — e.g. "A Monster of the Week One-Shot"]</div>
  </div>

  <div class="flavour">
    [Opening read-aloud or atmosphere hook]
  </div>

  <!-- SCENE / CHAPTER DIVIDER -->
  <div class="section-header">[SECTION TITLE — e.g. "THE HOOK — ORACLE Flags an Anomaly"]</div>

  <h2>[Subsection heading]</h2>
  <p>[Body copy]</p>

  <!-- NPC BLOCK -->
  <div class="npc-box">
    <div class="npc-header">[NPC Name] <span>[Bystander — Role]</span></div>
    <div class="npc-body">
      <p class="npc-motivation">Motivation: [one line]</p>
      <p>[Description and dialogue]</p>
    </div>
  </div>

  <!-- STAT BLOCK -->
  <div class="stat-grid">
    <div class="stat-item"><strong>Type</strong>[Value]</div>
    <div class="stat-item"><strong>Harm Capacity</strong>[Value]</div>
    <div class="stat-item full"><strong>Attack</strong>[Full-width entry]</div>
    <div class="stat-item"><strong>Armour</strong>[Value]</div>
    <div class="stat-item"><strong>Weakness</strong>[Value]</div>
  </div>

  <!-- KEEPER CALLOUT -->
  <div class="quick-ref">
    <h3>[Rules or Checklist Title]</h3>
    <ul>
      <li>[Item one]</li>
      <li>[Item two]</li>
    </ul>
    <!-- Optional: escalation sequence instead of a plain ul -->
    <ul class="escalation-list">
      <li><strong>Trigger label:</strong> Description of what happens.</li>
      <li><strong>Next trigger:</strong> Description of what happens next.</li>
    </ul>
    <!-- Optional: closing keeper meta-note -->
    <p class="keeper-note">Keeper note: [internal guidance not visible to players]</p>
  </div>

  <!-- COUNTDOWN CLOCK -->
  <div class="clock">
    <div class="clock-step"><div class="clock-icon">🌫️</div><div class="clock-label"><strong>DAY</strong> [Description]</div></div>
    <div class="clock-step"><div class="clock-icon">📱</div><div class="clock-label"><strong>SHADOWS</strong> [Description]</div></div>
    <div class="clock-step"><div class="clock-icon">🩹</div><div class="clock-label"><strong>SUNSET</strong> [Description]</div></div>
    <div class="clock-step"><div class="clock-icon">👁️</div><div class="clock-label"><strong>DUSK</strong> [Description]</div></div>
    <div class="clock-step"><div class="clock-icon">💀</div><div class="clock-label"><strong>MIDNIGHT</strong> [Description]</div></div>
    <div class="clock-step"><div class="clock-icon">🔥</div><div class="clock-label"><strong>DOOM</strong> [Description]</div></div>
  </div>

  <!-- RESOLUTION PATHS -->
  <div class="resolution">
    <div class="resolution-row best"><strong>BEST ENDING</strong>[Description]</div>
    <div class="resolution-row partial"><strong>PARTIAL ENDING</strong>[Description]</div>
    <div class="resolution-row"><strong>DIFFICULT ENDING</strong>[Description]</div>
    <div class="resolution-row bad"><strong>BAD ENDING</strong>[Description]</div>
  </div>

  <!-- TERMINAL READOUT -->
  <div class="terminal">
    <div class="t-label">CAMPBELL // REPORT #[XXXX] // [CLASSIFICATION]</div>
    <span class="t-key">FIELD:</span> Value<br>
    <span class="t-alert">Alert text</span><br>
    <span class="t-dim">// Comment</span>
  </div>

  <!-- TENSION BOX -->
  <div class="tension-box">
    <strong>PRESSURE POINT — [Name]</strong>
    <p>[Description]</p>
  </div>

  <div class="ornament">· · · ✦ · · ·</div>

</div><!-- /.page -->
</body>
</html>
```

**File naming:** `NN-hyphenated-mission-title.html` — e.g. `03-the-empty-house.html`

---

## 7. Page-Specific Classes (Do NOT Use in New Pages)

These are defined in inline `<style>` blocks inside individual pages. They are not available in any shared stylesheet.

### `hunters/hunter.css` classes (available on all hunter pages)

| Class | Visual effect | When to use |
|---|---|---|
| `.hero-eyebrow` | Tiny mono label in `--accent-dim` | Pre-title line in hunter hero |
| `.hero-title .accent` | Accent-coloured glowing text | Character surname in hero title |
| `.hero-meta` / `.hero-meta-item` | Mono badge row | Playbook, origin, status tags in hero |
| `.campbell-note` / `.c-label` | Accent-bordered terminal note | CAMPBELL operative note in hero |
| `.how-it-works` / `.how-grid` / `.how-item` | 3-column explainer card | "About Hunter Stories" block |
| `.arc` | Bordered card, accent top stripe | One hunter story arc container |
| `.arc.arc-custom` | Amber top stripe instead of accent | PORTAL-original arcs (Arc III) |
| `.arc-header` / `.arc-eyebrow` / `.arc-name` / `.arc-intro` | Arc title block | Top section of an arc card |
| `.arc-player` / `.arc-section-label` | Player section with labelled divider | Player-facing content in an arc |
| `.entry-points` / `.entry-list` | `//`-prefixed bullet list | "When to Start This Arc" |
| `.choices-block` / `.choice-group` / `.choice-options` | Choice grid | Player choice questions |
| `.choice-opt` / `.choice-box` / `.choice-text` | Toggleable choice card | Individual player choice |
| `.choice-open` | Free-text input row (`grid-column: 1/-1`) | "Something else:" custom field |
| `.beats-block` / `.beats-track` / `.beat-box` | Row of 5 clickable progress boxes | Story beat tracker |
| `.beats-list` | `◇`-prefixed bullet list | Beat descriptions |
| `.resolution-block` / `.resolution-moves` | 2-column resolution grid | Arc resolution move choices |
| `.res-move` / `.res-move-name` / `.check` | Clickable resolution card | Single resolution move (one active at a time) |
| `.portal-note` | Mono callout, accent left border | P.O.R.T.A.L campaign hook note |
| `.arc-keeper` / `.arc-keeper.blurred` | Keeper section, blurred by default | Keeper-only arc notes |
| `.blur-wrap` / `.blur-notice` | Overlay label on blurred region | "KEEPER ACCESS ONLY" badge |
| `.keeper-label` / `.keeper-intro` | Amber label + body text | Inside keeper section |
| `.countdown-table` | 6-row Day→Midnight table | Arc countdown clock |
| `.threats-grid` / `.threat-card` / `.threat-card.full` | 2-column threat cards | Threats/NPCs in keeper section |
| `.threat-name` / `.threat-type` / `.threat-desc` / `.threat-moves` | Threat card internals | Name, type, description, move list |
| `.custom-move` | Amber left-bordered callout | Custom mechanic move inside threat card |
| `.arc-nav` / `.arc-nav a` / `.arc-nav a.active` / `.arc-nav a.custom` | Sticky arc navigation pills | Jump links at top of `<main>` |
| `.page-actions` / `.action-btn` | Fixed bottom-right button group | Print + Reset buttons |
| `.arc-divider` | 1px gradient line | Optional visual separator inside arc |

### In `missions/keeper.html`
- `.stats-row`, `.stat-box`, `.stat-label`, `.stat-val` — keeper index dashboard stats
- `.kmission`, `.kmission-header`, `.kmission-num`, `.kmission-title`, `.kmission-sub`, `.kmission-tags` — mission card layout
- `.kmission-body`, `.kmission-toggle` — expandable mission card body
- `.kbody-label`, `.kbody-text`, `.kbody-section` — content inside expanded cards
- `.ktag` (+ `.green`, `.amber`, `.red`, `.purple`, `.grey`) — mission status tags
- `.resolution-table` — keeper index resolution outcome table
- `.full-link` — "open full prep document" CTA button
- `.post-session`, `.post-grid`, `.post-field` — post-session notes form

### In `index.html` (player-facing homepage)
- `.hero`, `.hero-eyebrow`, `.hero-title`, `.hero-sub`, `.hero-desc` — homepage hero (different sizing from keeper.css hero)
- `.oracle-readout`, `.o-label` — CAMPBELL readout widget
- Various section-specific card and grid classes

### In `missions/index.html` (public mission archive)
- Mission card and list classes specific to the public archive view

**General rule:** If a class is only defined inside an HTML `<style>` block, it is page-specific and must not be relied on in other pages.

---

## 8. New Page Checklist

Before a new HTML page is considered integrated, verify all five of these: **(1) CSS link** — exactly one of `player.css`, `keeper.css`, or `mission-prep.css` is linked with the correct relative path (`../` prefix for pages inside `/missions/`), and the matching Google Fonts `<link>` is also present. **(2) No orphan inline styles** — any classes used in the page that aren't in the shared stylesheet must be in a page-specific `<style>` block clearly separated from the `:root` theme block; no inline `style=""` attributes for layout or colour. **(3) Navigation** — player pages have the standard `<header>` + `<nav>` from `player.css`; keeper nav pages have `.keeper-banner` as the first `<body>` element; mission prep pages have `.keeper-nav` at the top with a correct breadcrumb path back to `keeper.html`. **(4) `:root` variables present (mission-prep pages only)** — all 21 `--mp-*` variables are defined and none reference hardcoded colours outside of this block. **(5) Mobile breakpoint** — player/keeper pages rely on the shared `@media (max-width: 600–700px)` in the CSS file; mission-prep pages have `@media (max-width: 480px)` either via the shared file or a page-level override covering at minimum `stat-grid`, `title-block h1`, and `section-header` margins.

---

## 9. Site Audit — Current Compliance Status

| File | CSS used | Status | Notes |
|---|---|---|---|
| `index.html` | `player.css` | ✅ Compliant | |
| `missions/index.html` | `../player.css` | ✅ Compliant | |
| `missions/keeper.html` | `../keeper.css` | ✅ Compliant | |
| `missions/gallery.html` | `../keeper.css` | ✅ Compliant | |
| `missions/02-something-that-wants-to-be-known.html` | `../mission-prep.css` | ✅ Compliant | Reference green theme |
| `missions/01-a-promise-is-a-promise.html` | `../mission-prep.css` | ✅ Converted | Amber theme. Uses `.escalation-list` and `.keeper-note`. |
| `missions/eszter_scenes_v2.html` | None (inline) | ⚠️ Zombie draft | Identical content to `01-a-promise-is-a-promise.html`. Safe to delete. |
| `missions/01-portal-campbell-briefings.html` | `../briefing.css` | ✅ Converted | Briefing card format. Cases A/B/C. |
| `missions/02-portal-campbell-briefings.html` | `../briefing.css` | ✅ Converted | Briefing card format. Cases A/C/D/E (post-Aldermoor). |
| `missions/02-portal-keeper-cases.html` | `../mission-prep.css` | ✅ Converted | Purple theme. Page-specific: `.case-block`, `.case-hook`, `.seed-box`, `.rival-box`, `.veil-box`. |
| `missions/references.html` | `../keeper.css` | ✅ Compliant | Page-specific: `.rcard` system, `.thread-row`, `.ref-stats`/`.ref-stat`. |
| `missions/entities.html` | `../keeper.css` | ✅ Compliant | Page-specific: `.ecard`, `.tcard`, `.dbcard`, `.stat-block`, `.harm-row`, `.moves-block`, `.notes-block`, `.entity-stats`, `.class-badge`. |
| `hunters/alan-hunter-stories.html` | `hunters/hunter.css` | ✅ Compliant | No accent override (default teal). |
| `hunters/reed-hunter-stories.html` | `hunters/hunter.css` | ✅ Compliant | Accent override: `#3ab5b0` teal. |
| `hunters/rex-hunter-stories.html` | `hunters/hunter.css` | ✅ Compliant | Accent override: `#2ecc71` green. |
| `hunters/sven-hunter-stories.html` | `hunters/hunter.css` | ✅ Compliant | Accent override: `#9b59b6` violet. |

---

## 10. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Mission prep files | `NN-hyphenated-title.html` | `03-the-empty-house.html` |
| Lab/general images | `lab-[descriptor]` | `lab-campbell.png` |
| Mission images | `M[N]-[descriptor]` | `M2-aldermoor-street.png` |
| Mission number padding | Always two digits | `01`, `02`, `03` |
| Section IDs (player nav) | `#sessions`, `#missions`, `#operatives`, `#bestiary`, `#lab`, `#artefacts`, `#atmosphere` | `index.html#lab` |
| AI system in-world name | CAMPBELL (all caps) | `CAMPBELL v2.4.11` |

---

## 11. `.tension-box` vs `.quick-ref` — When to Use Which

Both are keeper-only boxes that appear in mission prep documents, but they serve opposite narrative purposes.

**`.quick-ref`** — dark background (`--mp-dark-bg`), light text. A **rules and reference callout**. Use it for information the Keeper needs to look up mid-session: mechanic rules, checklists, stat exceptions, rollable tables. It sits outside the flow of the scene and speaks directly to the Keeper as a reader. Contains `h3` + `ul`, `.escalation-list`, or `.keeper-note`. Ask yourself: *"Is this something the Keeper needs to know, not something that happens?"* → `.quick-ref`.

**`.tension-box`** — light background (`--mp-tension-bg`), left accent stripe. A **narrative event callout**. Use it for things that actively happen during play: a pressure point that fires mid-scene, a Director call, an NPC action that drives the story forward. Contains `<strong>` title + `<p>` prose. The light background keeps it in the narrative flow; the left stripe signals "this is a beat, not a reference." Ask yourself: *"Is this something that happens in the scene?"* → `.tension-box`.

| | `.quick-ref` | `.tension-box` |
|---|---|---|
| Background | Dark (`--mp-dark-bg`) | Light (`--mp-tension-bg`) |
| Text | Light (`--mp-dark-text`) | Body (`--mp-text`) |
| Contents | `h3` + `ul` / checklist / rules | `strong` title + `p` prose |
| Role | Reference — Keeper reads this | Narrative — Keeper plays this |
| Example use | "The Locket — Rules", clue checklist, stat exceptions | "Pressure Point 1 — The Check-In Call", NPC interventions |

---

## 12. CAMPBELL Briefing Cards — `briefing.css` Specification

The CAMPBELL briefing card pages (`01-portal-campbell-briefings.html`, `02-portal-campbell-briefings.html`) are **player-facing terminal documents**, not keeper prep pages. They have their own complete visual system and are not covered by `player.css`, `keeper.css`, or `mission-prep.css`.

### Page type characteristics
- Font: `Share Tech Mono` as the **body** font (not just labels — everything is monospace)
- No `<header>` / `<nav>` / `.keeper-banner` — just a centred `.page-header` masthead
- No `.page` wrapper — full-bleed card grid, `max-width: 860px`
- Green is **brighter** than `player.css` (`#6fcf6f` vs `#2ecc71`)
- Player-facing: no keeper-only content, no keeper-nav

### Fonts required
```html
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet">
```

### Colour variables (full set, including v2 additions)
```css
:root {
  --bg:           #050807;   /* page background */
  --card:         #080f08;   /* briefing card background */
  --card2:        #0a110a;   /* card footer, closing note bg */
  --green:        #6fcf6f;   /* primary terminal text */
  --green-dim:    #3a6b3a;   /* borders, dim labels */
  --green-bright: #a0dfa0;   /* data-row key labels */
  --green-glow:   #6fcf6f22; /* page header title glow */
  --amber:        #e8c050;   /* alert values, medium priority */
  --amber-dim:    #7a6020;   /* amber borders */
  --red:          #e05050;   /* critical/red values */
  --red-dim:      #7a2020;   /* red borders */
  --text-dim:     #4a7a4a;   /* dim/comment text */
  --border:       #1e3d1e;   /* subtle internal borders */
  --border-bright:#3a6b3a;   /* card outer border */
  --purple:       #a855f7;   /* info/purple case colour */
  --purple-dim:   #4a1d7a;   /* purple borders */
  --teal:         #50c8c8;   /* new case accent (v2+) */
  --teal-dim:     #1a5a5a;   /* teal borders */
  --rose:         #e87070;   /* new-b case accent (v2+) */
  --rose-dim:     #7a3030;   /* rose borders */
}
```

### Full class list for `briefing.css`

**Page structure:**

| Class | Description |
|---|---|
| `.page-header` | Centred masthead block, `max-width: 860px`, text-align center |
| `.page-header .portal-logo` | `// P · O · R · T · A · L` — tiny green-dim monospace label |
| `.page-header .sub` | Subheading — dim, small tracking |
| `.page-header .divider` | 120px gradient rule, green-dim |
| `.page-header .note` | Amber-bordered inline status badge |
| `.page-header .timestamp` | Tiny dim date/context line |

**Briefing card:**

| Class | Description |
|---|---|
| `.briefing` | Card container — `max-width: 860px`, dark card bg, `border-bright` border |
| `.briefing.case-a` | Amber accent — top gradient stripe, title, directive, footer dot |
| `.briefing.case-b` | Green accent |
| `.briefing.case-c` | Purple accent |
| `.briefing.case-d` | Teal accent |
| `.briefing.case-e` | Rose accent |
| `data-case="A"` attribute | Renders as a large ghost watermark letter via `::after` |

**Card internal sections:**

| Class | Description |
|---|---|
| `.card-header` | Grid (title block + priority badge), padded, border-bottom |
| `.report-id` | Tiny dim report number label |
| `.report-title` | Large Barlow Condensed case name — colour from `.case-X` |
| `.report-subtitle` | Small dim location/classification line |
| `.priority-badge` | Bordered badge, top-right alignment |
| `.priority-badge.high` | Red — `PRIORITY: HIGH` |
| `.priority-badge.medium` | Amber — `PRIORITY: MEDIUM` |
| `.priority-badge.info` | Purple — informational |
| `.priority-badge.new` | Teal — newly flagged |
| `.priority-badge.new-b` | Rose — newly flagged variant |
| `.terminal` | Data readout body — green text, card bg, padded |
| `.t-label` | Terminal header row — flex, space-between, blink dot at right |
| `.blink` | 8px circle, step-end animation, inside `.t-label` only |
| `.data-row` | `KEY: value` pair row — flex, `.k` + `.v` children |
| `.data-row .k` | Key label — `green-bright`, no-wrap |
| `.data-row .v` | Value text — `green` |
| `.data-row .v.alert` | Amber value |
| `.data-row .v.red` | Red value |
| `.data-row .v.dim` | Dim/comment value |
| `.data-row .v.purple` | Purple value |
| `.data-row .v.teal` | Teal value |
| `.data-row .v.rose` | Rose value |
| `.t-key` | Inline bright-green span (for use in prose inside `.terminal`) |
| `.t-alert` | Inline amber span |
| `.t-red` | Inline red span |
| `.t-dim` | Inline dim span |
| `.t-purple` | Inline purple span |
| `.t-teal` | Inline teal span |
| `.t-rose` | Inline rose span |
| `.t-divider` | `<hr>` inside terminal — `border-top` only, no margin |
| `.directive` | Director's Note box — border + tinted bg inherits from `.case-X` |
| `.directive-label` | Tiny `// DIRECTOR'S NOTE` label at top of directive |
| `.card-footer` | Status strip — flex, space-between, `card2` bg, tiny text |
| `.card-footer .status-dot` | 6px circle with glow — colour from `.case-X` |

**Section labels (between card groups):**

| Class | Description |
|---|---|
| `.carry-over` | Dim label above carry-over cases (`// CARRY-OVER — CASES OPEN...`) |
| `.new-cases-label` | Teal label above new cases (`// NEW — CASES FLAGGED...`) |

**Closing block:**

| Class | Description |
|---|---|
| `.campbell-note` | Closing transmission block — `card2` bg, dim text, bordered |
| `.campbell-note .cn-header` | Header row — flex, space-between, `green-dim` |
| `.campbell-note .cn-text` | Body — `green-dim`, double line-height |
| `.campbell-note .cn-sig` | Signature line — tiny, dim |

### HTML skeleton for a new briefing page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>P.O.R.T.A.L — CAMPBELL [Queue Name]</title>
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../briefing.css">
</head>
<body>

<div class="page-header">
  <div class="portal-logo">// P · O · R · T · A · L</div>
  <h1>CAMPBELL</h1>
  <div class="sub">PRIORITY QUEUE — [QUEUE SUBTITLE]</div>
  <div class="divider"></div>
  <div class="note">⚠ [STATUS NOTE]</div>
  <div class="timestamp">// [CONTEXT LINE]</div>
</div>

<div class="briefing case-a" data-case="A">
  <div class="card-header">
    <div>
      <div class="report-id">// CAMPBELL — ANOMALY REPORT #[XXXX-X]</div>
      <div class="report-title">[CASE NAME]</div>
      <div class="report-subtitle">[LOCATION · CLASSIFICATION · TYPE]</div>
    </div>
    <div class="priority-badge high">PRIORITY: HIGH</div>
  </div>

  <div class="terminal">
    <div class="t-label">
      <span>FIELD BRIEFING — AUTHORISED PERSONNEL ONLY</span>
      <span class="blink"></span>
    </div>

    <div class="data-row"><span class="k">LOCATION:</span><span class="v">[value]</span></div>
    <div class="data-row"><span class="k">PATTERN:</span><span class="v alert">[alert value]</span></div>

    <hr class="t-divider">

    <div class="data-row"><span class="k">ENERGY SIG:</span><span class="v alert">[classification]</span></div>
    <div class="data-row"><span class="k">MECHANISM:</span><span class="v">[description]</span></div>

    <div class="directive">
      <span class="directive-label">// DIRECTOR'S NOTE — [DATE/CONTEXT]</span>
      [Director's instructions in prose.]
      <br><br>
      <span class="t-dim">// [Closing private note. — Director]</span>
    </div>
  </div>

  <div class="card-footer">
    <span><span class="status-dot"></span>[STATUS TEXT]</span>
    <span>REPORT #[XXXX-X] · CAMPBELL v<span class="ver"></span></span>
    <span>[LOCATION · CLASSIFICATION]</span>
  </div>
</div>

<div class="campbell-note">
  <div class="cn-header">
    <span>// CAMPBELL — [END LABEL]</span>
    <span>[CASE COUNT]</span>
  </div>
  <div class="cn-text">[Closing transmission text in all caps.]</div>
  <div class="cn-sig">// END TRANSMISSION — CAMPBELL · P.O.R.T.A.L ANOMALY DETECTION SYSTEM</div>
</div>

<script>
  const ver = '2.' + (Math.floor(Math.random()*9)+1) + '.' + (Math.floor(Math.random()*89)+10);
  document.querySelectorAll('.ver').forEach(el => el.textContent = ver);
</script>
</body>
</html>
```

**Case letter → colour mapping:**
- `case-a` → amber (urgent, carry-over)
- `case-b` → green (standard/active)
- `case-c` → purple (informational/unusual)
- `case-d` → teal (new, unknown)
- `case-e` → rose (new, identity/body horror)

No rule mandates a specific letter for a specific priority — use the colour that fits the case's emotional register, then set `.priority-badge` class separately for the formal priority level.

---

## 14. What to Tell Claude When Requesting a New Page

When asking an AI assistant to generate or modify a page, include the following in your prompt for clean integration:

**Always include:**
> "Use the P.O.R.T.A.L integration reference. Link `[player.css / keeper.css / mission-prep.css]` — do not write any inline styles for classes that exist in those files."
> "At the end, list any new CSS classes you added that aren't in the shared stylesheet, so I can decide whether to promote them."


**For mission prep pages, also include:**
> "This is a mission-prep page. Use `../mission-prep.css`. Define a `:root` block with all 21 `--mp-*` variables for a [colour/theme description] palette. Start the body with a `.keeper-nav` breadcrumb linking back to `keeper.html`."

**For keeper nav pages, also include:**
> "This is a keeper page. Use `../keeper.css`. The first element in `<body>` must be `<div class="keeper-banner">KEEPER ACCESS ONLY — DO NOT SHARE THIS URL WITH PLAYERS</div>`. Nav links: Player Site → `../index.html`, Public Missions → `index.html`, Keeper Index → `keeper.html`, Gallery → `gallery.html`."

**For player pages, also include:**
> "This is a player-facing page. Use `player.css` (or `../player.css` if inside `/missions/`). Nav links go to `index.html#section-id`. All sections need `scroll-margin-top: 64px`."

**For hunter story arc pages, also include:**
> "This is a hunter story arc page inside `hunters/`. Use `hunter.css` (same directory — no path prefix). Add a `<style>:root{}` block overriding the 7 `--accent-*` variables for [character name]'s colour: `--accent`, `--accent-dim`, `--accent-glow`, `--accent-a03` through `--accent-a08`. See integration-reference.md §3 for all four existing palettes. Nav links: Home → `../index.html`, Operatives → `../index.html#operatives`. Arc III (PORTAL-original) gets `class='arc arc-custom'`. Include the standard JS block for choice toggles, beat tracking, resolution moves, and arc-nav smooth scroll."

**When the page introduces new CSS classes not in the shared stylesheets:**
> "List any new CSS classes you defined that are not in `mission-prep.css` / `player.css` / `keeper.css`, so they can be reviewed for promotion to the shared stylesheet."

**When modifying an existing page:**
> "Here is the current file. Preserve the CSS link structure — do not switch from the linked stylesheet to inline styles. Only add new page-specific classes in the `<style>` block."

---

## 15. Hidden Keeper Access — Double-Click Pattern

Both player-facing pages (`index.html` and `missions/index.html`) have a hidden double-click shortcut on the "CAMPBELL ONLINE" status span that navigates to `keeper.html`. This is invisible to players.

**Required attributes on the span:**
```html
<span id="campbell-status" style="cursor:default;user-select:none;">CAMPBELL ONLINE</span>
```
- `cursor: default` — no pointer cursor hint
- `user-select: none` — no text selection on double-click

**Script (in existing `<script>` block):**
```javascript
// Double-click CAMPBELL ONLINE to enter keeper mode
document.getElementById('campbell-status').addEventListener('dblclick', function () {
  window.location.href = 'missions/keeper.html'; // or 'keeper.html' if already in /missions/
});
```

This works on GitHub Pages — only server-side code is blocked, not browser JavaScript.

---

## 13. New Patterns Added to `mission-prep.css`

The following classes were introduced to canonise patterns that previously appeared as inline styles in AI-generated pages. They are now available in `mission-prep.css`.

### `.escalation-list`

A list (use `<ul>` or `<ol>`) for mechanic sequences where each step has a bold trigger label followed by descriptive text. Use when the sequence is "if X happens → then Y → then Z". Works standalone or nested inside `.quick-ref`.

```html
<ul class="escalation-list">
  <li><strong>Immediately:</strong> The object is heavier than it should be.</li>
  <li><strong>After 10 minutes:</strong> The fabric around it frosts over.</li>
  <li><strong>If the warning is ignored:</strong> The frost spreads. A nearby phone dies.</li>
</ul>
```

Inside `.quick-ref`, the trigger labels and text colours automatically adapt to the dark background.

### `.keeper-note`

An italic closing note for the Keeper, visually separated from the content above by a top border. Use as the final `<p>` in a `.quick-ref` or at the end of a section. Not shown to players.

```html
<div class="quick-ref">
  <h3>Some Rule</h3>
  <ul> ... </ul>
  <p class="keeper-note">Keeper note: the escalation is not punishment — it's character. She is frightened someone will take the locket before he can say goodbye.</p>
</div>
```
