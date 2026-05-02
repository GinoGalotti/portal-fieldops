# S04 — The Shōjō — Image Generation Prompts
# Use with: python generate_images.py S4-prompts
# Style targets: photorealistic-with-grain for evidence/setting; painterly-uncanny for the Shōjō.
# Colour palette: deep teals, sodium-amber, salt-water greys, rust-red accents.
# All images: 16:9 or 4:3, no text overlays, no watermarks.
# Output: images/<key>.png  (generate_images.py always writes to images/)

PROMPTS = [

    # ─── ESTABLISHING SHOTS ────────────────────────────────────────────

    ("s04-inner-harbor-afternoon", (
        "Baltimore Inner Harbor on a Friday afternoon in late October 2005, "
        "wide establishing shot from the south promenade looking northeast. "
        "Tourists in middle distance, working commercial quays in the far right, "
        "a converted Japanese-style barge with a small reception canopy moored at "
        "the easternmost mooring. Low autumn sun, slight haze rising off the water. "
        "Warm but melancholy atmosphere. Photographic, slight film grain, golden hour."
    )),

    ("s04-hosokawa-quay-dusk", (
        "Industrial container quay at Baltimore harbour at sunset, fog rolling in "
        "across stacked shipping containers. Sodium-vapour lamps just turning on, "
        "their light haloed in amber through dense fog. The fog has a faint sweetness to "
        "it, almost rice-like. Long sightlines between container stacks. Empty, tense, "
        "the moment before something happens. Photorealistic, cinematic widescreen, "
        "low contrast, muted teals and amber."
    )),

    ("s04-loading-bay-night", (
        "A concrete loading bay at a working dockyard at night. Single sodium-vapour "
        "lamp overhead, dense fog reducing visibility to twenty metres. Container stacks "
        "labelled D-7 and D-8 on either side of frame. Wooden pallet stacks, a parked "
        "forklift, the harbour edge with a three-metre drop into black water visible at "
        "the right. Empty. Charged. The setting for a confrontation. Photographic, "
        "high contrast, amber-on-teal, slight motion blur in the fog."
    )),

    # ─── KEY OBJECTS ───────────────────────────────────────────────────

    ("s04-six-casks", (
        "Six traditional Japanese cedar sake casks — taru — arranged in a wooden cradle "
        "row in a climate-controlled storage hold. Each cask is wrapped in straw matting, "
        "bound with bamboo hoops, painted with a different brewery mon (family crest). "
        "Five appear ordinary; one — slightly back-lit, with the faintest shimmer of "
        "warmth around it — sits in the centre. Studio lighting, warm wood tones, "
        "Japanese craft aesthetic, photographic, museum-piece composition."
    )),

    ("s04-tachibana-cask", (
        "Close shot of a single traditional Japanese cedar sake cask, taru, painted with "
        "the Tachibana brewery mon (a stylised mandarin orange branch). Bamboo bound, "
        "straw matting partially visible, the wood worn smooth at the lid. A faint warm "
        "haze rises from it, almost imperceptibly. Photographic, very shallow depth of "
        "field, museum-quality, slight unease."
    )),

    ("s04-brewers-letter", (
        "A single sheet of traditional Japanese washi paper, hand-written in elegant "
        "vertical Japanese calligraphy with sumi ink. The paper is slightly aged, its "
        "edges worn. A small red brewery seal (Tachibana mon) stamped at the bottom. "
        "Soft side-light, paper texture visible, melancholic and reverent atmosphere. "
        "Photographic, tabletop composition."
    )),

    # ─── NPCS ──────────────────────────────────────────────────────────

    ("s04-pulaski-portrait", (
        "A 51-year-old white American homicide detective at his desk in a 2005 Baltimore "
        "police precinct. Salt-and-pepper hair, jacket off, white shirt with sleeves "
        "rolled up, tie loosened. Tired but dignified. A manila folder open in front of "
        "him, three crime-scene photographs visible but unreadable. Fluorescent overhead "
        "lighting, stained ceiling tiles visible. Documentary-photographic, mid-2000s "
        "American police procedural aesthetic."
    )),

    ("s04-mariana-portrait", (
        "A 28-year-old Latina dockworker on her break behind a loading-office trailer at "
        "an industrial commercial port. High-visibility vest over a long-sleeved shirt, "
        "work boots, hard hat under one arm. Smoking a cigarette, leaning against the "
        "trailer. Confident posture but wary expression. Late afternoon light, "
        "container stacks blurred in background. Photographic, documentary style."
    )),

    ("s04-yuki-portrait", (
        "A 34-year-old Japanese woman, professional and composed, on the deck of a "
        "moored cultural-exchange barge. Tailored grey wool coat over a blouse, "
        "clipboard in one hand, a small earpiece. Confident, multilingual, "
        "the kind of person who runs operations in three languages. Inner Harbor "
        "Baltimore in the background, soft autumn light. Photographic, professional "
        "portrait, dignified."
    )),

    ("s04-veritas-grunt", (
        "A short, broad white man in his mid-thirties wearing plain dark tactical "
        "gear without insignia, standing on a foggy industrial dockyard at night. "
        "Comm earpiece visible, dark jacket, tactical vest, no firearm drawn. "
        "Hands visible. Forearm tattoo half-glimpsed under sleeve. Calm, professional, "
        "the kind of man who used to be in a uniform he was proud of. Sodium-amber "
        "lighting from above, dense fog, photographic, cinematic."
    )),

    # ─── THE CREATURE ──────────────────────────────────────────────────
    # Note: the Shōjō's exact appearance is player-defined canon. These prompts
    # establish the baseline (tall, red, swaying, singing in fog) without
    # over-specifying. Generate sparingly; better to let the players define.

    ("s04-shojo-glimpse", (
        "Indistinct, foreboding figure glimpsed between shipping containers in dense "
        "fog at night. Tall — taller than the containers — with a sense of slow swaying "
        "movement. Deep weathered cinnabar red robes or skin (ambiguous). The figure is "
        "mostly silhouette, partially obscured by fog, uncertain in proportion. The fog "
        "around it has a faint warm quality. Painterly, uncanny, Studio Ghibli meets "
        "Kurosawa, NOT cute, NOT cartoonish, melancholic and ancient. "
        "DO NOT specify face details. Atmospheric and ambiguous."
    )),

    # ─── EVIDENCE ──────────────────────────────────────────────────────

    ("s04-third-stool", (
        "Interior of a working-class American neighbourhood bar, dim, lived-in. "
        "Old wooden bar with stools in a row, third stool from one end conspicuously "
        "empty while others are occupied. Framed Orioles photographs from the eighties "
        "on the wall. Slightly sticky floor. A bottle of beer untouched at the empty "
        "stool's place. Photographic, atmospheric, melancholic. Mid-2000s aesthetic."
    )),

    ("s04-pier5-bench", (
        "An old wooden public bench at the very end of a fishing pier, facing east "
        "toward a calm grey harbour. Small bronze plaque on the bench reading 'for "
        "those who watch the water'. Initials EW + DW carved into the back of the "
        "seat. Empty. Late afternoon light, slight melancholy, the kind of place a "
        "person comes to grieve. Photographic, soft focus."
    )),

]
