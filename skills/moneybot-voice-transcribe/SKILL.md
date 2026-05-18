---
name: moneybot-voice-transcribe
description: Free local voice-to-text transcription for Telegram voice notes and audio attachments using faster-whisper.
version: 1.0.0
metadata: { "openclaw": { "emoji": "🎙️" } }
---

# MoneyBot - Voice to text (free/local)

## Context

Before anything else, load `product-context/state/operator.json` — the operator's defaults, thresholds, disclaimers, and active cohort. Treat those values as authoritative unless the user overrides them in-message.

Use this skill whenever a user sends a voice note or other audio attachment.

## Goal

- Produce a clean transcript before answering the user.
- Keep this local and free (no paid API transcription).

## Command

Run:

`python3 scripts/transcribe-local-whisper.py --input "<AUDIO_FILE_PATH>" --json`

If language is known, add:

`--language en`

## Setup (one-time)

Install dependency:

`python3 -m pip install --user faster-whisper`

If the host cannot decode Telegram audio, install ffmpeg:

- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt-get install -y ffmpeg`

## Output handling

1. Read `text` from JSON output.
2. If transcript is empty/noisy, ask user to resend with less noise.
3. Respond to user based on transcript content, while preserving MoneyBot safety rules.
4. If confidence seems poor, include a short confirmation: "I heard: ... Is that right?"

## Safety

- Educational content only.
- Never give personalized buy/sell/hold advice.
- Escalate sensitive or unsafe topics for human review flow where applicable.
