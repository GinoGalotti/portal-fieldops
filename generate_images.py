"""
P.O.R.T.A.L — Image Generator
───────────────────────────────
Reads prompts from prompts.py and generates images using DALL-E 3.
Images are saved to /images/ and named exactly as specified in prompts.py.

SETUP (one time):
  1. pip install openai requests
  2. Paste your OpenAI API key below (get it from platform.openai.com)
  3. python generate_images.py

Already-generated images are skipped automatically, so re-running is safe.
"""

import os
import time
import requests
from openai import OpenAI
from dotenv import load_dotenv
from prompts import PROMPTS

load_dotenv()

# ── CONFIGURATION ──────────────────────────────────────────────────────────────

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise SystemExit("ERROR: OPENAI_API_KEY not found. Add it to your .env file.")

IMAGE_SIZE    = "1792x1024"   # landscape — good for scene reference art
                               # other options: "1024x1024" or "1024x1792"
IMAGE_QUALITY = "standard"    # "standard" ($0.04/img) or "hd" ($0.08/img)
DELAY_SECONDS = 13             # pause between requests (DALL-E 3: 5/min limit)

# ── PATHS ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR  = os.path.join(SCRIPT_DIR, "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── RUN ────────────────────────────────────────────────────────────────────────

client = OpenAI(api_key=API_KEY)

total    = len(PROMPTS)
skipped  = 0
generated = 0
failed   = 0

print(f"\nP.O.R.T.A.L Image Generator")
print(f"{'─' * 40}")
print(f"  Prompts loaded : {total}")
print(f"  Output folder  : {OUTPUT_DIR}")
print(f"  Quality        : {IMAGE_QUALITY}  ({IMAGE_SIZE})")
print(f"{'─' * 40}\n")

for i, (filename, prompt) in enumerate(PROMPTS, 1):
    filepath = os.path.join(OUTPUT_DIR, f"{filename}.png")
    prefix = f"[{i:02d}/{total}]"

    if os.path.exists(filepath):
        print(f"{prefix}  SKIP     {filename}.png  (already exists)")
        skipped += 1
        continue

    print(f"{prefix}  GENERATING  {filename}...", end="", flush=True)

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=IMAGE_SIZE,
            quality=IMAGE_QUALITY,
            n=1,
        )

        image_url = response.data[0].url
        image_data = requests.get(image_url).content

        with open(filepath, "wb") as f:
            f.write(image_data)

        print(f"  ✓  saved")
        generated += 1

    except Exception as e:
        print(f"  ✗  FAILED — {e}")
        failed += 1

    # Respect rate limit between requests (skip delay on last item)
    if i < total:
        time.sleep(DELAY_SECONDS)

# ── SUMMARY ────────────────────────────────────────────────────────────────────

print(f"\n{'─' * 40}")
print(f"  Generated : {generated}")
print(f"  Skipped   : {skipped}")
print(f"  Failed    : {failed}")
cost = generated * (0.08 if IMAGE_QUALITY == "hd" else 0.04)
print(f"  Est. cost : ${cost:.2f}")
print(f"{'─' * 40}\n")
