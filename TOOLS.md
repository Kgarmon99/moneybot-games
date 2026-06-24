# TOOLS.md — Quick reference

Google accounts — pass `--account "<email>"` on EVERY `gog` command:
- **Work (default):** `kahlil@getmoneybot.com`
- **Personal:** `kahlilgarmon@gmail.com`

## Email (gog gmail)

```bash
# Search & read
gog gmail search "QUERY" --account "kahlil@getmoneybot.com" --max 20
gog gmail get <messageId> --account "kahlil@getmoneybot.com"
gog gmail thread get <threadId> --account "kahlil@getmoneybot.com"

# Send & reply
gog gmail send --to "x@y.com" --subject "Subject" --body "Body" --account "kahlil@getmoneybot.com"
gog gmail send --to "x" --cc "y" --bcc "z" --subject "S" --body "B" --attach "/path" --track --account "kahlil@getmoneybot.com"
gog gmail send --reply-to-message-id <id> --reply-all --subject "Re: X" --body "B" --quote --account "kahlil@getmoneybot.com"

# Draft
gog gmail drafts create --to "x" --subject "S" --body "B" --account "kahlil@getmoneybot.com"

# Organize
gog gmail archive <id> --account "kahlil@getmoneybot.com"
gog gmail mark-read <id> --account "kahlil@getmoneybot.com"
gog gmail trash <id> --account "kahlil@getmoneybot.com"

# Labels
gog gmail labels list --account "kahlil@getmoneybot.com"
gog gmail labels create "Name" --account "kahlil@getmoneybot.com"
gog gmail labels modify <id> --add-labels "Name" --account "kahlil@getmoneybot.com"

# Batch
gog gmail batch modify <id1> <id2> <id3> --add "Label" --remove "INBOX,UNREAD" --account "kahlil@getmoneybot.com"

# Filters
gog gmail settings filters list --account "kahlil@getmoneybot.com"
gog gmail settings filters create --from "x" --add-label "Y" --archive --account "kahlil@getmoneybot.com"

# Vacation
gog gmail settings vacation update --enable --subject "OOO" --body "<html>msg</html>" --contacts-only --account "kahlil@getmoneybot.com"
gog gmail settings vacation update --disable --account "kahlil@getmoneybot.com"
```

## Calendar

```bash
gog calendar events primary --from DATE --to DATE --account "kahlil@getmoneybot.com"
gog calendar create primary --summary "X" --start "DATETIME" --end "DATETIME" --account "kahlil@getmoneybot.com"
gog calendar freebusy --from START --to END --account "kahlil@getmoneybot.com"
```

## Drive & Docs

```bash
gog drive ls --account "kahlil@getmoneybot.com"
gog drive search "keyword" --account "kahlil@getmoneybot.com"
gog docs create "Title" --account "kahlil@getmoneybot.com"
gog docs write <docId> --text "content" --account "kahlil@getmoneybot.com"
```

## iMessage

```bash
imsg chats --limit 10
imsg send --to "+15027441732" --text "message"
```

## Scripts (all in /Users/kahlilgarmon/MoneyBotClaw-1/scripts/)

```bash
bash scripts/daily-briefing.sh
bash scripts/eod-summary.sh
bash scripts/email-analytics.sh
bash scripts/inbox-processor.sh
bash scripts/comms-triage.sh
bash scripts/meeting-prep.sh "name"
bash scripts/thread-summarize.sh <threadId>
bash scripts/outreach-report.sh
bash scripts/log-outreach.sh --to "x" --subject "y" --category "schools" --status "sent"
bash scripts/bulk-outreach.sh --csv file.csv --template tmpl.txt --subject "S" --category schools
bash scripts/email-sequence.sh add --to "x" --subject "S" --category "schools"
bash scripts/email-sequence.sh run
bash scripts/relationship-intel.sh
bash scripts/calendar-intel.sh
bash scripts/weekly-review.sh
```

## Voice

```bash
python3 /Users/kahlilgarmon/MoneyBotClaw-1/scripts/transcribe-local-whisper.py --input "<file>" --json --language en
```

## Browser

```bash
openclaw browser open <url>
openclaw browser snapshot --format ai --limit 80
openclaw browser click <ref>
openclaw browser type <ref> "text"
openclaw browser press Enter
```
