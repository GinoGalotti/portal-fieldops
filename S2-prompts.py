# ─────────────────────────────────────────────────────────────────
# PORTAL — Image Generation Prompts
# Session 02: Something That Wants To Be Known
#
# Scene structure:
#   THE HOOK        — Lab briefing, anchor protocol
#   COLD OPEN       — Arthur Okafor on the street
#   SCENE 1         — The perimeter, the estate agent's office
#   SCENE 2         — Deep in the zone, palimpsest, the loop
#   SCENE 3         — 14 Aldermoor Crescent, the construction site
#   CLIMAX          — The entity, the contact, the resolution
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

    # ── THE HOOK — Lab Briefing ───────────────────────────────────

    ("S2-lab-campbell-briefing", build(
        "Interior of a private research lab briefing room.\n"
        "A long dark table dominates the centre.\n"
        "A large central monitor on the wall displays a topographic street map\n"
        "with concentric rings radiating from a single point.\n"
        "Green data text surrounds the map. A small blinking cursor at the bottom.\n\n"
        "The text on screen reads: CLASSIFICATION: TOPOGRAPHICAL DISTORTION CLASS 2.\n\n"
        "The room is empty of people.\n"
        "Low overhead lighting, a pool of green light from the screen on the table surface.\n\n"
        "Wide symmetrical shot from the doorway.",
    )),

    ("S2-lab-anchor-objects", build(
        "A dark wooden table surface.\n"
        "Four small personal objects laid out in a row, slightly spaced apart.\n"
        "A worn cassette tape. A printed photograph folded once.\n"
        "A short length of knotted rope. A coin with a hole punched through it.\n\n"
        "Each object sits in a small pool of warm light from above.\n"
        "The table surface is otherwise in shadow.\n\n"
        "Extreme close-up, very shallow depth of field.\n"
        "Still life composition — the objects feel deliberate, chosen.",
        "closeup",
    )),


    # ── COLD OPEN — Arthur Okafor ─────────────────────────────────

    ("S2-arthur-morning-walk", build(
        "A quiet residential street in a British suburb, early morning.\n"
        "Terraced Victorian houses line both sides.\n"
        "An older Black man, seventies, walks a slow old greyhound on a lead.\n"
        "He is dressed neatly in a coat and flat cap.\n"
        "His posture is upright but unhurried.\n\n"
        "The street is completely normal.\n"
        "Morning mist sits low between the houses.\n"
        "The pavement is slightly damp.\n\n"
        "Wide shot, looking down the street toward him.\n"
        "He is small in the frame but central. The street stretches ahead.",
        "outdoor_day",
    )),

    ("S2-arthur-lost", build(
        "A quiet residential street in a British suburb.\n"
        "An older Black man, seventies, stands perfectly still on the pavement.\n"
        "He is looking around him with an expression of patient, bewildered concentration.\n"
        "Not frightened — just deeply, wrongly uncertain.\n\n"
        "A slow old greyhound sits at his feet and will not move.\n\n"
        "The street looks ordinary. The houses are correct. The light is normal.\n"
        "But something in the composition is subtly wrong —\n"
        "the perspective is slightly inconsistent, as if the street is longer than it should be.\n\n"
        "Medium shot. He is centred. The street recedes oddly behind him.",
        "outdoor_day",
        "supernatural",
    )),

    ("S2-arthur-on-the-wall", build(
        "A quiet residential street. Mid-morning.\n\n"
        "An older Black man, seventies, sits on a low garden wall\n"
        "outside an unfamiliar front garden.\n"
        "His coat is buttoned. His greyhound lies at his feet, calm.\n"
        "He sits with the patient stillness of someone who has decided\n"
        "that sitting quietly is the right response to an unreasonable situation.\n\n"
        "He is not distressed. He is waiting.\n\n"
        "Medium shot, slightly low angle. Morning light.",
        "outdoor_day",
    )),


    # ── SCENE 1 — The Perimeter ───────────────────────────────────

    ("S2-aldermoor-exterior", build(
        "Establishing shot of a British residential district on an overcast day.\n"
        "Victorian terraced houses, parked cars, a corner shop with shutters half-down.\n"
        "Normal in every visible detail.\n\n"
        "The street is noticeably quiet. No pedestrians. No children.\n"
        "A few net curtains in upstairs windows.\n"
        "A hand-lettered sign taped to a lamppost: NO ENTRY — RESIDENT REPORTS.\n\n"
        "Wide shot from outside the district, looking in.\n"
        "The street extends away. Overcast light flattens everything slightly.",
        "outdoor_day",
    )),

    ("S2-boundary-felt", build(
        "A residential pavement in a British suburb. Overcast day.\n\n"
        "A person has stopped walking at the edge of the pavement\n"
        "and is standing very still.\n"
        "They are facing away from camera, looking down the street.\n"
        "Their posture suggests they have noticed something — a hesitation,\n"
        "a subtle wrongness they can't name.\n\n"
        "The street ahead looks completely ordinary.\n"
        "There is no visible difference between the pavement where they stand\n"
        "and the pavement ahead. That is the point.\n\n"
        "Medium shot, looking past the figure down the street.",
        "outdoor_day",
        "supernatural",
    )),

    ("S2-estate-agent-exterior", build(
        "A vacant estate agent's shopfront on a British high street.\n"
        "Glass frontage with old property listings still in the window, faded by sun.\n"
        "The signage reads: ALDERMOOR PROPERTY SERVICES.\n"
        "A Closed / No longer trading notice on the door.\n\n"
        "The interior is visible through the glass — stripped but not empty.\n"
        "Filing cabinets still visible inside. The outline of a whiteboard on the wall.\n\n"
        "Overcast daylight. The street is quiet.",
        "outdoor_day",
    )),

    ("S2-estate-agent-whiteboard", build(
        "Interior of a vacated estate agent's office.\n\n"
        "A large whiteboard on the wall, covered in a hand-drawn street map.\n"
        "Streets are labelled. At each address, a date has been written in marker pen.\n"
        "The dates form a pattern — a spiral of acquisitions tracking inward from the edges.\n"
        "The most recent dates are at the centre.\n\n"
        "The office is otherwise stripped — empty desk, filing cabinets, abandoned printer.\n"
        "Overcast light through the glass frontage.\n\n"
        "Medium shot, looking straight at the whiteboard.\n"
        "The map fills most of the frame.",
        "indoor",
    )),

    ("S2-shredded-email", build(
        "Extreme close-up of a document in a jammed office shredder.\n\n"
        "The paper is partially shredded — the top quarter remains legible.\n"
        "Text is visible in plain business email format.\n"
        "The words SPECIMEN ALD-1 are legible in the body text.\n"
        "The sender's email domain — @helixboundary.com — is visible in the header.\n\n"
        "Shredder teeth visible at the bottom of the frame.\n"
        "Dim office light. Shallow depth of field.",
        "closeup",
    )),


    # ── SCENE 2 — Deep In ────────────────────────────────────────

    ("S2-zone-interior", build(
        "A residential street in a British suburb. Overcast day.\n\n"
        "The street looks completely ordinary — terraced houses, cars, pavements.\n"
        "But the perspective is subtly wrong.\n"
        "The street is slightly too long. A turning on the left appears twice.\n"
        "The far end does not resolve to a junction — it just continues.\n\n"
        "Empty of people.\n\n"
        "Wide shot, looking down the street. The disorientation is geometric, not visual.",
        "outdoor_day",
        "supernatural",
    )),

    ("S2-string-lines", build(
        "A residential street in a British suburb.\n\n"
        "A length of white string runs along the pavement,\n"
        "tied at intervals to front garden gates and railings.\n"
        "It disappears around a corner into the distance.\n\n"
        "The string is practical, recent — someone made this deliberately.\n"
        "It is the only sign of human activity on an otherwise empty street.\n\n"
        "Medium shot, following the string down the pavement.\n"
        "Overcast light. Quiet.",
        "outdoor_day",
    )),

    ("S2-palimpsest-street", build(
        "A residential street in a British suburb, late afternoon.\n\n"
        "The street is physically real and present.\n"
        "But faintly overlaid on it — like a double exposure, or a reflection in still water —\n"
        "is an earlier version of the same street:\n"
        "a terrace where a garden now stands,\n"
        "a telephone box on a corner where there is now only pavement,\n"
        "a shop frontage that is also a house.\n\n"
        "The overlay is faint. Not ghostly — more like architectural memory.\n"
        "The physical street is dominant. The earlier version is there if you look.\n\n"
        "Wide shot. The doubled image is strongest in the middle distance.",
        "outdoor_day",
        "supernatural",
    )),

    ("S2-chalk-arrow", build(
        "Extreme close-up of chalk writing on a British pavement.\n\n"
        "A single arrow, drawn in white chalk, pointing in a clear direction.\n"
        "The chalk is recent but not fresh — a few days old, still legible.\n"
        "Beside the arrow, a small notation in neat handwriting:\n"
        "THIS WAY OUT — confirmed 3x.\n\n"
        "The pavement is damp. The chalk is slightly blurred at the edges.\n"
        "Very shallow depth of field. The pavement stretches blurred behind it.",
        "closeup",
    )),

    ("S2-vera-doorstep", build(
        "A front doorstep of a Victorian terraced house.\n\n"
        "A woman in her sixties stands in the doorway.\n"
        "She is holding a ball of string — one end trailing behind her into the house,\n"
        "the other extending out across the front garden to the gate.\n"
        "She looks at the street with the composed expression of someone\n"
        "who has made a practical decision about an impractical situation.\n\n"
        "A tabby cat sits in the garden, completely at ease.\n\n"
        "Medium shot from the pavement, looking up at the door.\n"
        "Overcast light.",
        "outdoor_day",
    )),


    # ── SCENE 3 — 14 Aldermoor Crescent ──────────────────────────

    ("S2-margaret-house-exterior", build(
        "A semi-detached Victorian house on a quiet residential street.\n"
        "Aldermoor Crescent — the house number 14 just visible on the gate.\n\n"
        "The house is tidy and clearly inhabited: curtains drawn but not shut,\n"
        "a milk bottle on the step, a light on in the hall visible through the glass.\n\n"
        "The surrounding street looks slightly wrong.\n"
        "The house itself appears more solid than its surroundings —\n"
        "more real, somehow, as if it is the fixed point and everything else is slightly loose.\n\n"
        "Wide shot from the street. Dusk light.",
        "dusk",
        "supernatural",
    )),

    ("S2-margaret-interior", build(
        "Interior of a lived-in Victorian sitting room. Evening.\n\n"
        "A woman in her seventies sits in an armchair by a window.\n"
        "She is reading — or has been reading; the book is closed on her lap.\n"
        "She is looking out the window at the street with an expression\n"
        "of complete and settled calm.\n\n"
        "The room is warm and filled with fifty years of accumulated objects:\n"
        "books, photographs, a small clock on the mantelpiece.\n"
        "Everything exactly where it has always been.\n\n"
        "Warm lamp light. Evening. The window beyond is a rectangle of dusk.",
        "indoor",
    )),

    ("S2-construction-site-fence", build(
        "The perimeter fence of an abandoned urban construction site. Dusk.\n\n"
        "Metal hoarding panels, grey and weathered.\n"
        "A handwritten notice: DANGER — EXCAVATION — NO UNAUTHORISED ENTRY.\n\n"
        "Through a gap in the hoarding, the excavation is partially visible:\n"
        "a construction site office, a site lamp still running on a timer,\n"
        "the dark mouth of the excavation beyond it.\n\n"
        "At the base of the fence, a small bundle: a foil-wrapped food parcel.\n"
        "Left there deliberately. Very recently.\n\n"
        "Wide shot, looking along the fence line. Dusk light.",
        "dusk",
    )),

    ("S2-diane-site-office", build(
        "Interior of a small portable construction site office. Night.\n\n"
        "A woman in her fifties sits at a folding table.\n"
        "She is writing in a notebook — a dense, careful hand.\n"
        "A sleeping bag is visible on the floor. A torch. An empty flask.\n\n"
        "The notebook is open to a page filled with observations and a hand-drawn map.\n"
        "Her posture is focused, composed — someone who has been here a long time\n"
        "and has decided to make herself useful while she waits.\n\n"
        "The site lamp outside glows through the small window.\n"
        "Warm interior light from a battery lantern on the desk.",
        "indoor",
    )),

    ("S2-diane-notebook", build(
        "Extreme close-up of a handwritten notebook, open on a table.\n\n"
        "Left page: a detailed hand-drawn map of a residential street grid.\n"
        "Streets are marked with times and brief notes:\n"
        "worse at dusk, ok after 10am, avoid Aldermoor Gardens entirely.\n\n"
        "Right page: a sketch of an excavation wall cross-section.\n"
        "The substrate layer is hatched differently from the soil above it.\n"
        "In the margin, the words: like a threshold — not a door, but the memory of one.\n\n"
        "Neat, practical handwriting. The pages are slightly damp at the edges.\n"
        "Warm lantern light from the left.",
        "closeup",
    )),

    ("S2-excavation-substrate", build(
        "A construction site excavation at night.\n\n"
        "A deep trench cut through British soil and clay.\n"
        "The upper layers are ordinary — dark soil, rubble, Victorian foundations.\n"
        "Below them, a stratum of different material is exposed:\n"
        "not rock, not clay — something between the two,\n"
        "with a faint internal quality, as if it holds something.\n"
        "It does not glow. It does not move. It is simply different in a way\n"
        "that cannot be explained by geology.\n\n"
        "Close-medium shot, looking down into the trench wall.\n"
        "A site lamp on a stand illuminates the section from above.\n"
        "The anomalous stratum is in the lower third of the frame.",
        "supernatural",
    )),


    # ── CLIMAX — The Entity and the Contact ───────────────────────

    ("S2-entity-felt", build(
        "A residential street in a British suburb at dusk.\n\n"
        "The street is empty and completely still.\n"
        "No wind. No movement.\n\n"
        "The air itself has a quality of attention —\n"
        "as if the street is aware of itself,\n"
        "as if the houses and pavements and front gardens are not just observed but observing.\n\n"
        "Nothing is physically wrong. Everything is exactly in place.\n"
        "That is the problem.\n\n"
        "Wide shot looking down the street. The perspective is perfectly still.",
        "dusk",
        "supernatural",
    )),

    ("S2-contact-moment", build(
        "A residential street at dusk.\n\n"
        "A person stands alone in the middle of the road.\n"
        "They have stopped walking. Their anchor object — a small thing, held loosely —\n"
        "has been placed deliberately on the ground at their feet.\n"
        "They are not afraid. They are very still.\n\n"
        "Around them, the street shifts slightly in that quality of doubled memory:\n"
        "the houses present and also earlier, the road present and also older.\n"
        "The overlay is gentle, not violent.\n\n"
        "Wide shot. The figure is small and centred.\n"
        "The street extends to both sides, layered in the light.",
        "dusk",
        "supernatural",
    )),

    ("S2-entity-neighbourhood", build(
        "A residential district seen from above — rooftops, gardens, streets.\n\n"
        "The neighbourhood is ordinary in every detail.\n"
        "Victorian terraces, a park, a corner shop, parked cars.\n\n"
        "But superimposed on it, visible only as the faintest impression,\n"
        "are all the earlier versions of itself:\n"
        "the original field, the first houses, the streets as they were built,\n"
        "decade by decade, all occupying the same space simultaneously.\n"
        "The layers are faint. The present is dominant.\n"
        "The depth is enormous.\n\n"
        "Aerial or high crane shot. Dusk. Overcast sky above.",
        "dusk",
        "supernatural",
    )),


    # ── RESOLUTION ───────────────────────────────────────────────

    ("S2-diane-found", build(
        "A residential street in a British suburb. Early morning.\n\n"
        "A woman in her fifties walks along the pavement.\n"
        "She is carrying a notebook under one arm and a sleeping bag under the other.\n"
        "Her clothes are practical and slightly worn from days of use.\n"
        "She is walking steadily, purposefully — she knows exactly where she is.\n\n"
        "She looks tired, but not frightened.\n"
        "She is almost smiling.\n\n"
        "Medium shot from ahead, looking toward her.\n"
        "Morning light. The street is normal.",
        "outdoor_day",
    )),

    ("S2-margaret-stays", build(
        "Interior of a Victorian sitting room. Evening.\n\n"
        "A woman in her seventies stands at her front window.\n"
        "The street outside is quiet. The streetlights are on.\n"
        "She is watching the street with the expression of someone\n"
        "who has known this view for fifty years and intends to know it for fifty more.\n\n"
        "The room behind her is warm. The clock on the mantelpiece is ticking.\n"
        "Everything exactly where it has always been.\n\n"
        "Medium shot from behind, looking past her through the window.",
        "indoor",
    )),

    ("S2-arthur-home", build(
        "A residential street in a British suburb. Morning.\n\n"
        "An older Black man, seventies, walks his greyhound\n"
        "along a pavement he has walked for forty-one years.\n"
        "Left out of the gate, past the postbox, right at the phone box.\n"
        "He moves without hesitation.\n\n"
        "The street is ordinary and completely familiar.\n"
        "He is home.\n\n"
        "Wide shot. He is walking away from camera.\n"
        "The street ahead curves gently in morning light.",
        "outdoor_day",
    )),

]
