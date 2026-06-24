# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice
**Areas**: frontend | backend | infra | tests | docs | config
**Statuses**: pending | in_progress | resolved | wont_fix | promoted | promoted_to_skill

## Status Definitions

| Status | Meaning |
|--------|---------|
| `pending` | Not yet addressed |
| `in_progress` | Actively being worked on |
| `resolved` | Issue fixed or knowledge integrated |
| `wont_fix` | Decided not to address (reason in Resolution) |
| `promoted` | Elevated to CLAUDE.md, AGENTS.md, or copilot-instructions.md |
| `promoted_to_skill` | Extracted as a reusable skill |

## Skill Extraction Fields

When a learning is promoted to a skill, add these fields:

```markdown
**Status**: promoted_to_skill
**Skill-Path**: skills/skill-name
```

Example:
```markdown
## [LRN-20250115-001] best_practice

**Logged**: 2025-01-15T10:00:00Z
**Priority**: high
**Status**: promoted_to_skill
**Skill-Path**: skills/docker-m1-fixes
**Area**: infra

### Summary
Docker build fails on Apple Silicon due to platform mismatch
...
```

---

## [LRN-20260624-001] best_practice

**Logged**: 2026-06-24T01:50:00Z
**Priority**: low
**Status**: resolved
**Area**: backend

### Summary
`~/.openclaw/workspace/crm/contacts.ndjson` contains concatenated JSON objects on single lines in some places, so naive `json.loads(line)` fails. Use `json.JSONDecoder.raw_decode` in a loop to safely parse multi-object JSON/JSONL streams.

### Resolution
Updated `command-center/aggregate-data.sh` to use a streaming `iter_objects()` helper that skips whitespace and calls `raw_decode` repeatedly.

### Reference
- File: `command-center/aggregate-data.sh`

