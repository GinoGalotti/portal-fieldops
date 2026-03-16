# ─────────────────────────────────────────────────────────────────
# PORTAL — Image Generation Prompts
# Session 03: The Understudies
#
# Scene structure:
#   COLD OPEN       — Daniel Ashworth / Edmund, hospital ward
#   SCENE 1         — Theatre exterior, hospital investigation
#   SCENE 2         — The rehearsal, Clara's dressing room, BIM arrays
#   SCENE 3         — Loading bay, MESA confrontation
#   CLIMAX          — Saturday's performance, curtain up
# ─────────────────────────────────────────────────────────────────

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
    "outdoor_day": (
        "Overcast British daylight. "
        "Flat even light, no hard shadows. "
        "Slightly desaturated palette."
    ),
    "dusk": (
        "Late afternoon fading to dusk. "
        "Long shadows. Warm amber light giving way to blue-grey. "
        "Streetlights just beginning to glow."
    ),
    "theatre": (
        "Theatre interior lit by a combination of stage lighting and house lights. "
        "Rich warm tones on stage, cooler air above the stalls. "
        "The specific quality of a working rehearsal space — functional, worn, alive."
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

    # ── COLD OPEN — Hospital Ward ─────────────────────────────────

    ("M3-daniel-hospital", build(
        "An NHS hospital side room. Daytime, grey light through the window.\n"
        "A young man in his mid-twenties sits upright in the hospital bed,\n"
        "hands folded on the covers.\n"
        "He is not ill-looking. He is composed.\n"
        "His posture is very still — the studied stillness of someone trained to hold a room.\n\n"
        "A woman in her mid-thirties sits in the chair beside him.\n"
        "She is still in her coat. A handbag on her lap. A book she has not opened.\n"
        "She is looking at him with an expression that is trying very hard\n"
        "not to be frightened.\n\n"
        "The man in the bed is smiling — warmly, genuinely, as if everything is fine.\n"
        "It does not help.\n\n"
        "Medium shot from the doorway. Clinical light. Absolutely ordinary room.",
        "indoor",
    )),


    # ── SCENE 1 — Theatre Exterior / Investigation ────────────────

    ("M3-theatre-exterior", build(
        "The exterior of a small regional repertory theatre on a British high street.\n"
        "Victorian brick building, a marquee above the entrance:\n"
        "THE TWO GENTLEMEN OF VERONA — THIS WEEKEND ONLY.\n\n"
        "The front-of-house is not yet open.\n"
        "The box office windows are dark.\n"
        "A few old posters in frames beside the entrance — production photographs,\n"
        "a cast list, a review quote.\n\n"
        "One poster is different: a black-bordered memorial notice for CLARA VOSS.\n"
        "A printed headshot. Flowers left beneath it, beginning to wilt.\n\n"
        "Wide shot from across the street. Overcast day. A single figure\n"
        "at the edge of frame near the stage door — watching.",
        "outdoor_day",
        "supernatural",
    )),


    # ── SCENE 2 — Rehearsal / Dressing Room / BIM Arrays ─────────

    ("M3-stage-act2", build(
        "Inside a working theatre, viewed from the wings.\n"
        "The stage is set for Act II of a Jacobean-era production:\n"
        "a minimal set — dark wood, a throne, candlelit sconces.\n\n"
        "Four actors in rehearsal clothes (no full costume) run through a scene.\n"
        "They are very good. The camera catches them from stage left,\n"
        "slightly behind the proscenium arch.\n\n"
        "The stage manager stands in the wings watching,\n"
        "clipboard lowered, not writing anything down.\n"
        "Her expression says she has seen something she cannot account for.\n\n"
        "Stage lighting only — warm gold on the actors, deep shadow in the wings.\n"
        "The auditorium beyond is dark and empty.",
        "theatre",
    )),

    ("M3-dressing-room", build(
        "A small dressing room in a working theatre.\n"
        "A name placard on the open door reads: C. VOSS.\n\n"
        "The room is partially in use as storage —\n"
        "boxes stacked against one wall, a rail of old costumes.\n"
        "But the dressing table remains untouched:\n"
        "a mirror framed with bare light bulbs, half of them off.\n"
        "A makeup tray. A script with handwritten margin notes.\n"
        "A single costume piece hanging on the back of the door.\n\n"
        "The room is empty of people.\n"
        "But there is a quality to the air — the specific quality of\n"
        "a room that has recently been occupied by someone you cannot see.\n\n"
        "Medium shot from the doorway. Single practical light source — the mirror bulbs.",
        "indoor",
        "supernatural",
    )),

    ("M3-bim-array-rig", build(
        "Looking up into the technical grid above a theatre stage.\n"
        "A complex tangle of lighting rigs, cables, and pipe battens.\n\n"
        "Among the genuine lighting equipment, three devices\n"
        "that do not belong: small matte grey boxes with mesh faces,\n"
        "secured to the pipe battens with cable ties.\n"
        "They look, almost, like lighting control units.\n"
        "They are not.\n\n"
        "One of them has a small LED indicator — not a standard indicator colour.\n"
        "It is actively recording.\n\n"
        "Close-medium shot looking steeply upward into the rig.\n"
        "Stage lighting from below creates complex cross-shadows.\n"
        "The devices are visible in the mid-frame — present but easy to miss.",
        "indoor",
        "supernatural",
    )),


    # ── SCENE 3 — Loading Bay / MESA ─────────────────────────────

    ("M3-loading-bay", build(
        "The loading bay at the back of a theatre. Evening.\n\n"
        "Two vehicles are parked: a plain white transit van and a dark estate car.\n"
        "No logos, no markings on either.\n\n"
        "Four people in dark civilian jackets stand near the vehicles.\n"
        "They have the posture of people who are used to waiting\n"
        "and do not find it difficult.\n"
        "They look exactly like private security contractors.\n\n"
        "A woman stands slightly apart from the others —\n"
        "a tablet under one arm, watching the stage door.\n"
        "She is very still. She is not waiting.\n"
        "She is already looking at the right place.\n\n"
        "Wide shot, from the direction of the stage door.\n"
        "The loading bay is lit by a single overhead industrial lamp.\n"
        "The vehicles are in partial shadow.",
        "indoor",
    )),


    # ── CLIMAX — Saturday's Performance ──────────────────────────

    ("M3-performance-curtain", build(
        "A sold-out theatre auditorium, viewed from the back of the stalls.\n\n"
        "Four hundred people sit in rows facing the stage.\n"
        "The house lights have just dimmed — that precise moment\n"
        "when the ambient noise drops and four hundred people\n"
        "simultaneously stop talking.\n\n"
        "The curtain is still closed.\n"
        "A warm golden light bleeds around its edges.\n\n"
        "The audience is expectant. Some lean forward slightly.\n"
        "None of them know what they are about to watch.\n\n"
        "The shot is from the back of the house, looking toward the stage.\n"
        "The audience fills the lower two-thirds of the frame.\n"
        "The lit curtain fills the upper third.",
        "theatre",
        "supernatural",
    )),


    # ── ARTEFACT — The Prompt Book ────────────────────────────────

    ("M3-prompt-book", build(
        "Extreme close-up of a 19th-century theatrical prompt book,\n"
        "displayed in a glass case on a pale wall.\n\n"
        "The book is open to a page of dense handwritten text:\n"
        "stage directions and margin annotations in a precise Victorian hand.\n"
        "Character names are underlined. Cues are marked in a different ink.\n\n"
        "The glass case has a small brass plaque below it,\n"
        "barely legible at this angle: PRIVATE COLLECTION — ON LOAN.\n\n"
        "The book looks old. It looks used.\n"
        "It does not look like a museum piece.\n"
        "It looks like something that has been handled\n"
        "by someone who needed it.\n\n"
        "The glass of the case reflects the foyer beyond — a theatre interior,\n"
        "production posters, a box office window.\n"
        "The reflection is faint. The book is the subject.",
        "closeup",
    )),

]
