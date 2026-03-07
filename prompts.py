# ─────────────────────────────────────────────────────────────────
# PORTAL — Image Generation Prompts
# Add new entries as (filename, prompt) — no extension needed.
# Run generate_images.py to produce the files in /images/.
# Already-generated images are skipped automatically.
# ─────────────────────────────────────────────────────────────────

PROMPTS = [

    # ── THE LAB ──────────────────────────────────────────────────

    ("lab-exterior",
     "Exterior of a discreet private research building at dusk, "
     "brutalist architecture softened by ivy, no signage visible, "
     "warm amber light from tall narrow windows, a single security "
     "camera above a plain steel door, empty car park, fog rolling "
     "in from a treeline. Cinematic photography style, moody, "
     "slightly ominous, colour graded teal and amber. No people."),

    ("lab-briefing-room",
     "Interior of a sleek private research lab briefing room, "
     "long black table, multiple monitors displaying green-tinted "
     "data readouts and topographic maps, one large central screen "
     "showing a pulsing waveform, low overhead lighting with pools "
     "of warm light, walls lined with acoustic panels and whiteboards "
     "covered in equations. Cinematic, slightly clinical, atmospheric. "
     "Shot from the doorway looking in. No people."),

    ("lab-campbell-core",
     "A quantum computing server room, deep underground, cool blue "
     "and white light emanating from floor-to-ceiling glass-encased "
     "processors, cables like veins running across the ceiling, "
     "a faint human silhouette visible inside the glass — ambiguous, "
     "could be reflection or something more. Condensation on the "
     "glass. Eerie, beautiful, slightly tragic. Cinematic sci-fi, "
     "photorealistic lighting."),

    ("lab-campbell-screen",
     "A close-up of a dark monitor screen displaying a terminal "
     "interface, green monospace text on black background, a single "
     "blinking cursor, lines of anomaly report data half-visible, "
     "the words CLASS 2 ECTOPLASMIC RESIDUE visible in the text, "
     "soft green glow reflecting on a desk surface. Dark room beyond. "
     "Photorealistic, moody, slightly unsettling."),

    # ── COLD OPEN — Marcus in the Car Park ───────────────────────

    ("M1-carpark-before",
     "A university car park at night, sodium yellow lighting, "
     "wet tarmac reflecting orange light, a lone young man "
     "in a hoodie walking alone, hands in pockets, slightly "
     "unsteady. Distant brutalist university buildings, "
     "one lit window far away. Quiet, isolated, normal. "
     "Cinematic photography, shallow depth of field. "
     "The calm before something wrong."),

    ("M1-carpark-figure",
     "A university car park at night, a young woman standing "
     "perfectly still at the far end of the lot, wearing an "
     "autumn jacket, face obscured by shadow, fine grey ash "
     "falling around her like snow, the sodium lights above "
     "her flickering and dying one by one from left to right. "
     "The near end of the lot is normal. She is not. "
     "Cinematic horror photography, extremely atmospheric, "
     "cool and amber colour grade, no gore."),

    ("M1-carpark-aftermath",
     "A young man sitting against a concrete wall in a university "
     "car park at night, visibly shaken, cracked phone beside him, "
     "fine grey ash dusted across his jacket, temples of his hair "
     "slightly greyed. Eyes wide open, staring at nothing. "
     "A distant security torch beam cuts through the fog. "
     "Cinematic, cold, still. Drama photography style. No violence."),

    # ── SCENE 1 — Keller University Campus ───────────────────────

    ("M1-campus-coldspot",
     "A university corridor, students walking normally in "
     "background, but in the foreground a section of lockers "
     "where one student has stopped and pulled their coat "
     "tighter, breath just barely visible as mist, a faint "
     "smear of grey ash on one locker door. Nobody else has "
     "noticed. Natural daylight from windows. "
     "Cinematic photography, realistic, subtle wrongness."),

    ("M1-campus-noticeboard",
     "A close-up of a university notice board, layered with "
     "flyers and timetables, but in the centre a single "
     "printed disciplinary notice half-obscured by other "
     "papers, the name Kovacs Balint just visible. "
     "One corner has a small grey ash smudge. "
     "Shallow depth of field, natural fluorescent lighting, "
     "slightly unsettling documentary photography style."),

    # ── SCENE 2 — Bálint's Dorm Room ─────────────────────────────

    ("M1-dorm-shrine",
     "A small improvised shrine on a student dormitory desk, "
     "a framed photograph of a young woman smiling in autumn "
     "light, a dried flower, a handwritten birthday card in "
     "a foreign language, a small gold locket resting on a "
     "folded cloth. The locket is the focus. Warm, sad, "
     "intimate. Candlelight adjacent but from a desk lamp. "
     "Still life photography, shallow depth of field, "
     "melancholy and tender."),

    ("M1-dorm-locket",
     "Extreme close-up of a small gold oval locket lying open "
     "on dark fabric, inside one half a tiny rolled note "
     "with handwritten text, the other half containing fine "
     "grey ash. The locket is warm — suggest this through "
     "soft golden light. Macro photography, cinematic, "
     "beautiful and slightly haunting. Black background."),

    ("M1-dorm-wallmap",
     "A close-up of a hand-drawn annotation on a printed "
     "satellite map pinned to a dormitory wall, a red circle "
     "around a stretch of road, the word miert written "
     "in pen beside it in neat handwriting. Surrounding "
     "papers visible but out of focus. Forensic photography "
     "style, cool overhead light, melancholy."),

    ("M1-dorm-notes",
     "A close-up of university physics notes on paper, "
     "equations and diagrams in the main text, but the margins "
     "are filled with the same phrase written over and over "
     "in increasingly unsteady handwriting: "
     "Eszter, kerlek, menj el. The handwriting starts "
     "neat and becomes more desperate further down the page. "
     "Documentary close-up photography, natural light, "
     "deeply unsettling repetition."),

    # ── INTERLUDE — Bálint on the Footbridge ─────────────────────

    ("M1-balint-footbridge",
     "A young man sitting on the railing of a pedestrian "
     "footbridge between university buildings, night, "
     "campus lights below, not in danger but utterly "
     "still, looking at nothing, gold locket visible "
     "around his neck outside his shirt. He looks exhausted, "
     "not dramatic — just someone who has been carrying "
     "something too heavy for too long. Cinematic, "
     "melancholy, warm distant light, cool night air. "
     "No supernatural elements."),

    # ── SCENE 3 — The Robotics Lab ────────────────────────────────

    ("M1-roboticslab-empty",
     "A university robotics lab basement, night, blue glow "
     "from standby monitors, four large competition robots "
     "arranged in a circle facing inward, motionless, "
     "frost on the concrete floor in thin lines, "
     "the smell of solder and something cold. "
     "One large monitor on the back wall showing "
     "only a blinking cursor. Nobody present. "
     "Cinematic, deeply unsettling, sci-fi horror aesthetic, "
     "cold blue and shadow."),

    ("M1-roboticslab-screen",
     "A close-up of a dark monitor screen in a robotics lab, "
     "green terminal text appearing letter by letter, "
     "the words they hurt him on one line, "
     "i only wanted to protect him below it, "
     "i promised on the last line, cursor blinking. "
     "Blue light from the screen illuminating frost "
     "on the desk surface in front of it. "
     "Cinematic, cold, heartbreaking and frightening "
     "in equal measure."),

    ("M1-roboticslab-goodbye",
     "A university robotics lab, a young man standing "
     "before a large monitor, back to camera, "
     "fine grey ash rising from an open gold locket "
     "in his hand, the ash forming briefly into "
     "the suggestion of a human figure — a girl "
     "in an autumn jacket — before dispersing upward "
     "into nothing. Robots motionless around him. "
     "Frost on the floor melting. The monitors dark. "
     "Cinematic, magical realism style, deeply emotional."),

]
