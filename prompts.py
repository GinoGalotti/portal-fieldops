# ─────────────────────────────────────────────────────────────────
# PORTAL — Image Generation Prompts
#
# HOW TO ADD A NEW IMAGE:
#   1. Write the core scene in plain language
#   2. Tag it with the relevant add-ons from ADDONS below
#   3. Run generate_images.py — only new images are generated
#
# AVAILABLE TAGS:
#   "supernatural"   — subtle paranormal implication, visually grounded
#   "indoor"         — practical light sources, soft shadow falloff
#   "outdoor_night"  — wet ground, mist, realistic urban/campus lighting
#   "closeup"        — intimate still life, very shallow depth of field
# ─────────────────────────────────────────────────────────────────

# ── TEMPLATE ──────────────────────────────────────────────────────

TEMPLATE = """\
Cinematic film still.

{scene}

Environment grounded in everyday realism.
Ordinary architecture, believable materials, natural imperfections.

Lighting is naturalistic and motivated by the environment
(e.g. daylight, fluorescent lights, sodium street lamps, desk lamps).

Shot as realistic photography:
50mm lens, shallow depth of field, subtle film grain,
cinematic composition, soft focus falloff.

Colour grading subtle and natural,
slightly desaturated tones, cool and amber balance.

Mood: quiet tension, grounded realism, slightly unsettling but believable.

Photorealistic cinematic photography, documentary film still aesthetic.

No fantasy art, no illustration style, no exaggerated lighting,
no surrealism, no text artifacts, no visual distortion.\
"""

# ── ADD-ONS ────────────────────────────────────────────────────────

ADDONS = {
    "supernatural": (
        "Subtle supernatural implication but visually grounded in reality. "
        "Nothing overtly fantastical."
    ),
    "indoor": (
        "Interior lit by practical light sources visible in scene. "
        "Soft shadow falloff."
    ),
    "outdoor_night": (
        "Wet ground reflecting light, "
        "atmospheric haze or mist, "
        "realistic urban lighting."
    ),
    "closeup": (
        "Intimate still life photography, "
        "very shallow depth of field, "
        "soft warm lighting."
    ),
}


def build(scene, *tags):
    """Assemble a full prompt from a scene description and optional tags."""
    prompt = TEMPLATE.format(scene=scene.strip())
    for tag in tags:
        prompt += "\n\n" + ADDONS[tag]
    return prompt


# ── PROMPTS ────────────────────────────────────────────────────────
# Format: ("filename", build("scene description", "tag1", "tag2"))

PROMPTS = [

    # ── THE LAB ──────────────────────────────────────────────────

    ("lab-exterior", build(
        "Exterior of a discreet private research building at dusk. "
        "Brutalist architecture softened by ivy, no signage visible, "
        "warm amber light from tall narrow windows, a single security "
        "camera above a plain steel door, empty car park, fog rolling "
        "in from a treeline. No people.",
        "outdoor_night",
    )),

    ("lab-briefing-room", build(
        "Interior of a sleek private research lab briefing room. "
        "Long black table, multiple monitors displaying green-tinted "
        "data readouts and topographic maps, one large central screen "
        "showing a pulsing waveform, low overhead lighting with pools "
        "of warm light, walls lined with acoustic panels and whiteboards "
        "covered in equations. Shot from the doorway looking in. No people.",
        "indoor",
    )),

    ("lab-campbell-core", build(
        "A quantum computing server room deep underground. "
        "Cool blue and white light emanating from floor-to-ceiling "
        "glass-encased processors, cables like veins running across "
        "the ceiling, a faint human silhouette visible inside the glass "
        "— ambiguous, could be reflection or something more. "
        "Condensation on the glass. Eerie, beautiful, slightly tragic.",
        "indoor",
        "supernatural",
    )),

    ("lab-campbell-screen", build(
        "Close-up of a dark monitor screen displaying a terminal interface. "
        "Green monospace text on black background, a single blinking cursor, "
        "lines of anomaly report data half-visible, "
        "the words CLASS 2 ECTOPLASMIC RESIDUE visible in the text. "
        "Soft green glow reflecting on a desk surface. Dark room beyond.",
        "indoor",
        "closeup",
    )),

    # ── COLD OPEN — Marcus in the Car Park ───────────────────────

    ("M1-carpark-before", build(
        "A university car park at night. Sodium yellow lighting, "
        "wet tarmac reflecting orange light, a lone young man "
        "in a hoodie walking alone, hands in pockets, slightly "
        "unsteady. Distant brutalist university buildings, "
        "one lit window far away. Quiet, isolated, completely normal. "
        "The calm before something wrong.",
        "outdoor_night",
    )),

    ("M1-carpark-figure", build(
        "A university car park at night. A young woman standing "
        "perfectly still at the far end of the lot, wearing an "
        "autumn jacket, face obscured by shadow, fine grey ash "
        "falling around her like snow. The sodium lights above "
        "her are flickering and dying one by one from left to right. "
        "The near end of the lot is normal. She is not.",
        "outdoor_night",
        "supernatural",
    )),

    ("M1-carpark-aftermath", build(
        "A young man sitting against a concrete wall in a university "
        "car park at night, visibly shaken, cracked phone beside him, "
        "fine grey ash dusted across his jacket, temples of his hair "
        "slightly greyed. Eyes wide open, staring at nothing. "
        "A distant security torch beam cuts through the fog.",
        "outdoor_night",
    )),

    # ── SCENE 1 — Keller University Campus ───────────────────────

    ("M1-campus-coldspot", build(
        "A university corridor during the day. Students walking normally "
        "in background, but in the foreground one student has stopped "
        "and pulled their coat tighter, breath just barely visible as mist. "
        "A faint smear of grey ash on one locker door. "
        "Nobody else has noticed. Natural daylight from windows.",
        "indoor",
        "supernatural",
    )),

    ("M1-campus-noticeboard", build(
        "Close-up of a university notice board, layered with "
        "flyers and timetables. In the centre a single printed "
        "disciplinary notice half-obscured by other papers, "
        "the name Kovacs Balint just visible. "
        "One corner has a small grey ash smudge.",
        "indoor",
        "closeup",
    )),

    # ── SCENE 2 — Bálint's Dorm Room ─────────────────────────────

    ("M1-dorm-shrine", build(
        "A small improvised shrine on a student dormitory desk. "
        "A framed photograph of a young woman smiling in autumn light, "
        "a dried flower, a handwritten birthday card in a foreign language, "
        "a small gold locket resting on a folded cloth at the centre. "
        "Warm, sad, intimate. Lit by a single desk lamp.",
        "indoor",
        "closeup",
    )),

    ("M1-dorm-locket", build(
        "Extreme close-up of a small gold oval locket lying open "
        "on dark fabric. Inside one half a tiny rolled note "
        "with handwritten text, the other half containing fine grey ash. "
        "The locket appears warm — suggested through soft golden light. "
        "Black background.",
        "indoor",
        "closeup",
    )),

    ("M1-dorm-wallmap", build(
        "Close-up of a hand-drawn annotation on a printed satellite map "
        "pinned to a dormitory wall. A red circle around a stretch of road, "
        "the word miert written in pen beside it in neat handwriting. "
        "Surrounding papers visible but out of focus.",
        "indoor",
        "closeup",
    )),

    ("M1-dorm-notes", build(
        "Close-up of university physics notes on paper. "
        "Equations and diagrams in the main text, but the margins "
        "are filled with the same phrase written over and over "
        "in increasingly unsteady handwriting: Eszter, kerlek, menj el. "
        "The handwriting starts neat and becomes more desperate "
        "further down the page.",
        "indoor",
        "closeup",
    )),

    # ── INTERLUDE — Bálint on the Footbridge ─────────────────────

    ("M1-balint-footbridge", build(
        "A young man sitting on the railing of a pedestrian footbridge "
        "between university buildings at night. Campus lights below. "
        "Not in danger — just utterly still, looking at nothing, "
        "a gold locket visible around his neck outside his shirt. "
        "He looks exhausted, not dramatic. Someone who has been "
        "carrying something too heavy for too long.",
        "outdoor_night",
    )),

    # ── SCENE 3 — The Robotics Lab ────────────────────────────────

    ("M1-roboticslab-empty", build(
        "A university robotics lab basement at night. "
        "Blue glow from standby monitors, four large competition robots "
        "arranged in a circle facing inward, motionless. "
        "Frost on the concrete floor in thin lines. "
        "One large monitor on the back wall showing only a blinking cursor. "
        "Nobody present.",
        "indoor",
        "supernatural",
    )),

    ("M1-roboticslab-screen", build(
        "Close-up of a dark monitor screen in a robotics lab at night. "
        "Green terminal text visible line by line: "
        "they hurt him — i only wanted to protect him — i promised. "
        "Cursor blinking. Blue light from the screen "
        "illuminating frost crystals on the desk surface in front of it.",
        "indoor",
        "supernatural",
        "closeup",
    )),

    ("M1-roboticslab-goodbye", build(
        "A university robotics lab at night. A young man standing "
        "before a large monitor, back to camera. "
        "Fine grey ash rising from an open gold locket in his hand, "
        "the ash forming briefly into the suggestion of a human figure "
        "— a girl in an autumn jacket — before dispersing upward into nothing. "
        "Robots motionless around him. Frost on the floor melting. "
        "The monitors dark.",
        "indoor",
        "supernatural",
    )),

]
