"""
P.O.R.T.A.L — Image Generator
-------------------------------
Reads prompts from prompts.py and generates images using gpt-image-1.
Images are saved to /images/ and named exactly as specified in prompts.py.

SETUP (one time):
  1. pip install requests python-dotenv
  2. Add your OpenAI API key to .env as OPENAI_API_KEY
  3. python generate_images.py

Already-generated images are skipped automatically, so re-running is safe.
"""

import os
import sys
import base64
import time
import importlib
import requests
from dotenv import load_dotenv

# Optional: pass a prompts module name as the first argument.
# Defaults to "prompts" (the original prompts.py).
# Example: python generate_images.py S2-prompts
_prompts_module = sys.argv[1].replace(".py", "") if len(sys.argv) > 1 else "prompts"
PROMPTS = importlib.import_module(_prompts_module).PROMPTS

load_dotenv()

# -- CONFIGURATION --------------------------------------------------------------

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise SystemExit("ERROR: OPENAI_API_KEY not found. Add it to your .env file.")

IMAGE_SIZE    = "1536x1024"   # landscape — gpt-image-1 supported size
                               # other options: "1024x1024" or "1024x1536"
IMAGE_QUALITY = "medium"      # "low", "medium", or "high"
DELAY_SECONDS = 0              # gpt-image-1 has higher rate limits

# -- PATHS ----------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR  = os.path.join(SCRIPT_DIR, "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -- RUN ------------------------------------------------------------------------

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

total     = len(PROMPTS)
skipped   = 0
generated = 0
failed    = 0

print(f"\nP.O.R.T.A.L Image Generator")
print(f"{'-' * 40}")
print(f"  Prompts loaded : {total}")
print(f"  Output folder  : {OUTPUT_DIR}")
print(f"  Quality        : {IMAGE_QUALITY}  ({IMAGE_SIZE})")
print(f"{'-' * 40}\n")

for i, (filename, prompt) in enumerate(PROMPTS, 1):
    filepath = os.path.join(OUTPUT_DIR, f"{filename}.png")
    prefix = f"[{i:02d}/{total}]"

    if os.path.exists(filepath):
        print(f"{prefix}  SKIP     {filename}.png  (already exists)")
        skipped += 1
        continue

    print(f"{prefix}  GENERATING  {filename}...", end="", flush=True)

    try:
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=HEADERS,
            json={
                "model": "gpt-image-1",
                "prompt": prompt,
                "size": IMAGE_SIZE,
                "quality": IMAGE_QUALITY,
                "n": 1,
            },
        )
        response.raise_for_status()
        image_b64 = response.json()["data"][0]["b64_json"]
        image_data = base64.b64decode(image_b64)

        with open(filepath, "wb") as f:
            f.write(image_data)

        print(f"  saved")
        generated += 1

    except Exception as e:
        print(f"  FAILED — {e}")
        failed += 1

    # Respect rate limit between requests (skip delay on last item)
    if i < total:
        time.sleep(DELAY_SECONDS)

# -- SUMMARY --------------------------------------------------------------------

print(f"\n{'-' * 40}")
print(f"  Generated : {generated}")
print(f"  Skipped   : {skipped}")
print(f"  Failed    : {failed}")
cost_per_img = {"low": 0.011, "medium": 0.042, "high": 0.167}.get(IMAGE_QUALITY, 0.042)
cost = generated * cost_per_img
print(f"  Est. cost : ${cost:.2f}")
print(f"{'-' * 40}\n")
