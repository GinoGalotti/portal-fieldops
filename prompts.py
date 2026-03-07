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
Cinematic film still, shot on 35mm film.

{scene}

Wide cinematic composition.
Realistic lighting motivated by the environment.

Photorealistic cinematic photography.
Subtle film grain.

Mood: grounded realism, quiet tension.

No CGI, no digital painting, no illustration, no stylized lighting.\
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
        "Exterior of a discreet private research building at dusk.\n"
        "Brutalist concrete architecture partially covered in ivy.\n"
        "No signage visible.\n\n"
        "Tall narrow windows glowing with warm amber light.\n"
        "A plain steel door with a single security camera above it.\n\n"
        "An empty car park in the foreground.\n"
        "Wet asphalt reflecting the orange streetlights.\n"
        "Light fog rolling in from a nearby treeline.\n\n"
        "Wide establishing shot, low camera angle.\n"
        "Foreground asphalt in focus, building slightly softened in depth.\n\n"
        "Sodium vapor lighting mixed with cool dusk sky.",
    )),

    ("lab-briefing-room", build(
        "Interior of a private research lab briefing room.\n"
        "A long black table dominates the centre.\n"
        "Multiple monitors on the walls display green-tinted data and topographic maps.\n"
        "One large central screen shows a pulsing waveform.\n\n"
        "Shot from the doorway looking in.\n"
        "Wide angle, symmetrical composition.\n\n"
        "Low overhead lighting, pools of warm light on the table.\n"
        "Walls lined with acoustic panels and whiteboards covered in equations.\n\n"
        "No people present.",
    )),

    ("lab-campbell-core", build(
        "A server room deep underground.\n"
        "Floor-to-ceiling glass-encased processors emit cool blue and white light.\n"
        "Dense cables run across the ceiling like veins.\n\n"
        "A faint human silhouette is visible through the glass.\n"
        "Ambiguous — could be a reflection, or something more.\n"
        "Condensation on the glass surface.\n\n"
        "Medium shot, looking down the length of the room.\n"
        "Dominated by cool blue and white light from the processors.",
        "supernatural",
    )),

    ("lab-campbell-screen", build(
        "Extreme close-up of a dark monitor screen.\n"
        "Green monospace text on a black background.\n"
        "A single blinking cursor in the terminal.\n\n"
        "Lines of anomaly report data half-visible.\n"
        "The words CLASS 2 ECTOPLASMIC RESIDUE visible in the text.\n\n"
        "Soft green glow reflecting off the desk surface below.\n"
        "The room beyond the screen is completely dark.\n\n"
        "Very shallow depth of field.",
    )),

    # ── COLD OPEN — Marcus in the Car Park ───────────────────────

    ("M1-carpark-before", build(
        "A university car park at night.\n"
        "Sodium yellow streetlights cast orange pools on wet tarmac.\n"
        "Wet asphalt reflecting the orange light.\n\n"
        "A lone young man in a hoodie walks alone through the lot.\n"
        "Hands in pockets, slightly unsteady gait.\n\n"
        "Distant brutalist university buildings in the background.\n"
        "One lit window visible far away.\n\n"
        "Wide shot, medium distance.\n"
        "Completely ordinary. The calm before something goes wrong.",
    )),

    ("M1-carpark-figure", build(
        "A university car park at night.\n\n"
        "A young woman stands perfectly still at the far end of the lot.\n"
        "She wears an autumn jacket.\n"
        "Her face is obscured by shadow.\n"
        "Fine grey ash falls around her like slow snow.\n\n"
        "The sodium streetlights above her are flickering and dying, one by one, left to right.\n"
        "The near end of the lot remains lit and normal.\n\n"
        "Wide shot from the near end, looking toward her.\n"
        "She is very far away but the eye is drawn to her immediately.",
        "supernatural",
    )),

    ("M1-carpark-aftermath", build(
        "A university car park at night.\n\n"
        "A young man sits slumped against a concrete wall.\n"
        "He is visibly shaken.\n"
        "A cracked phone lies beside him on the wet ground.\n"
        "Fine grey ash is dusted across his jacket.\n"
        "The temples of his hair have turned slightly grey.\n\n"
        "His eyes are wide open, staring at nothing.\n\n"
        "A distant security torch beam cuts through fog in the background.\n\n"
        "Medium shot, low camera angle.\n"
        "Sodium streetlight overhead.",
    )),

    # ── SCENE 1 — Keller University Campus ───────────────────────

    ("M1-campus-coldspot", build(
        "A university corridor during the day.\n"
        "Natural daylight from windows along one side.\n"
        "Students walking normally in the background.\n\n"
        "In the foreground, one student has stopped walking.\n"
        "She has pulled her coat tighter around herself.\n"
        "Her breath is just barely visible as a faint mist.\n\n"
        "A faint smear of grey ash on one locker door nearby.\n"
        "Nobody else has noticed anything.\n\n"
        "Medium shot, looking down the corridor.",
        "supernatural",
    )),

    ("M1-campus-noticeboard", build(
        "Extreme close-up of a university notice board.\n"
        "Layered with flyers, timetables, and printed notices.\n\n"
        "In the centre, a single printed disciplinary notice.\n"
        "Partially obscured by other papers.\n"
        "The name Kovacs Balint just visible in the text.\n\n"
        "A small grey ash smudge on one corner of the notice.\n\n"
        "Shallow depth of field. Surrounding papers soft and out of focus.\n"
        "Indoor fluorescent lighting.",
    )),

    # ── SCENE 2 — Bálint's Dorm Room ─────────────────────────────

    ("M1-dorm-shrine", build(
        "A small improvised shrine on a student dormitory desk.\n\n"
        "A framed photograph of a young woman smiling in autumn light.\n"
        "A dried flower leaning against the frame.\n"
        "A handwritten birthday card in a foreign language.\n"
        "A small gold locket resting on a folded cloth at the centre.\n\n"
        "Lit by a single desk lamp.\n"
        "Warm, intimate light. Deep shadows at the edges.\n\n"
        "Extreme close-up, still life composition.\n"
        "Mood: quiet grief.",
    )),

    ("M1-dorm-locket", build(
        "Extreme close-up of a small gold oval locket, lying open on dark fabric.\n\n"
        "Inside one half: a tiny rolled note with handwritten text.\n"
        "Inside the other half: fine grey ash, carefully preserved.\n\n"
        "The locket appears warm — soft golden light emanates from it.\n\n"
        "Black background.\n"
        "Very shallow depth of field.",
    )),

    ("M1-dorm-wallmap", build(
        "Close-up of a hand-drawn annotation on a printed satellite map.\n"
        "The map is pinned to a dormitory wall.\n\n"
        "A red circle drawn around a stretch of road.\n"
        "The word miert written in neat pen handwriting beside it.\n\n"
        "Surrounding papers on the wall visible but out of focus.\n"
        "Shallow depth of field.\n"
        "Dim indoor ambient light.",
    )),

    ("M1-dorm-notes", build(
        "Close-up of university physics notes on paper.\n\n"
        "The main text contains equations and diagrams, written normally.\n"
        "The margins are filled with the same phrase repeated over and over:\n"
        "Eszter, kerlek, menj el.\n\n"
        "The handwriting begins neat and orderly at the top.\n"
        "It becomes increasingly unsteady and desperate further down the page.\n\n"
        "Shallow depth of field. Warm desk lamp light.",
    )),

    # ── INTERLUDE — Bálint on the Footbridge ─────────────────────

    ("M1-balint-footbridge", build(
        "A pedestrian footbridge between university buildings at night.\n\n"
        "A young man sits on the railing of the bridge.\n"
        "He is perfectly still, looking at nothing.\n"
        "A small gold locket hangs outside his shirt on a chain.\n\n"
        "He looks exhausted — not dramatic, just worn down.\n"
        "Someone who has been carrying something too heavy for too long.\n\n"
        "Campus lights glow softly below. Sodium streetlight overhead.\n\n"
        "Medium shot. He is centred but small in the frame.",
    )),

    # ── SCENE 3 — The Robotics Lab ────────────────────────────────

    ("M1-roboticslab-empty", build(
        "A university robotics lab in a basement, at night.\n\n"
        "Four large competition robots are arranged in a circle, facing inward.\n"
        "All motionless.\n\n"
        "Standby monitors on the walls cast a dim blue glow.\n"
        "A large monitor on the back wall shows only a single blinking cursor.\n\n"
        "Frost in thin lines across the concrete floor.\n\n"
        "Wide shot, looking across the room at the robots.\n"
        "No people present.",
        "supernatural",
    )),

    ("M1-roboticslab-screen", build(
        "Extreme close-up of a dark monitor screen in a basement robotics lab.\n\n"
        "Green terminal text appears line by line:\n"
        "they hurt him\n"
        "i only wanted to protect him\n"
        "i promised\n\n"
        "A blinking cursor at the end.\n\n"
        "Frost crystals visible on the desk surface in front of the monitor.\n"
        "Blue-green light from the screen illuminates the frost.\n\n"
        "Very shallow depth of field.",
        "supernatural",
    )),

    ("M1-roboticslab-goodbye", build(
        "A university robotics lab at night.\n\n"
        "A young man stands before a large dark monitor, his back to camera.\n"
        "In his outstretched hand, a small gold locket lies open.\n\n"
        "Fine grey ash rises from the locket.\n"
        "The ash forms briefly into the faint suggestion of a human figure — "
        "a girl in an autumn jacket — before dispersing upward into nothing.\n\n"
        "The competition robots stand motionless around him.\n"
        "Frost on the floor is melting.\n"
        "The monitors are dark.\n\n"
        "Wide shot, low camera angle. He is small in the frame.",
        "supernatural",
    )),

]
