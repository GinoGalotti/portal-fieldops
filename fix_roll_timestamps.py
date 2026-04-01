"""
One-time script to backfill `created_at` on all existing rolls in D1.

Strategy:
  - Sessions WITH a transcript: keyword-match each roll's move_name against
    the transcript to find an approximate relative timestamp, then offset by
    the session's recording start time.
  - Sessions WITHOUT a transcript: linearly distribute rolls across the
    session window using start time + estimated duration.

Output:
  fix_roll_timestamps.sql  — review this, then apply with:
    wrangler d1 execute portal-db --remote --file=fix_roll_timestamps.sql

BEFORE RUNNING: apply migration 016 first —
    wrangler d1 execute portal-db --local  --file=workers/migrations/016_rolls_created_at.sql
    wrangler d1 execute portal-db --remote --file=workers/migrations/016_rolls_created_at.sql

Usage:
    python fix_roll_timestamps.py           # reads from --remote, writes fix_roll_timestamps.sql
    python fix_roll_timestamps.py --local   # reads from --local (safe dry-run)
"""

import json
import os
import re
import sys
import subprocess
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# CONFIG — fill in real session recording start times (UTC)
# ---------------------------------------------------------------------------

SESSION_CONFIG = {
    # M01 + M02 never used the feed — no rolls to backfill.
    # M03: Friday 2026-03-21, estimated ~19:00 CET (18:00 UTC).
    # Evidence: transcript says "tomorrow, Saturday" at 00:16:30; prep committed
    # 2026-03-18/19; context-sync committed 2026-03-20 14:39; post-session work
    # (Field Journals) committed 2026-03-24. Adjust start time if you know better.
    "M03": {"start": "2026-03-21 18:00:00", "hours": 4.0},
}

# Paths to merged transcripts (skip sessions with no transcript)
TRANSCRIPTS = {
    "M03": os.path.join("audio", "s03", "merged_transcript.txt"),
}

D1_DATABASE = "portal-db"
OUTPUT_SQL  = "fix_roll_timestamps.sql"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_STOPWORDS = {"a", "an", "the", "your", "under", "some", "bad", "big", "for",
              "out", "through", "to", "of", "at", "in", "on", "my", "with"}

def _move_keywords(move_name):
    # type: (str) -> List[str]
    words = re.sub(r"[^a-z0-9 ]", "", move_name.lower()).split()
    return [w for w in words if w not in _STOPWORDS and len(w) > 2]


def _parse_ts(ts_str):
    # type: (str) -> float
    """Convert HH:MM:SS transcript timestamp to seconds."""
    h, m, s = ts_str.split(":")
    return int(h) * 3600 + int(m) * 60 + int(s)


def load_transcript(path):
    # type: (str) -> List[Tuple[float, str, str]]
    """Return list of (seconds, speaker, text) from a merged transcript file."""
    entries = []
    pattern = re.compile(r"^\[(\d{2}:\d{2}:\d{2})\] \[([A-Z]+)\] (.+)$")
    with open(path, encoding="utf-8") as f:
        for line in f:
            m = pattern.match(line.strip())
            if m:
                entries.append((_parse_ts(m.group(1)), m.group(2), m.group(3)))
    return entries


def find_in_transcript(transcript, move_name):
    # type: (List[Tuple[float, str, str]], str) -> Optional[float]
    """
    Search for the best keyword match of move_name in the transcript.
    Returns the timestamp in seconds of the best match, or None.
    Prefers KEEPER lines (most reliable channel).
    """
    keywords = _move_keywords(move_name)
    if not keywords:
        return None

    best_score = 0
    best_ts = None
    best_is_keeper = False

    for (ts, speaker, text) in transcript:
        text_lower = text.lower()
        score = sum(1 for kw in keywords if kw in text_lower)
        if score == 0:
            continue
        is_keeper = (speaker == "KEEPER")
        # Prefer higher score; break ties by preferring KEEPER lines
        if (score > best_score) or (score == best_score and is_keeper and not best_is_keeper):
            best_score = score
            best_ts = ts
            best_is_keeper = is_keeper

    # Require at least half the keywords to match
    return best_ts if best_score >= max(1, len(keywords) // 2) else None


def to_utc_str(dt):
    # type: (datetime) -> str
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def fetch_rolls(use_local):
    # type: (bool) -> List[Dict]
    """Fetch all rolls with NULL created_at from D1 via wrangler CLI."""
    sql = "SELECT id, session, move_name FROM rolls WHERE created_at IS NULL ORDER BY id ASC"
    flag = "--local" if use_local else "--remote"
    proc = subprocess.run(
        ["wrangler", "d1", "execute", D1_DATABASE, flag, "--command", sql, "--json"],
        capture_output=True, text=True, timeout=60, shell=True,
    )
    if proc.returncode != 0:
        raise RuntimeError("wrangler error: " + proc.stderr.strip())
    data = json.loads(proc.stdout)
    return data[0].get("results", []) if data else []


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    use_local = "--local" in sys.argv
    target = "LOCAL" if use_local else "REMOTE"
    print(f"Fetching rolls with NULL created_at from D1 [{target}]...")

    rolls = fetch_rolls(use_local)
    print(f"  Found {len(rolls)} rolls to update.\n")

    if not rolls:
        print("Nothing to do — all rolls already have created_at.")
        return

    # All existing rolls have session=NULL (session field wasn't being sent at play time).
    # Treat them all as M03 — the only session that had a live feed.
    for r in rolls:
        if not r["session"] or r["session"] == "null":
            r["session"] = "M03"

    # Group by session
    by_session = {}  # type: Dict[str, List[Dict]]
    for r in rolls:
        by_session.setdefault(r["session"], []).append(r)

    # Pre-load transcripts
    transcripts = {}  # type: Dict[str, list]
    for key, path in TRANSCRIPTS.items():
        if os.path.exists(path):
            transcripts[key] = load_transcript(path)
            print(f"  Loaded transcript for {key}: {len(transcripts[key])} segments")
        else:
            print(f"  [WARNING] Transcript not found: {path}")

    updates = []  # type: List[Tuple[int, str]]

    for session_key, session_rolls in by_session.items():
        cfg = SESSION_CONFIG.get(session_key)
        if not cfg:
            print(f"  [SKIP] No config for session '{session_key}' — add it to SESSION_CONFIG")
            continue

        start_dt = datetime.strptime(cfg["start"], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        duration = timedelta(hours=cfg["hours"])
        transcript = transcripts.get(session_key)

        print(f"\nSession {session_key}: {len(session_rolls)} rolls, start={cfg['start']}")

        matched = 0
        interp  = 0
        n       = len(session_rolls)

        for i, roll in enumerate(session_rolls):
            move_name = roll.get("move_name", "")
            offset_sec = None

            if transcript:
                offset_sec = find_in_transcript(transcript, move_name)

            if offset_sec is not None:
                ts = start_dt + timedelta(seconds=offset_sec)
                matched += 1
                method = "match"
            else:
                frac = (i + 0.5) / n
                ts = start_dt + frac * duration
                interp += 1
                method = "interp"

            updates.append((roll["id"], to_utc_str(ts)))
            print(f"  #{roll['id']:4d}  [{method}]  {move_name:<35s}  -> {to_utc_str(ts)}")

        print(f"  Matched: {matched}  Interpolated: {interp}")

    # Write SQL
    apply_flag = "--local" if use_local else "--remote"
    lines = [
        "-- Auto-generated by fix_roll_timestamps.py",
        f"-- Apply with: wrangler d1 execute portal-db {apply_flag} --file={OUTPUT_SQL}",
        "",
    ]
    for roll_id, ts_str in updates:
        lines.append(f"UPDATE rolls SET created_at = '{ts_str}' WHERE id = {roll_id};")

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\nWrote {len(updates)} UPDATE statements to: {OUTPUT_SQL}")
    print(f"Review the file, then apply with:")
    print(f"  wrangler d1 execute portal-db {apply_flag} --file={OUTPUT_SQL}")


if __name__ == "__main__":
    main()
