---
name: moneybot-voice-speak
description: Free, fully-local outbound voice (text-to-speech) for any agent. Renders agent replies as Telegram voice notes using Piper TTS — no API key, no per-character costs. Pairs with moneybot-voice-transcribe for full voice-in / voice-out conversations.
version: 1.0.0
metadata: { "openclaw": { "emoji": "🔊" } }
---

# MoneyBot — Voice out (free / local TTS)

## Context

Before anything else, load `product-context/state/operator.json` — the operator's defaults, thresholds, disclaimers, and active cohort. Treat those values as authoritative unless the user overrides them in-message.

Use this skill whenever the user asks for a **spoken reply**, a **voice briefing**, or otherwise opts into voice (e.g. they messaged via Telegram voice note, or said "tell me out loud", "send as voice", "voice update", "speak it").

Engine: **Piper TTS** (Rhasspy). Fully local, no API key, free for any volume. Voices are neural ONNX models (~25–80 MB each) downloaded on first install.

## When to use it

| User signal                                                       | Action                                                  |
|-------------------------------------------------------------------|---------------------------------------------------------|
| User sent a Telegram voice note                                   | Reply via voice (round-trip voice conversation)         |
| "Send the briefing as voice" / "voice update" / "speak it"        | Render reply through `speak.sh`                         |
| Daily briefing / weekly review with `--send-voice` flag           | Convert briefing text to voice before delivery          |
| Long text-only reply that user said is hard to read on the go     | Offer voice version proactively                         |
| User explicitly opts out ("text only", "no voice")                | Stop using until they re-enable                         |

## Setup (one-time)

```bash
# Installs piper-tts in an isolated venv at ~/.openclaw/voice/venv
# and downloads the default voice models (~190 MB total) to ~/.openclaw/voice/models/
bash scripts/voice/install-piper.sh
```

Default voices installed:

- `en_US-ryan-high` — warm male baritone (Capital Bot / cfo-bot)
- `en_US-amy-medium` — friendly female (default for moneybot-* agents)
- `en_US-lessac-medium` — neutral newscaster (general fallback)

To add more voices (browse [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices)):

```bash
bash scripts/voice/install-piper.sh --voice en_US-libritts_r-medium
bash scripts/voice/install-piper.sh --list
```

## Commands

### Speak a message into a Telegram chat (one-shot)

```bash
bash scripts/voice/speak.sh --text "Cash is 14,558. Net cashflow positive." --agent cfo-bot
bash scripts/voice/speak.sh -f briefing.txt --agent cfo-bot --speed 1.05
echo "from stdin" | bash scripts/voice/speak.sh - --agent moneybot-curator
```

`--agent` selects both the **voice profile** (e.g. cfo-bot → ryan-high) and the **Telegram bot account** that sends the message (so cfo-bot speaks via @your-cfo-bot, not the main bot).

### Render-only (no send)

```bash
bash scripts/voice/tts.sh --text "Hello world" --out /tmp/hi.ogg
bash scripts/voice/tts.sh -f reply.txt --voice en_US-ryan-high --out /tmp/cfo.ogg
bash scripts/voice/tts.sh --text "Hi" --wav --out /tmp/hi.wav    # raw WAV instead of opus
```

### Send a pre-rendered file

```bash
bash scripts/voice/send-telegram-voice.sh /tmp/hi.ogg --account cfo-bot
bash scripts/voice/send-telegram-voice.sh /tmp/song.mp3 --account default --caption "track"
```

`.ogg` / `.opus` files are sent via `sendVoice` (waveform UI). Other formats use `sendAudio`.

## Voice cloning (F5-TTS)

When the operator wants the bot to **sound like a specific person** (their own voice, a co-host, a custom character), use F5-TTS with a short reference recording. Zero-shot — no training, just one ~15-30s reference per voice.

```bash
# 1. One-time engine install (~1.5 GB Python deps + first-run model ~700 MB)
bash scripts/voice/install-f5.sh

# 2a. Record fresh from the Mac mic (uses ffmpeg avfoundation)
bash scripts/voice/record-voice.sh --name kahlil --duration 25

# 2b. ...or import an existing recording (m4a / wav / mp3 etc.)
bash scripts/voice/clone-voice.sh --name kahlil --audio ~/Desktop/voice.m4a

# 3. Register & auto-transcribe via faster-whisper
bash scripts/voice/clone-voice.sh --name kahlil

# 4. Quick test (renders a fixed sentence in the cloned voice)
bash scripts/voice/clone-voice.sh --name kahlil --test

# 5. Use it
bash scripts/voice/speak.sh --text "Hello." --voice clone:kahlil --account cfo-bot

# 6. Make it the default for one agent...
bash scripts/voice/clone-voice.sh --name kahlil --set-agent cfo-bot
# ...or for ALL agents
bash scripts/voice/clone-voice.sh --name kahlil --set-default
```

Once `--set-default` is on, `voice_for_agent` returns `clone:kahlil` for every agent unless overridden via `VOICE_OVERRIDE_<AGENT>=<voice>` or per-call `--voice <other>`.

## Microsoft VibeVoice (optional advanced model)

If the operator asks for “Microsoft's new open source voice model,” “VibeVoice,”
“real-time voice,” or “streaming voice,” treat that as a real integration path,
not as an impossible request.

Verified public metadata:

- Repository: `microsoft/VibeVoice`
- License: MIT
- VibeVoice is a family of open-source voice AI models with TTS and ASR variants.
- `VibeVoice-Realtime-0.5B` is described as a lightweight real-time TTS model with streaming text input and robust long-form speech generation.
- `VibeVoice-ASR` is described as available through Hugging Face Transformers.

Default behavior:

1. Continue using Piper/F5 for current production voice output until VibeVoice is explicitly installed and tested.
2. Route setup/integration work to `moneybot-code`; do not let non-code agents claim they cannot help.
3. Ask before installing dependencies, downloading model weights, changing default voices, or enabling any real-time/streaming pathway.
4. Mention verified constraints only: Python/model dependencies and hardware/runtime requirements may be significant; exact local install steps must be checked from the upstream repo before execution.

Reference-audio guidance for clean clones:

- 15–30 seconds of natural speech (longer ≠ better past ~30s)
- Quiet room, no music / TV / fan noise
- Mic 6–12 inches from your mouth
- Speak naturally — the clone mimics your delivery, including pace, inflection, and any "uh"s
- One speaker only

Files written per clone (under `~/.openclaw/voice/clones/<name>/`):

| File             | Purpose                                                    |
|------------------|------------------------------------------------------------|
| `raw.wav`        | Original recording (untouched)                             |
| `ref.wav`        | Trimmed (≤25s), normalized 24kHz mono — what F5 ingests    |
| `transcript.txt` | Exact words said in `ref.wav` (Whisper-generated)          |
| `profile.json`   | Engine, model, source, duration, language, version         |

Performance on M-series Macs: first inference downloads the F5_v1 base model (~700 MB) into `~/.cache/huggingface/`. Subsequent inferences are ~3-8s of compute per ~10s of generated audio (CPU/MPS). Each render is fully local — no audio leaves your machine.

## Per-agent voice map

Defined in `scripts/voice/_lib.sh::voice_for_agent`. Override per-call with `--voice <model>` or globally via env: `VOICE_OVERRIDE_CFO_BOT=en_US-amy-medium`.

| Agent                         | Default voice              | Character           |
|-------------------------------|----------------------------|---------------------|
| `cfo-bot` (Capital Bot)       | `en_US-ryan-high`          | Warm male           |
| `moneybot-content-voice`      | `en_US-libritts_r-medium`  | Multi-speaker       |
| `moneybot-curator`            | `en_US-amy-medium`         | Friendly female     |
| `moneybot-trend-analyst`      | `en_US-amy-medium`         | Friendly female     |
| `moneybot-personalization`    | `en_US-amy-medium`         | Friendly female     |
| `moneybot-scheduler-publisher`| `en_US-amy-medium`         | Friendly female     |
| `moneybot-telemetry`          | `en_US-amy-medium`         | Friendly female     |
| `moneybot-adaptation`         | `en_US-amy-medium`         | Friendly female     |
| `moneybot-capital`            | `en_US-amy-medium`         | Friendly female     |
| `moneybot-code` (GameDesign)  | `en_US-amy-medium`         | Friendly female     |
| (anything else)               | `en_US-lessac-medium`      | Neutral newscaster  |

## Composing with the transcription skill

For full voice-to-voice loops, pair with `moneybot-voice-transcribe`:

1. User sends voice note → `transcribe-local-whisper.py` returns text
2. Agent processes text per its normal skills + safety rules
3. Reply rendered via `speak.sh --agent <id>` and delivered as a Telegram voice note

## Voice content rules

- **Spoken text ≠ written text.** Strip markdown, emoji, URLs, code fences, and tables before sending to TTS — they read aloud poorly. Keep numbers, replace `$14,558.52` with `fourteen thousand five hundred fifty-eight dollars` when natural, or just `$14,558` for brevity.
- **Keep voice replies short** — under 60 seconds is ideal. Long monologues lose the user. If output is long, send a short voice summary + the full text as a follow-up message.
- **Re-attach safety disclaimers in voice form** for moneybot-* agents (educational only). Capital Bot is operator-only and may give personalized advice.
- **Never speak secrets, tokens, full account numbers, or full transaction memos** — summarize.

## Failure modes

- **Piper not installed** → `tts.sh` falls back to macOS `say` (lower quality, still functional). Tell the user to run `bash scripts/voice/install-piper.sh` for high-quality voices.
- **Voice model not downloaded** → script tells user the install command for that specific voice.
- **ffmpeg missing** → `brew install ffmpeg`.
- **Telegram account not found** → falls back to the `default` bot account; warn user if the agent's dedicated bot wasn't configured.

## Hard guardrails

- This skill **only renders** what the calling agent asks for; it does not generate content. The calling agent is still responsible for safety filtering, disclaimers, and personalization rules.
- Voice files are written to `~/.openclaw/voice/cache/` and deleted by `speak.sh` after send (use `--keep` to retain).
- No voice data is sent to any third party — Piper inference is fully local.
