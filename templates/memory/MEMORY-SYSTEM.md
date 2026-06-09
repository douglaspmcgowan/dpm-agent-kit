# The auto-memory system

A persistent, file-based memory that survives across conversations. The agent builds it up over
time so future sessions know who you are, how you like to work, and the context behind your
projects — things that can't be re-derived by reading code.

## Layout

```
<memory-dir>/
  MEMORY.md            # the index — ALWAYS loaded into context. One line per memory.
  user_*.md            # who the user is, their role, preferences, knowledge
  feedback_*.md        # how to approach work — corrections AND confirmed-good approaches
  project_*.md         # ongoing work, goals, decisions, deadlines (decays fast)
  reference_*.md       # pointers to where info lives in external systems
```

`MEMORY.md` is the only file loaded every session, so it stays a thin **index** — each entry is one
line under ~150 chars: `- [Title](file.md) — one-line hook`. The bodies live in the individual files
and are read on demand when relevant.

## The four memory types

- **user** — role, goals, responsibilities, expertise. Lets the agent tailor explanations to you
  (a senior engineer and a first-time coder get different answers). Avoid anything that reads as a
  negative judgment.
- **feedback** — guidance on how to work. Save from BOTH failure (corrections: "don't do X") AND
  success (confirmations: "yes, that bundled PR was right"). If you only save corrections you drift
  toward over-caution and forget validated approaches. Lead with the rule, then a **Why:** line
  (the reason/incident) and a **How to apply:** line (when it kicks in).
- **project** — who's doing what, why, by when. Convert relative dates to absolute ("Thursday" →
  "2026-03-05"). Decays quickly — keep it current.
- **reference** — where information lives elsewhere ("pipeline bugs are tracked in Linear project
  INGEST"; "the oncall dashboard is at <url>").

## What NOT to save

- Code patterns, architecture, file paths, project structure — re-derivable by reading the repo.
- Git history / who-changed-what — `git log`/`git blame` are authoritative.
- Debugging fixes — the fix is in the code; the commit message has the context.
- Anything already in `CLAUDE.md`.
- Ephemeral task state — that belongs in `CURRENT-TASK.md`, not memory.

## How to save (two steps)

1. Write the memory to its own file with this frontmatter:

```markdown
---
name: short-kebab-case-slug
description: one-line summary used to judge relevance later — be specific
metadata:
  type: user | feedback | project | reference
---

Body. For feedback/project, structure as: the rule/fact, then **Why:** and **How to apply:** lines.
Link related memories with [[their-slug]].
```

2. Add one pointer line to `MEMORY.md`.

## Using memory well

- Read memory when it's relevant or the user references prior-conversation work; you MUST read it
  when they ask you to recall/remember.
- Memory is a snapshot in time. Before acting on a memory that names a file/function/flag, verify it
  still exists. If a memory conflicts with what you observe now, trust the present and update the
  memory.
- If the user says to ignore memory, don't apply or cite it.

## Wiring

The kit's `session-primer.js` hook injects `CURRENT-TASK.md` and `BACKGROUND-TASKS.md` at session
start; `MEMORY.md` is loaded by the harness's own memory feature. Point your harness's memory
directory at this folder (Claude Code: place it under the project's memory dir, or keep a global
one). See `../../docs/DETAILED-GUIDE.md` for the full workflow.
