"""
Session audio transcription script using OpenAI Whisper.
Transcribes split tracks individually, then merges into a single interleaved transcript.
Also transcribes the mixed track for quality comparison.
Fetches rolls + messages for the session from D1 (via wrangler CLI) and writes feed-log.txt.
If RECORDING_START is set, also writes merged-timeline.txt interleaving feed messages AND rolls
(those with a non-NULL created_at) into the transcript by wall-clock offset.

Usage: python transcribe_session.py
Edit the config block below as needed.
"""

import json
import os
import re
import subprocess
import whisper
from datetime import datetime, timezone

# --- Config ---
MODEL           = "large-v3"
AUDIO_DIR       = os.path.join("audio", "s03")
SPLIT_DIR       = os.path.join(AUDIO_DIR, "split")
MIXED_FILE      = os.path.join(AUDIO_DIR, "mixed.flac")
MERGED_OUTPUT   = os.path.join(AUDIO_DIR, "merged_transcript.txt")
LANGUAGE        = "en"

# D1 feed export
SESSION_KEY     = "M03"       # value stored in rolls.session / messages.session_id
D1_DATABASE     = "portal-db"
FEED_LOG_OUTPUT = os.path.join(AUDIO_DIR, "feed-log.txt")

# Set to "YYYY-MM-DD HH:MM:SS" (UTC) to enable time-aligned merged timeline.
# This is the wall-clock time when the recording started.
# Rolls have no timestamp so they always go in feed-log.txt only.
RECORDING_START = None        # e.g. "2026-03-22 19:00:00"
MERGED_TIMELINE_OUTPUT = os.path.join(AUDIO_DIR, "merged-timeline.txt")
# --------------


def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}"


def speaker_from_filename(filename: str) -> str:
    """Extract speaker name from filename like '1-alan.flac' → 'ALAN'"""
    name = os.path.splitext(filename)[0]
    name = re.sub(r"^\d+-", "", name)
    return name.upper()


def transcribe_file(model, audio_path: str, output_path: str, speaker: str = None) -> list:
    """
    Transcribe a single audio file and write timestamped text to output_path.
    Returns list of (start_seconds, speaker, text) tuples for merging.
    """
    print(f"  Transcribing: {audio_path}")
    result = model.transcribe(audio_path, language=LANGUAGE, verbose=False)

    segments = []
    lines = []
    for seg in result["segments"]:
        ts = format_timestamp(seg["start"])
        text = seg["text"].strip()
        if speaker:
            if len(text.split()) < 3:
                continue  # skip noise artifacts (single words, filler dots, etc.)
            lines.append(f"[{ts}] {text}")
            segments.append((seg["start"], speaker, text))
        else:
            lines.append(f"[{ts}] {text}")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"  → Saved: {output_path}")
    return segments


# ---------------------------------------------------------------------------
# D1 feed helpers
# ---------------------------------------------------------------------------

_OUTCOME_LABEL = {
    "advanced": "★ ADVANCED (12+)",
    "hit":      "✓ HIT (10-11)",
    "partial":  "~ PARTIAL (7-9)",
    "miss":     "✗ MISS (6-)",
}


def fetch_d1(sql: str) -> list:
    """Run a SQL query against the remote D1 database via wrangler CLI."""
    try:
        proc = subprocess.run(
            ["wrangler", "d1", "execute", D1_DATABASE, "--remote",
             "--command", sql, "--json"],
            capture_output=True, text=True, timeout=60,
        )
        if proc.returncode != 0:
            print(f"  [wrangler error] {proc.stderr.strip()}")
            return []
        data = json.loads(proc.stdout)
        return data[0].get("results", []) if data else []
    except Exception as e:
        print(f"  [D1 fetch failed] {e}")
        return []


def _format_roll(r: dict) -> str:
    outcome = _OUTCOME_LABEL.get(r.get("outcome", ""), r.get("outcome", "?"))
    hunter  = r.get("hunter_id") or "unknown"
    stat    = r.get("stat_used") or ""
    dice    = f"{r.get('roll_1','?')}+{r.get('roll_2','?')}"
    mod     = r.get("modifier", 0)
    if mod:
        dice += f"{mod:+d}"
    note = f"  — {r['note']}" if r.get("note") else ""
    return f"[ROLL #{r['id']}] {hunter} — {r['move_name']} ({stat}): {dice} = {r['total']} → {outcome}{note}"


def _format_message(m: dict) -> str:
    ts     = m.get("delivered_at", "?")
    sender = m.get("sender", "?")
    mtype  = m.get("type", "message")
    body   = m.get("body", "")
    if mtype == "message":
        return f"[{ts}] {sender}: {body}"
    label = f"[{ts}] [{mtype.upper()}] {sender}"
    if body:
        label += f": {body}"
    payload_raw = m.get("payload")
    if payload_raw:
        try:
            p = json.loads(payload_raw) if isinstance(payload_raw, str) else payload_raw
            for key in ("label", "subject", "from_", "content"):
                if key in p:
                    label += f" | {p[key]}"
                    break
        except Exception:
            pass
    return label


def write_feed_log(rolls: list, messages: list) -> None:
    lines = []
    if rolls:
        lines.append(f"=== ROLLS ({len(rolls)}) ===\n")
        for r in rolls:
            lines.append(_format_roll(r))
        lines.append("")
    if messages:
        lines.append(f"=== MESSAGES & HANDOUTS ({len(messages)}) ===\n")
        for m in messages:
            lines.append(_format_message(m))
    with open(FEED_LOG_OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  → Saved: {FEED_LOG_OUTPUT}")


def write_merged_timeline(all_segments: list, messages: list, rolls: list = None) -> None:
    """Interleave transcript segments with feed messages and timestamped rolls."""
    start_dt = datetime.strptime(RECORDING_START, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
    start_ts = start_dt.timestamp()

    events = []

    # Transcript segments (offset in seconds from recording start)
    for (offset_sec, speaker, text) in all_segments:
        events.append((start_ts + offset_sec, "transcript", speaker, text, offset_sec))

    # Feed messages (wall-clock → offset)
    for m in messages:
        ts_str = m.get("delivered_at", "")
        if not ts_str:
            continue
        try:
            dt = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        offset_sec = dt.timestamp() - start_ts
        label = _format_message(m).split("] ", 1)[-1]  # strip the [timestamp] prefix
        events.append((dt.timestamp(), "feed", None, label, offset_sec))

    # Rolls with non-NULL created_at (backfilled via fix_roll_timestamps.py)
    for r in (rolls or []):
        ts_str = r.get("created_at", "")
        if not ts_str:
            continue
        try:
            dt = datetime.strptime(ts_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except ValueError:
            continue
        offset_sec = dt.timestamp() - start_ts
        label = _format_roll(r)
        events.append((dt.timestamp(), "roll", None, label, offset_sec))

    events.sort(key=lambda x: x[0])

    lines = []
    for (_, kind, speaker, text, offset_sec) in events:
        if offset_sec < -60:
            continue  # skip anything more than 1 min before recording
        ts = format_timestamp(max(0, offset_sec))
        if kind == "transcript":
            lines.append(f"[{ts}] [{speaker}] {text}")
        elif kind == "roll":
            lines.append(f"[{ts}] [ROLL] {text}")
        else:
            lines.append(f"[{ts}] [FEED] {text}")

    with open(MERGED_TIMELINE_OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  → Saved: {MERGED_TIMELINE_OUTPUT}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"Loading Whisper model '{MODEL}'...")
    model = whisper.load_model(MODEL)
    print("Model loaded.\n")

    # --- Transcribe split tracks ---
    all_segments = []

    split_files = sorted(f for f in os.listdir(SPLIT_DIR) if f.endswith(".flac"))
    print(f"Found {len(split_files)} split tracks:")
    for f in split_files:
        print(f"  {f}")
    print()

    for filename in split_files:
        speaker = speaker_from_filename(filename)
        audio_path = os.path.join(SPLIT_DIR, filename)
        output_path = os.path.join(SPLIT_DIR, os.path.splitext(filename)[0] + ".txt")
        segments = transcribe_file(model, audio_path, output_path, speaker=speaker)
        all_segments.extend(segments)
        print()

    # --- Write merged transcript ---
    print("Building merged transcript...")
    all_segments.sort(key=lambda x: x[0])

    merged_lines = []
    for start, speaker, text in all_segments:
        ts = format_timestamp(start)
        merged_lines.append(f"[{ts}] [{speaker}] {text}")

    with open(MERGED_OUTPUT, "w", encoding="utf-8") as f:
        f.write("\n".join(merged_lines))
    print(f"  → Saved: {MERGED_OUTPUT}\n")

    # --- Transcribe mixed ---
    print("Transcribing mixed track (for comparison)...")
    mixed_output = os.path.join(AUDIO_DIR, "mixed.txt")
    transcribe_file(model, MIXED_FILE, mixed_output)
    print()

    # --- Fetch feed data from D1 ---
    print(f"Fetching feed data for session '{SESSION_KEY}' from D1 (remote)...")
    rolls    = fetch_d1(f"SELECT * FROM rolls    WHERE session    = '{SESSION_KEY}' ORDER BY id ASC")
    messages = fetch_d1(f"SELECT * FROM messages WHERE session_id = '{SESSION_KEY}' AND delivered = 1 ORDER BY id ASC")
    print(f"  Rolls: {len(rolls)} | Messages/handouts: {len(messages)}")
    write_feed_log(rolls, messages)

    if RECORDING_START:
        timestamped_rolls = [r for r in rolls if r.get("created_at")]
        print(f"Building merged timeline (transcript + feed messages + {len(timestamped_rolls)} timestamped rolls)...")
        write_merged_timeline(all_segments, messages, rolls)
        print()

    print("\nDone!")
    print(f"  Split transcripts : {SPLIT_DIR}/*.txt")
    print(f"  Merged transcript : {MERGED_OUTPUT}")
    print(f"  Mixed transcript  : {mixed_output}")
    print(f"  Feed log          : {FEED_LOG_OUTPUT}")
    if RECORDING_START:
        print(f"  Merged timeline   : {MERGED_TIMELINE_OUTPUT}")


if __name__ == "__main__":
    main()
