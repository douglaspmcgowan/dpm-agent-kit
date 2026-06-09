# CLAUDE.md templates

The always-loaded behavioral contract for your agent. Claude Code reads `CLAUDE.md` at session start
from `~/.claude/` (global) and from project roots (project-specific), and merges them.

- **`CLAUDE.md`** — the main file. Keep it lean: voice, anti-fabrication, secret-safety,
  file-safety, autonomy, plan-means-plan, careful-actions, and pointers to sibling files.
- **`CLAUDE-delegation.md`** — when/how to delegate and parallelize, and model-tier policy. Pulled
  out of the main file because it's only needed before a non-trivial task.

## The modular pattern

Keep the always-on file small. Push deep, situational detail into sibling files you reference by
name (`CLAUDE-delegation.md`, `CLAUDE-frontend-testing.md`, `CLAUDE-obsidian.md`, …) and tell the
agent to read on demand. This keeps every-session context cheap while still having the detail
one Read away.

## Why these specific rules

Most of them are scar tissue — each rule exists because its absence caused a concrete problem once:

| Rule | The failure it prevents |
|---|---|
| No "X, not Y" antithesis | The tell that makes writing sound AI-generated. |
| Never fabricate; cite the source | A plausible-but-wrong number shipped into a real document. |
| Backup + new file, never overwrite | An in-place save destroyed unsaved edits (no Recycle Bin). |
| Plan means plan | The agent implemented when only a plan was wanted. |
| Proceed, don't ask; batch questions | Ping-ponging one question at a time stalled multi-step work. |
| Careful actions | An irreversible action (force-push, delete) taken without confirmation. |

Edit freely — the point is that *your* CLAUDE.md should encode *your* scar tissue.
